package com.recordroom.seed

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LocalSeedRunner(
    private val jdbcTemplate: JdbcTemplate,
    @Value("\${app.seed.enabled:true}") private val seedEnabled: Boolean,
) : ApplicationRunner {
    private val log = LoggerFactory.getLogger(LocalSeedRunner::class.java)

    override fun run(args: ApplicationArguments) {
        if (!seedEnabled) {
            log.info("[시드 데이터] 로컬 시드 생성을 건너뜀. who=system, what=LocalSeedRunner.run, requestData=seedEnabled:false, reason=seed_disabled")
            return
        }

        runCatching {
            seedMembers()
            seedRooms()
            seedRoomMembers()
            seedNotificationSettings()
            syncIdentitySequences()
        }.onSuccess {
            log.info("[시드 데이터] 로컬 시드 생성 완료. who=system, what=LocalSeedRunner.run, requestData=profile:local, reason=completed")
        }.onFailure { exception ->
            log.error(
                "[시드 데이터] 로컬 시드 생성 실패. who=system, what=LocalSeedRunner.run, requestData=profile:local, reason={}",
                exception.message ?: "unknown",
                exception,
            )
            throw exception
        }
    }

    // 기본 시연 사용자가 항상 같은 식별자로 존재하도록 upsert한다.
    private fun seedMembers() {
        jdbcTemplate.update(
            """
            insert into members (id, display_name, username, email, phone_number, profile_image_url, password_hash, is_deleted)
            values
                (1, '류성열', 'recordryu', 'ryu@example.com', '010-1234-5678', null, 'local-dummy-hash', false),
                (2, '민지', 'minji', 'minji@example.com', '010-2222-3333', null, 'local-dummy-hash', false),
                (3, '아버지', 'father', 'father@example.com', '010-3333-4444', null, 'local-dummy-hash', false),
                (4, '지훈', 'jihun', 'jihun@example.com', '010-4444-5555', null, 'local-dummy-hash', false)
            on conflict (id) do update set
                display_name = excluded.display_name,
                username = excluded.username,
                email = excluded.email,
                phone_number = excluded.phone_number,
                updated_at = now()
            """.trimIndent(),
        )
    }

    // 메인 사이드바와 이후 기능 이슈가 공통으로 사용할 기록방을 준비한다.
    private fun seedRooms() {
        jdbcTemplate.update(
            """
            insert into rooms (id, name, description, type, owner_member_id)
            values
                (1, '우리 둘의 100일', '둘이 함께 쌓는 기록방', 'COUPLE', 1),
                (2, '7월 가족', '가족의 이번 달 기록방', 'FAMILY', 1),
                (3, '여름 프로젝트반', '프로젝트 구성원의 기록방', 'GROUP', 1)
            on conflict (id) do update set
                name = excluded.name,
                description = excluded.description,
                type = excluded.type,
                owner_member_id = excluded.owner_member_id,
                updated_at = now()
            """.trimIndent(),
        )
    }

    // 선택 방 접근 검증과 멤버 목록 화면을 위한 참여 관계를 준비한다.
    private fun seedRoomMembers() {
        jdbcTemplate.update(
            """
            insert into room_members (id, room_id, member_id, role)
            values
                (1, 1, 1, 'OWNER'),
                (2, 1, 2, 'MEMBER'),
                (3, 2, 1, 'OWNER'),
                (4, 2, 3, 'MEMBER'),
                (5, 3, 1, 'OWNER'),
                (6, 3, 4, 'MEMBER')
            on conflict (room_id, member_id) do update set
                role = excluded.role
            """.trimIndent(),
        )
    }

    // 설정 화면의 전체/개별 알림 토글 기본값을 준비한다.
    private fun seedNotificationSettings() {
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
            values (1, true, true, true, true, true)
            on conflict (member_id) do update set
                all_enabled = excluded.all_enabled,
                chat_enabled = excluded.chat_enabled,
                letter_enabled = excluded.letter_enabled,
                memory_enabled = excluded.memory_enabled,
                mission_enabled = excluded.mission_enabled,
                updated_at = now()
            """.trimIndent(),
        )
    }

    // 고정 ID 시드 이후 런타임 insert가 다음 ID를 자동 생성하도록 identity sequence를 보정한다.
    private fun syncIdentitySequences() {
        listOf("members", "rooms", "room_members", "room_invitations").forEach { tableName ->
            jdbcTemplate.execute(
                """
                select setval(
                    pg_get_serial_sequence('$tableName', 'id'),
                    coalesce((select max(id) from $tableName), 0) + 1,
                    false
                )
                """.trimIndent(),
            )
        }
    }
}
