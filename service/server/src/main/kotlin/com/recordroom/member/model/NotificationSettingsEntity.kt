package com.recordroom.member.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "notification_settings")
class NotificationSettingsEntity(
    @Id
    @Column(name = "member_id")
    var memberId: Long = 0,

    @Column(name = "all_enabled", nullable = false)
    var allEnabled: Boolean = true,

    @Column(name = "chat_enabled", nullable = false)
    var chatEnabled: Boolean = true,

    @Column(name = "letter_enabled", nullable = false)
    var letterEnabled: Boolean = true,

    @Column(name = "memory_enabled", nullable = false)
    var memoryEnabled: Boolean = true,

    @Column(name = "mission_enabled", nullable = false)
    var missionEnabled: Boolean = true,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),
)
