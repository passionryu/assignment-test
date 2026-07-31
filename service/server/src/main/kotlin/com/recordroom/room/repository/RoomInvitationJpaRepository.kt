package com.recordroom.room.repository

import com.recordroom.room.model.RoomInvitationEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.time.OffsetDateTime

interface RoomInvitationJpaRepository : JpaRepository<RoomInvitationEntity, Long> {
    fun findByIdAndStatus(id: Long, status: String): RoomInvitationEntity?

    fun existsByRoomIdAndStatusAndInviteeMemberIdAndExpiresAtAfter(
        roomId: Long,
        status: String,
        inviteeMemberId: Long,
        expiresAt: OffsetDateTime,
    ): Boolean

    fun existsByRoomIdAndStatusAndInviteeEmailAndExpiresAtAfter(
        roomId: Long,
        status: String,
        inviteeEmail: String,
        expiresAt: OffsetDateTime,
    ): Boolean

    fun existsByRoomIdAndStatusAndInviteePhoneNumberAndExpiresAtAfter(
        roomId: Long,
        status: String,
        inviteePhoneNumber: String,
        expiresAt: OffsetDateTime,
    ): Boolean
}
