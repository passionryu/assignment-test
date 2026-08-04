package com.recordroom.book.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.recordroom.book.model.BookContentCandidate
import com.recordroom.book.model.BookContentCandidateResponse
import com.recordroom.book.model.BookContentCandidatesResponse
import com.recordroom.book.model.BookContentSummaryResponse
import com.recordroom.book.model.BookCreateRoomResponse
import com.recordroom.book.model.BookCreateRoomsResponse
import com.recordroom.book.model.BookCreationType
import com.recordroom.book.model.BookPageLimitStatus
import com.recordroom.book.model.BookPeriodResponse
import com.recordroom.book.model.BookPreviewContentEntity
import com.recordroom.book.model.BookPreviewContentItemRequest
import com.recordroom.book.model.BookPreviewEntity
import com.recordroom.book.model.BookPreviewResponse
import com.recordroom.book.model.BookProductsResponse
import com.recordroom.book.model.CreateBookPreviewRequest
import com.recordroom.book.repository.BookContentRepository
import com.recordroom.book.repository.BookPreviewContentJpaRepository
import com.recordroom.book.repository.BookPreviewJpaRepository
import com.recordroom.common.ApiException
import com.recordroom.member.service.MemberService
import com.recordroom.room.repository.RoomRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.OffsetDateTime

