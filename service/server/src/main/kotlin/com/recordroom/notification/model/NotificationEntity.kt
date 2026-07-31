package com.recordroom.notification.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "notifications")
class NotificationEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "receiver_member_id", nullable = false)
    var receiverMemberId: Long = 0,

    @Column(name = "room_id")
    var roomId: Long? = null,

    @Column(name = "actor_member_id")
    var actorMemberId: Long? = null,

    @Column(name = "type", nullable = false, length = 40)
    var type: String = "",

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "message", nullable = false, length = 255)
    var message: String = "",

    @Column(name = "target_type", length = 40)
    var targetType: String? = null,

    @Column(name = "target_id")
    var targetId: Long? = null,

    @Column(name = "occurred_date")
    var occurredDate: java.time.LocalDate? = null,

    @Column(name = "read_at")
    var readAt: OffsetDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),
)
