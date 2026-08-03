package com.recordroom.chat.controller

import com.recordroom.chat.model.ChatMessagesResponse
import com.recordroom.chat.model.ChatReadResponse
import com.recordroom.chat.model.ChatSearchResponse
import com.recordroom.chat.model.SendChatMessageRequest
import com.recordroom.chat.model.SendChatMessageResponse
import com.recordroom.chat.service.ChatService
import com.recordroom.member.service.CurrentMemberResolver
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/rooms/{roomId}/chat")
class ChatController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val chatService: ChatService,
) {
    @GetMapping("/messages")
    fun getMessages(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?,
    ): ChatMessagesResponse =
        chatService.getMessages(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            date = date,
        )

    @PostMapping("/messages")
    fun sendMessage(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestBody request: SendChatMessageRequest,
    ): SendChatMessageResponse =
        chatService.sendMessage(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            request = request,
        )

    @PostMapping("/read")
    fun readRoomChat(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
    ): ChatReadResponse =
        chatService.readRoomChat(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
        )

    @GetMapping("/search")
    fun searchMessages(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestParam(required = false) keyword: String?,
    ): ChatSearchResponse =
        chatService.searchMessages(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            keyword = keyword,
        )
}
