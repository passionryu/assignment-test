package com.recordroom.member.repository

import com.recordroom.member.model.NotificationSettingsEntity
import org.springframework.data.jpa.repository.JpaRepository

interface NotificationSettingsJpaRepository : JpaRepository<NotificationSettingsEntity, Long>
