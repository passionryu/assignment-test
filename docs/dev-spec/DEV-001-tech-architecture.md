# DEV-001 Tech Architecture

Status: Draft
Owner: Tech Lead Agent
Issue: #2

## 1. Purpose

이 문서는 Lv1 콘텐츠 서비스 구현을 위한 기술 구조를 정의한다.

Lv1의 목표는 외부 인쇄 주문 연동 이전 단계의 콘텐츠 서비스다. 사용자는 기록방에 참여하고, 방 안에서 채팅, 추억 게시글, 미션 인증, 편지를 남기며, 메인 캘린더에서 날짜별 기록 흐름을 다시 탐색할 수 있어야 한다.

이 문서는 실제 기능 코드를 구현하지 않는다. Full Stack Dev Agent가 구현할 수 있도록 기술 스택, 모듈 책임, API/DB 설계 기준, 검증 기준을 확정한다.

## 2. Scope

### Included

- 회원 프로필 조회/수정
- 로그아웃 확인 흐름
- 설정 화면의 비밀번호 변경 UI/API
- 전체/개별 알림 설정
- 참여 중인 방 목록
- 방 생성
- 초대 받은 방 조회
- 방 멤버 관리 기초
- 선택 방 기준 사이드바 데이터
- 방 채팅
- 추억 게시판
- 미션 인증
- 편지
- 최신 알림
- 날짜별 캘린더 마커
- 선택 날짜 기록 요약
- Docker 기반 로컬 실행
- 더미/시드 데이터
- curl happy/edge 1차 검증

### Excluded

- 책 만들기
- 주문 생성
- 주문 상태 조회
- 외부 인쇄 주문 연동
- 결제
- 실시간 WebSocket 채팅
- 영상 업로드
- 프로덕션 배포 자동화

## 3. Final Stack

| Layer | Stack | Reason |
| --- | --- | --- |
| Server | Kotlin, Spring Boot, Gradle | 서비스 레이어 orchestration 컨벤션을 가장 잘 반영할 수 있다. |
| API | REST JSON | curl 1차 검증이 쉽고 과제 범위에 충분하다. |
| Persistence | PostgreSQL | Docker 환경에서 재현 가능하고 관계형 도메인에 적합하다. |
| Migration | Flyway | DB 스키마 변경 이력을 명확히 남긴다. |
| ORM | Spring Data JPA | MVP 범위에서 CRUD와 관계 조회 구현 속도가 빠르다. |
| API Docs | springdoc-openapi | API 계약 확인과 추후 README 연결이 쉽다. |
| Client | React, Vite, TypeScript | 화면 정의서 기반 UI 구현 속도와 타입 안정성 균형이 좋다. |
| Client Data | TanStack Query | 서버 상태, loading, error, refetch 상태를 일관되게 관리한다. |
| Routing | React Router | 메인, 방 기능, 설정 페이지 이동을 명확히 표현한다. |
| Form | React Hook Form, Zod | 프로필/게시글/미션/편지 입력 검증을 구조화한다. |
| Test | curl, Playwright | Tech Lead 1차 API 검증과 QA Agent E2E 검증을 분리한다. |
| Infra | Docker Compose | server, client, db를 한 번에 실행한다. |

## 4. Repository Layout

```text
service/
  server/
    src/main/kotlin/
    src/main/resources/
    build.gradle.kts
  client/
    src/
    package.json
    vite.config.ts
  infra/
    docker-compose.yml
    server.Dockerfile
    client.Dockerfile
```

Docs:

```text
docs/dev-spec/
  DEV-001-tech-architecture.md
  DEV-002-domain-db-model.md
  DEV-003-api-contract.md
  DEV-004-seed-docker-verification.md
```

## 5. Backend Architecture

Backend는 다음 계층을 기본으로 한다.

```text
Controller -> Application Service -> Reader / Checker / Recorder / Updater -> Repository
```

### Controller

책임:

- HTTP request/response 처리
- request DTO 검증
- authentication member id 추출
- application service 호출
- response DTO 반환

금지:

- 비즈니스 정책 판단
- repository 직접 호출
- 상태 변경 로직
- 로그에 민감 정보 출력

### Application Service

책임:

- 유스케이스 흐름 orchestration
- 조회, 검증, 상태 변경, 기록, 알림 생성을 순서대로 조립

권장 흐름:

```text
read -> validate/check -> decide -> record/update -> notify -> return
```

예상 서비스:

| Service | Responsibility |
| --- | --- |
| MemberProfileService | 내 프로필 조회/수정, 비밀번호 변경 |
| NotificationSettingService | 전체/개별 알림 설정 변경 |
| RoomCommandService | 방 생성, 방 관리, 초대 처리 |
| RoomQueryService | 사이드바/방 리스트 조회 |
| ChatMessageService | 메시지 등록, 목록/검색 조회 |
| MemoryPostService | 추억 게시글 등록, 목록/상세 조회 |
| MissionService | 미션 목록, 인증 등록, 동의/승인 처리 |
| LetterService | 편지 작성, 받은/보낸 편지 조회 |
| NotificationService | 최신 알림 조회, 읽음 처리 |
| CalendarRecordService | 날짜별 기록 마커와 기록 요약 조회 |

