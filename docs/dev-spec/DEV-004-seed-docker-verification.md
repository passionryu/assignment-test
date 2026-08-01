# DEV-004 Seed, Docker, And Verification

Status: Draft
Owner: Tech Lead Agent
Issue: #2

## 1. Purpose

이 문서는 Lv1 콘텐츠 서비스의 로컬 실행, seed 데이터, curl 1차 검증 기준을 정의한다.

Full Stack Dev Agent는 이 문서를 기준으로 Docker 실행 환경과 seed 데이터를 구현하고, 구현 후 curl로 happy/edge case를 검증한다.

## 2. Docker Strategy

Docker services:

```text
app-db
app-server
app-client
```

Expected command:

```bash
docker compose -f service/infra/docker-compose.yml up --build
```

Expected local URLs:

| Service | URL |
| --- | --- |
| Client | http://localhost:5173 |
| Server | http://localhost:8080 |
| OpenAPI | http://localhost:8080/swagger-ui/index.html |
| PostgreSQL | localhost:5432 |

Environment variables:

| Name | Example | Note |
| --- | --- | --- |
| POSTGRES_DB | assignment_test | local DB name |
| POSTGRES_USER | assignment_user | local DB user |
| POSTGRES_PASSWORD | assignment_password | local-only dummy password |
| SERVER_PORT | 8080 | server port |
| VITE_API_BASE_URL | http://localhost:8080/api | client API base URL |
| SEED_ENABLED | true | local seed toggle |

Do not commit real secrets.

## 3. Server Docker Requirements

`service/infra/server.Dockerfile` should:

- build Kotlin/Spring Boot server
- run jar with local profile
- expose `8080`
- fail fast when DB is unavailable

Runtime profile:

```text
spring.profiles.active=local
```

## 4. Client Docker Requirements

`service/infra/client.Dockerfile` should:

- install dependencies
- run Vite dev server or production preview
- expose `5173`
- use `VITE_API_BASE_URL`

For assignment review, stable local execution is more important than production-optimized image size.

## 5. DB Migration Strategy

Use Flyway migrations:

```text
service/server/src/main/resources/db/migration/
  V1__create_member_and_room_tables.sql
  V2__create_content_tables.sql
  V3__create_notification_and_settings_tables.sql
```

Migration order follows `DEV-002-domain-db-model.md`.

Rules:

- schema creation belongs in Flyway.
- seed data should not be mixed into versioned schema migrations unless it is static reference data.
- demo seed should be idempotent and controlled by `SEED_ENABLED=true`.

## 6. Seed Strategy

Use an idempotent local seed runner in server startup.

Seed runner conditions:

- active profile is `local`
- `SEED_ENABLED=true`
- members table has no seed marker or seed data is upserted by unique keys

Seed data must be fake and safe for public repository.

### Seed Members

| id | displayName | username | email | phoneNumber |
| --- | --- | --- | --- | --- |
| 1 | 류성열 | recordryu | ryu@example.com | 010-1234-5678 |
| 2 | 민지 | minji | minji@example.com | 010-2222-3333 |
| 3 | 아버지 | father | father@example.com | 010-3333-4444 |
| 4 | 지훈 | jihun | jihun@example.com | 010-4444-5555 |

Default local member:

```text
X-Member-Id: 1
```

### Seed Rooms

| id | name | type | members |
| --- | --- | --- | --- |
| 1 | 우리 둘의 100일 | COUPLE | 1, 2 |
| 2 | 7월 가족 | FAMILY | 1, 3 |
| 3 | 여름 프로젝트반 | GROUP | 1, 4 |

Default selected room:

```text
roomId=1
```

### Seed Content

Room 1:

- chat messages on `2026-07-17`
- memory post on `2026-07-17`
- mission with waiting approval
- received letter on `2026-07-17`
- latest notifications for mission, chat, memory

Room 2:

- family memory post
- mission completed by owner approval

Room 3:

- group mission active
- pending invitation count example

### Seed Notification Settings

For member 1:

```json
{
  "allEnabled": true,
  "chatEnabled": true,
  "letterEnabled": true,
  "memoryEnabled": true,
  "missionEnabled": true
}
```

## 7. curl Verification Setup

Set shell variables:

```bash
BASE_URL=http://localhost:8080/api
MEMBER_ID=1
ROOM_ID=1
DATE=2026-07-17
```

Common header:

```bash
-H "X-Member-Id: ${MEMBER_ID}"
```

## 8. Happy Path curl Cases

### 8.1 Main dashboard

```bash
curl -s "${BASE_URL}/main?yearMonth=2026-07" -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- HTTP 200
- `profile.username=recordryu`
- `sidebar.selectedRoomId=1`
- `latestNotifications` length <= 3
- calendar has `2026-07-17` record marker

### 8.2 Room list

```bash
curl -s "${BASE_URL}/rooms" -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- HTTP 200
- at least 3 rooms
- pending invitation count is present

### 8.3 Create chat message

```bash
curl -s -X POST "${BASE_URL}/rooms/${ROOM_ID}/chat/messages" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"body":"curl 검증 메시지"}'
```

Expected:

- HTTP 200 or 201
- response has `id`
- `occurredDate` is today in server timezone or request-created date policy

### 8.4 Search chat messages

