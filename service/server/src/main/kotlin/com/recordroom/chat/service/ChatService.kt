package com.recordroom.chat.service

import com.recordroom.chat.model.ChatMessageEntity
import com.recordroom.chat.model.ChatMessagesResponse
import com.recordroom.chat.model.ChatSearchResponse
import com.recordroom.chat.model.SendChatMessageRequest
import com.recordroom.chat.model.SendChatMessageResponse
import com.recordroom.chat.repository.ChatRepository
import com.recordroom.common.ApiException
import com.recordroom.member.service.MemberService
import com.recordroom.room.model.RoomEntity
import com.recordroom.room.repository.RoomRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId

@Service
@Transactional(readOnly = true)
class ChatService(
    private val memberService: MemberService,
    private val roomRepository: RoomRepository,
    private val chatRepository: ChatRepository,
) {
    private val log = LoggerFactory.getLogger(ChatService::class.java)
    private val seoulZone = ZoneId.of("Asia/Seoul")

    fun getMessages(memberId: Long, roomId: Long, date: LocalDate?): ChatMessagesResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/chat/messages")
        val messages = chatRepository.findMessages(roomId, memberId, date)

        return ChatMessagesResponse(
            roomId = room.id,
            roomName = room.name,
            date = date,
            messages = messages,
        )
    }

    @Transactional
    fun sendMessage(memberId: Long, roomId: Long, request: SendChatMessageRequest): SendChatMessageResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/chat/messages")
        val body = validateMessageBody(memberId, roomId, request.body)
        val now = OffsetDateTime.now(seoulZone)

        val userMessage = chatRepository.saveMessage(
            ChatMessageEntity(
                roomId = room.id,
                senderMemberId = memberId,
                body = body,
                sentAt = now,
                occurredDate = now.toLocalDate(),
            ),
        )

        return SendChatMessageResponse(
            roomId = room.id,
            createdMessages = chatRepository.findMessages(room.id, memberId, now.toLocalDate())
                .filter { it.id == userMessage.id },
        )
    }

    fun searchMessages(memberId: Long, roomId: Long, keyword: String?): ChatSearchResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/chat/search")
        val normalizedKeyword = validateSearchKeyword(memberId, roomId, keyword)
        val results = chatRepository.searchMessages(roomId, normalizedKeyword)

        return ChatSearchResponse(
            roomId = roomId,
            keyword = normalizedKeyword,
            results = results,
        )
    }

    private fun readRoomJoinedByMember(memberId: Long, roomId: Long, what: String): RoomEntity {
        val room = roomRepository.findActiveRoom(roomId) ?: run {
            log.warn(
                "[채팅] 방 조회 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=room_not_found",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "방을 찾을 수 없습니다.")
        }

        if (roomRepository.findActiveRoomMember(roomId, memberId) == null) {
            log.warn(
                "[채팅] 방 접근 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=member_not_joined_room",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_ACCESS_DENIED", "참여 중인 방의 채팅만 볼 수 있습니다.")
        }

        return room
    }

    private fun validateMessageBody(memberId: Long, roomId: Long, rawBody: String?): String {
        val body = rawBody?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, "body:null", "메시지를 입력해 주세요.", "CHAT_MESSAGE_REQUIRED")

        if (body.length > MAX_MESSAGE_LENGTH) {
            badRequest(memberId, roomId, "body:length:${body.length}", "메시지는 500자 이하로 입력해 주세요.", "CHAT_MESSAGE_TOO_LONG")
        }

        return body
    }

    private fun validateSearchKeyword(memberId: Long, roomId: Long, rawKeyword: String?): String {
        val keyword = rawKeyword?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, "keyword:null", "검색어를 입력해 주세요.", "CHAT_SEARCH_KEYWORD_REQUIRED")

        if (keyword.length > MAX_SEARCH_KEYWORD_LENGTH) {
            badRequest(memberId, roomId, "keyword:length:${keyword.length}", "검색어는 50자 이하로 입력해 주세요.", "CHAT_SEARCH_KEYWORD_TOO_LONG")
        }

        return keyword
    }

    private fun badRequest(memberId: Long, roomId: Long, requestData: String, message: String, code: String): Nothing {
        log.warn(
            "[채팅] 요청 값 검증 실패. who=memberId:{}, what=ChatService, requestData=roomId:{},{}, reason={}",
            memberId,
            roomId,
            requestData,
            code,
        )
        throw ApiException(HttpStatus.BAD_REQUEST, code, message)
    }

    companion object {
        private const val MAX_MESSAGE_LENGTH = 500
        private const val MAX_SEARCH_KEYWORD_LENGTH = 50
    }
}
