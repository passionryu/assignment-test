package com.recordroom.room.repository

import com.recordroom.room.model.RoomMemberEntity
import org.springframework.data.jpa.repository.JpaRepository

interface RoomMemberJpaRepository : JpaRepository<RoomMemberEntity, Long> {
    fun findByRoomIdAndMemberIdAndLeftAtIsNull(roomId: Long, memberId: Long): RoomMemberEntity?

    fun existsByRoomIdAndMemberIdAndLeftAtIsNull(roomId: Long, memberId: Long): Boolean
}
