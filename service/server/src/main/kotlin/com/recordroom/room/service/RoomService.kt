package com.recordroom.room.service

import com.recordroom.member.service.MemberService
import com.recordroom.room.model.RoomsResponse
import com.recordroom.room.repository.RoomRepository
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
