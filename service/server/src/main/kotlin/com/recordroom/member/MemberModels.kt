package com.recordroom.member

data class MemberProfileResponse(
    val id: Long,
    val displayName: String,
    val username: String,
    val email: String,
    val phoneNumber: String,
    val profileImageUrl: String?,
)

data class UpdateProfileRequest(
    val displayName: String?,
    val profileImageUrl: String?,
)

data class ChangePasswordRequest(
    val currentPassword: String?,
    val newPassword: String?,
)

data class ChangePasswordResponse(
    val changed: Boolean,
)

data class NotificationSettingsResponse(
    val allEnabled: Boolean,
    val chatEnabled: Boolean,
    val letterEnabled: Boolean,
    val memoryEnabled: Boolean,
    val missionEnabled: Boolean,
)

data class UpdateNotificationSettingsRequest(
    val allEnabled: Boolean?,
    val chatEnabled: Boolean?,
    val letterEnabled: Boolean?,
    val memoryEnabled: Boolean?,
    val missionEnabled: Boolean?,
)
