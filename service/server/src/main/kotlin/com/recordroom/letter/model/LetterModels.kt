package com.recordroom.letter.model

import java.time.LocalDate
import java.time.OffsetDateTime

data class LettersResponse(
    val roomId: Long,
    val roomName: String,
    val box: String,
    val recipients: List<LetterRecipientResponse>,
    val items: List<LetterSummaryResponse>,
)

data class LetterRecipientResponse(
    val memberId: Long,
    val displayName: String,
)

data class LetterSummaryResponse(
    val id: Long,
    val roomId: Long,
    val box: String,
    val title: String,
    val bodyPreview: String,
    val counterpartMemberId: Long,
    val counterpartName: String,
    val sentAt: OffsetDateTime,
    val occurredDate: LocalDate,
    val read: Boolean,
)

data class LetterDetailResponse(
    val id: Long,
    val roomId: Long,
    val title: String,
    val body: String,
    val senderMemberId: Long,
    val senderName: String,
    val receiverMemberId: Long,
    val receiverName: String,
    val sentAt: OffsetDateTime,
    val occurredDate: LocalDate,
    val readAt: OffsetDateTime?,
    val read: Boolean,
    val mine: Boolean,
)

data class SendLetterRequest(
    val receiverMemberId: Long?,
    val title: String?,
    val body: String?,
)

data class SendLetterResponse(
    val letter: LetterDetailResponse,
)
