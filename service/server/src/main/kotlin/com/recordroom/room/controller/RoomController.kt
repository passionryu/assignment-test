package com.recordroom.room.controller

import com.recordroom.member.service.CurrentMemberResolver
import com.recordroom.room.model.RoomsResponse
import com.recordroom.room.service.RoomService
import org.springframework.web.bind.annotation.GetMapping
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
}
