package com.recordroom.book.repository

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.book.model.BookContentCandidate
import com.recordroom.book.model.BookContentType
import com.recordroom.chat.model.QChatMessageEntity.chatMessageEntity
import com.recordroom.calendar.model.QLetterEntity.letterEntity
import com.recordroom.calendar.model.QMemoryPostEntity.memoryPostEntity
import com.recordroom.calendar.model.QMissionEntity.missionEntity
import com.recordroom.calendar.model.QMissionSubmissionEntity.missionSubmissionEntity
import com.recordroom.member.model.QMemberEntity
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Repository
class BookContentRepository(
    private val queryFactory: JPAQueryFactory,
) {
    // 책 만들기 방 선택 카드에서 쓸 수 있는 기록 수를 가볍게 집계한다.
    fun countBookableRecords(roomIds: List<Long>, memberId: Long): Map<Long, Int> {
        if (roomIds.isEmpty()) return emptyMap()

        val counts = mutableMapOf<Long, Int>()
        roomIds.forEach { roomId -> counts[roomId] = 0 }

        findMemoryCountByRoom(roomIds).forEach { (roomId, count) -> counts[roomId] = (counts[roomId] ?: 0) + count }
        findMissionSubmissionCountByRoom(roomIds).forEach { (roomId, count) -> counts[roomId] = (counts[roomId] ?: 0) + count }
        findAccessibleLetterCountByRoom(roomIds, memberId).forEach { (roomId, count) -> counts[roomId] = (counts[roomId] ?: 0) + count }

        return counts
    }

    // 기간 선택 직후 기본 포함할 추억, 미션 인증, 편지를 조회한다.
    fun findDefaultCandidates(
        roomId: Long,
        memberId: Long,
        startDate: LocalDate,
        endDate: LocalDate,
    ): List<BookContentCandidate> =
        buildList {
            addAll(findMemoryCandidates(roomId, memoryPostEntity.occurredDate.between(startDate, endDate), selectedByDefault = true))
            addAll(findMissionSubmissionCandidates(roomId, missionSubmissionEntity.occurredDate.between(startDate, endDate), selectedByDefault = true))
            addAll(findLetterCandidates(roomId, memberId, letterEntity.occurredDate.between(startDate, endDate), selectedByDefault = true))
        }.sorted()

    // 선택 기간 밖에서 사용자가 추가로 가져올 수 있는 기록 후보를 보여준다.
    fun findAdditionalCandidates(
        roomId: Long,
        memberId: Long,
        startDate: LocalDate,
        endDate: LocalDate,
    ): List<BookContentCandidate> =
        buildList {
            addAll(
                findMemoryCandidates(
                    roomId,
                    memoryPostEntity.occurredDate.before(startDate).or(memoryPostEntity.occurredDate.after(endDate)),
                    selectedByDefault = false,
                    limit = ADDITIONAL_LIMIT_PER_TYPE,
                ),
            )
            addAll(
                findMissionSubmissionCandidates(
                    roomId,
                    missionSubmissionEntity.occurredDate.before(startDate).or(missionSubmissionEntity.occurredDate.after(endDate)),
                    selectedByDefault = false,
                    limit = ADDITIONAL_LIMIT_PER_TYPE,
                ),
            )
            addAll(
                findLetterCandidates(
                    roomId,
                    memberId,
                    letterEntity.occurredDate.before(startDate).or(letterEntity.occurredDate.after(endDate)),
                    selectedByDefault = false,
                    limit = ADDITIONAL_LIMIT_PER_TYPE,
                ),
            )
            addAll(findChatDayCandidates(roomId, chatMessageEntity.occurredDate.between(startDate, endDate), selectedByDefault = false, limit = ADDITIONAL_LIMIT_PER_TYPE))
        }.sortedByDescending { it.occurredDate }.take(ADDITIONAL_TOTAL_LIMIT)

    // 미리보기 생성 직전 선택 콘텐츠가 여전히 해당 방과 현재 사용자 권한 안에 있는지 재조회한다.
    fun findSelectedCandidate(
        roomId: Long,
        memberId: Long,
        type: BookContentType,
        sourceId: Long,
    ): BookContentCandidate? =
        when (type) {
            BookContentType.MEMORY -> findMemoryCandidate(roomId, sourceId)
            BookContentType.MISSION -> findMissionSubmissionCandidate(roomId, sourceId)
            BookContentType.LETTER -> findLetterCandidate(roomId, memberId, sourceId)
            BookContentType.CHAT -> findChatDayCandidate(roomId, sourceId)
        }

    private fun findMemoryCountByRoom(roomIds: List<Long>): List<Pair<Long, Int>> =
        memoryPostEntity.id.count().let { recordCount ->
            queryFactory
                .select(memoryPostEntity.roomId, recordCount)
                .from(memoryPostEntity)
                .where(memoryPostEntity.roomId.`in`(roomIds), memoryPostEntity.deletedAt.isNull)
                .groupBy(memoryPostEntity.roomId)
                .fetch()
                .map { row ->
                    Pair(row.get(memoryPostEntity.roomId) ?: 0L, row.get(recordCount)?.toInt() ?: 0)
                }
        }

    private fun findMissionSubmissionCountByRoom(roomIds: List<Long>): List<Pair<Long, Int>> =
        missionSubmissionEntity.id.count().let { recordCount ->
            queryFactory
                .select(missionEntity.roomId, recordCount)
                .from(missionSubmissionEntity)
                .join(missionEntity).on(missionEntity.id.eq(missionSubmissionEntity.missionId))
                .where(missionEntity.roomId.`in`(roomIds))
                .groupBy(missionEntity.roomId)
                .fetch()
                .map { row ->
                    Pair(row.get(missionEntity.roomId) ?: 0L, row.get(recordCount)?.toInt() ?: 0)
                }
        }

    private fun findAccessibleLetterCountByRoom(roomIds: List<Long>, memberId: Long): List<Pair<Long, Int>> =
        letterEntity.id.count().let { recordCount ->
            queryFactory
                .select(letterEntity.roomId, recordCount)
                .from(letterEntity)
                .where(letterEntity.roomId.`in`(roomIds), accessibleLetterCondition(memberId))
                .groupBy(letterEntity.roomId)
                .fetch()
                .map { row ->
                    Pair(row.get(letterEntity.roomId) ?: 0L, row.get(recordCount)?.toInt() ?: 0)
                }
        }

    private fun findMemoryCandidates(
        roomId: Long,
        dateCondition: BooleanExpression,
        selectedByDefault: Boolean,
        limit: Long? = null,
    ): List<BookContentCandidate> {
        val author = QMemberEntity("bookMemoryAuthor")
        val comment = com.recordroom.memory.model.QMemoryCommentEntity("bookMemoryComment")
        val commentCount = comment.id.count()

        val query = queryFactory
            .select(
                memoryPostEntity.id,
                memoryPostEntity.title,
                memoryPostEntity.body,
                memoryPostEntity.occurredDate,
                author.displayName,
                memoryPostEntity.imageCount,
                commentCount,
            )
            .from(memoryPostEntity)
            .join(author).on(author.id.eq(memoryPostEntity.authorMemberId))
            .leftJoin(comment).on(comment.memoryPostId.eq(memoryPostEntity.id), comment.deletedAt.isNull)
            .where(memoryPostEntity.roomId.eq(roomId), memoryPostEntity.deletedAt.isNull, dateCondition)
            .groupBy(
                memoryPostEntity.id,
                memoryPostEntity.title,
                memoryPostEntity.body,
                memoryPostEntity.occurredDate,
                author.displayName,
                memoryPostEntity.imageCount,
            )
            .orderBy(memoryPostEntity.occurredDate.asc(), memoryPostEntity.createdAt.asc(), memoryPostEntity.id.asc())

        limit?.let { query.limit(it) }

        return query.fetch().map { row ->
            BookContentCandidate(
                type = BookContentType.MEMORY,
                sourceId = row.get(memoryPostEntity.id) ?: 0L,
                title = row.get(memoryPostEntity.title) ?: "",
                description = preview(row.get(memoryPostEntity.body) ?: ""),
                occurredDate = row.get(memoryPostEntity.occurredDate) ?: LocalDate.now(),
                authorName = row.get(author.displayName) ?: "",
                imageCount = row.get(memoryPostEntity.imageCount) ?: 0,
                commentCount = row.get(commentCount)?.toInt() ?: 0,
                selectedByDefault = selectedByDefault,
                sourceLabel = "추억 게시글",
            )
        }
    }

    private fun findMemoryCandidate(roomId: Long, sourceId: Long): BookContentCandidate? =
        findMemoryCandidates(
            roomId = roomId,
            dateCondition = memoryPostEntity.id.eq(sourceId),
            selectedByDefault = true,
            limit = 1,
        ).firstOrNull()

    private fun findMissionSubmissionCandidates(
        roomId: Long,
        dateCondition: BooleanExpression,
        selectedByDefault: Boolean,
        limit: Long? = null,
    ): List<BookContentCandidate> {
        val submitter = QMemberEntity("bookMissionSubmitter")
        val comment = com.recordroom.mission.model.QMissionCommentEntity("bookMissionComment")
        val commentCount = comment.id.count()

        val query = queryFactory
            .select(
                missionSubmissionEntity.id,
                missionEntity.title,
                missionSubmissionEntity.body,
                missionSubmissionEntity.occurredDate,
                submitter.displayName,
                missionSubmissionEntity.imageUrl,
                commentCount,
            )
            .from(missionSubmissionEntity)
            .join(missionEntity).on(missionEntity.id.eq(missionSubmissionEntity.missionId))
            .join(submitter).on(submitter.id.eq(missionSubmissionEntity.submitterMemberId))
            .leftJoin(comment).on(comment.missionId.eq(missionEntity.id), comment.deletedAt.isNull)
            .where(missionEntity.roomId.eq(roomId), dateCondition)
            .groupBy(
                missionSubmissionEntity.id,
                missionEntity.title,
                missionSubmissionEntity.body,
                missionSubmissionEntity.occurredDate,
                submitter.displayName,
                missionSubmissionEntity.imageUrl,
            )
            .orderBy(missionSubmissionEntity.occurredDate.asc(), missionSubmissionEntity.submittedAt.asc(), missionSubmissionEntity.id.asc())

        limit?.let { query.limit(it) }

        return query.fetch().map { row ->
            BookContentCandidate(
                type = BookContentType.MISSION,
                sourceId = row.get(missionSubmissionEntity.id) ?: 0L,
                title = row.get(missionEntity.title) ?: "",
                description = preview(row.get(missionSubmissionEntity.body) ?: ""),
                occurredDate = row.get(missionSubmissionEntity.occurredDate) ?: LocalDate.now(),
                authorName = row.get(submitter.displayName) ?: "",
                imageCount = if (row.get(missionSubmissionEntity.imageUrl).isNullOrBlank()) 0 else 1,
                commentCount = row.get(commentCount)?.toInt() ?: 0,
                selectedByDefault = selectedByDefault,
                sourceLabel = "미션 인증",
            )
        }
    }

    private fun findMissionSubmissionCandidate(roomId: Long, sourceId: Long): BookContentCandidate? =
        findMissionSubmissionCandidates(
            roomId = roomId,
            dateCondition = missionSubmissionEntity.id.eq(sourceId),
            selectedByDefault = true,
            limit = 1,
        ).firstOrNull()

    private fun findLetterCandidates(
        roomId: Long,
        memberId: Long,
        dateCondition: BooleanExpression,
        selectedByDefault: Boolean,
        limit: Long? = null,
    ): List<BookContentCandidate> {
        val sender = QMemberEntity("bookLetterSender")
        val receiver = QMemberEntity("bookLetterReceiver")

        val query = queryFactory
            .select(
                letterEntity.id,
                letterEntity.title,
                letterEntity.body,
                letterEntity.occurredDate,
                sender.displayName,
                receiver.displayName,
            )
            .from(letterEntity)
            .join(sender).on(sender.id.eq(letterEntity.senderMemberId))
            .join(receiver).on(receiver.id.eq(letterEntity.receiverMemberId))
            .where(letterEntity.roomId.eq(roomId), accessibleLetterCondition(memberId), dateCondition)
            .orderBy(letterEntity.occurredDate.asc(), letterEntity.sentAt.asc(), letterEntity.id.asc())

        limit?.let { query.limit(it) }

        return query.fetch().map { row ->
            val senderName = row.get(sender.displayName) ?: ""
            val receiverName = row.get(receiver.displayName) ?: ""

            BookContentCandidate(
                type = BookContentType.LETTER,
                sourceId = row.get(letterEntity.id) ?: 0L,
                title = row.get(letterEntity.title) ?: "",
                description = "${senderName} -> ${receiverName} · ${preview(row.get(letterEntity.body) ?: "")}",
                occurredDate = row.get(letterEntity.occurredDate) ?: LocalDate.now(),
                authorName = senderName,
                imageCount = 0,
                commentCount = 0,
                selectedByDefault = selectedByDefault,
                sourceLabel = "편지",
            )
        }
    }

    private fun findLetterCandidate(roomId: Long, memberId: Long, sourceId: Long): BookContentCandidate? =
        findLetterCandidates(
            roomId = roomId,
            memberId = memberId,
            dateCondition = letterEntity.id.eq(sourceId),
            selectedByDefault = true,
            limit = 1,
        ).firstOrNull()

    private fun findChatDayCandidates(
        roomId: Long,
        dateCondition: BooleanExpression,
        selectedByDefault: Boolean,
        limit: Long? = null,
    ): List<BookContentCandidate> {
        val messageCount = chatMessageEntity.id.count()
        val query = queryFactory
            .select(chatMessageEntity.occurredDate, messageCount)
            .from(chatMessageEntity)
            .where(chatMessageEntity.roomId.eq(roomId), chatMessageEntity.deletedAt.isNull, dateCondition)
            .groupBy(chatMessageEntity.occurredDate)
            .orderBy(chatMessageEntity.occurredDate.asc())

        limit?.let { query.limit(it) }

        return query.fetch().map { row ->
            val occurredDate = row.get(chatMessageEntity.occurredDate) ?: LocalDate.now()
            val count = row.get(messageCount)?.toInt() ?: 0

            BookContentCandidate(
                type = BookContentType.CHAT,
                sourceId = occurredDate.format(DateTimeFormatter.BASIC_ISO_DATE).toLong(),
                title = "${occurredDate} 채팅 묶음",
                description = "선택한 날짜의 채팅 ${count}개를 책 구성에 포함합니다.",
                occurredDate = occurredDate,
                authorName = "방 구성원",
                imageCount = 0,
                commentCount = count,
                selectedByDefault = selectedByDefault,
                sourceLabel = "채팅",
            )
        }
    }

    private fun findChatDayCandidate(roomId: Long, sourceId: Long): BookContentCandidate? {
        val date = runCatching { LocalDate.parse(sourceId.toString(), DateTimeFormatter.BASIC_ISO_DATE) }.getOrNull()
            ?: return null

        return findChatDayCandidates(
            roomId = roomId,
            dateCondition = chatMessageEntity.occurredDate.eq(date),
            selectedByDefault = true,
            limit = 1,
        ).firstOrNull()
    }

    private fun accessibleLetterCondition(memberId: Long): BooleanExpression =
        letterEntity.senderMemberId.eq(memberId)
            .and(letterEntity.deletedBySenderAt.isNull)
            .or(
                letterEntity.receiverMemberId.eq(memberId)
                    .and(letterEntity.deletedByReceiverAt.isNull),
            )

    private fun List<BookContentCandidate>.sorted(): List<BookContentCandidate> =
        sortedWith(
            compareBy<BookContentCandidate> { it.occurredDate }
                .thenBy { contentTypeOrder(it.type) }
                .thenBy { it.sourceId },
        )

    private fun preview(body: String): String =
        if (body.length <= BODY_PREVIEW_LENGTH) body else "${body.take(BODY_PREVIEW_LENGTH)}..."

    private fun contentTypeOrder(type: BookContentType): Int =
        when (type) {
            BookContentType.MEMORY -> 1
            BookContentType.MISSION -> 2
            BookContentType.LETTER -> 3
            BookContentType.CHAT -> 4
        }

    companion object {
        private const val BODY_PREVIEW_LENGTH = 90
        private const val ADDITIONAL_LIMIT_PER_TYPE = 8L
        private const val ADDITIONAL_TOTAL_LIMIT = 24
    }
}
