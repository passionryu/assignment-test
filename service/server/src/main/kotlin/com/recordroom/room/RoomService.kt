package com.recordroom.room

import com.recordroom.member.MemberService
import org.springframework.stereotype.Service

@Service
class RoomService(
    private val memberService: MemberService,
    private val roomRepository: RoomRepository,
) {
    fun getRoomsForSidebar(memberId: Long): RoomsResponse {
        memberService.getProfile(memberId)

        val joinedRooms = roomRepository.findRoomsJoinedByMember(memberId)

        val pendingInvitationCount = roomRepository.countPendingInvitationsForMember(memberId)

        return RoomsResponse(
            rooms = joinedRooms,
            pendingInvitationCount = pendingInvitationCount,
        )
    }
}
