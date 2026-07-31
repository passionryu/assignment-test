package com.recordroom.member

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository

@Repository
class MemberRepository(
    private val jdbcTemplate: JdbcTemplate,
) {
    fun findProfile(memberId: Long): MemberProfileResponse? =
        jdbcTemplate.query(
            """
            select id, display_name, username, email, phone_number, profile_image_url
            from members
            where id = ? and is_deleted = false
            """.trimIndent(),
            { rs, _ ->
                MemberProfileResponse(
                    id = rs.getLong("id"),
                    displayName = rs.getString("display_name"),
                    username = rs.getString("username"),
                    email = rs.getString("email"),
                    phoneNumber = rs.getString("phone_number"),
                    profileImageUrl = rs.getString("profile_image_url"),
                )
            },
            memberId,
        ).firstOrNull()

    fun updateProfile(memberId: Long, displayName: String, profileImageUrl: String?): MemberProfileResponse? {
        jdbcTemplate.update(
            """
            update members
            set display_name = ?, profile_image_url = ?, updated_at = now()
            where id = ? and is_deleted = false
            """.trimIndent(),
            displayName,
            profileImageUrl,
            memberId,
        )

        return findProfile(memberId)
    }

    fun updatePassword(memberId: Long, passwordHash: String): Boolean =
        jdbcTemplate.update(
            """
            update members
            set password_hash = ?, updated_at = now()
            where id = ? and is_deleted = false
            """.trimIndent(),
            passwordHash,
            memberId,
        ) > 0

    fun findNotificationSettings(memberId: Long): NotificationSettingsResponse? =
        jdbcTemplate.query(
            """
            select all_enabled, chat_enabled, letter_enabled, memory_enabled, mission_enabled
            from notification_settings
            where member_id = ?
            """.trimIndent(),
            { rs, _ ->
                NotificationSettingsResponse(
                    allEnabled = rs.getBoolean("all_enabled"),
                    chatEnabled = rs.getBoolean("chat_enabled"),
                    letterEnabled = rs.getBoolean("letter_enabled"),
                    memoryEnabled = rs.getBoolean("memory_enabled"),
                    missionEnabled = rs.getBoolean("mission_enabled"),
                )
            },
            memberId,
        ).firstOrNull()

    fun upsertNotificationSettings(memberId: Long, settings: NotificationSettingsResponse): NotificationSettingsResponse {
        jdbcTemplate.update(
            """
            insert into notification_settings (
                member_id,
                all_enabled,
                chat_enabled,
                letter_enabled,
                memory_enabled,
                mission_enabled
            )
            values (?, ?, ?, ?, ?, ?)
            on conflict (member_id) do update set
                all_enabled = excluded.all_enabled,
                chat_enabled = excluded.chat_enabled,
                letter_enabled = excluded.letter_enabled,
                memory_enabled = excluded.memory_enabled,
                mission_enabled = excluded.mission_enabled,
                updated_at = now()
            """.trimIndent(),
            memberId,
            settings.allEnabled,
            settings.chatEnabled,
            settings.letterEnabled,
            settings.memoryEnabled,
            settings.missionEnabled,
        )

        return settings
    }
}