@Service
class BookArchiveService(
    private val memberService: MemberService,
    private val roomRepository: RoomRepository,
    private val bookContentRepository: BookContentRepository,
    private val bookProductCatalog: BookProductCatalog,
    private val bookPageEstimator: BookPageEstimator,
    private val bookPageLimitChecker: BookPageLimitChecker,
    private val bookEstimateCalculator: BookEstimateCalculator,
    private val bookPreviewComposer: BookPreviewComposer,
    private val bookPreviewJpaRepository: BookPreviewJpaRepository,
    private val bookPreviewContentJpaRepository: BookPreviewContentJpaRepository,
    private val objectMapper: ObjectMapper,
) {
    // 화면의 상품 안내와 상품 선택 UI는 서버 카탈로그를 기준으로 렌더링한다.
    @Transactional(readOnly = true)
    fun getProducts(): BookProductsResponse =
        BookProductsResponse(products = bookProductCatalog.getProducts())

    // 책 만들기 첫 단계에서는 현재 사용자가 참여 중인 방만 하나씩 선택할 수 있게 내려준다.
    @Transactional(readOnly = true)
    fun getCreateRooms(memberId: Long): BookCreateRoomsResponse {
        memberService.getProfile(memberId)
        val rooms = roomRepository.findRoomsJoinedByMember(memberId)
        val recordCounts = bookContentRepository.countBookableRecords(rooms.map { it.id }, memberId)

        return BookCreateRoomsResponse(
            rooms = rooms.map { room ->
                BookCreateRoomResponse(
                    id = room.id,
                    name = room.name,
                    type = room.type,
                    memberCount = room.memberCount,
                    bookableRecordCount = recordCounts[room.id] ?: 0,
                )
            },
        )
    }

    // 기간을 기준으로 기본 후보를 자동으로 불러오고, 기간 밖 추가 후보와 페이지 상태를 함께 계산한다.
    @Transactional(readOnly = true)
    fun getContentCandidates(
        memberId: Long,
        roomId: Long,
        productUid: String,
        startDate: LocalDate,
        endDate: LocalDate,
    ): BookContentCandidatesResponse {
        memberService.getProfile(memberId)
        val room = validateRoomAccess(roomId, memberId)
        val product = bookProductCatalog.getProduct(productUid)
        validatePeriod(startDate, endDate)

        val defaultContents = bookContentRepository.findDefaultCandidates(roomId, memberId, startDate, endDate)
        val defaultResponses = defaultContents.map { it.toResponse() }
        val rawPageCount = bookPageEstimator.estimateTotalPage(defaultContents)
        val pageRange = bookPageLimitChecker.check(product, rawPageCount)

        return BookContentCandidatesResponse(
            roomId = room.id,
            roomName = room.name,
            product = product,
            period = BookPeriodResponse(startDate = startDate, endDate = endDate),
            defaultContents = defaultResponses,
            additionalContents = bookContentRepository.findAdditionalCandidates(roomId, memberId, startDate, endDate).map { it.toResponse() },
            summary = bookPageEstimator.summarize(defaultContents, pageRange.estimatedPageCount),
            pageRange = pageRange,
        )
    }

    // 사용자가 확정한 템플릿 바인딩 구성을 저장하고 대표 미리보기와 mock 견적을 반환한다.
    @Transactional
    fun createPreview(memberId: Long, request: CreateBookPreviewRequest): BookPreviewResponse {
        memberService.getProfile(memberId)
        val roomId = request.roomId ?: throw badRequest("BOOK_ROOM_REQUIRED", "책으로 만들 방을 선택해 주세요.")
        val room = validateRoomAccess(roomId, memberId)
        val productUid = request.bookSpecUid?.trim().orEmpty()
        val product = bookProductCatalog.getProduct(productUid)
        val title = validateTitle(request.title, room.name)
        val quantity = validateQuantity(request.quantity)
        val startDate = request.periodStartDate ?: throw badRequest("BOOK_PERIOD_REQUIRED", "가져올 기록의 시작일을 선택해 주세요.")
        val endDate = request.periodEndDate ?: throw badRequest("BOOK_PERIOD_REQUIRED", "가져올 기록의 종료일을 선택해 주세요.")
        validatePeriod(startDate, endDate)
        val selectedContents = resolveSelectedContents(roomId, memberId, request.contents.orEmpty())
        val rawPageCount = bookPageEstimator.estimateTotalPage(selectedContents)
        val pageRange = bookPageLimitChecker.check(product, rawPageCount)
        if (pageRange.status == BookPageLimitStatus.OVER_MAX) {
            throw badRequest("BOOK_PAGE_LIMIT_EXCEEDED", pageRange.message)
        }

        val estimate = bookEstimateCalculator.calculate(product, pageRange.estimatedPageCount, quantity)
        val savedPreview = bookPreviewJpaRepository.save(
            BookPreviewEntity(
                memberId = memberId,
                roomId = roomId,
                bookSpecUid = product.uid,
                creationType = BookCreationType.TEMPLATE,
                title = title,
                quantity = quantity,
                periodStartDate = startDate,
                periodEndDate = endDate,
                estimatedPageCount = pageRange.estimatedPageCount,
                basePrice = estimate.basePrice,
                additionalPagePrice = estimate.additionalPagePrice,
                shippingPrice = estimate.shippingPrice,
                totalPrice = estimate.totalPrice,
                createdAt = OffsetDateTime.now(),
                expiresAt = OffsetDateTime.now().plusDays(PREVIEW_EXPIRATION_DAYS),
            ),
        )
        val contentResponses = selectedContents.map { it.toResponse() }
        bookPreviewContentJpaRepository.saveAll(
            contentResponses.mapIndexed { index, content ->
                BookPreviewContentEntity(
                    previewId = savedPreview.id,
                    contentType = content.type,
                    sourceId = content.sourceId,
                    title = content.title,
                    occurredDate = content.occurredDate,
                    pageCount = content.pageCount,
                    sortOrder = index + 1,
                    snapshotJson = objectMapper.writeValueAsString(content),
                )
            },
        )

        return BookPreviewResponse(
            previewId = savedPreview.id,
            creationType = BookCreationType.TEMPLATE,
            roomId = room.id,
            roomName = room.name,
            product = product,
            title = title,
            period = BookPeriodResponse(startDate = startDate, endDate = endDate),
            contents = contentResponses,
            summary = bookPageEstimator.summarize(selectedContents, pageRange.estimatedPageCount),
            pageRange = pageRange,
            estimate = estimate,
            pages = bookPreviewComposer.compose(title, contentResponses),
            warnings = buildWarnings(contentResponses, pageRange),
        )
    }

    private fun validateRoomAccess(roomId: Long, memberId: Long) =
        roomRepository.findActiveRoom(roomId)
            ?.takeIf { roomRepository.existsActiveRoomMember(roomId, memberId) }
            ?: throw ApiException(HttpStatus.FORBIDDEN, "ROOM_ACCESS_DENIED", "참여 중인 방의 기록만 책으로 만들 수 있습니다.")

    private fun validatePeriod(startDate: LocalDate, endDate: LocalDate) {
        if (startDate.isAfter(endDate)) {
            throw badRequest("BOOK_PERIOD_INVALID", "시작일은 종료일보다 늦을 수 없습니다.")
        }
    }

    private fun validateTitle(rawTitle: String?, roomName: String): String {
        val title = rawTitle?.trim().takeUnless { it.isNullOrBlank() } ?: "${roomName} 기록집"
        if (title.length > TITLE_MAX_LENGTH) {
            throw badRequest("BOOK_TITLE_TOO_LONG", "책 제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해 주세요.")
        }

        return title
    }

    private fun validateQuantity(rawQuantity: Int?): Int {
        val quantity = rawQuantity ?: 1
        if (quantity !in 1..MAX_QUANTITY) {
            throw badRequest("BOOK_QUANTITY_INVALID", "수량은 1권부터 ${MAX_QUANTITY}권까지 선택할 수 있습니다.")
        }

        return quantity
    }

    private fun resolveSelectedContents(
        roomId: Long,
        memberId: Long,
        requestedContents: List<BookPreviewContentItemRequest>,
    ): List<BookContentCandidate> {
        if (requestedContents.isEmpty()) {
            throw badRequest("BOOK_CONTENT_REQUIRED", "책에 담을 기록을 1개 이상 선택해 주세요.")
        }

        val seen = mutableSetOf<String>()
        return requestedContents.map { item ->
            val type = item.type ?: throw badRequest("BOOK_CONTENT_TYPE_REQUIRED", "콘텐츠 종류를 확인할 수 없습니다.")
            val sourceId = item.sourceId?.takeIf { it > 0 }
                ?: throw badRequest("BOOK_CONTENT_SOURCE_REQUIRED", "콘텐츠 식별값을 확인할 수 없습니다.")
            val key = "${type.name}:$sourceId"
            if (!seen.add(key)) {
                throw badRequest("BOOK_CONTENT_DUPLICATED", "같은 기록이 중복 선택되었습니다.")
            }

            bookContentRepository.findSelectedCandidate(roomId, memberId, type, sourceId)
                ?: throw ApiException(HttpStatus.FORBIDDEN, "BOOK_CONTENT_ACCESS_DENIED", "선택한 기록 중 접근할 수 없는 항목이 있습니다.")
        }
    }

    private fun BookContentCandidate.toResponse(): BookContentCandidateResponse {
        val pageCount = bookPageEstimator.estimateContentPage(this)

        return BookContentCandidateResponse(
            type = type,
            sourceId = sourceId,
            title = title,
            description = description,
            occurredDate = occurredDate,
            authorName = authorName,
            imageCount = imageCount,
            commentCount = commentCount,
            pageCount = pageCount,
            selectedByDefault = selectedByDefault,
            sourceLabel = sourceLabel,
        )
    }

    private fun buildWarnings(
        contents: List<BookContentCandidateResponse>,
        pageRange: com.recordroom.book.model.BookPageRangeResponse,
    ): List<String> =
        buildList {
            if (contents.none { it.type == com.recordroom.book.model.BookContentType.CHAT }) {
                add("채팅은 기본 포함하지 않습니다. 필요한 날짜의 채팅 묶음만 직접 추가해 주세요.")
            }
            if (pageRange.estimatedPageCount == pageRange.minPage) {
                add("최소 페이지보다 적은 구성은 템플릿 기본 페이지로 보정됩니다.")
            }
        }

    private fun badRequest(code: String, message: String): ApiException =
        ApiException(HttpStatus.BAD_REQUEST, code, message)

    companion object {
        private const val TITLE_MAX_LENGTH = 120
        private const val MAX_QUANTITY = 20
        private const val PREVIEW_EXPIRATION_DAYS = 7L
    }
}
