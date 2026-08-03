package com.recordroom.notification.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.member.model.QMemberEntity
import com.recordroom.notification.model.NotificationEntity
import com.recordroom.notification.model.NotificationResponse
import com.recordroom.notification.model.NotificationTargetResponse
import com.recordroom.notification.model.QNotificationEntity.notificationEntity
import com.recordroom.room.model.QRoomEntity.roomEntity
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
class NotificationRepository(
    private val queryFactory: JPAQueryFactory,
    private val notificationJpaRepository: NotificationJpaRepository,
) {
    // 메인 화면에는 현재 회원이 아직 확인하지 않은 최신 알림만 최대 3개 노출한다.
    fun findLatestNotifications(memberId: Long): List<NotificationResponse> =
        findNotifications(
            memberId = memberId,
            offset = 0,
            limit = 3,
            unreadOnly = true,
            excludedTypes = setOf(CHAT_NOTIFICATION_TYPE),
        )

    // 전체 알림 모달은 현재 회원의 알림을 최신순으로 page/size만큼 조회한다.
    fun findNotifications(
        memberId: Long,
        offset: Long,
        limit: Long,
        unreadOnly: Boolean = false,
        excludedTypes: Set<String> = emptySet(),
    ): List<NotificationResponse> {
        val actor = QMemberEntity("actor")

        val query = queryFactory
            .select(
                notificationEntity.id,
                notificationEntity.type,
                notificationEntity.roomId,
                roomEntity.name,
                actor.displayName,
                notificationEntity.message,
                notificationEntity.createdAt,
                notificationEntity.readAt,
                notificationEntity.targetType,
                notificationEntity.targetId,
            )
            .from(notificationEntity)
            .leftJoin(roomEntity).on(roomEntity.id.eq(notificationEntity.roomId))
            .leftJoin(actor).on(actor.id.eq(notificationEntity.actorMemberId))

        if (unreadOnly) {
            query.where(notificationEntity.receiverMemberId.eq(memberId), notificationEntity.readAt.isNull)
        } else {
            query.where(notificationEntity.receiverMemberId.eq(memberId))
        }
        if (excludedTypes.isNotEmpty()) {
            query.where(notificationEntity.type.notIn(excludedTypes))
        }

        return query
            .orderBy(notificationEntity.createdAt.desc(), notificationEntity.id.desc())
            .offset(offset)
            .limit(limit)
            .fetch()
            .map { row ->
                val roomId = row.get(notificationEntity.roomId)
                val targetType = row.get(notificationEntity.targetType)
                val targetId = row.get(notificationEntity.targetId)

                NotificationResponse(
                    id = row.get(notificationEntity.id) ?: 0L,
                    type = row.get(notificationEntity.type) ?: "",
                    roomId = roomId,
                    roomName = row.get(roomEntity.name),
                    actorName = row.get(actor.displayName) ?: "시스템",
                    summary = row.get(notificationEntity.message) ?: "",
                    occurredAt = row.get(notificationEntity.createdAt) ?: java.time.OffsetDateTime.now(),
                    read = row.get(notificationEntity.readAt) != null,
                    target = NotificationTargetResponse(
                        type = targetType,
                        id = targetId,
                        url = buildTargetUrl(roomId, targetType, targetId),
                    ),
                )
            }
    }

    // 사이드바 배지는 방별 읽지 않은 알림 수만 집계해 실제 상태를 보여준다.
    fun countUnreadNotificationsByRoomAndTypes(
        memberId: Long,
        roomIds: List<Long>,
        types: Set<String>,
    ): Map<Long, Int> {
        if (roomIds.isEmpty() || types.isEmpty()) {
            return emptyMap()
        }

        val unreadCount = notificationEntity.id.count()

        return queryFactory
            .select(notificationEntity.roomId, unreadCount)
            .from(notificationEntity)
            .where(
                notificationEntity.receiverMemberId.eq(memberId),
                notificationEntity.roomId.`in`(roomIds),
                notificationEntity.type.`in`(types),
                notificationEntity.readAt.isNull,
            )
            .groupBy(notificationEntity.roomId)
            .fetch()
            .mapNotNull { row ->
                val roomId = row.get(notificationEntity.roomId) ?: return@mapNotNull null
                val count = row.get(unreadCount)?.toInt() ?: 0

                roomId to count
            }
            .toMap()
    }

    // 채팅방 진입 시 해당 방의 읽지 않은 채팅 알림만 일괄 읽음 처리한다.
    fun markUnreadRoomChatNotificationsAsRead(memberId: Long, roomId: Long, readAt: OffsetDateTime): Long =
        queryFactory
            .update(notificationEntity)
            .set(notificationEntity.readAt, readAt)
            .where(
                notificationEntity.receiverMemberId.eq(memberId),
                notificationEntity.roomId.eq(roomId),
                notificationEntity.type.eq(CHAT_NOTIFICATION_TYPE),
                notificationEntity.readAt.isNull,
            )
            .execute()

    // 읽음 처리는 소유자 검증을 위해 notification id와 receiver member id를 함께 확인한다.
    fun findOwnedNotification(notificationId: Long, memberId: Long): NotificationEntity? =
        notificationJpaRepository.findById(notificationId)
            .orElse(null)
            ?.takeIf { it.receiverMemberId == memberId }

    // JPA dirty checking이 아닌 명시적 저장으로 읽음 처리 결과를 고정한다.
    fun save(notification: NotificationEntity): NotificationEntity =
        notificationJpaRepository.save(notification)

    fun saveAll(notifications: List<NotificationEntity>): List<NotificationEntity> =
        notificationJpaRepository.saveAll(notifications)

    private fun buildTargetUrl(roomId: Long?, targetType: String?, targetId: Long?): String {
        val roomPath = roomId?.let { "/rooms/$it" } ?: "/"
        val featurePath = when (targetType) {
            "CHAT" -> "chat"
            "LETTER" -> "letters"
            "MEMORY" -> "memories"
            "MISSION" -> "missions"
            else -> ""
        }
        val focus = targetId?.let { "?targetId=$it" } ?: ""

        return if (featurePath.isEmpty()) roomPath else "$roomPath/$featurePath$focus"
    }

    companion object {
        const val CHAT_NOTIFICATION_TYPE = "CHAT"
    }
}