```bash
curl -s "${BASE_URL}/rooms/${ROOM_ID}/chat/messages?keyword=curl" \
  -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- HTTP 200
- matching message is returned
- each item has `occurredDate`

### 8.5 Create memory post

```bash
curl -s -X POST "${BASE_URL}/rooms/${ROOM_ID}/memories" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"title":"curl 추억","body":"curl로 만든 추억","representativeImageUrl":"/seed/curl.jpg","imageCount":1,"occurredDate":"2026-07-17"}'
```

Expected:

- HTTP 200 or 201
- response has `id`
- calendar summary count increases or newly created item appears in memory list

### 8.6 Submit mission proof

```bash
curl -s -X POST "${BASE_URL}/rooms/${ROOM_ID}/missions/1/submissions" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"body":"미션 인증","imageUrl":"/seed/mission.jpg","occurredDate":"2026-07-17"}'
```

Expected:

- HTTP 200 or 201
- status is `WAITING_APPROVAL`
- approvalRate is present

### 8.7 Send letter

```bash
curl -s -X POST "${BASE_URL}/rooms/${ROOM_ID}/letters" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"receiverMemberId":2,"title":"curl 편지","body":"테스트 편지입니다.","occurredDate":"2026-07-17"}'
```

Expected:

- HTTP 200 or 201
- response has `id`
- receiver is member 2

### 8.8 Calendar month

```bash
curl -s "${BASE_URL}/calendar/month?yearMonth=2026-07" \
  -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- HTTP 200
- days include records for chat, memory, mission, or letter

### 8.9 Date summary

```bash
curl -s "${BASE_URL}/calendar/days/${DATE}/summary" \
  -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- HTTP 200
- rooms grouped by room id
- count fields are present

### 8.10 Notification setting update

```bash
curl -s -X PUT "${BASE_URL}/members/me/notification-settings" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"allEnabled":false,"chatEnabled":true,"letterEnabled":false,"memoryEnabled":true,"missionEnabled":true}'
```

Expected:

- HTTP 200
- `allEnabled=false`
- individual settings match request

## 9. Edge Case curl Cases

### 9.1 Missing member header

```bash
curl -i "${BASE_URL}/main"
```

Expected:

- HTTP 401 or 400
- safe Korean error message
- no stack trace

### 9.2 Non-member room access

```bash
curl -i "${BASE_URL}/rooms/999/chat/messages" -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- HTTP 403 or 404
- message: `참여 중인 방이 아닙니다.` or `방을 찾을 수 없습니다.`

### 9.3 Empty chat body

```bash
curl -i -X POST "${BASE_URL}/rooms/${ROOM_ID}/chat/messages" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"body":""}'
```

Expected:

- HTTP 400
- field-level or safe form-level error

### 9.4 Invalid room type

```bash
curl -i -X POST "${BASE_URL}/rooms" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"name":"잘못된 방","type":"INVALID"}'
```

Expected:

- HTTP 400
- safe Korean error message

### 9.5 Update read-only profile fields

```bash
curl -i -X PATCH "${BASE_URL}/members/me/profile" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"displayName":"류성열","profileImageUrl":null,"email":"changed@example.com","phoneNumber":"010-0000-0000"}'
```

Expected:

- 서버 DTO가 email/phoneNumber를 무시하거나 HTTP 400을 반환한다.
- DB email/phoneNumber는 변경되지 않는다.

### 9.6 Self approval for mission submission

```bash
curl -i -X POST "${BASE_URL}/rooms/${ROOM_ID}/missions/1/submissions/1/approvals" \
  -H "Content-Type: application/json" \
  -H "X-Member-Id: ${MEMBER_ID}" \
  -d '{"decision":"APPROVED"}'
```

Expected:

- submitter 본인이면 HTTP 400
- message explains own proof cannot be approved by self

### 9.7 Notification target deleted

```bash
curl -i -X POST "${BASE_URL}/notifications/1/read" \
  -H "X-Member-Id: ${MEMBER_ID}"
```

Expected:

- notification read succeeds
- if target is deleted, later navigation API returns deleted target state

## 10. Verification Report Format

Full Stack Dev Agent should update `docs/qa/issue-{issueNumber}/테크리드_에이전트_1차검증.md` after implementation.

The authoritative verification report standard is `docs/agents/tech-lead-agent.md`.
Every issue with API changes must include the `API Coverage Summary`, `Happy curl Results`, and `Edge curl Results` sections defined by the Tech Lead Agent document.

For each implemented API, the report must satisfy the minimum Happy/Edge curl coverage gate.
If the minimum coverage is not satisfied, the result cannot be marked `PASS`.

Required sections:

```text
## curl Verification

### Environment
- branch:
- commit:
- docker command:
- server url:

### API Coverage Summary
| API | Required Happy | Actual Happy | Required Edge | Actual Edge | Result |

### Happy Cases
| Test ID | API | Case | curl | Expected | Actual | Status |

### Edge Cases
| Test ID | API | Case | curl | Expected | Actual | Status |

### Known Issues
```

## 11. Done Criteria

- `docker compose -f service/infra/docker-compose.yml up --build` starts db/server/client.
- server health check returns 200.
- seed data is created idempotently.
- all happy curl cases pass.
- edge cases return safe Korean errors.
- logs contain `who`, `what`, `requestData`, `reason` for expected failures.
- README has local run instructions.
