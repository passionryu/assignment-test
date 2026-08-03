package com.recordroom.member.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.member.model.MemberEntity
import com.recordroom.member.model.MemberProfileResponse
import com.recordroom.member.model.NotificationSettingsEntity
import com.recordroom.member.model.NotificationSettingsResponse
import com.recordroom.member.model.QMemberEntity.memberEntity
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
class MemberRepository(
    private val queryFactory: JPAQueryFactory,
    private val memberJpaRepository: MemberJpaRepository,
    private val notificationSettingsJpaRepository: NotificationSettingsJpaRepository,
) {
    fun findProfile(memberId: Long): MemberProfileResponse? =
        memberJpaRepository.findByIdAndDeletedFalse(memberId)?.toProfileResponse()

    fun findActiveMember(memberId: Long): MemberEntity? =
        memberJpaRepository.findByIdAndDeletedFalse(memberId)

    fun findActiveMemberByEmail(email: String): MemberEntity? =
        memberJpaRepository.findByEmailAndDeletedFalse(email)

    fun findActiveMemberByPhoneNumber(phoneNumber: String): MemberEntity? =
        memberJpaRepository.findByPhoneNumberAndDeletedFalse(phoneNumber)

    // 초대 검색은 이름 동명이인을 사용자가 직접 구분해야 하므로 여러 후보를 반환한다.
    fun searchActiveMembersForInvitation(keyword: String, limit: Long = 8): List<MemberEntity> {
        val normalizedKeyword = keyword.trim()
        val normalizedEmail = normalizedKeyword.lowercase()

        return queryFactory
            .selectFrom(memberEntity)
            .where(
                memberEntity.deleted.isFalse,
                memberEntity.displayName.containsIgnoreCase(normalizedKeyword)
                    .or(memberEntity.username.containsIgnoreCase(normalizedKeyword))
                    .or(memberEntity.email.eq(normalizedEmail))
                    .or(memberEntity.phoneNumber.eq(normalizedKeyword)),
            )
            .orderBy(memberEntity.displayName.asc(), memberEntity.id.asc())
            .limit(limit)
            .fetch()
    }

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