### Collaborator Classes

서비스에서 호출하는 외부 책임 객체 public method 위에는 한국어 한 줄 주석을 작성한다.

권장 객체:

| Suffix | Example |
| --- | --- |
| Reader | RoomMemberReader, MissionReader |
| Checker | RoomAccessChecker, MissionApprovalPolicyChecker |
| Recorder | ChatMessageRecorder, NotificationRecorder |
| Updater | NotificationStatusUpdater, MemberProfileUpdater |
| Decider | MissionCompletionDecider |
| Mapper | CalendarRecordMapper |

## 6. Frontend Architecture

Frontend는 화면 정의서의 사용자 흐름을 기준으로 구성한다.

```text
Page -> Feature Component -> UI Component -> API Client
```

Frontend routes:

| Route | Page |
| --- | --- |
| `/` | MainPage |
| `/rooms` | RoomListPage |
| `/rooms/:roomId/chat` | RoomChatPage |
| `/rooms/:roomId/memories` | MemoryBoardPage |
| `/rooms/:roomId/missions` | MissionPage |
| `/rooms/:roomId/letters` | LetterPage |
| `/settings` | SettingsPage |
| `/records/:date` | DateRecordDetailPage |

Shared layout:

- AppShell
- Sidebar
- Top-level content area
- ModalRoot
- ToastRoot

Feature modules:

```text
src/features/member/
src/features/rooms/
src/features/chat/
src/features/memories/
src/features/missions/
src/features/letters/
src/features/notifications/
src/features/calendar/
src/features/settings/
```

## 7. Authentication Strategy For MVP

Lv1에서는 실제 회원가입/로그인 완성도를 과도하게 키우지 않는다.

MVP authentication strategy:

- seed member를 기본 로그인 사용자로 사용한다.
- API 요청에는 `X-Member-Id` header를 허용한다.
- client 개발 환경에서는 seed member id를 local config로 고정한다.
- 인증 미들웨어는 추후 실제 로그인으로 교체 가능하게 얇게 둔다.
- 회원가입/로그인 화면은 Lv1에서 구현하지 않는다.
- 이메일과 전화번호는 seed member 식별과 초대 시나리오에만 사용한다.

Default local header:

```text
X-Member-Id: 1
```

주의:

- 공개 저장소에 실제 이메일, 전화번호, token, password를 넣지 않는다.
- seed 데이터는 모두 가짜 값을 사용한다.

## 8. Error And Logging Policy

Backend 실패 로그는 coding convention의 형식을 따른다.

```text
[행위 영역] 실패 내용. who=..., what=..., requestData=..., reason=...
```

예:

```text
[미션 동의] 방 멤버가 아닌 사용자의 미션 동의 실패. who=memberId:3, what=POST /api/missions/10/approvals, requestData=roomId:2,missionId:10, reason=room_member_not_found
```

API error response shape:

```json
{
  "code": "ROOM_MEMBER_NOT_FOUND",
  "message": "참여 중인 방이 아닙니다.",
  "requestId": "local-request-id"
}
```

## 9. Lv1 Implementation Priority

| Priority | Feature | Reason |
| --- | --- | --- |
| P0 | Seed member, rooms, sidebar | 모든 화면의 기준 데이터다. |
| P0 | Main dashboard APIs | 화면 정의서 첫 진입 경험의 핵심이다. |
| P0 | Chat, memory, mission, letter list/create | Lv1 콘텐츠 서비스의 핵심 기록 기능이다. |
| P1 | Notification list/read | 최신 알림과 이동 정책을 보여준다. |
| P1 | Calendar markers/date summary | 기록이 쌓이는 서비스 가치를 보여준다. |
| P1 | Settings profile/notification | 화면 정의서 13페이지 반영 범위다. |
| P2 | Password change UI/API mock | 보안 설정의 존재를 보여주되 과도한 auth 구현은 피한다. |

## 10. Handoff To Full Stack Dev Agent

Full Stack Dev Agent는 아래 순서로 구현한다.

1. `service/infra/docker-compose.yml`로 PostgreSQL 실행
2. `service/server` Spring Boot skeleton 생성
3. Flyway migration 작성
4. seed profile 작성
5. REST API 구현
6. curl happy/edge 검증
7. `service/client` React/Vite skeleton 생성
8. API client와 라우팅 구현
9. 화면 정의서 기준 UI 구현
10. README 실행 방법 업데이트

이 문서와 `DEV-002`, `DEV-003`, `DEV-004`를 함께 기준으로 삼는다.
