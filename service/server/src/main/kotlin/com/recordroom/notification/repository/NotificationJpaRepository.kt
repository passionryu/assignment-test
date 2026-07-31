package com.recordroom.notification.repository

import com.recordroom.notification.model.NotificationEntity
import org.springframework.data.jpa.repository.JpaRepository

interface NotificationJpaRepository : JpaRepository<NotificationEntity, Long>
