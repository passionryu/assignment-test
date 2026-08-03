package com.recordroom.room.model

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
    val unreadMemoryCount: Int,
    val unreadLetterCount: Int,
    val pendingMissionCount: Int,
)

data class RoomDetailResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val type: String,
    val role: String,
    val memberCount: Int,
    val canManage: Boolean,
)

data class CreateRoomRequest(
    val name: String?,
    val description: String?,
    val type: String?,
)

data class CreateRoomResponse(
    val id: Long,
    val name: String,
    val type: String,
    val role: String,
)

data class UpdateRoomRequest(
    val name: String?,
    val description: String?,
)

data class DeleteRoomResponse(
    val id: Long,
    val deleted: Boolean,
)

data class CreateRoomInvitationRequest(
    val email: String?,
    val phoneNumber: String?,
)

data class CreateRoomInvitationResponse(
    val id: Long,
    val status: String,
    val expiresAt: String,
)

data class PendingRoomInvitationsResponse(
    val items: List<PendingRoomInvitationResponse>,
)

data class PendingRoomInvitationResponse(
    val id: Long,
    val roomId: Long,
    val roomName: String,
    val roomType: String,
    val inviterName: String,
    val createdAt: String,
    val expiresAt: String,
)

data class RespondRoomInvitationResponse(
    val id: Long,
    val roomId: Long,
    val status: String,
)
