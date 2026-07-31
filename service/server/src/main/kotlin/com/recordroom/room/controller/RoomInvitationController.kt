package com.recordroom.room.controller

import com.recordroom.member.service.CurrentMemberResolver
import com.recordroom.room.model.PendingRoomInvitationsResponse
import com.recordroom.room.model.RespondRoomInvitationResponse
import com.recordroom.room.service.RoomService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/room-invitations")
class RoomInvitationController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val roomService: RoomService,
) {
    @GetMapping("/pending")
    fun getPendingInvitations(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): PendingRoomInvitationsResponse =
        roomService.getPendingInvitations(currentMemberResolver.resolve(rawMemberId))

    @PostMapping("/{invitationId}/accept")
    fun acceptInvitation(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable invitationId: Long,
    ): RespondRoomInvitationResponse =
        roomService.acceptInvitation(currentMemberResolver.resolve(rawMemberId), invitationId)

    @PostMapping("/{invitationId}/decline")
    fun declineInvitation(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable invitationId: Long,
    ): RespondRoomInvitationResponse =
        roomService.declineInvitation(currentMemberResolver.resolve(rawMemberId), invitationId)
}
