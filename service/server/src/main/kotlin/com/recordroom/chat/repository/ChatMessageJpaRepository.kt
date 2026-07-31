package com.recordroom.chat.repository

import com.recordroom.chat.model.ChatMessageEntity
import org.springframework.data.jpa.repository.JpaRepository

interface ChatMessageJpaRepository : JpaRepository<ChatMessageEntity, Long>
