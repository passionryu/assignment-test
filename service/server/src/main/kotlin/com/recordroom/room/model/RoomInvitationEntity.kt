package com.recordroom.room.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "room_invitations")
class RoomInvitationEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "inviter_member_id", nullable = false)
    var inviterMemberId: Long = 0,

    @Column(name = "invitee_email", length = 255)
    var inviteeEmail: String? = null,

    @Column(name = "invitee_phone_number", length = 30)
    var inviteePhoneNumber: String? = null,

    @Column(name = "invitee_member_id")
    var inviteeMemberId: Long? = null,

    @Column(name = "status", nullable = false, length = 20)
    var status: String = "",

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "expires_at", nullable = false)
    var expiresAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "responded_at")
    var respondedAt: OffsetDateTime? = null,
)
