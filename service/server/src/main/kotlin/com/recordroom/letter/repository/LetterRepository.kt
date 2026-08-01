package com.recordroom.letter.repository

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.calendar.model.LetterEntity
import com.recordroom.calendar.model.QLetterEntity.letterEntity
import com.recordroom.letter.model.LetterDetailResponse
import com.recordroom.letter.model.LetterRecipientResponse
import com.recordroom.letter.model.LetterSummaryResponse
import com.recordroom.member.model.QMemberEntity
import com.recordroom.room.model.QRoomMemberEntity
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.OffsetDateTime

@Repository
class LetterRepository(
    private val queryFactory: JPAQueryFactory,
    private val letterJpaRepository: LetterJpaRepository,
) {
    // 선택 방의 편지 작성 수신자 후보를 현재 참여 중인 멤버 기준으로 조회한다.
    fun findRecipients(roomId: Long, senderMemberId: Long): List<LetterRecipientResponse> {
        val roomMember = QRoomMemberEntity("letterRecipientRoomMember")
        val member = QMemberEntity("letterRecipientMember")

        return queryFactory
            .select(member.id, member.displayName)
            .from(roomMember)
            .join(member).on(member.id.eq(roomMember.memberId), member.deleted.isFalse)
            .where(
                roomMember.roomId.eq(roomId),
                roomMember.leftAt.isNull,
                roomMember.memberId.ne(senderMemberId),
            )
            .orderBy(member.displayName.asc(), member.id.asc())
            .fetch()
            .map { row ->
                LetterRecipientResponse(
                    memberId = row.get(member.id) ?: 0L,
                    displayName = row.get(member.displayName) ?: "",
                )
            }
    }

    // 받은 편지함과 보낸 편지함을 같은 응답 형태로 노출하기 위해 상대방 이름과 함께 목록을 조회한다.
    fun findLetters(roomId: Long, memberId: Long, box: String): List<LetterSummaryResponse> {
        val sender = QMemberEntity("letterSummarySender")
        val receiver = QMemberEntity("letterSummaryReceiver")
        val counterpart = if (box == BOX_SENT) receiver else sender

        return queryFactory
            .select(
                letterEntity.id,
                letterEntity.roomId,
                letterEntity.title,
                letterEntity.body,
                letterEntity.senderMemberId,
                sender.displayName,
                letterEntity.receiverMemberId,
                receiver.displayName,
                letterEntity.sentAt,
                letterEntity.occurredDate,
                letterEntity.readAt,
                counterpart.id,
                counterpart.displayName,
            )
            .from(letterEntity)
            .join(sender).on(sender.id.eq(letterEntity.senderMemberId))
            .join(receiver).on(receiver.id.eq(letterEntity.receiverMemberId))
            .where(letterEntity.roomId.eq(roomId), mailboxCondition(memberId, box))
            .orderBy(letterEntity.sentAt.desc(), letterEntity.id.desc())
            .fetch()
            .map { row ->
                LetterSummaryResponse(
                    id = row.get(letterEntity.id) ?: 0L,
                    roomId = row.get(letterEntity.roomId) ?: roomId,
                    box = box,
                    title = row.get(letterEntity.title) ?: "",
                    bodyPreview = preview(row.get(letterEntity.body) ?: ""),
                    counterpartMemberId = row.get(counterpart.id) ?: 0L,
                    counterpartName = row.get(counterpart.displayName) ?: "",
                    sentAt = row.get(letterEntity.sentAt) ?: OffsetDateTime.now(),
                    occurredDate = row.get(letterEntity.occurredDate) ?: LocalDate.now(),
                    read = row.get(letterEntity.readAt) != null,
                )
            }
    }

    // 상세 조회와 읽음 처리를 위해 현재 회원이 접근 가능한 편지 엔티티만 조회한다.
    fun findAccessibleLetter(roomId: Long, letterId: Long, memberId: Long): LetterEntity? =
        queryFactory
            .selectFrom(letterEntity)
            .where(
                letterEntity.id.eq(letterId),
                letterEntity.roomId.eq(roomId),
                accessibleCondition(memberId),
            )
            .fetchOne()

    // 편지 상세 패널에서 발신자와 수신자 정보를 함께 보여주기 위해 단건 상세를 복원한다.
    fun findLetterDetail(roomId: Long, letterId: Long, memberId: Long): LetterDetailResponse? {
        val sender = QMemberEntity("letterDetailSender")
        val receiver = QMemberEntity("letterDetailReceiver")

        val row = queryFactory
            .select(
                letterEntity.id,
                letterEntity.roomId,
                letterEntity.title,
                letterEntity.body,
                letterEntity.senderMemberId,
                sender.displayName,
                letterEntity.receiverMemberId,
                receiver.displayName,
                letterEntity.sentAt,
                letterEntity.occurredDate,
                letterEntity.readAt,
            )
            .from(letterEntity)
            .join(sender).on(sender.id.eq(letterEntity.senderMemberId))
            .join(receiver).on(receiver.id.eq(letterEntity.receiverMemberId))
            .where(
                letterEntity.id.eq(letterId),
                letterEntity.roomId.eq(roomId),
                accessibleCondition(memberId),
            )
            .fetchOne()
            ?: return null

        val senderMemberId = row.get(letterEntity.senderMemberId) ?: 0L
        val readAt = row.get(letterEntity.readAt)

        return LetterDetailResponse(
            id = row.get(letterEntity.id) ?: letterId,
            roomId = row.get(letterEntity.roomId) ?: roomId,
            title = row.get(letterEntity.title) ?: "",
            body = row.get(letterEntity.body) ?: "",
            senderMemberId = senderMemberId,
            senderName = row.get(sender.displayName) ?: "",
            receiverMemberId = row.get(letterEntity.receiverMemberId) ?: 0L,
            receiverName = row.get(receiver.displayName) ?: "",
            sentAt = row.get(letterEntity.sentAt) ?: OffsetDateTime.now(),
            occurredDate = row.get(letterEntity.occurredDate) ?: LocalDate.now(),
            readAt = readAt,
            read = readAt != null,
            mine = senderMemberId == memberId,
        )
    }

    // 편지 전송 후 받은 편지함, 보낸 편지함, 캘린더에서 즉시 확인할 수 있도록 저장한다.
    fun save(letter: LetterEntity): LetterEntity =
        letterJpaRepository.save(letter)

    private fun mailboxCondition(memberId: Long, box: String): BooleanExpression =
        if (box == BOX_SENT) {
            letterEntity.senderMemberId.eq(memberId).and(letterEntity.deletedBySenderAt.isNull)
        } else {
            letterEntity.receiverMemberId.eq(memberId).and(letterEntity.deletedByReceiverAt.isNull)
        }

    private fun accessibleCondition(memberId: Long): BooleanExpression =
        letterEntity.senderMemberId.eq(memberId)
            .and(letterEntity.deletedBySenderAt.isNull)
            .or(
                letterEntity.receiverMemberId.eq(memberId)
                    .and(letterEntity.deletedByReceiverAt.isNull),
            )

    private fun preview(body: String): String =
        if (body.length <= BODY_PREVIEW_LENGTH) body else "${body.take(BODY_PREVIEW_LENGTH)}..."

    companion object {
        const val BOX_RECEIVED = "RECEIVED"
        const val BOX_SENT = "SENT"
        private const val BODY_PREVIEW_LENGTH = 80
    }
}
