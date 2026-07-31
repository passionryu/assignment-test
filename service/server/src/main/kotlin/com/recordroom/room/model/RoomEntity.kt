package com.recordroom.room.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "rooms")
class RoomEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "name", nullable = false, length = 80)
    var name: String = "",

    @Column(name = "description", length = 255)
    var description: String? = null,

    @Column(name = "type", nullable = false, length = 20)
    var type: String = "",

    @Column(name = "owner_member_id", nullable = false)
    var ownerMemberId: Long = 0,

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: OffsetDateTime? = null,
)
