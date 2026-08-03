package com.recordroom.chat.model

import java.time.LocalDate
import java.time.OffsetDateTime

data class ChatMessagesResponse(
    val roomId: Long,
    val roomName: String,
    val date: LocalDate?,
    val messages: List<ChatMessageResponse>,
)

data class ChatMessageResponse(
    val id: Long,
    val roomId: Long,
    val senderMemberId: Long,
    val senderName: String,
    val senderType: String,
    val body: String,
    val sentAt: OffsetDateTime,
    val occurredDate: LocalDate,
    val mine: Boolean,
)

data class SendChatMessageRequest(
    val body: String?,
)

data class SendChatMessageResponse(
    val roomId: Long,
    val createdMessages: List<ChatMessageResponse>,
)

data class ChatSearchResponse(
    val roomId: Long,
    val keyword: String,
    val results: List<ChatSearchResultResponse>,
)

data class ChatSearchResultResponse(
    val messageId: Long,
    val senderName: String,
    val body: String,
    val sentAt: OffsetDateTime,
    val occurredDate: LocalDate,
)
