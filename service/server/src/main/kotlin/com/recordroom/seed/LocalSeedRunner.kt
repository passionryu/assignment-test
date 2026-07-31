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
            seedContents()
            seedNotifications()
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

    // 메인 캘린더가 날짜별 채팅/추억/미션/편지 흐름을 바로 보여주도록 콘텐츠 시드를 준비한다.
    private fun seedContents() {
        seedChatMessages()
        seedMemoryPosts()
        seedMissions()
        seedMissionSubmissions()
        seedLetters()
    }

    // 채팅 탭과 캘린더의 날짜별 채팅 점 표시를 위한 메시지를 준비한다.
    private fun seedChatMessages() {
        jdbcTemplate.update(
            """
            insert into chat_messages (id, room_id, sender_member_id, body, occurred_date, sent_at)
            values
                (201, 1, 2, '오늘 점심 사진 이야기 남겼어.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '22 minutes'),
                (202, 1, 2, '카페에서 찍은 사진도 책에 넣자.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '2 hours'),
                (203, 3, 4, '프로젝트 공지 확인해줘.', ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 1 hour'),
                (204, 1, 2, '저녁 약속 시간 다시 정하자.', ((now() at time zone 'Asia/Seoul')::date) - 3, now() - interval '3 days 2 hours'),
                (205, 2, 3, '가족 모임 시간 공유합니다.', ((now() at time zone 'Asia/Seoul')::date) - 4, now() - interval '4 days 2 hours'),
                (206, 2, 3, '이번 달 가족 모임 날짜를 정했어요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 9, now() - interval '30 minutes')
            on conflict (id) do update set
                room_id = excluded.room_id,
                sender_member_id = excluded.sender_member_id,
                body = excluded.body,
                occurred_date = excluded.occurred_date,
                sent_at = excluded.sent_at,
                deleted_at = null
            """.trimIndent(),
        )
    }

    // 추억 게시판과 캘린더의 추억 점 표시를 위한 게시글을 준비한다.
    private fun seedMemoryPosts() {
        jdbcTemplate.update(
            """
            insert into memory_posts (
                id,
                room_id,
                author_member_id,
                title,
                body,
                representative_image_url,
                image_count,
                occurred_date,
                created_at,
                updated_at
            )
            values
                (301, 2, 3, '가족 여행 사진', '가족 여행에서 남긴 사진 기록', null, 3, ((now() at time zone 'Asia/Seoul')::date), now() - interval '2 hours', now() - interval '2 hours'),
                (302, 3, 4, '프로젝트 회고 사진', '프로젝트반 회고 날의 기록', null, 2, ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 8 hours', now() - interval '1 day 8 hours'),
                (303, 1, 2, '카페에서 찍은 사진', '둘이 다녀온 카페 기록', null, 2, ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days', now() - interval '2 days'),
                (304, 2, 3, '주말 장보기', '주말 장보기와 가족 식사 준비', null, 1, ((now() at time zone 'Asia/Seoul')::date) - 3, now() - interval '3 days', now() - interval '3 days'),
                (305, 1, 2, '기념일 후보 사진', '책에 담고 싶은 이번 달 사진 기록', null, 4, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 16, now() - interval '1 hour', now() - interval '1 hour')
            on conflict (id) do update set
                room_id = excluded.room_id,
                author_member_id = excluded.author_member_id,
                title = excluded.title,
                body = excluded.body,
                representative_image_url = excluded.representative_image_url,
                image_count = excluded.image_count,
                occurred_date = excluded.occurred_date,
                created_at = excluded.created_at,
                updated_at = excluded.updated_at,
                deleted_at = null
            """.trimIndent(),
        )
    }

    // 미션 인증과 캘린더의 미션 점 표시를 위한 미션을 준비한다.
    private fun seedMissions() {
        jdbcTemplate.update(
            """
            insert into missions (id, room_id, title, description, status, created_by_member_id, created_at, completed_at)
            values
                (101, 1, '오늘의 산책 인증', '함께 산책한 순간을 남긴다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (102, 2, '가족 산책', '가족이 함께 산책한 기록을 남긴다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (103, 1, '함께 먹은 점심', '점심 사진과 짧은 글을 남긴다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (104, 2, '가족 여행 회고', '여행에서 좋았던 순간을 인증한다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (105, 3, '프로젝트 회고', '프로젝트 회고 내용을 남긴다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (106, 1, '저녁 약속 인증', '저녁 약속을 짧게 기록한다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (107, 3, '팀 응원 미션', '팀원에게 응원 메시지를 남긴다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (108, 3, '발표 준비 인증', '발표 준비 상황을 인증한다.', 'IN_PROGRESS', 1, now() - interval '5 days', null)
            on conflict (id) do update set
                room_id = excluded.room_id,
                title = excluded.title,
                description = excluded.description,
                status = excluded.status,
                created_by_member_id = excluded.created_by_member_id,
                created_at = excluded.created_at,
                completed_at = excluded.completed_at
            """.trimIndent(),
        )
    }

    // 미션 인증 제출 기록을 날짜별 기록으로 집계할 수 있게 준비한다.
    private fun seedMissionSubmissions() {
        jdbcTemplate.update(
            """
            insert into mission_submissions (id, mission_id, submitter_member_id, body, image_url, occurred_date, submitted_at)
            values
                (101, 101, 2, '오늘 산책 인증 완료', null, ((now() at time zone 'Asia/Seoul')::date), now() - interval '8 minutes'),
                (102, 102, 3, '가족 산책 인증', null, ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 2 hours'),
                (103, 103, 2, '점심 사진 인증', null, ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 10 hours'),
                (104, 104, 3, '가족 여행 회고 인증', null, ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days'),
                (105, 105, 4, '프로젝트 회고 인증', null, ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days 2 hours'),
                (106, 106, 2, '저녁 약속 인증', null, ((now() at time zone 'Asia/Seoul')::date) - 3, now() - interval '3 days 4 hours'),
                (107, 107, 4, '팀 응원 미션 인증', null, ((now() at time zone 'Asia/Seoul')::date) - 4, now() - interval '4 days 5 hours'),
                (108, 108, 4, '발표 준비 인증', null, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 27, now() - interval '1 hour')
            on conflict (id) do update set
                mission_id = excluded.mission_id,
                submitter_member_id = excluded.submitter_member_id,
                body = excluded.body,
                image_url = excluded.image_url,
                occurred_date = excluded.occurred_date,
                submitted_at = excluded.submitted_at
            """.trimIndent(),
        )
    }

    // 편지 화면과 캘린더의 편지 점 표시를 위한 편지를 준비한다.
    private fun seedLetters() {
        jdbcTemplate.update(
            """
            insert into letters (
                id,
                room_id,
                sender_member_id,
                receiver_member_id,
                title,
                body,
                occurred_date,
                sent_at,
                read_at
            )
            values
                (401, 3, 4, 1, '프로젝트 응원 편지', '지훈이 보낸 응원 편지', ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day', null),
                (402, 2, 3, 1, '고마운 마음', '아버지가 남긴 고마운 마음', ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 6 hours', null),
                (403, 2, 3, 1, '여행 후기', '가족 여행 후기를 편지로 남겼습니다.', ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days', null),
                (404, 3, 4, 1, '팀원 응원', '팀원들에게 보내는 응원 편지', ((now() at time zone 'Asia/Seoul')::date) - 3, now() - interval '3 days', null),
                (405, 1, 2, 1, '기념일 편지', '이번 달 기념일에 남기는 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 16, now() - interval '2 hours', null)
            on conflict (id) do update set
                room_id = excluded.room_id,
                sender_member_id = excluded.sender_member_id,
                receiver_member_id = excluded.receiver_member_id,
                title = excluded.title,
                body = excluded.body,
                occurred_date = excluded.occurred_date,
                sent_at = excluded.sent_at,
                read_at = excluded.read_at,
                deleted_by_sender_at = null,
                deleted_by_receiver_at = null
            """.trimIndent(),
        )
    }

    // 메인 최신 알림과 전체 알림 모달을 확인할 수 있도록 타입별 알림을 준비한다.
    private fun seedNotifications() {
        jdbcTemplate.update(
            """
            insert into notifications (
                id,
                receiver_member_id,
                room_id,
                actor_member_id,
                type,
                title,
                message,
                target_type,
                target_id,
                occurred_date,
                read_at,
                created_at
            )
            values
                (
                    1,
                    1,
                    1,
                    2,
                    'MISSION_APPROVAL_REQUEST',
                    '미션 인증 요청',
                    '민지가 미션 인증 동의를 기다립니다.',
                    'MISSION',
                    101,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '8 minutes'
                ),
                (
                    2,
                    1,
                    1,
                    2,
                    'CHAT',
                    '새 채팅',
                    '민지가 새 채팅을 보냈습니다.',
                    'CHAT',
                    201,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '22 minutes'
                ),
                (
                    3,
                    1,
                    2,
                    3,
                    'MEMORY',
                    '새 추억',
                    '아버지가 가족 여행 사진을 올렸습니다.',
                    'MEMORY',
                    301,
                    ((now() at time zone 'Asia/Seoul')::date),
                    now() - interval '5 minutes',
                    now() - interval '2 hours'
                ),
                (
                    4,
                    1,
                    3,
                    4,
                    'LETTER',
                    '새 편지',
                    '지훈이 보낸 편지가 도착했습니다.',
                    'LETTER',
                    401,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day'
                ),
                (
                    5,
                    1,
                    2,
                    3,
                    'MISSION_PROGRESS',
                    '미션 동의율',
                    '가족 미션 인증 동의율이 60%입니다.',
                    'MISSION',
                    102,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day 2 hours'
                ),
                (
                    6,
                    1,
                    1,
                    2,
                    'CHAT',
                    '새 채팅',
                    '민지가 오늘 점심 사진 이야기를 남겼습니다.',
                    'CHAT',
                    202,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '1 day 4 hours'
                ),
                (
                    7,
                    1,
                    2,
                    3,
                    'LETTER',
                    '새 편지',
                    '아버지가 고마운 마음을 담은 편지를 보냈습니다.',
                    'LETTER',
                    402,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day 6 hours'
                ),
                (
                    8,
                    1,
                    3,
                    4,
                    'MEMORY',
                    '새 추억',
                    '지훈이 프로젝트 회고 사진을 올렸습니다.',
                    'MEMORY',
                    302,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day 8 hours'
                ),
                (
                    9,
                    1,
                    1,
                    2,
                    'MISSION_PROGRESS',
                    '미션 동의율',
                    '우리 둘의 100일 미션 동의율이 50%입니다.',
                    'MISSION',
                    103,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day 10 hours'
                ),
                (
                    10,
                    1,
                    2,
                    3,
                    'MISSION_APPROVAL_REQUEST',
                    '미션 인증 요청',
                    '아버지가 가족 산책 미션 인증 동의를 기다립니다.',
                    'MISSION',
                    104,
                    ((now() at time zone 'Asia/Seoul')::date) - 2,
                    null,
                    now() - interval '1 day 12 hours'
                ),
                (
                    11,
                    1,
                    3,
                    4,
                    'CHAT',
                    '새 채팅',
                    '지훈이 프로젝트 공지 채팅을 남겼습니다.',
                    'CHAT',
                    203,
                    ((now() at time zone 'Asia/Seoul')::date) - 2,
                    null,
                    now() - interval '1 day 14 hours'
                ),
                (
                    12,
                    1,
                    1,
                    2,
                    'MEMORY',
                    '새 추억',
                    '민지가 카페에서 찍은 사진을 올렸습니다.',
                    'MEMORY',
                    303,
                    ((now() at time zone 'Asia/Seoul')::date) - 2,
                    now() - interval '20 minutes',
                    now() - interval '1 day 16 hours'
                ),
                (
                    13,
                    1,
                    2,
                    3,
                    'LETTER',
                    '새 편지',
                    '아버지가 가족 여행 후기를 편지로 남겼습니다.',
                    'LETTER',
                    403,
                    ((now() at time zone 'Asia/Seoul')::date) - 2,
                    null,
                    now() - interval '1 day 18 hours'
                ),
                (
                    14,
                    1,
                    3,
                    4,
                    'MISSION_PROGRESS',
                    '미션 동의율',
                    '여름 프로젝트반 미션 동의율이 75%입니다.',
                    'MISSION',
                    105,
                    ((now() at time zone 'Asia/Seoul')::date) - 2,
                    null,
                    now() - interval '1 day 20 hours'
                ),
                (
                    15,
                    1,
                    1,
                    2,
                    'CHAT',
                    '새 채팅',
                    '민지가 저녁 약속 채팅을 남겼습니다.',
                    'CHAT',
                    204,
                    ((now() at time zone 'Asia/Seoul')::date) - 3,
                    null,
                    now() - interval '1 day 22 hours'
                ),
                (
                    16,
                    1,
                    2,
                    3,
                    'MEMORY',
                    '새 추억',
                    '아버지가 주말 장보기 사진을 올렸습니다.',
                    'MEMORY',
                    304,
                    ((now() at time zone 'Asia/Seoul')::date) - 3,
                    null,
                    now() - interval '2 days'
                ),
                (
                    17,
                    1,
                    3,
                    4,
                    'LETTER',
                    '새 편지',
                    '지훈이 팀원들에게 응원 편지를 보냈습니다.',
                    'LETTER',
                    404,
                    ((now() at time zone 'Asia/Seoul')::date) - 3,
                    null,
                    now() - interval '2 days 2 hours'
                ),
                (
                    18,
                    1,
                    1,
                    2,
                    'MISSION_APPROVAL_REQUEST',
                    '미션 인증 요청',
                    '민지가 산책 인증 동의를 기다립니다.',
                    'MISSION',
                    106,
                    ((now() at time zone 'Asia/Seoul')::date) - 3,
                    null,
                    now() - interval '2 days 4 hours'
                ),
                (
                    19,
                    1,
                    2,
                    3,
                    'CHAT',
                    '새 채팅',
                    '아버지가 가족 모임 시간을 공유했습니다.',
                    'CHAT',
                    205,
                    ((now() at time zone 'Asia/Seoul')::date) - 4,
                    null,
                    now() - interval '2 days 6 hours'
                ),
                (
                    20,
                    1,
                    3,
                    4,
                    'MISSION_PROGRESS',
                    '미션 동의율',
                    '프로젝트 회고 미션 동의율이 90%입니다.',
                    'MISSION',
                    107,
                    ((now() at time zone 'Asia/Seoul')::date) - 4,
                    null,
                    now() - interval '2 days 8 hours'
                )
            on conflict (id) do update set
                receiver_member_id = excluded.receiver_member_id,
                room_id = excluded.room_id,
                actor_member_id = excluded.actor_member_id,
                type = excluded.type,
                title = excluded.title,
                message = excluded.message,
                target_type = excluded.target_type,
                target_id = excluded.target_id,
                occurred_date = excluded.occurred_date,
                read_at = excluded.read_at,
                created_at = excluded.created_at
            """.trimIndent(),
        )
    }

    // 고정 ID 시드 이후 런타임 insert가 다음 ID를 자동 생성하도록 identity sequence를 보정한다.
    private fun syncIdentitySequences() {
        listOf(
            "members",
            "rooms",
            "room_members",
            "room_invitations",
            "chat_messages",
            "memory_posts",
            "missions",
            "mission_submissions",
            "letters",
            "notifications",
        ).forEach { tableName ->
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
