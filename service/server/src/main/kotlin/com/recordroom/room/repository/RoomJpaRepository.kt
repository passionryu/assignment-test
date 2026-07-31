package com.recordroom.room.repository

import com.recordroom.room.model.RoomEntity
import org.springframework.data.jpa.repository.JpaRepository

interface RoomJpaRepository : JpaRepository<RoomEntity, Long> {
    fun findByIdAndArchivedAtIsNull(id: Long): RoomEntity?
}
