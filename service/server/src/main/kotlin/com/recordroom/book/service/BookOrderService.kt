package com.recordroom.book.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.recordroom.book.model.BookContentCandidateResponse
import com.recordroom.book.model.BookPeriodResponse
import com.recordroom.book.model.CancelPrintOrderRequest
import com.recordroom.book.model.CreatePrintOrderRequest
import com.recordroom.book.model.CreatePrintOrderResponse
import com.recordroom.book.model.PrintOrderActionResponse
import com.recordroom.book.model.PrintOrderContentEntity
import com.recordroom.book.model.PrintOrderContentSnapshotResponse
import com.recordroom.book.model.PrintOrderDetailResponse
import com.recordroom.book.model.PrintOrderEntity
import com.recordroom.book.model.PrintOrderStatus
import com.recordroom.book.model.PrintOrderStatusHistoryEntity
import com.recordroom.book.model.PrintOrderStatusHistoryResponse
import com.recordroom.book.model.PrintOrderSummaryResponse
import com.recordroom.book.model.PrintOrdersResponse
import com.recordroom.book.repository.BookPreviewContentJpaRepository
import com.recordroom.book.repository.BookPreviewJpaRepository
import com.recordroom.book.repository.PrintOrderContentJpaRepository
import com.recordroom.book.repository.PrintOrderJpaRepository
import com.recordroom.book.repository.PrintOrderStatusHistoryJpaRepository
import com.recordroom.common.ApiException
import com.recordroom.member.service.MemberService
import com.recordroom.room.repository.RoomRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class BookOrderService(
    private val memberService: MemberService,
    private val roomRepository: RoomRepository,
    private val bookProductCatalog: BookProductCatalog,
    private val bookPreviewJpaRepository: BookPreviewJpaRepository,
    private val bookPreviewContentJpaRepository: BookPreviewContentJpaRepository,
    private val printOrderJpaRepository: PrintOrderJpaRepository,
    private val printOrderContentJpaRepository: PrintOrderContentJpaRepository,
    private val printOrderStatusHistoryJpaRepository: PrintOrderStatusHistoryJpaRepository,
    private val printOrderNumberGenerator: PrintOrderNumberGenerator,
    private val objectMapper: ObjectMapper,
) {
    // 확정된 미리보기 스냅샷을 주문 스냅샷으로 복사해 이후 원본 변경과 분리한다.
    @Transactional
    fun createOrder(memberId: Long, request: CreatePrintOrderRequest): CreatePrintOrderResponse {
        memberService.getProfile(memberId)
        val previewId = request.previewId ?: throw badRequest("BOOK_PREVIEW_REQUIRED", "주문할 미리보기를 선택해 주세요.")
        val preview = bookPreviewJpaRepository.findByIdAndMemberId(previewId, memberId)
            ?: throw ApiException(HttpStatus.NOT_FOUND, "BOOK_PREVIEW_NOT_FOUND", "미리보기를 찾을 수 없습니다.")
        if (preview.expiresAt.isBefore(OffsetDateTime.now())) {
            throw badRequest("BOOK_PREVIEW_EXPIRED", "만료된 미리보기는 주문할 수 없습니다.")
        }
        validateRoomAccess(preview.roomId, memberId)

        val now = OffsetDateTime.now()
        val order = printOrderJpaRepository.save(
            PrintOrderEntity(
                orderNo = printOrderNumberGenerator.generateOrderNo(now),
                memberId = memberId,
                roomId = preview.roomId,
                previewId = preview.id,
                bookSpecUid = preview.bookSpecUid,
                creationType = preview.creationType,
                title = preview.title,
                quantity = preview.quantity,
                periodStartDate = preview.periodStartDate,
                periodEndDate = preview.periodEndDate,
                estimatedPageCount = preview.estimatedPageCount,
                basePrice = preview.basePrice,
                additionalPagePrice = preview.additionalPagePrice,
                shippingPrice = preview.shippingPrice,
                totalPrice = preview.totalPrice,
                status = PrintOrderStatus.PAID,
                requestedAt = now,
                updatedAt = now,
            ),
        )
        val previewContents = bookPreviewContentJpaRepository.findByPreviewIdOrderBySortOrderAsc(preview.id)
        printOrderContentJpaRepository.saveAll(
            previewContents.map { content ->
                PrintOrderContentEntity(
                    orderId = order.id,
                    contentType = content.contentType,
                    sourceId = content.sourceId,
                    title = content.title,
                    occurredDate = content.occurredDate,
                    pageCount = content.pageCount,
                    sortOrder = content.sortOrder,
                    snapshotJson = content.snapshotJson,
                )
            },
        )
        printOrderStatusHistoryJpaRepository.save(
            PrintOrderStatusHistoryEntity(
                orderId = order.id,
                previousStatus = null,
                nextStatus = PrintOrderStatus.PAID,
                changedByMemberId = memberId,
                memo = "사용자가 주문을 생성했습니다.",
                changedAt = now,
            ),
        )

        return CreatePrintOrderResponse(order = order.toDetailResponse())
    }

    // 주문 상태 화면에는 아직 완료되지 않은 사용자 본인 주문만 노출한다.
    @Transactional(readOnly = true)
    fun getMyActiveOrders(memberId: Long): PrintOrdersResponse {
        memberService.getProfile(memberId)

        return PrintOrdersResponse(
            orders = printOrderJpaRepository
                .findByMemberIdAndStatusInOrderByRequestedAtDesc(memberId, ACTIVE_STATUSES)
                .map { it.toSummaryResponse() },
        )
    }

    // 주문 내역 화면에는 완료, 취소, 오류처럼 종료된 사용자 본인 주문을 노출한다.
    @Transactional(readOnly = true)
    fun getMyOrderHistory(memberId: Long): PrintOrdersResponse {
        memberService.getProfile(memberId)

        return PrintOrdersResponse(
            orders = printOrderJpaRepository
                .findByMemberIdAndStatusInOrderByRequestedAtDesc(memberId, HISTORY_STATUSES)
                .map { it.toSummaryResponse() },
        )
    }

    // 일반 사용자는 본인 주문 상세만 볼 수 있으므로 memberId와 orderId를 함께 검증한다.
    @Transactional(readOnly = true)
    fun getMyOrderDetail(memberId: Long, orderId: Long): PrintOrderDetailResponse {
        memberService.getProfile(memberId)
        val order = printOrderJpaRepository.findByIdAndMemberId(orderId, memberId)
            ?: throw ApiException(HttpStatus.NOT_FOUND, "PRINT_ORDER_NOT_FOUND", "주문을 찾을 수 없습니다.")

        return order.toDetailResponse()
    }

    // 사용자는 제작 확정 전 상태의 본인 주문만 취소할 수 있다.
    @Transactional
    fun cancelMyOrder(memberId: Long, orderId: Long, request: CancelPrintOrderRequest): PrintOrderActionResponse {
        memberService.getProfile(memberId)
        val order = printOrderJpaRepository.findByIdAndMemberId(orderId, memberId)
            ?: throw ApiException(HttpStatus.NOT_FOUND, "PRINT_ORDER_NOT_FOUND", "주문을 찾을 수 없습니다.")

        cancelOrder(
            order = order,
            changedByMemberId = memberId,
            reason = request.reason,
            changedAt = OffsetDateTime.now(),
        )

        return PrintOrderActionResponse(order = order.toDetailResponse())
    }

    // 운영자 흐름에서 주문을 다음 제작 상태로 한 단계 전이한다.
    @Transactional
    fun advanceOrderStatus(orderId: Long, changedByMemberId: Long, memo: String?): PrintOrderActionResponse {
        val order = printOrderJpaRepository.findById(orderId)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "PRINT_ORDER_NOT_FOUND", "주문을 찾을 수 없습니다.") }
        val nextStatus = NEXT_STATUSES[order.status]
            ?: throw badRequest("ORDER_STATUS_TRANSITION_NOT_ALLOWED", "현재 주문 상태에서는 다음 단계로 변경할 수 없습니다.")

        changeOrderStatus(
            order = order,
            nextStatus = nextStatus,
            changedByMemberId = changedByMemberId,
            memo = memo?.trim()?.takeIf { it.isNotBlank() } ?: "${order.status.toKoreanLabel()}에서 ${nextStatus.toKoreanLabel()} 상태로 변경했습니다.",
            changedAt = OffsetDateTime.now(),
        )

        return PrintOrderActionResponse(order = order.toDetailResponse())
    }

    // 운영자는 전체 주문을 상태 필터와 함께 확인할 수 있다.
    @Transactional(readOnly = true)
    fun getOperatorOrders(operatorMemberId: Long, status: PrintOrderStatus?): PrintOrdersResponse {
        validateOperator(operatorMemberId)

        val orders = if (status == null) {
            printOrderJpaRepository.findAllByOrderByRequestedAtDesc()
        } else {
            printOrderJpaRepository.findByStatusOrderByRequestedAtDesc(status)
        }

        return PrintOrdersResponse(orders = orders.map { it.toSummaryResponse() })
    }

    // 운영자는 주문자와 무관하게 주문 상세 스냅샷을 확인할 수 있다.
    @Transactional(readOnly = true)
    fun getOperatorOrderDetail(operatorMemberId: Long, orderId: Long): PrintOrderDetailResponse {
        validateOperator(operatorMemberId)
        val order = printOrderJpaRepository.findById(orderId)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "PRINT_ORDER_NOT_FOUND", "주문을 찾을 수 없습니다.") }

        return order.toDetailResponse()
    }

    // 운영자만 주문을 다음 제작 상태로 전이할 수 있다.
    @Transactional
    fun advanceOrderStatusAsOperator(operatorMemberId: Long, orderId: Long, memo: String?): PrintOrderActionResponse {
        validateOperator(operatorMemberId)

        return advanceOrderStatus(
            orderId = orderId,
            changedByMemberId = operatorMemberId,
            memo = memo,
        )
    }

    // 운영자도 제작 확정 전 상태의 주문만 취소할 수 있다.
    @Transactional
    fun cancelOrderAsOperator(operatorMemberId: Long, orderId: Long, request: CancelPrintOrderRequest): PrintOrderActionResponse {
        validateOperator(operatorMemberId)
        val order = printOrderJpaRepository.findById(orderId)
            .orElseThrow { ApiException(HttpStatus.NOT_FOUND, "PRINT_ORDER_NOT_FOUND", "주문을 찾을 수 없습니다.") }

        cancelOrder(
            order = order,
            changedByMemberId = operatorMemberId,
            reason = request.reason,
            changedAt = OffsetDateTime.now(),
        )

        return PrintOrderActionResponse(order = order.toDetailResponse())
    }

    private fun validateOperator(memberId: Long) {
        memberService.getProfile(memberId)
        if (memberId != OPERATOR_MEMBER_ID) {
            throw ApiException(HttpStatus.FORBIDDEN, "OPERATOR_ONLY", "운영자만 주문을 확인할 수 있습니다.")
        }
    }

    private fun validateRoomAccess(roomId: Long, memberId: Long) {
        val hasRoomAccess = roomRepository.findActiveRoom(roomId) != null &&
            roomRepository.existsActiveRoomMember(roomId, memberId)
        if (!hasRoomAccess) {
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_ACCESS_DENIED", "참여 중인 방의 주문만 생성할 수 있습니다.")
        }
    }

    private fun cancelOrder(
        order: PrintOrderEntity,
        changedByMemberId: Long,
        reason: String?,
        changedAt: OffsetDateTime,
    ) {
        if (order.status !in CANCELLABLE_STATUSES) {
            throw badRequest("ORDER_CANCEL_NOT_ALLOWED", "주문 요청 또는 제작 파일 준비 상태에서만 취소할 수 있습니다.")
        }

        val normalizedReason = reason?.trim()?.take(255)?.takeIf { it.isNotBlank() }
        changeOrderStatus(
            order = order,
            nextStatus = PrintOrderStatus.CANCELLED_REFUND,
            changedByMemberId = changedByMemberId,
            memo = normalizedReason?.let { "취소 사유: $it" } ?: "사용자가 주문을 취소했습니다.",
            changedAt = changedAt,
        )
        order.cancelledAt = changedAt
        order.cancelReason = normalizedReason
    }

    private fun changeOrderStatus(
        order: PrintOrderEntity,
        nextStatus: PrintOrderStatus,
        changedByMemberId: Long,
        memo: String,
        changedAt: OffsetDateTime,
    ) {
        val previousStatus = order.status
        order.status = nextStatus
        order.updatedAt = changedAt
        printOrderStatusHistoryJpaRepository.save(
            PrintOrderStatusHistoryEntity(
                orderId = order.id,
                previousStatus = previousStatus,
                nextStatus = nextStatus,
                changedByMemberId = changedByMemberId,
                memo = memo,
                changedAt = changedAt,
            ),
        )
    }

    private fun PrintOrderEntity.toSummaryResponse(): PrintOrderSummaryResponse =
        PrintOrderSummaryResponse(
            id = id,
            orderNo = orderNo,
            memberId = memberId,
            memberName = resolveMemberName(memberId),
            roomId = roomId,
            roomName = resolveRoomName(roomId),
            product = bookProductCatalog.getProduct(bookSpecUid),
            title = title,
            quantity = quantity,
            estimatedPageCount = estimatedPageCount,
            totalPrice = totalPrice,
            status = status,
            statusLabel = status.toKoreanLabel(),
            requestedAt = requestedAt,
            updatedAt = updatedAt,
        )

    private fun PrintOrderEntity.toDetailResponse(): PrintOrderDetailResponse =
        PrintOrderDetailResponse(
            id = id,
            orderNo = orderNo,
            memberId = memberId,
            memberName = resolveMemberName(memberId),
            roomId = roomId,
            roomName = resolveRoomName(roomId),
            product = bookProductCatalog.getProduct(bookSpecUid),
            creationType = creationType,
            title = title,
            quantity = quantity,
            period = BookPeriodResponse(periodStartDate, periodEndDate),
            estimatedPageCount = estimatedPageCount,
            basePrice = basePrice,
            additionalPagePrice = additionalPagePrice,
            shippingPrice = shippingPrice,
            totalPrice = totalPrice,
            status = status,
            statusLabel = status.toKoreanLabel(),
            requestedAt = requestedAt,
            updatedAt = updatedAt,
            cancelledAt = cancelledAt,
            cancelReason = cancelReason,
            contents = printOrderContentJpaRepository.findByOrderIdOrderBySortOrderAsc(id).map { it.toResponse() },
            statusHistories = printOrderStatusHistoryJpaRepository.findByOrderIdOrderByChangedAtAscIdAsc(id).map { it.toResponse() },
        )

    private fun PrintOrderContentEntity.toResponse(): PrintOrderContentSnapshotResponse =
        PrintOrderContentSnapshotResponse(
            type = contentType,
            sourceId = sourceId,
            title = title,
            occurredDate = occurredDate,
            pageCount = pageCount,
            sortOrder = sortOrder,
            snapshot = runCatching { objectMapper.readValue<BookContentCandidateResponse>(snapshotJson) }.getOrNull(),
        )

    private fun PrintOrderStatusHistoryEntity.toResponse(): PrintOrderStatusHistoryResponse =
        PrintOrderStatusHistoryResponse(
            id = id,
            previousStatus = previousStatus,
            nextStatus = nextStatus,
            nextStatusLabel = nextStatus.toKoreanLabel(),
            memo = memo,
            changedAt = changedAt,
        )

    private fun resolveRoomName(roomId: Long): String =
        roomRepository.findActiveRoom(roomId)?.name ?: "보관된 방"

    private fun resolveMemberName(memberId: Long): String =
        runCatching { memberService.getProfile(memberId).displayName }.getOrElse { "탈퇴한 사용자" }

    private fun badRequest(code: String, message: String): ApiException =
        ApiException(HttpStatus.BAD_REQUEST, code, message)

    companion object {
        private const val OPERATOR_MEMBER_ID = 100L
        private val ACTIVE_STATUSES = listOf(
            PrintOrderStatus.PAID,
            PrintOrderStatus.PDF_READY,
            PrintOrderStatus.CONFIRMED,
            PrintOrderStatus.IN_PRODUCTION,
            PrintOrderStatus.PRODUCTION_COMPLETE,
            PrintOrderStatus.SHIPPED,
        )
        private val HISTORY_STATUSES = listOf(
            PrintOrderStatus.DELIVERED,
            PrintOrderStatus.CANCELLED_REFUND,
            PrintOrderStatus.ERROR,
        )
        private val CANCELLABLE_STATUSES = setOf(
            PrintOrderStatus.PAID,
            PrintOrderStatus.PDF_READY,
        )
        private val NEXT_STATUSES = mapOf(
            PrintOrderStatus.PAID to PrintOrderStatus.PDF_READY,
            PrintOrderStatus.PDF_READY to PrintOrderStatus.CONFIRMED,
            PrintOrderStatus.CONFIRMED to PrintOrderStatus.IN_PRODUCTION,
            PrintOrderStatus.IN_PRODUCTION to PrintOrderStatus.PRODUCTION_COMPLETE,
            PrintOrderStatus.PRODUCTION_COMPLETE to PrintOrderStatus.SHIPPED,
            PrintOrderStatus.SHIPPED to PrintOrderStatus.DELIVERED,
        )
    }
}
