package com.recordroom.member.repository

import com.recordroom.member.model.MemberEntity
import com.recordroom.member.model.MemberProfileResponse
import com.recordroom.member.model.NotificationSettingsEntity
import com.recordroom.member.model.NotificationSettingsResponse
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
class MemberRepository(
    private val memberJpaRepository: MemberJpaRepository,
    private val notificationSettingsJpaRepository: NotificationSettingsJpaRepository,
) {
    fun findProfile(memberId: Long): MemberProfileResponse? =
        memberJpaRepository.findByIdAndDeletedFalse(memberId)?.toProfileResponse()

    fun updateProfile(memberId: Long, displayName: String, profileImageUrl: String?): MemberProfileResponse? {
        val member = memberJpaRepository.findByIdAndDeletedFalse(memberId) ?: return null

        member.displayName = displayName
        member.profileImageUrl = profileImageUrl
        member.updatedAt = OffsetDateTime.now()

        return memberJpaRepository.save(member).toProfileResponse()
    }

    fun updatePassword(memberId: Long, passwordHash: String): Boolean {
        val member = memberJpaRepository.findByIdAndDeletedFalse(memberId) ?: return false

        member.passwordHash = passwordHash
        member.updatedAt = OffsetDateTime.now()
        memberJpaRepository.save(member)

        return true
    }

    fun findNotificationSettings(memberId: Long): NotificationSettingsResponse? =
        notificationSettingsJpaRepository.findById(memberId).orElse(null)?.toResponse()

    fun upsertNotificationSettings(memberId: Long, settings: NotificationSettingsResponse): NotificationSettingsResponse {
        val entity = notificationSettingsJpaRepository.findById(memberId).orElse(
            NotificationSettingsEntity(memberId = memberId),
        )

        entity.allEnabled = settings.allEnabled
        entity.chatEnabled = settings.chatEnabled
        entity.letterEnabled = settings.letterEnabled
        entity.memoryEnabled = settings.memoryEnabled
        entity.missionEnabled = settings.missionEnabled
        entity.updatedAt = OffsetDateTime.now()
        notificationSettingsJpaRepository.save(entity)

        return settings
    }

    private fun MemberEntity.toProfileResponse(): MemberProfileResponse =
        MemberProfileResponse(
            id = id,
            displayName = displayName,
            username = username,
            email = email,
            phoneNumber = phoneNumber,
            profileImageUrl = profileImageUrl,
        )

    private fun NotificationSettingsEntity.toResponse(): NotificationSettingsResponse =
        NotificationSettingsResponse(
            allEnabled = allEnabled,
            chatEnabled = chatEnabled,
            letterEnabled = letterEnabled,
            memoryEnabled = memoryEnabled,
            missionEnabled = missionEnabled,
        )
}
