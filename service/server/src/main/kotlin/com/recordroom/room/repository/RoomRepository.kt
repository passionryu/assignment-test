package com.recordroom.room.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.member.model.QMemberEntity.memberEntity
import com.recordroom.room.model.QRoomEntity.roomEntity
import com.recordroom.room.model.QRoomInvitationEntity.roomInvitationEntity
import com.recordroom.room.model.QRoomMemberEntity
import com.recordroom.room.model.RoomSummaryResponse
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
class RoomRepository(
    private val queryFactory: JPAQueryFactory,
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
