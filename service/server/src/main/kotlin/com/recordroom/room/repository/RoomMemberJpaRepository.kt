package com.recordroom.room.repository

import com.recordroom.room.model.RoomMemberEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.OffsetDateTime

interface RoomMemberJpaRepository : JpaRepository<RoomMemberEntity, Long> {
    fun findByRoomIdAndMemberIdAndLeftAtIsNull(roomId: Long, memberId: Long): RoomMemberEntity?

    fun existsByRoomIdAndMemberIdAndLeftAtIsNull(roomId: Long, memberId: Long): Boolean

    fun findByRoomIdAndLeftAtIsNull(roomId: Long): List<RoomMemberEntity>

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        update RoomMemberEntity roomMember
        set roomMember.leftAt = :leftAt
        where roomMember.roomId = :roomId
            and roomMember.memberId = :memberId
            and roomMember.leftAt is null
            and roomMember.role <> 'OWNER'
        """,
    )
    fun markMemberLeft(
        @Param("roomId") roomId: Long,
        @Param("memberId") memberId: Long,
        @Param("leftAt") leftAt: OffsetDateTime,
    ): Int
}
