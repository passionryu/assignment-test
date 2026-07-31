package com.recordroom.notification.service

import com.recordroom.common.ApiException
import com.recordroom.member.service.MemberService
import com.recordroom.notification.model.NotificationReadResponse
import com.recordroom.notification.model.NotificationsResponse
import com.recordroom.notification.repository.NotificationRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
@Transactional(readOnly = true)
class NotificationService(
    private val memberService: MemberService,
    private val notificationRepository: NotificationRepository,
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

    private fun validatePaging(page: Int, size: Int) {
        if (page < 0) {
            throw ApiException(HttpStatus.BAD_REQUEST, "PAGE_INVALID", "페이지 번호는 0 이상이어야 합니다.")
        }
        if (size !in 1..100) {
            throw ApiException(HttpStatus.BAD_REQUEST, "SIZE_INVALID", "조회 개수는 1개 이상 100개 이하로 입력해 주세요.")
        }
    }
}
