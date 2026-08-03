package com.recordroom.member.service

import com.recordroom.common.ApiException
import com.recordroom.member.model.ChangePasswordRequest
import com.recordroom.member.model.ChangePasswordResponse
import com.recordroom.member.model.MemberProfileResponse
import com.recordroom.member.model.NotificationSettingsResponse
import com.recordroom.member.model.UpdateNotificationSettingsRequest
import com.recordroom.member.model.UpdateProfileRequest
import com.recordroom.member.repository.MemberRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class MemberService(
    private val memberRepository: MemberRepository,
) {
    fun getProfile(memberId: Long): MemberProfileResponse =
        memberRepository.findProfile(memberId) ?: memberNotFound()

    @Transactional
    fun updateProfile(memberId: Long, request: UpdateProfileRequest): MemberProfileResponse {
        val displayName = request.displayName?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw ApiException(HttpStatus.BAD_REQUEST, "DISPLAY_NAME_REQUIRED", "이름을 입력해 주세요.")

        if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
            throw ApiException(HttpStatus.BAD_REQUEST, "DISPLAY_NAME_TOO_LONG", "이름은 50자 이하로 입력해 주세요.")
        }

        val profileImageUrl = request.profileImageUrl
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        if ((profileImageUrl?.length ?: 0) > MAX_PROFILE_IMAGE_DATA_LENGTH) {
            throw ApiException(HttpStatus.BAD_REQUEST, "PROFILE_IMAGE_TOO_LARGE", "프로필 이미지는 5MB 이하 파일로 선택해 주세요.")
        }

        return memberRepository.updateProfile(memberId, displayName, profileImageUrl) ?: memberNotFound()
    }

    @Transactional
    fun changePassword(memberId: Long, request: ChangePasswordRequest): ChangePasswordResponse {
        val currentPassword = request.currentPassword?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw ApiException(HttpStatus.BAD_REQUEST, "CURRENT_PASSWORD_REQUIRED", "현재 비밀번호를 입력해 주세요.")
        val newPassword = request.newPassword?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw ApiException(HttpStatus.BAD_REQUEST, "NEW_PASSWORD_REQUIRED", "새 비밀번호를 입력해 주세요.")

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            throw ApiException(HttpStatus.BAD_REQUEST, "NEW_PASSWORD_TOO_WEAK", "새 비밀번호는 8자 이상이어야 합니다.")
        }

        val updated = memberRepository.updatePassword(
            memberId = memberId,
            passwordHash = "local-mvp:${currentPassword.length}:${newPassword.length}",
        )
        if (!updated) {
            memberNotFound()
        }

        return ChangePasswordResponse(changed = true)
    }

    fun getNotificationSettings(memberId: Long): NotificationSettingsResponse {
        getProfile(memberId)

        return memberRepository.findNotificationSettings(memberId)
            ?: memberRepository.upsertNotificationSettings(memberId, defaultNotificationSettings())
    }

    @Transactional
    fun updateNotificationSettings(
        memberId: Long,
        request: UpdateNotificationSettingsRequest,
    ): NotificationSettingsResponse {
        getProfile(memberId)

        val allEnabled = request.allEnabled
            ?: throw ApiException(HttpStatus.BAD_REQUEST, "ALL_ENABLED_REQUIRED", "전체 알림 설정 값을 입력해 주세요.")

        val settings = if (allEnabled) {
            NotificationSettingsResponse(
                allEnabled = true,
                chatEnabled = true,
                letterEnabled = true,
                memoryEnabled = true,
                missionEnabled = true,
            )
        } else {
            NotificationSettingsResponse(
                allEnabled = false,
                chatEnabled = request.chatEnabled ?: false,
                letterEnabled = request.letterEnabled ?: false,
                memoryEnabled = request.memoryEnabled ?: false,
                missionEnabled = request.missionEnabled ?: false,
            )
        }

        return memberRepository.upsertNotificationSettings(memberId, settings)
    }

    private fun defaultNotificationSettings(): NotificationSettingsResponse =
        NotificationSettingsResponse(
            allEnabled = true,
            chatEnabled = true,
            letterEnabled = true,
            memoryEnabled = true,
            missionEnabled = true,
        )

    private fun memberNotFound(): Nothing =
        throw ApiException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원을 찾을 수 없습니다.")

    companion object {
        private const val MAX_DISPLAY_NAME_LENGTH = 50
        private const val MAX_PROFILE_IMAGE_DATA_LENGTH = 7 * 1024 * 1024
        private const val MIN_PASSWORD_LENGTH = 8
    }
}
