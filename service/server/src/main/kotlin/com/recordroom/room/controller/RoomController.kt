package com.recordroom.room.controller

import com.recordroom.member.service.CurrentMemberResolver
import com.recordroom.room.model.CreateRoomInvitationRequest
import com.recordroom.room.model.CreateRoomInvitationResponse
import com.recordroom.room.model.CreateRoomRequest
import com.recordroom.room.model.CreateRoomResponse
import com.recordroom.room.model.RoomsResponse
import com.recordroom.room.service.RoomService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/rooms")
class RoomController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val roomService: RoomService,
) {
    @GetMapping
    fun getRooms(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): RoomsResponse =
        roomService.getRoomsForSidebar(currentMemberResolver.resolve(rawMemberId))

    @PostMapping
    fun createRoom(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestBody request: CreateRoomRequest,
    ): CreateRoomResponse =
        roomService.createRoom(currentMemberResolver.resolve(rawMemberId), request)

    @PostMapping("/{roomId}/invitations")
    fun createInvitation(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestBody request: CreateRoomInvitationRequest,
    ): CreateRoomInvitationResponse =
        roomService.createInvitation(currentMemberResolver.resolve(rawMemberId), roomId, request)
}
