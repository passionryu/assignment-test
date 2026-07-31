package com.recordroom.notification.model

import java.time.OffsetDateTime

data class NotificationsResponse(
    val items: List<NotificationResponse>,
)

data class NotificationResponse(
    val id: Long,
    val type: String,
    val roomId: Long?,
    val roomName: String?,
    val actorName: String,
    val summary: String,
    val occurredAt: OffsetDateTime,
    val read: Boolean,
    val target: NotificationTargetResponse,
)

data class NotificationTargetResponse(
    val type: String?,
    val id: Long?,
    val url: String,
)

data class NotificationReadResponse(
    val read: Boolean,
)
