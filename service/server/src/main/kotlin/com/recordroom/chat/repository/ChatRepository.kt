package com.recordroom.chat.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.chat.model.AI_ASSISTANT_MEMBER_ID
import com.recordroom.chat.model.ChatMessageEntity
import com.recordroom.chat.model.ChatMessageResponse
import com.recordroom.chat.model.ChatReplyCandidate
import com.recordroom.chat.model.ChatSearchResultResponse
import com.recordroom.chat.model.QChatMessageEntity.chatMessageEntity
import com.recordroom.member.model.QMemberEntity
import com.recordroom.room.model.QRoomMemberEntity
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
class ChatRepository(
    private val queryFactory: JPAQueryFactory,
    private val chatMessageJpaRepository: ChatMessageJpaRepository,
) {
    // 사용자가 선택한 방의 대화 흐름을 날짜순으로 복원하기 위해 메시지와 보낸 사람 이름을 함께 조회한다.
    fun findMessages(roomId: Long, memberId: Long, date: LocalDate?): List<ChatMessageResponse> {
        val sender = QMemberEntity("chatMessageSender")

        return queryFactory
            .select(
                chatMessageEntity.id,
                chatMessageEntity.roomId,
                chatMessageEntity.senderMemberId,
                sender.displayName,
                chatMessageEntity.body,
                chatMessageEntity.sentAt,
                chatMessageEntity.occurredDate,
            )
            .from(chatMessageEntity)
            .join(sender).on(sender.id.eq(chatMessageEntity.senderMemberId))
            .where(
                chatMessageEntity.roomId.eq(roomId),
                chatMessageEntity.deletedAt.isNull,
                date?.let { chatMessageEntity.occurredDate.eq(it) },
            )
            .orderBy(chatMessageEntity.sentAt.asc(), chatMessageEntity.id.asc())
            .fetch()
            .map { row ->
                val senderMemberId = row.get(chatMessageEntity.senderMemberId) ?: 0L

                ChatMessageResponse(
                    id = row.get(chatMessageEntity.id) ?: 0L,
                    roomId = row.get(chatMessageEntity.roomId) ?: roomId,
                    senderMemberId = senderMemberId,
                    senderName = row.get(sender.displayName) ?: "",
                    senderType = if (senderMemberId == AI_ASSISTANT_MEMBER_ID) "ASSISTANT" else "MEMBER",
                    body = row.get(chatMessageEntity.body) ?: "",
                    sentAt = row.get(chatMessageEntity.sentAt) ?: java.time.OffsetDateTime.now(),
                    occurredDate = row.get(chatMessageEntity.occurredDate) ?: LocalDate.now(),
                    mine = senderMemberId == memberId,
                )
            }
    }

    // 새 채팅과 AI 응답을 같은 테이블에 기록해 이후 캘린더와 검색에서 동일하게 활용한다.
    fun saveMessage(message: ChatMessageEntity): ChatMessageEntity =
        chatMessageJpaRepository.save(message)

    // GPT 키가 없을 때도 실제 방 구성원이 답한 것처럼 보이도록 현재 사용자를 제외한 활성 멤버를 조회한다.
    fun findReplyCandidates(roomId: Long, excludedMemberId: Long): List<ChatReplyCandidate> {
        val replyMember = QRoomMemberEntity("replyMember")
        val member = QMemberEntity("replyCandidateMember")

        return queryFactory
            .select(replyMember.memberId, member.displayName)
            .from(replyMember)
            .join(member).on(member.id.eq(replyMember.memberId))
            .where(
                replyMember.roomId.eq(roomId),
                replyMember.leftAt.isNull,
                replyMember.memberId.ne(excludedMemberId),
                member.deleted.isFalse,
            )
            .orderBy(replyMember.id.asc())
            .fetch()
            .map { row ->
                ChatReplyCandidate(
                    memberId = row.get(replyMember.memberId) ?: 0L,
                    displayName = row.get(member.displayName) ?: "",
                )
            }
            .filter { it.memberId > 0 }
    }

    // 사용자가 검색어로 과거 대화 위치를 찾을 수 있도록 선택 방 안의 메시지를 부분 일치로 조회한다.
    fun searchMessages(roomId: Long, keyword: String): List<ChatSearchResultResponse> {
        val sender = QMemberEntity("chatSearchSender")

        return queryFactory
            .select(
                chatMessageEntity.id,
                sender.displayName,
                chatMessageEntity.body,
                chatMessageEntity.sentAt,
                chatMessageEntity.occurredDate,
            )
            .from(chatMessageEntity)
            .join(sender).on(sender.id.eq(chatMessageEntity.senderMemberId))
            .where(
                chatMessageEntity.roomId.eq(roomId),
                chatMessageEntity.deletedAt.isNull,
                chatMessageEntity.body.containsIgnoreCase(keyword),
            )
            .orderBy(chatMessageEntity.sentAt.desc(), chatMessageEntity.id.desc())
            .limit(20)
            .fetch()
            .map { row ->
                ChatSearchResultResponse(
                    messageId = row.get(chatMessageEntity.id) ?: 0L,
                    senderName = row.get(sender.displayName) ?: "",
                    body = row.get(chatMessageEntity.body) ?: "",
                    sentAt = row.get(chatMessageEntity.sentAt) ?: java.time.OffsetDateTime.now(),
                    occurredDate = row.get(chatMessageEntity.occurredDate) ?: LocalDate.now(),
                )
            }
    }
}
