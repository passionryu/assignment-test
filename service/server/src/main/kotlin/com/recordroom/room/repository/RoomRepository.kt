package com.recordroom.room.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.member.model.QMemberEntity.memberEntity
import com.recordroom.room.model.PendingRoomInvitationResponse
import com.recordroom.room.model.QRoomEntity.roomEntity
import com.recordroom.room.model.QRoomInvitationEntity.roomInvitationEntity
import com.recordroom.room.model.QRoomMemberEntity
import com.recordroom.room.model.RoomEntity
import com.recordroom.room.model.RoomInvitationEntity
import com.recordroom.room.model.RoomMemberEntity
import com.recordroom.room.model.RoomSummaryResponse
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
class RoomRepository(
    private val queryFactory: JPAQueryFactory,
    private val roomJpaRepository: RoomJpaRepository,
    private val roomMemberJpaRepository: RoomMemberJpaRepository,
    private val roomInvitationJpaRepository: RoomInvitationJpaRepository,
) {
    // 사용자가 참여 중인 방만 사이드바에 노출해야 하므로 멤버십 기준으로 조회한다.
    fun findRoomsJoinedByMember(memberId: Long): List<RoomSummaryResponse> {
        val joinedMember = QRoomMemberEntity("joinedMember")
        val activeMember = QRoomMemberEntity("activeMember")
        val memberCount = activeMember.id.count()

        return queryFactory
            .select(
                roomEntity.id,
                roomEntity.name,
                roomEntity.description,
                roomEntity.type,
                joinedMember.role,
                memberCount,
            )
            .from(roomEntity)
            .join(joinedMember).on(
                joinedMember.roomId.eq(roomEntity.id),
                joinedMember.memberId.eq(memberId),
                joinedMember.leftAt.isNull,
            )
            .leftJoin(activeMember).on(
                activeMember.roomId.eq(roomEntity.id),
                activeMember.leftAt.isNull,
            )
            .where(roomEntity.archivedAt.isNull)
            .groupBy(roomEntity.id, roomEntity.name, roomEntity.description, roomEntity.type, joinedMember.role)
            .orderBy(roomEntity.id.asc())
            .fetch()
            .map { row ->
                val roomId = row.get(roomEntity.id) ?: 0L

                RoomSummaryResponse(
                    id = roomId,
                    name = row.get(roomEntity.name) ?: "",
                    description = row.get(roomEntity.description),
                    type = row.get(roomEntity.type) ?: "",
                    role = row.get(joinedMember.role) ?: "",
                    memberCount = row.get(memberCount)?.toInt() ?: 0,
                    unreadChatCount = seedUnreadChatCount(roomId),
                    pendingMissionCount = seedPendingMissionCount(roomId),
                )
            }
    }

    // 초대 받은 방 조회 탭에 표시할 대기 초대 수를 현재 회원 식별값 기준으로 계산한다.
    fun countPendingInvitationsForMember(memberId: Long): Int =
        queryFactory
            .select(roomInvitationEntity.id.count())
            .from(roomInvitationEntity)
            .join(memberEntity).on(memberEntity.id.eq(memberId))
            .where(
                roomInvitationEntity.status.eq("PENDING"),
                roomInvitationEntity.expiresAt.after(OffsetDateTime.now()),
                roomInvitationEntity.inviteeMemberId.eq(memberEntity.id)
                    .or(roomInvitationEntity.inviteeEmail.eq(memberEntity.email))
                    .or(roomInvitationEntity.inviteePhoneNumber.eq(memberEntity.phoneNumber)),
            )
            .fetchOne()
            ?.toInt() ?: 0

    fun saveRoom(room: RoomEntity): RoomEntity =
        roomJpaRepository.save(room)

    fun saveRoomMember(roomMember: RoomMemberEntity): RoomMemberEntity =
        roomMemberJpaRepository.save(roomMember)

    fun saveRoomInvitation(invitation: RoomInvitationEntity): RoomInvitationEntity =
        roomInvitationJpaRepository.save(invitation)

    fun findActiveRoom(roomId: Long): RoomEntity? =
        roomJpaRepository.findByIdAndArchivedAtIsNull(roomId)

    fun findActiveRoomMember(roomId: Long, memberId: Long): RoomMemberEntity? =
        roomMemberJpaRepository.findByRoomIdAndMemberIdAndLeftAtIsNull(roomId, memberId)

    fun existsActiveRoomMember(roomId: Long, memberId: Long): Boolean =
        roomMemberJpaRepository.existsByRoomIdAndMemberIdAndLeftAtIsNull(roomId, memberId)

    // 방 정보 화면에는 현재 참여 중인 멤버 수만 보여줘야 하므로 탈퇴하지 않은 멤버십을 집계한다.
    fun countActiveRoomMembers(roomId: Long): Int {
        val activeMember = QRoomMemberEntity("activeRoomMemberCount")

        return queryFactory
            .select(activeMember.id.count())
            .from(activeMember)
            .where(
                activeMember.roomId.eq(roomId),
                activeMember.leftAt.isNull,
            )
            .fetchOne()
            ?.toInt() ?: 0
    }

    fun existsPendingInvitationForMember(
        roomId: Long,
        memberId: Long,
        email: String?,
        phoneNumber: String?,
        now: OffsetDateTime,
    ): Boolean {
        val hasMemberInvitation = roomInvitationJpaRepository.existsByRoomIdAndStatusAndInviteeMemberIdAndExpiresAtAfter(
            roomId = roomId,
            status = "PENDING",
            inviteeMemberId = memberId,
            expiresAt = now,
        )
        val hasEmailInvitation = email?.let {
            roomInvitationJpaRepository.existsByRoomIdAndStatusAndInviteeEmailAndExpiresAtAfter(
                roomId = roomId,
                status = "PENDING",
                inviteeEmail = it,
                expiresAt = now,
            )
        } ?: false
        val hasPhoneInvitation = phoneNumber?.let {
            roomInvitationJpaRepository.existsByRoomIdAndStatusAndInviteePhoneNumberAndExpiresAtAfter(
                roomId = roomId,
                status = "PENDING",
                inviteePhoneNumber = it,
                expiresAt = now,
            )
        } ?: false

        return hasMemberInvitation || hasEmailInvitation || hasPhoneInvitation
    }

    fun findPendingInvitation(invitationId: Long): RoomInvitationEntity? =
        roomInvitationJpaRepository.findByIdAndStatus(invitationId, "PENDING")

    // 받은 초대 목록은 현재 회원 식별값과 연락처 모두로 매칭해야 누락 없이 확인할 수 있다.
    fun findPendingInvitationsReceivedByMember(memberId: Long): List<PendingRoomInvitationResponse> {
        val inviter = com.recordroom.member.model.QMemberEntity("inviter")
        val receiver = com.recordroom.member.model.QMemberEntity("receiver")
        val now = OffsetDateTime.now()

        return queryFactory
            .select(
                roomInvitationEntity.id,
                roomInvitationEntity.roomId,
                roomEntity.name,
                roomEntity.type,
                inviter.displayName,
                roomInvitationEntity.createdAt,
                roomInvitationEntity.expiresAt,
            )
            .from(roomInvitationEntity)
            .join(roomEntity).on(roomEntity.id.eq(roomInvitationEntity.roomId))
            .join(inviter).on(inviter.id.eq(roomInvitationEntity.inviterMemberId))
            .join(receiver).on(receiver.id.eq(memberId))
            .where(
                roomInvitationEntity.status.eq("PENDING"),
                roomInvitationEntity.expiresAt.after(now),
                roomEntity.archivedAt.isNull,
                roomInvitationEntity.inviteeMemberId.eq(receiver.id)
                    .or(roomInvitationEntity.inviteeEmail.eq(receiver.email))
                    .or(roomInvitationEntity.inviteePhoneNumber.eq(receiver.phoneNumber)),
            )
            .orderBy(roomInvitationEntity.createdAt.desc())
            .fetch()
            .map { row ->
                PendingRoomInvitationResponse(
                    id = row.get(roomInvitationEntity.id) ?: 0L,
                    roomId = row.get(roomInvitationEntity.roomId) ?: 0L,
                    roomName = row.get(roomEntity.name) ?: "",
                    roomType = row.get(roomEntity.type) ?: "",
                    inviterName = row.get(inviter.displayName) ?: "",
                    createdAt = row.get(roomInvitationEntity.createdAt)?.toString() ?: "",
                    expiresAt = row.get(roomInvitationEntity.expiresAt)?.toString() ?: "",
                )
            }
    }

    private fun seedUnreadChatCount(roomId: Long): Int =
        when (roomId) {
            1L -> 1
            else -> 0
        }

    private fun seedPendingMissionCount(roomId: Long): Int =
        when (roomId) {
            1L -> 2
            else -> 0
        }
}
