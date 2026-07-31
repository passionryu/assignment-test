package com.recordroom.calendar.model

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

@Entity
@Table(name = "memory_posts")
class MemoryPostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "author_member_id", nullable = false)
    var authorMemberId: Long = 0,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "body", nullable = false)
    var body: String = "",

    @Column(name = "representative_image_url", length = 500)
    var representativeImageUrl: String? = null,

    @Column(name = "image_count", nullable = false)
    var imageCount: Int = 0,

    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate = LocalDate.now(),

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null,
)

@Entity
@Table(name = "missions")
class MissionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "description", nullable = false)
    var description: String = "",

    @Column(name = "status", nullable = false, length = 30)
    var status: String = "",

    @Column(name = "created_by_member_id", nullable = false)
    var createdByMemberId: Long = 0,

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "completed_at")
    var completedAt: OffsetDateTime? = null,
)

@Entity
@Table(name = "mission_submissions")
class MissionSubmissionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "mission_id", nullable = false)
    var missionId: Long = 0,

    @Column(name = "submitter_member_id", nullable = false)
    var submitterMemberId: Long = 0,

    @Column(name = "body", nullable = false)
    var body: String = "",

    @Column(name = "image_url", length = 500)
    var imageUrl: String? = null,

    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate = LocalDate.now(),

    @Column(name = "submitted_at", nullable = false)
    var submittedAt: OffsetDateTime = OffsetDateTime.now(),
)

@Entity
@Table(name = "letters")
class LetterEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "sender_member_id", nullable = false)
    var senderMemberId: Long = 0,

    @Column(name = "receiver_member_id", nullable = false)
    var receiverMemberId: Long = 0,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "body", nullable = false)
    var body: String = "",

    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate = LocalDate.now(),

    @Column(name = "sent_at", nullable = false)
    var sentAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "read_at")
    var readAt: OffsetDateTime? = null,

    @Column(name = "deleted_by_sender_at")
    var deletedBySenderAt: OffsetDateTime? = null,

    @Column(name = "deleted_by_receiver_at")
    var deletedByReceiverAt: OffsetDateTime? = null,
)
