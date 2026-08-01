package com.recordroom.memory.repository

import com.recordroom.calendar.model.MemoryPostEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MemoryPostJpaRepository : JpaRepository<MemoryPostEntity, Long>
