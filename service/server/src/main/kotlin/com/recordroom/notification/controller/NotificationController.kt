package com.recordroom.notification.controller

import com.recordroom.member.service.CurrentMemberResolver
import com.recordroom.notification.model.NotificationReadResponse
import com.recordroom.notification.model.NotificationsResponse
import com.recordroom.notification.service.NotificationService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val notificationService: NotificationService,
) {
    @GetMapping("/latest")
    fun getLatestNotifications(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): NotificationsResponse =
        notificationService.getLatestNotifications(currentMemberResolver.resolve(rawMemberId))

    @GetMapping
    fun getNotifications(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): NotificationsResponse =
        notificationService.getNotifications(
            memberId = currentMemberResolver.resolve(rawMemberId),
            page = page,
            size = size,
        )

    @PostMapping("/{notificationId}/read")
    fun readNotification(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable notificationId: Long,
    ): NotificationReadResponse =
        notificationService.readNotification(
            memberId = currentMemberResolver.resolve(rawMemberId),
            notificationId = notificationId,
        )

    @PostMapping("/rooms/{roomId}/features/{feature}/read")
    fun readRoomFeatureNotifications(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable feature: String,
    ): NotificationReadResponse =
        notificationService.readRoomFeatureNotifications(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            feature = feature,
        )
}
