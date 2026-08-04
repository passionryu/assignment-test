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
            seedRoomInvitations()
            seedNotificationSettings()
            seedContents()
            seedNotifications()
            deleteLegacyAutomaticReplyMessages()
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
                (2, '여자친구', 'girlfriend', 'girlfriend@example.com', '010-2222-3333', null, 'local-dummy-hash', false),
                (3, '아버지', 'father', 'father@example.com', '010-3333-4444', null, 'local-dummy-hash', false),
                (4, '지훈', 'jihun', 'jihun@example.com', '010-4444-5555', null, 'local-dummy-hash', false),
                (5, '어머니', 'mother', 'mother@example.com', '010-5555-0005', null, 'local-dummy-hash', false),
                (6, '형', 'olderbrother', 'olderbrother@example.com', '010-5555-0006', null, 'local-dummy-hash', false),
                (7, '누나', 'oldersister', 'oldersister@example.com', '010-5555-0007', null, 'local-dummy-hash', false),
                (8, '남동생', 'youngerbrother', 'youngerbrother@example.com', '010-5555-0008', null, 'local-dummy-hash', false),
                (9, '여동생', 'youngersister', 'youngersister@example.com', '010-5555-0009', null, 'local-dummy-hash', false),
                (10, '서연', 'seoyeon', 'seoyeon@example.com', '010-5555-0010', null, 'local-dummy-hash', false),
                (11, '도윤', 'doyun', 'doyun@example.com', '010-5555-0011', null, 'local-dummy-hash', false),
                (12, '하준', 'hajun', 'hajun@example.com', '010-5555-0012', null, 'local-dummy-hash', false),
                (13, '수아', 'sua', 'sua@example.com', '010-5555-0013', null, 'local-dummy-hash', false),
                (99, '기록방 AI', 'recordbot', 'recordbot@example.com', '010-9999-0000', null, 'local-dummy-hash', false),
                (100, '운영자', 'operator', 'operator@example.com', '010-0000-0100', null, 'local-dummy-hash', false),
                (20, '초대회원0', 'invitee0', 'invitee0@example.com', '010-0000-0000', null, 'local-dummy-hash', false),
                (21, '초대회원1', 'invitee1', 'invitee1@example.com', '010-1111-1111', null, 'local-dummy-hash', false),
                (22, '초대회원2', 'invitee2', 'invitee2@example.com', '010-2222-2222', null, 'local-dummy-hash', false),
                (23, '초대회원3', 'invitee3', 'invitee3@example.com', '010-3333-3333', null, 'local-dummy-hash', false),
                (24, '초대회원4', 'invitee4', 'invitee4@example.com', '010-4444-4444', null, 'local-dummy-hash', false),
                (25, '초대회원5', 'invitee5', 'invitee5@example.com', '010-5555-5555', null, 'local-dummy-hash', false),
                (26, '초대회원6', 'invitee6', 'invitee6@example.com', '010-6666-6666', null, 'local-dummy-hash', false),
                (27, '초대회원7', 'invitee7', 'invitee7@example.com', '010-7777-7777', null, 'local-dummy-hash', false),
                (28, '초대회원8', 'invitee8', 'invitee8@example.com', '010-8888-8888', null, 'local-dummy-hash', false),
                (29, '초대회원9', 'invitee9', 'invitee9@example.com', '010-9999-9999', null, 'local-dummy-hash', false)
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
                (3, '여름 프로젝트반', '프로젝트 구성원의 기록방', 'GROUP', 1),
                (4, '여자친구의 여행 준비방', '여행 준비 과정을 같이 모으는 방', 'GROUP', 2),
                (40, '가족 여행 사진방', '가족 여행 사진을 함께 모으는 방', 'FAMILY', 3),
                (41, '4학년 1반', '반 기록을 함께 모으는 학급방', 'GROUP', 4)
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
                (101, 2, 5, 'MEMBER'),
                (102, 2, 6, 'MEMBER'),
                (103, 2, 7, 'MEMBER'),
                (104, 2, 8, 'MEMBER'),
                (105, 2, 9, 'MEMBER'),
                (5, 3, 1, 'OWNER'),
                (6, 3, 4, 'MEMBER'),
                (201, 3, 10, 'MEMBER'),
                (202, 3, 11, 'MEMBER'),
                (203, 3, 12, 'MEMBER'),
                (204, 3, 13, 'MEMBER'),
                (7, 4, 2, 'OWNER'),
                (40, 40, 3, 'OWNER'),
                (41, 41, 4, 'OWNER')
            on conflict (room_id, member_id) do update set
                role = excluded.role
            """.trimIndent(),
        )
    }

    // 초대 받은 방 조회와 수락/거절 흐름을 바로 확인할 수 있도록 대기 초대를 준비한다.
    private fun seedRoomInvitations() {
        jdbcTemplate.update(
            """
            insert into room_invitations (
                id,
                room_id,
                inviter_member_id,
                invitee_email,
                invitee_phone_number,
                invitee_member_id,
                status,
                created_at,
                expires_at,
                responded_at
            )
            values
                (
                    1,
                    4,
                    2,
                    'ryu@example.com',
                    null,
                    1,
                    'PENDING',
                    now() - interval '1 hour',
                    now() + interval '7 days',
                    null
                ),
                (
                    40,
                    40,
                    3,
                    'ryu@example.com',
                    null,
                    1,
                    'PENDING',
                    now() - interval '2 hours',
                    now() + interval '6 days',
                    null
                ),
                (
                    41,
                    41,
                    4,
                    'ryu@example.com',
                    null,
                    1,
                    'PENDING',
                    now() - interval '3 hours',
                    now() + interval '5 days',
                    null
                )
            on conflict (id) do update set
                room_id = excluded.room_id,
                inviter_member_id = excluded.inviter_member_id,
                invitee_email = excluded.invitee_email,
                invitee_phone_number = excluded.invitee_phone_number,
                invitee_member_id = excluded.invitee_member_id,
                status = excluded.status,
                created_at = excluded.created_at,
                expires_at = excluded.expires_at,
                responded_at = excluded.responded_at
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
            values
                (1, true, true, true, true, true),
                (2, true, true, true, true, true),
                (3, true, true, true, true, true),
                (4, true, true, true, true, true)
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
        seedMemoryComments()
        seedMissions()
        seedMissionSubmissions()
        seedMissionApprovals()
        seedMissionComments()
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
                (206, 2, 3, '이번 달 가족 모임 날짜를 정했어요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 9, now() - interval '30 minutes'),
                (207, 1, 2, '월초 계획을 같이 정리했어.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 2, now() - interval '3 hours'),
                (208, 2, 3, '가족 일정 공유합니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 2, now() - interval '4 hours'),
                (209, 3, 4, '자료 조사 진행 상황 남깁니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 4, now() - interval '5 hours'),
                (210, 1, 2, '퇴근 후 산책 이야기 남겼어.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 6, now() - interval '6 hours'),
                (211, 2, 3, '주말 식사 후보를 골라봤어요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 7, now() - interval '7 hours'),
                (212, 1, 2, '오늘도 사진 정리하자.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 9, now() - interval '8 hours'),
                (213, 3, 4, '중간 발표 피드백 공유합니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 11, now() - interval '9 hours'),
                (214, 1, 2, '금요일 데이트 후보 정리했어.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 13, now() - interval '10 hours'),
                (215, 2, 3, '가족 앨범에 넣을 사진 골라주세요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 14, now() - interval '11 hours'),
                (216, 1, 2, '기념일 편지 초안 봐줘.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 16, now() - interval '12 hours'),
                (217, 3, 4, '회고 질문 리스트 공유합니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 18, now() - interval '13 hours'),
                (218, 2, 3, '가족 미션 인증 확인해주세요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 20, now() - interval '14 hours'),
                (219, 1, 2, '주말 계획을 다시 정리했어.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 21, now() - interval '15 hours'),
                (220, 3, 4, '팀 회식 후보 날짜 투표합니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 23, now() - interval '16 hours'),
                (221, 2, 3, '할머니 생신 준비 이야기입니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 25, now() - interval '17 hours'),
                (222, 1, 2, '이번 달 마지막 산책 기록하자.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 27, now() - interval '18 hours'),
                (223, 2, 3, '가족 사진 인화 후보를 골랐어요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 28, now() - interval '19 hours'),
                (224, 3, 4, '프로젝트 마무리 소감 남깁니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 30, now() - interval '20 hours'),
                (225, 1, 2, '일요일 아침 산책 기록을 남겼어.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 1, now() - interval '21 hours'),
                (226, 2, 3, '화요일 가족 일정 다시 확인해요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 3, now() - interval '22 hours'),
                (227, 3, 4, '일요일 팀 체크인 남깁니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 8, now() - interval '23 hours'),
                (228, 1, 2, '화요일 저녁 메뉴 후보를 골랐어.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 10, now() - interval '24 hours'),
                (229, 1, 2, '목요일 짧은 통화 기록 남겨둘게.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 19, now() - interval '25 hours'),
                (230, 3, 4, '일요일 프로젝트 준비 상황 공유합니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 22, now() - interval '26 hours'),
                (231, 2, 3, '목요일 가족 사진 후보를 다시 골랐어요.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 26, now() - interval '27 hours'),
                (232, 3, 4, '월말 일요일 마무리 채팅입니다.', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 29, now() - interval '28 hours'),
                (233, 1, 1, '오늘 기록은 같이 보면 더 좋겠다.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '18 minutes'),
                (234, 1, 1, '나중에 책에 넣을 문장도 골라보자.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '12 minutes'),
                (235, 2, 1, '이번 가족 기록은 내가 먼저 정리해둘게요.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '16 minutes'),
                (236, 3, 1, '프로젝트반 사진은 발표 자료 후보로도 좋아요.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '14 minutes'),
                (237, 40, 1, '초대받은 사진방도 확인해볼게요.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '10 minutes'),
                (238, 41, 1, '반 기록방은 수락 후 같이 채워보겠습니다.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '9 minutes')
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
                (305, 1, 2, '기념일 후보 사진', '책에 담고 싶은 이번 달 사진 기록', null, 4, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 16, now() - interval '1 hour', now() - interval '1 hour'),
                (306, 3, 4, '월초 팀 사진', '월초 회의에서 남긴 팀 사진', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 2, now() - interval '3 hours', now() - interval '3 hours'),
                (307, 1, 2, '퇴근길 하늘', '같이 본 하늘 사진 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 4, now() - interval '4 hours', now() - interval '4 hours'),
                (308, 2, 3, '가족 저녁상', '가족이 함께 먹은 저녁 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 6, now() - interval '5 hours', now() - interval '5 hours'),
                (309, 3, 4, '중간 발표 사진', '중간 발표 준비 현장', null, 3, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 9, now() - interval '6 hours', now() - interval '6 hours'),
                (310, 1, 2, '카페 영수증과 사진', '둘이 고른 디저트 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 11, now() - interval '7 hours', now() - interval '7 hours'),
                (311, 2, 3, '가족 산책 사진', '공원 산책 중 남긴 사진', null, 4, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 13, now() - interval '8 hours', now() - interval '8 hours'),
                (312, 3, 4, '회고 보드 사진', '프로젝트 회고 보드 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 14, now() - interval '9 hours', now() - interval '9 hours'),
                (313, 1, 2, '기념일 산책 사진', '기념일 주간 산책 기록', null, 3, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 18, now() - interval '10 hours', now() - interval '10 hours'),
                (314, 2, 3, '생신 준비 사진', '생신 준비 과정 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 20, now() - interval '11 hours', now() - interval '11 hours'),
                (315, 3, 4, '팀 회식 후보 장소', '후보 장소를 사진으로 남김', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 21, now() - interval '12 hours', now() - interval '12 hours'),
                (316, 1, 2, '주말 영화 티켓', '함께 본 영화 티켓 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 23, now() - interval '13 hours', now() - interval '13 hours'),
                (317, 2, 3, '가족 앨범 후보', '앨범에 넣을 사진 후보', null, 5, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 27, now() - interval '14 hours', now() - interval '14 hours'),
                (318, 3, 4, '최종 발표 사진', '최종 발표 날의 기록', null, 4, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 28, now() - interval '15 hours', now() - interval '15 hours'),
                (319, 1, 2, '월말 산책 사진', '월말에 남긴 산책 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 30, now() - interval '16 hours', now() - interval '16 hours'),
                (320, 2, 3, '일요일 가족 브런치', '일요일에 함께 먹은 브런치 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 1, now() - interval '17 hours', now() - interval '17 hours'),
                (321, 3, 4, '화요일 회의 사진', '화요일 회의에서 남긴 사진', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 3, now() - interval '18 hours', now() - interval '18 hours'),
                (322, 1, 2, '일요일 카페 기록', '일요일 카페에서 남긴 추억', null, 3, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 8, now() - interval '19 hours', now() - interval '19 hours'),
                (323, 3, 4, '화요일 발표 준비', '화요일 발표 준비 사진', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 10, now() - interval '20 hours', now() - interval '20 hours'),
                (324, 2, 3, '목요일 가족 간식', '목요일 가족 간식 사진', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 19, now() - interval '21 hours', now() - interval '21 hours'),
                (325, 1, 2, '일요일 영화 기록', '일요일에 함께 본 영화 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 22, now() - interval '22 hours', now() - interval '22 hours'),
                (326, 3, 4, '목요일 최종 점검', '목요일 최종 점검 사진', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 26, now() - interval '23 hours', now() - interval '23 hours'),
                (327, 2, 3, '월말 가족 기록', '월말 가족 모임 사진', null, 4, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 29, now() - interval '24 hours', now() - interval '24 hours'),
                (328, 1, 2, '아침 산책 풍경', '아침 산책길에 남긴 사진과 짧은 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 2, now() - interval '25 hours', now() - interval '25 hours'),
                (329, 1, 1, '둘이 고른 책갈피', '책에 넣고 싶은 작은 물건을 기록했다.', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 3, now() - interval '26 hours', now() - interval '26 hours'),
                (330, 1, 2, '주말 브런치 사진', '주말에 같이 먹은 브런치 사진 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 5, now() - interval '27 hours', now() - interval '27 hours'),
                (331, 1, 1, '저녁 노을 기록', '퇴근 후 같이 본 노을을 남겼다.', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 7, now() - interval '28 hours', now() - interval '28 hours'),
                (332, 1, 2, '기념일 메뉴 후보', '기념일에 먹고 싶은 메뉴 후보를 사진으로 남김', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 9, now() - interval '29 hours', now() - interval '29 hours'),
                (333, 1, 1, '공원 벤치 사진', '같이 앉았던 공원 벤치와 주변 풍경', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 12, now() - interval '30 hours', now() - interval '30 hours'),
                (334, 1, 2, '작은 선물 기록', '서로에게 준 작은 선물을 기록했다.', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 14, now() - interval '31 hours', now() - interval '31 hours'),
                (335, 1, 1, '비 오는 날 사진', '비 오는 날 함께 걸었던 거리 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 15, now() - interval '32 hours', now() - interval '32 hours'),
                (336, 1, 2, '같이 본 전시', '전시장에서 남긴 기억을 정리했다.', null, 3, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 17, now() - interval '33 hours', now() - interval '33 hours'),
                (337, 1, 1, '야식 사진', '늦은 밤 같이 먹은 야식 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 19, now() - interval '34 hours', now() - interval '34 hours'),
                (338, 1, 2, '서점 데이트', '서점에서 고른 책과 책장 사진', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 21, now() - interval '35 hours', now() - interval '35 hours'),
                (339, 1, 1, '함께 만든 저녁', '집에서 같이 만든 저녁 기록', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 24, now() - interval '36 hours', now() - interval '36 hours'),
                (340, 1, 2, '편지 쓰던 날', '편지를 쓰며 남긴 책상 위 사진', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 25, now() - interval '37 hours', now() - interval '37 hours'),
                (341, 1, 1, '여름 산책 사진', '더운 날 같이 걸었던 산책길 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 26, now() - interval '38 hours', now() - interval '38 hours'),
                (342, 1, 2, '카페 창가 자리', '창가 자리에 앉아 찍은 사진', null, 2, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 27, now() - interval '39 hours', now() - interval '39 hours'),
                (343, 1, 1, '월말 회고 메모', '이번 달 함께한 순간을 정리한 메모', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 28, now() - interval '40 hours', now() - interval '40 hours'),
                (344, 1, 2, '다음 달 약속 후보', '다음 달에 가고 싶은 장소 후보 기록', null, 1, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 29, now() - interval '41 hours', now() - interval '41 hours'),
                (345, 1, 1, '책에 넣을 사진 후보', '최종 책 후보로 표시하고 싶은 사진', null, 3, date_trunc('month', now() at time zone 'Asia/Seoul')::date + 30, now() - interval '42 hours', now() - interval '42 hours')
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

        jdbcTemplate.update(
            """
            update memory_posts
            set
                representative_image_url = 'https://picsum.photos/seed/record-room-' || id || '/720/480',
                image_count = greatest(image_count, 1),
                updated_at = now()
            where id between 301 and 345
            """.trimIndent(),
        )
    }

    // 추억 상세 화면에서 댓글 흐름을 바로 검증할 수 있도록 게시글별 댓글을 준비한다.
    private fun seedMemoryComments() {
        jdbcTemplate.update(
            """
            insert into memory_comments (id, memory_post_id, author_member_id, body, created_at)
            values
                (501, 301, 1, '이 사진은 가족 앨범 첫 장에 넣어도 좋겠어요.', now() - interval '1 hour 50 minutes'),
                (502, 301, 3, '다음 여행 때도 같은 구도로 한 장 더 찍어봐요.', now() - interval '1 hour 30 minutes'),
                (503, 303, 1, '카페 분위기가 잘 담겨서 책에 넣기 좋다.', now() - interval '1 day 20 hours'),
                (504, 303, 2, '디저트 사진도 같이 골라둘게.', now() - interval '1 day 19 hours'),
                (505, 305, 1, '기념일 후보로 표시해둘게.', now() - interval '55 minutes'),
                (506, 306, 4, '팀 기록으로 남기기 좋습니다.', now() - interval '2 hours 20 minutes'),
                (507, 309, 1, '발표 준비 과정이 잘 보이네요.', now() - interval '5 hours 40 minutes'),
                (508, 311, 3, '공원 산책 사진은 가족 책에 꼭 넣자.', now() - interval '7 hours 10 minutes'),
                (509, 313, 2, '산책 코스도 글에 같이 남기면 좋겠다.', now() - interval '9 hours 30 minutes'),
                (510, 317, 1, '앨범 후보 사진은 따로 모아두자.', now() - interval '13 hours 20 minutes'),
                (511, 318, 4, '최종 발표 날 분위기가 잘 담겼어요.', now() - interval '14 hours 20 minutes'),
                (512, 320, 3, '브런치 사진이 따뜻하게 나왔네요.', now() - interval '16 hours 45 minutes'),
                (513, 328, 1, '이 산책길 사진은 첫 페이지 후보로 두자.', now() - interval '17 hours 10 minutes'),
                (514, 329, 2, '책갈피 색이 사진이랑 잘 어울린다.', now() - interval '17 hours 30 minutes'),
                (515, 330, 1, '브런치 사진은 날짜랑 같이 남겨두면 좋겠다.', now() - interval '18 hours'),
                (516, 333, 2, '공원 벤치 사진은 분위기가 좋네.', now() - interval '18 hours 20 minutes'),
                (517, 336, 1, '전시 이름도 본문에 같이 적어둘게.', now() - interval '19 hours'),
                (518, 338, 2, '서점 기록은 나중에 다시 읽기 좋겠다.', now() - interval '20 hours'),
                (519, 340, 1, '편지 쓰던 날 사진은 편지 페이지랑 연결하면 좋겠다.', now() - interval '21 hours'),
                (520, 345, 2, '이 사진은 책 후보로 꼭 표시해두자.', now() - interval '22 hours')
            on conflict (id) do update set
                memory_post_id = excluded.memory_post_id,
                author_member_id = excluded.author_member_id,
                body = excluded.body,
                created_at = excluded.created_at,
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
                (101, 1, '오늘의 산책 사진', '함께 걸은 길이나 도착 장소를 사진으로 인증한다.', 'WAITING_APPROVAL', 1, now() - interval '20 days', null),
                (102, 1, '함께 먹은 음식', '둘이 함께 먹은 음식 사진과 짧은 기록을 남긴다.', 'COMPLETED', 1, now() - interval '19 days', now() - interval '18 days'),
                (103, 1, '카페 또는 디저트 인증', '함께 고른 음료나 디저트를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '18 days', null),
                (104, 1, '같은 색 아이템', '같은 색 옷이나 물건을 나란히 찍어 인증한다.', 'IN_PROGRESS', 1, now() - interval '17 days', null),
                (105, 1, '둘만의 포즈 사진', '손하트나 약속한 포즈를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '16 days', null),
                (106, 1, '영화 또는 공연 티켓', '함께 본 영화, 공연, 전시 티켓이나 입장 흔적을 인증한다.', 'IN_PROGRESS', 1, now() - interval '15 days', null),
                (107, 1, '함께 만든 요리', '같이 만든 음식의 완성 사진을 올린다.', 'IN_PROGRESS', 1, now() - interval '14 days', null),
                (108, 1, '기념일 장소', '기념일에 들른 장소나 표지판을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '13 days', null),
                (109, 1, '작은 선물 인증', '서로에게 준 작은 선물이나 포장 사진을 남긴다.', 'IN_PROGRESS', 1, now() - interval '12 days', null),
                (110, 1, '같이 본 하늘', '같은 날 함께 본 하늘이나 풍경을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '11 days', null),
                (111, 1, '운동 또는 산책 코스', '운동 장소, 산책로 표지, 코스 흔적을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '10 days', null),
                (112, 1, '데이트 코스 흔적', '간판, 영수증, 장소 사진 중 하나로 데이트 코스를 인증한다.', 'IN_PROGRESS', 1, now() - interval '9 days', null),
                (113, 1, '추억 물건 사진', '둘에게 의미 있는 물건을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '8 days', null),
                (114, 1, '함께 고른 책 또는 음악', '같이 고른 책, 앨범, 플레이리스트 화면을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '7 days', null),
                (115, 1, '사진첩 정리 인증', '함께 정리한 사진첩이나 인화 사진을 촬영한다.', 'IN_PROGRESS', 1, now() - interval '6 days', null),
                (116, 1, '서로의 컵 또는 음료', '각자 고른 컵이나 음료를 나란히 찍는다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (117, 1, '서점 또는 문구점 방문', '함께 방문한 서점이나 문구점의 흔적을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '4 days', null),
                (118, 1, '밤 산책 풍경', '밤 산책 중 본 거리나 조명을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '3 days', null),
                (119, 1, '다음 약속 후보 장소', '다음에 가고 싶은 장소의 간판이나 사진을 올린다.', 'IN_PROGRESS', 1, now() - interval '2 days', null),
                (120, 1, '이번 달 대표 사진', '이번 달을 대표할 사진 한 장을 골라 인증한다.', 'IN_PROGRESS', 1, now() - interval '1 day', null),
                (201, 2, '가족 식탁 사진', '함께 먹은 식탁이나 준비한 음식을 사진으로 남긴다.', 'WAITING_APPROVAL', 1, now() - interval '20 days', null),
                (202, 2, '가족 산책길', '가족이 함께 걸은 길이나 도착 장소를 인증한다.', 'COMPLETED', 1, now() - interval '19 days', now() - interval '18 days'),
                (203, 2, '가족 앨범 한 장', '앨범이나 인화 사진 중 이번 달에 다시 보고 싶은 장면을 찍는다.', 'IN_PROGRESS', 1, now() - interval '18 days', null),
                (204, 2, '장보기 장바구니', '함께 장본 물건이나 장바구니를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '17 days', null),
                (205, 2, '집 안의 작은 변화', '정리한 공간, 꽃, 새로 둔 물건 등 집 안 변화를 촬영한다.', 'IN_PROGRESS', 1, now() - interval '16 days', null),
                (206, 2, '가족 요리 과정', '요리 과정이나 완성 음식을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '15 days', null),
                (207, 2, '가족 간식 선택', '가족 중 누군가가 고른 간식이나 음료를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '14 days', null),
                (208, 2, '여행 준비물', '여행 가방, 준비물, 체크리스트 중 하나를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '13 days', null),
                (209, 2, '아침 또는 저녁 하늘', '가족과 함께 본 아침이나 저녁 하늘을 촬영한다.', 'IN_PROGRESS', 1, now() - interval '12 days', null),
                (210, 2, '오래된 물건 기록', '집에 오래 보관한 물건 한 가지를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '11 days', null),
                (211, 2, '생일 또는 기념일 장식', '케이크, 장식, 선물 포장 중 하나를 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '10 days', null),
                (212, 2, '주말 나들이 장소', '가족이 다녀온 장소의 간판이나 풍경을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '9 days', null),
                (213, 2, '가족 운동 인증', '함께 운동한 장소나 운동 후 흔적을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '8 days', null),
                (214, 2, '가족 영화의 흔적', '영화 티켓, 화면, 간식 등 함께 본 흔적을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '7 days', null),
                (215, 2, '함께 정리한 공간', '가족이 함께 정리한 방이나 책상을 촬영한다.', 'IN_PROGRESS', 1, now() - interval '6 days', null),
                (216, 2, '가족 신발 또는 우산', '함께 외출한 날의 신발이나 우산을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (217, 2, '추억 장소 간판', '가족에게 의미 있는 장소의 간판이나 입구를 촬영한다.', 'IN_PROGRESS', 1, now() - interval '4 days', null),
                (218, 2, '가족 메뉴판', '함께 고른 메뉴판이나 주문한 음식을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '3 days', null),
                (219, 2, '집 근처 산책 인증', '집 근처 산책 중 본 풍경을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '2 days', null),
                (220, 2, '이번 달 가족 대표 사진', '이번 달 가족 기록을 대표하는 사진을 선택한다.', 'IN_PROGRESS', 1, now() - interval '1 day', null),
                (301, 3, '단체 출석 인증', '모임 시작 전 출석 상황이나 장소를 사진으로 남긴다.', 'WAITING_APPROVAL', 1, now() - interval '20 days', null),
                (302, 3, '회의 보드 사진', '화이트보드, 칠판, 회의 메모를 사진으로 인증한다.', 'COMPLETED', 1, now() - interval '19 days', now() - interval '18 days'),
                (303, 3, '발표 자료 화면', '발표 자료나 준비 화면을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '18 days', null),
                (304, 3, '실습 결과물', '수업, 동아리, 프로젝트 실습 결과물을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '17 days', null),
                (305, 3, '스터디 책상', '모임 중 사용한 책상, 책, 노트북 배치를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '16 days', null),
                (306, 3, '팀 노트 필기', '팀 노트나 필기 일부를 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '15 days', null),
                (307, 3, '역할 분담 보드', '역할 분담표나 업무 보드를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '14 days', null),
                (308, 3, '모임 장소 간판', '모임 장소의 간판, 문패, 입구를 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '13 days', null),
                (309, 3, '활동 소품 인증', '활동에 사용한 소품이나 준비물을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '12 days', null),
                (310, 3, '프로젝트 결과물 캡처', '만든 화면이나 결과물을 캡처 이미지로 인증한다.', 'IN_PROGRESS', 1, now() - interval '11 days', null),
                (311, 3, '회고 포스트잇', '회고 내용이 담긴 포스트잇이나 보드를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '10 days', null),
                (312, 3, '팀 응원 문구', '팀원이 적은 응원 문구나 안내판을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '9 days', null),
                (313, 3, '활동 장면 기록', '학급, 동아리, 모임 활동 장면을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '8 days', null),
                (314, 3, '준비물 체크', '모임 준비물이나 체크리스트를 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '7 days', null),
                (315, 3, '발표 리허설', '리허설 화면이나 연습 공간을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '6 days', null),
                (316, 3, '팀 간식 기록', '모임 중 함께 먹은 간식이나 음료를 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '5 days', null),
                (317, 3, '행사 포스터', '행사 포스터, 안내문, 시간표를 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '4 days', null),
                (318, 3, '마감 전 작업 화면', '마감 전 작업 화면이나 책상을 사진으로 인증한다.', 'IN_PROGRESS', 1, now() - interval '3 days', null),
                (319, 3, '완료 인증 사진', '완료된 결과물이나 수료 흔적을 사진으로 남긴다.', 'IN_PROGRESS', 1, now() - interval '2 days', null),
                (320, 3, '이번 달 대표 활동', '이번 달 모임을 대표하는 사진 한 장을 선택한다.', 'IN_PROGRESS', 1, now() - interval '1 day', null)
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
            delete from mission_approvals
            where mission_submission_id in (
                select id
                from mission_submissions
                where mission_id between 101 and 320
                  and id not between 101 and 121
            )
            """.trimIndent(),
        )
        jdbcTemplate.update(
            """
            delete from mission_submissions
            where mission_id between 101 and 320
              and id not between 101 and 121
            """.trimIndent(),
        )
        jdbcTemplate.update(
            """
            insert into mission_submissions (id, mission_id, submitter_member_id, body, image_url, occurred_date, submitted_at)
            values
                (101, 101, 2, '오늘 산책로 입구 사진을 남겼어.', 'https://picsum.photos/seed/mission-101/900/640', ((now() at time zone 'Asia/Seoul')::date), now() - interval '8 minutes'),
                (102, 102, 2, '함께 먹은 점심 사진으로 인증 완료.', 'https://picsum.photos/seed/mission-102/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 2, now() - interval '1 day 2 hours'),
                (103, 201, 3, '가족 식탁 사진을 올립니다.', 'https://picsum.photos/seed/mission-201/900/640', ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 5 hours'),
                (104, 202, 3, '가족 산책길 표지판을 찍었습니다.', 'https://picsum.photos/seed/mission-202/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 4, now() - interval '2 days'),
                (105, 301, 4, '모임 장소 입구 사진으로 출석 인증합니다.', 'https://picsum.photos/seed/mission-301/900/640', ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days 2 hours'),
                (106, 302, 4, '회의 보드 사진을 올립니다.', 'https://picsum.photos/seed/mission-302/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 6, now() - interval '3 days'),
                (107, 103, 1, '디저트 사진은 여기 남겨둘게.', 'https://picsum.photos/seed/mission-103/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 7, now() - interval '4 hours'),
                (108, 203, 1, '오래된 가족 앨범 한 장을 다시 찍었습니다.', 'https://picsum.photos/seed/mission-203/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 9, now() - interval '5 hours'),
                (109, 303, 1, '발표 자료 화면을 캡처했습니다.', 'https://picsum.photos/seed/mission-303/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 11, now() - interval '6 hours'),
                (110, 104, 2, '같은 색 아이템을 맞춰 찍었어.', 'https://picsum.photos/seed/mission-104/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 13, now() - interval '7 hours'),
                (111, 204, 3, '장보기 장바구니 사진입니다.', 'https://picsum.photos/seed/mission-204/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 14, now() - interval '8 hours'),
                (112, 304, 4, '실습 결과물을 사진으로 인증합니다.', 'https://picsum.photos/seed/mission-304/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 16, now() - interval '9 hours'),
                (113, 105, 2, '둘만의 포즈 사진 인증.', 'https://picsum.photos/seed/mission-105/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 18, now() - interval '10 hours'),
                (114, 205, 3, '거실 책장 정리 후 사진을 남겼습니다.', 'https://picsum.photos/seed/mission-205/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 20, now() - interval '11 hours'),
                (115, 305, 4, '스터디 책상 인증합니다.', 'https://picsum.photos/seed/mission-305/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 21, now() - interval '12 hours'),
                (116, 106, 2, '티켓 사진을 남겼어.', 'https://picsum.photos/seed/mission-106/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 23, now() - interval '13 hours'),
                (117, 206, 3, '가족 요리 완성 사진입니다.', 'https://picsum.photos/seed/mission-206/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 25, now() - interval '14 hours'),
                (118, 306, 4, '팀 노트 필기 인증입니다.', 'https://picsum.photos/seed/mission-306/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 26, now() - interval '15 hours'),
                (119, 107, 1, '같이 만든 요리 사진을 올렸어.', 'https://picsum.photos/seed/mission-107/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 28, now() - interval '16 hours'),
                (120, 207, 1, '가족 간식 사진을 남깁니다.', 'https://picsum.photos/seed/mission-207/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 29, now() - interval '17 hours'),
                (121, 307, 1, '역할 분담 보드를 캡처했습니다.', 'https://picsum.photos/seed/mission-307/900/640', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 30, now() - interval '18 hours')
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

    // 완료 상태 미션은 실제 승인 데이터가 있어야 동의율과 완료 조건을 함께 확인할 수 있다.
    private fun seedMissionApprovals() {
        jdbcTemplate.update(
            """
            insert into mission_approvals (id, mission_submission_id, approver_member_id, decision, decided_at)
            values
                (101, 102, 1, 'APPROVED', now() - interval '1 day'),
                (102, 104, 1, 'APPROVED', now() - interval '1 day'),
                (103, 106, 1, 'APPROVED', now() - interval '1 day')
            on conflict (mission_submission_id, approver_member_id) do update set
                decision = excluded.decision,
                decided_at = excluded.decided_at
            """.trimIndent(),
        )
    }

    // 선택 미션 상세 카드에서 댓글 흐름을 바로 검증할 수 있도록 미션별 댓글을 준비한다.
    private fun seedMissionComments() {
        jdbcTemplate.update(
            """
            insert into mission_comments (id, mission_id, author_member_id, body, created_at)
            values
                (101, 101, 1, '산책 사진은 책에 넣기 좋아 보인다.', now() - interval '42 minutes'),
                (102, 101, 2, '다음에는 같은 장소에서 밤 사진도 찍어보자.', now() - interval '36 minutes'),
                (103, 102, 1, '이 음식 사진은 표지 후보로도 괜찮겠다.', now() - interval '1 day 1 hour'),
                (104, 201, 3, '식탁 전체가 잘 보이게 다시 한 장 찍어도 좋겠어요.', now() - interval '3 hours'),
                (105, 301, 4, '출석 사진은 다음 모임 자료에도 같이 쓰겠습니다.', now() - interval '5 hours')
            on conflict (id) do update set
                mission_id = excluded.mission_id,
                author_member_id = excluded.author_member_id,
                body = excluded.body,
                created_at = excluded.created_at,
                deleted_at = null
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
                (405, 1, 2, 1, '기념일 편지', '이번 달 기념일에 남기는 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 16, now() - interval '2 hours', null),
                (406, 2, 3, 1, '월초 가족 편지', '월초에 남기는 가족 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 2, now() - interval '3 hours', null),
                (407, 1, 2, 1, '고마운 하루', '오늘 고마웠던 마음', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 4, now() - interval '4 hours', null),
                (408, 3, 4, 1, '팀 응원 편지', '팀원에게 보내는 응원', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 6, now() - interval '5 hours', null),
                (409, 2, 3, 1, '주말 가족 편지', '주말 준비를 고마워하는 마음', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 7, now() - interval '6 hours', null),
                (410, 1, 2, 1, '기록을 부탁하는 편지', '사진을 같이 고르자는 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 11, now() - interval '7 hours', null),
                (411, 3, 4, 1, '발표 응원', '발표를 앞둔 응원 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 13, now() - interval '8 hours', null),
                (412, 2, 3, 1, '생신 준비 편지', '생신 준비 고마움을 담은 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 14, now() - interval '9 hours', null),
                (413, 1, 2, 1, '기념일 전날 편지', '기념일을 기다리는 마음', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 15, now() - interval '10 hours', null),
                (414, 3, 4, 1, '회고 감사 편지', '프로젝트 회고에 대한 감사', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 18, now() - interval '11 hours', null),
                (415, 2, 3, 1, '가족 앨범 편지', '앨범 정리에 대한 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 20, now() - interval '12 hours', null),
                (416, 1, 2, 1, '주말 데이트 편지', '주말 약속에 대한 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 21, now() - interval '13 hours', null),
                (417, 3, 4, 1, '마무리 응원 편지', '프로젝트 마무리 응원', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 23, now() - interval '14 hours', null),
                (418, 2, 3, 1, '가족 모임 편지', '가족 모임 후 남기는 마음', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 25, now() - interval '15 hours', null),
                (419, 1, 2, 1, '월말 편지', '이번 달을 정리하는 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 27, now() - interval '16 hours', null),
                (420, 3, 4, 1, '최종 발표 편지', '최종 발표 후 고마움을 담은 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 28, now() - interval '17 hours', null),
                (421, 2, 3, 1, '월말 가족 편지', '8월 가족 기록을 마무리하는 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 30, now() - interval '18 hours', null),
                (422, 3, 4, 1, '일요일 팀 편지', '일요일 팀원에게 남긴 짧은 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 1, now() - interval '19 hours', null),
                (423, 2, 3, 1, '화요일 가족 편지', '화요일 가족에게 남긴 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 3, now() - interval '20 hours', null),
                (424, 1, 2, 1, '일요일 데이트 편지', '일요일 데이트 후 남긴 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 8, now() - interval '21 hours', null),
                (425, 2, 3, 1, '화요일 가족 응원', '화요일 가족에게 보내는 응원 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 10, now() - interval '22 hours', null),
                (426, 3, 4, 1, '일요일 프로젝트 편지', '일요일 프로젝트 준비 응원 편지', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 22, now() - interval '23 hours', null),
                (427, 1, 2, 1, '목요일 고마움 편지', '목요일에 남긴 고마운 마음', date_trunc('month', now() at time zone 'Asia/Seoul')::date + 26, now() - interval '24 hours', null),
                (428, 1, 1, 2, '아침 인사', '오늘 하루도 잘 보내라는 마음을 남겼어.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '25 minutes', null),
                (429, 1, 2, 1, '답장 인사', '나도 오늘 하루 잘 보내라고 답장해.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '18 minutes', null),
                (430, 1, 1, 2, '점심 약속', '점심 메뉴 후보를 편지로 남겨둘게.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '50 minutes', null),
                (431, 1, 2, 1, '점심 답장', '네가 고른 메뉴도 좋을 것 같아.', ((now() at time zone 'Asia/Seoul')::date), now() - interval '42 minutes', null),
                (432, 1, 1, 2, '퇴근 후 산책', '퇴근하고 잠깐 산책하자는 편지를 남겼어.', ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 1 hour', null),
                (433, 1, 2, 1, '산책 답장', '산책길에서 사진도 같이 남기자.', ((now() at time zone 'Asia/Seoul')::date) - 1, now() - interval '1 day 50 minutes', null),
                (434, 1, 1, 2, '사진 고르기', '책에 넣을 사진 후보를 같이 고르자.', ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days 1 hour', null),
                (435, 1, 2, 1, '사진 답장', '카페 사진과 산책 사진을 먼저 보자.', ((now() at time zone 'Asia/Seoul')::date) - 2, now() - interval '2 days 40 minutes', null),
                (436, 1, 1, 2, '주말 계획', '주말에 갈 장소 후보를 정리해봤어.', ((now() at time zone 'Asia/Seoul')::date) - 3, now() - interval '3 days 1 hour', null),
                (437, 1, 2, 1, '주말 답장', '그중 전시회가 가장 기대돼.', ((now() at time zone 'Asia/Seoul')::date) - 3, now() - interval '3 days 35 minutes', null),
                (438, 1, 1, 2, '영화표 기록', '지난번 영화표도 추억으로 남겨두자.', ((now() at time zone 'Asia/Seoul')::date) - 4, now() - interval '4 days 1 hour', null),
                (439, 1, 2, 1, '영화표 답장', '영화 보고 나왔던 사진도 같이 넣자.', ((now() at time zone 'Asia/Seoul')::date) - 4, now() - interval '4 days 45 minutes', null),
                (440, 1, 1, 2, '고마운 순간', '어제 챙겨줘서 고마웠던 마음을 남겨.', ((now() at time zone 'Asia/Seoul')::date) - 5, now() - interval '5 days 1 hour', null),
                (441, 1, 2, 1, '고마움 답장', '나도 네가 기록을 챙겨줘서 고마워.', ((now() at time zone 'Asia/Seoul')::date) - 5, now() - interval '5 days 40 minutes', null),
                (442, 1, 1, 2, '기념일 후보', '기념일에 갈 장소 후보를 편지로 적어둘게.', ((now() at time zone 'Asia/Seoul')::date) - 6, now() - interval '6 days 1 hour', null),
                (443, 1, 2, 1, '기념일 답장', '바다가 보이는 곳이면 좋겠어.', ((now() at time zone 'Asia/Seoul')::date) - 6, now() - interval '6 days 42 minutes', null),
                (444, 1, 1, 2, '책에 담을 말', '첫 페이지에 넣고 싶은 문장을 적어봤어.', ((now() at time zone 'Asia/Seoul')::date) - 7, now() - interval '7 days 1 hour', null),
                (445, 1, 2, 1, '책 문장 답장', '그 문장은 마지막 페이지에도 잘 어울릴 것 같아.', ((now() at time zone 'Asia/Seoul')::date) - 7, now() - interval '7 days 38 minutes', null),
                (446, 1, 1, 2, '카페 창가', '창가 자리 사진이 아직 기억에 남아.', ((now() at time zone 'Asia/Seoul')::date) - 8, now() - interval '8 days 1 hour', null),
                (447, 1, 2, 1, '카페 답장', '그날 빛이 좋아서 사진도 따뜻했어.', ((now() at time zone 'Asia/Seoul')::date) - 8, now() - interval '8 days 45 minutes', null),
                (448, 1, 1, 2, '산책 코스', '다음 산책 코스를 지도에 표시해뒀어.', ((now() at time zone 'Asia/Seoul')::date) - 9, now() - interval '9 days 1 hour', null),
                (449, 1, 2, 1, '산책 코스 답장', '그 길은 노을 시간에 가면 좋겠다.', ((now() at time zone 'Asia/Seoul')::date) - 9, now() - interval '9 days 35 minutes', null),
                (450, 1, 1, 2, '월말 정리', '이번 달 편지와 사진을 같이 정리하자.', ((now() at time zone 'Asia/Seoul')::date) - 10, now() - interval '10 days 1 hour', null),
                (451, 1, 2, 1, '월말 답장', '좋아. 편지함에서 먼저 골라보자.', ((now() at time zone 'Asia/Seoul')::date) - 10, now() - interval '10 days 44 minutes', null),
                (452, 1, 1, 2, '다음 달 약속', '다음 달 첫 약속을 미리 정해두고 싶어.', ((now() at time zone 'Asia/Seoul')::date) - 11, now() - interval '11 days 1 hour', null),
                (453, 1, 2, 1, '다음 달 답장', '첫 주 주말에 만나서 정리하자.', ((now() at time zone 'Asia/Seoul')::date) - 11, now() - interval '11 days 36 minutes', null)
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
                    '여자친구가 미션 인증 동의를 기다립니다.',
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
                    '여자친구가 새 채팅을 보냈습니다.',
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
                    '여자친구가 오늘 점심 사진 이야기를 남겼습니다.',
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
                    '여자친구가 카페에서 찍은 사진을 올렸습니다.',
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
                    '여자친구가 저녁 약속 채팅을 남겼습니다.',
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
                    '여자친구가 산책 인증 동의를 기다립니다.',
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
                ),
                (
                    21,
                    2,
                    1,
                    1,
                    'CHAT',
                    '새 채팅',
                    '류성열이 오늘 기록을 같이 보자고 남겼습니다.',
                    'CHAT',
                    233,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '18 minutes'
                ),
                (
                    22,
                    2,
                    1,
                    1,
                    'LETTER',
                    '새 편지',
                    '류성열이 편지를 보냈습니다.',
                    'LETTER',
                    440,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day 1 hour'
                ),
                (
                    23,
                    3,
                    2,
                    1,
                    'CHAT',
                    '새 채팅',
                    '류성열이 가족 기록을 먼저 정리하겠다고 남겼습니다.',
                    'CHAT',
                    235,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '16 minutes'
                ),
                (
                    24,
                    3,
                    2,
                    1,
                    'MEMORY',
                    '새 추억',
                    '류성열이 가족 사진을 올렸습니다.',
                    'MEMORY',
                    301,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '1 hour'
                ),
                (
                    25,
                    4,
                    3,
                    1,
                    'CHAT',
                    '새 채팅',
                    '류성열이 프로젝트반 사진 후보를 남겼습니다.',
                    'CHAT',
                    236,
                    ((now() at time zone 'Asia/Seoul')::date),
                    null,
                    now() - interval '14 minutes'
                ),
                (
                    26,
                    4,
                    3,
                    1,
                    'MISSION_APPROVAL_REQUEST',
                    '미션 인증 요청',
                    '류성열이 프로젝트 미션 인증 동의를 기다립니다.',
                    'MISSION',
                    105,
                    ((now() at time zone 'Asia/Seoul')::date) - 1,
                    null,
                    now() - interval '1 day 2 hours'
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

    // 이전 로컬 fallback 응답이 화면에 남아 최신 채팅 정책과 섞이지 않도록 제거한다.
    private fun deleteLegacyAutomaticReplyMessages() {
        jdbcTemplate.update(
            """
            delete from chat_messages
            where sender_member_id = 99
              and body in (
                  '좋아요. 이 대화도 오늘의 기록으로 남겨둘게요.',
                  '좋아요. 이 사진 이야기는 나중에 책에 담기에도 좋겠어요.',
                  '편지로 남기면 더 오래 기억될 것 같아요.',
                  '미션 기록으로 남겨두면 함께 확인하기 좋겠어요.'
              )
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
            "memory_comments",
            "missions",
            "mission_submissions",
            "mission_approvals",
            "mission_comments",
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
