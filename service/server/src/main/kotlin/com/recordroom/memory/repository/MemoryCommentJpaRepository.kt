package com.recordroom.memory.repository

import com.recordroom.memory.model.MemoryCommentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MemoryCommentJpaRepository : JpaRepository<MemoryCommentEntity, Long>
