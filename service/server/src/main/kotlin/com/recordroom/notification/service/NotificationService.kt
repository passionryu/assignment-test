package com.recordroom.notification.service

import com.recordroom.common.ApiException
import com.recordroom.member.service.MemberService
import com.recordroom.notification.model.NotificationReadResponse
import com.recordroom.notification.model.NotificationsResponse
import com.recordroom.notification.repository.NotificationRepository
import com.recordroom.room.repository.RoomRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
@Transactional(readOnly = true)
class NotificationService(
    private val memberService: MemberService,
    private val notificationRepository: NotificationRepository,
    private val roomRepository: RoomRepository,
) {
    fun getLatestNotifications(memberId: Long): NotificationsResponse {
        memberService.getProfile(memberId)

        return NotificationsResponse(
            items = notificationRepository.findLatestNotifications(memberId),
        )
    }

    fun getNotifications(memberId: Long, page: Int, size: Int): NotificationsResponse {
        memberService.getProfile(memberId)
        validatePaging(page, size)

        return NotificationsResponse(
            items = notificationRepository.findNotifications(
                memberId = memberId,
                offset = page.toLong() * size.toLong(),
                limit = size.toLong(),
                excludedTypes = setOf(NotificationRepository.CHAT_NOTIFICATION_TYPE),
            ),
        )
    }

    @Transactional
    fun readNotification(memberId: Long, notificationId: Long): NotificationReadResponse {
        memberService.getProfile(memberId)

        val notification = notificationRepository.findOwnedNotification(notificationId, memberId)
            ?: throw ApiException(HttpStatus.NOT_FOUND, "NOTIFICATION_NOT_FOUND", "알림을 찾을 수 없습니다.")

        if (notification.readAt == null) {
            notification.readAt = OffsetDateTime.now()
            notificationRepository.save(notification)
        }

        return NotificationReadResponse(read = true)
    }

    @Transactional
    fun readRoomFeatureNotifications(memberId: Long, roomId: Long, feature: String): NotificationReadResponse {
        memberService.getProfile(memberId)

        validateMemberCanReadRoomFeatureNotifications(memberId, roomId)
        val notificationTypes = notificationTypesForFeature(feature)
        notificationRepository.markUnreadRoomNotificationsByTypesAsRead(
            memberId = memberId,
            roomId = roomId,
            types = notificationTypes,
            readAt = OffsetDateTime.now(),
        )

        return NotificationReadResponse(read = true)
    }

    private fun validatePaging(page: Int, size: Int) {
        if (page < 0) {
            throw ApiException(HttpStatus.BAD_REQUEST, "PAGE_INVALID", "페이지 번호는 0 이상이어야 합니다.")
        }
        if (size !in 1..100) {
            throw ApiException(HttpStatus.BAD_REQUEST, "SIZE_INVALID", "조회 개수는 1개 이상 100개 이하로 입력해 주세요.")
        }
    }

    private fun validateMemberCanReadRoomFeatureNotifications(memberId: Long, roomId: Long) {
        if (roomRepository.findActiveRoomMember(roomId, memberId) != null) {
            return
        }

        throw ApiException(
            HttpStatus.FORBIDDEN,
            "ROOM_ACCESS_DENIED",
            "참여 중인 방의 알림만 읽음 처리할 수 있습니다.",
        )
    }

    private fun notificationTypesForFeature(feature: String): Set<String> =
        when (feature.lowercase()) {
            "chat" -> setOf(NotificationRepository.CHAT_NOTIFICATION_TYPE)
            "memories" -> setOf(NotificationRepository.MEMORY_NOTIFICATION_TYPE)
            "missions" -> NotificationRepository.MISSION_NOTIFICATION_TYPES
            "letters" -> setOf(NotificationRepository.LETTER_NOTIFICATION_TYPE)
            else -> throw ApiException(
                HttpStatus.BAD_REQUEST,
                "NOTIFICATION_FEATURE_INVALID",
                "알림을 읽음 처리할 수 없는 기능입니다.",
            )
        }
}
