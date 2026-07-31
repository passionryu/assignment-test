package com.recordroom.room.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "room_members")
class RoomMemberEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "member_id", nullable = false)
    var memberId: Long = 0,

    @Column(name = "role", nullable = false, length = 20)
    var role: String = "",

    @Column(name = "joined_at", nullable = false)
    var joinedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "left_at")
    var leftAt: OffsetDateTime? = null,
)
