package com.recordroom.chat.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(name = "chat_messages")
class ChatMessageEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "sender_member_id", nullable = false)
    var senderMemberId: Long = 0,

    @Column(name = "body", nullable = false)
    var body: String = "",

    @Column(name = "sent_at", nullable = false)
    var sentAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate = LocalDate.now(),

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null,
)
