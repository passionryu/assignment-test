package com.recordroom.room

data class RoomsResponse(
    val rooms: List<RoomSummaryResponse>,
    val pendingInvitationCount: Int,
)

data class RoomSummaryResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val type: String,
    val role: String,
    val memberCount: Int,
    val unreadChatCount: Int,
    val pendingMissionCount: Int,
)
