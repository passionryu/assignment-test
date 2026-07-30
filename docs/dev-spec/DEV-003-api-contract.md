# DEV-003 API Contract

Status: Draft
Owner: Tech Lead Agent
Issue: #2

## 1. Purpose

이 문서는 Lv1 콘텐츠 서비스 구현을 위한 REST API 계약 초안을 정의한다.

API 원칙:

- 모든 request/response는 JSON이다.
- 로컬 MVP 인증은 `X-Member-Id` header를 사용한다.
- 응답은 화면에서 바로 쓰기 쉬운 view model 중심으로 구성한다.
- 민감 정보와 내부 구현 상세는 응답에 포함하지 않는다.
- 책 만들기, 주문, 외부 연동 API는 Lv1에 포함하지 않는다.

Base path:

```text
/api
```

Common header:

```text
X-Member-Id: 1
```

## 2. Common Response

### Error Response

```json
{
  "code": "ROOM_MEMBER_NOT_FOUND",
  "message": "참여 중인 방이 아닙니다.",
  "requestId": "local-request-id"
}
```

### Page Response

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "hasNext": false
}
```

## 3. Main Dashboard APIs

### GET /api/main

메인 화면 진입에 필요한 프로필, 사이드바, 최신 알림, 캘린더 요약 기본값을 반환한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| yearMonth | N | `YYYY-MM`, 없으면 현재 월 |

Response:

```json
{
  "profile": {
    "id": 1,
    "displayName": "류성열",
    "username": "recordryu",
    "email": "ryu@example.com",
    "phoneNumber": "010-1234-5678",
    "profileImageUrl": null
  },
  "sidebar": {
    "selectedRoomId": 1,
    "rooms": [
      {
        "id": 1,
        "name": "우리 둘의 100일",
        "type": "COUPLE",
        "unreadChatCount": 1,
        "pendingMissionCount": 2,
        "selected": true
      }
    ],
    "pendingInvitationCount": 1
  },
  "latestNotifications": [],
  "calendar": {
    "yearMonth": "2026-07",
    "filterRoomId": null,
    "days": []
  }
}
```

Happy:

- seed member가 참여 중인 방과 최신 알림 3개 이하를 반환한다.

Edge:

- 참여 방이 없으면 `rooms=[]`, `selectedRoomId=null`을 반환한다.

## 4. Member And Settings APIs

### GET /api/members/me

내 프로필을 조회한다.

Response:

```json
{
  "id": 1,
  "displayName": "류성열",
  "username": "recordryu",
  "email": "ryu@example.com",
  "phoneNumber": "010-1234-5678",
  "profileImageUrl": null
}
```

### PATCH /api/members/me/profile

프로필 이미지와 이름을 수정한다. 이메일/전화번호는 수정하지 않는다.

Request:

```json
{
  "displayName": "류성열",
  "profileImageUrl": null
}
```

Response:

```json
{
  "id": 1,
  "displayName": "류성열",
  "username": "recordryu",
  "email": "ryu@example.com",
  "phoneNumber": "010-1234-5678",
  "profileImageUrl": null
}
```

Validation:

- `displayName`: required, 1-50 chars
- `profileImageUrl`: optional, max 500 chars

### POST /api/members/me/password

비밀번호 변경 API 초안이다. Lv1에서는 UI와 API 계약만 두고 실제 보안 완성도는 최소 구현으로 제한할 수 있다.

Request:

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

Response:

```json
{
  "changed": true
}
```

Validation:

- `currentPassword`: required
- `newPassword`: required, 8-100 chars

### GET /api/members/me/notification-settings

알림 설정을 조회한다.

Response:

```json
{
  "allEnabled": true,
  "chatEnabled": true,
  "letterEnabled": true,
  "memoryEnabled": true,
  "missionEnabled": true
}
```

### PUT /api/members/me/notification-settings

알림 설정을 변경한다.

Request:

```json
{
  "allEnabled": false,
  "chatEnabled": true,
  "letterEnabled": false,
  "memoryEnabled": true,
  "missionEnabled": true
}
```

Rules:

- `allEnabled=true`이면 서버는 개별 알림을 모두 true로 저장한다.
- `allEnabled=false`이면 개별 알림 값을 그대로 저장한다.

### POST /api/members/me/logout

로컬 MVP에서는 세션 종료 mock response를 반환한다.

Response:

```json
{
  "loggedOut": true
}
```

### DELETE /api/members/me

회원 탈퇴 API 초안이다. 화면 정의서 기준으로 비밀번호 재확인과 최종 확인 모달 이후 호출된다.

Request:

```json
{
  "password": "current-password",
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

Response:

```json
{
  "deleted": true
}
```

## 5. Room APIs

### GET /api/rooms

참여 중인 방, 초대 대기 수를 조회한다.

Response:

```json
{
  "rooms": [
    {
      "id": 1,
      "name": "우리 둘의 100일",
      "description": "함께 남기는 기록방",
      "type": "COUPLE",
      "role": "OWNER",
      "memberCount": 2,
      "unreadChatCount": 1,
      "pendingMissionCount": 2
    }
  ],
  "pendingInvitationCount": 1
}
```

### POST /api/rooms

새 방을 생성한다.

Request:

```json
{
  "name": "우리 둘의 100일",
  "description": "함께 남기는 기록방",
  "type": "COUPLE"
}
```

Response:

```json
{
  "id": 1,
  "name": "우리 둘의 100일",
  "type": "COUPLE",
  "role": "OWNER"
}
```

Validation:

- `name`: required, 1-80 chars
- `type`: COUPLE, FAMILY, GROUP

### GET /api/rooms/{roomId}

방 상세와 멤버 목록을 조회한다.

Response:

```json
{
  "id": 1,
  "name": "우리 둘의 100일",
  "description": "함께 남기는 기록방",
  "type": "COUPLE",
  "myRole": "OWNER",
  "members": [
    {
      "id": 1,
      "displayName": "류성열",
      "role": "OWNER",
      "profileImageUrl": null
    }
  ]
}
```

### PATCH /api/rooms/{roomId}

방 이름/설명을 수정한다. OWNER만 허용한다.

Request:

```json
{
  "name": "우리 둘의 100일",
  "description": "새 설명"
}
```

### POST /api/rooms/{roomId}/invitations

이메일 또는 전화번호로 방 초대를 생성한다.

Request:

```json
{
  "email": "friend@example.com",
  "phoneNumber": null
}
```

Response:

```json
{
  "id": 1,
  "status": "PENDING",
  "expiresAt": "2026-08-07T23:59:59+09:00"
}
```

### GET /api/room-invitations/pending

내가 받은 초대 목록을 조회한다.

Response:

```json
{
  "items": [
    {
      "id": 1,
      "roomId": 2,
      "roomName": "7월 가족",
      "roomType": "FAMILY",
      "inviterName": "민지",
      "createdAt": "2026-07-31T10:00:00+09:00",
      "expiresAt": "2026-08-07T10:00:00+09:00"
    }
  ]
}
```

### POST /api/room-invitations/{invitationId}/accept

초대를 수락하고 방 멤버가 된다.

### POST /api/room-invitations/{invitationId}/decline

초대를 거절한다.

## 6. Chat APIs

### GET /api/rooms/{roomId}/chat/messages

선택 방 채팅 목록을 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| date | N | `YYYY-MM-DD`, 특정 날짜 조회 |
| keyword | N | 검색어 |
| cursor | N | pagination cursor |
| size | N | default 30 |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "sender": {
        "id": 2,
        "displayName": "민지",
        "profileImageUrl": null
      },
      "body": "오늘 사진 꼭 올리자",
      "sentAt": "2026-07-17T21:10:00+09:00",
      "occurredDate": "2026-07-17"
    }
  ],
  "hasNext": false,
  "nextCursor": null
}
```

### POST /api/rooms/{roomId}/chat/messages

채팅 메시지를 등록한다.

Request:

```json
{
  "body": "오늘 사진 꼭 올리자"
}
```

Response:

```json
{
  "id": 1,
  "body": "오늘 사진 꼭 올리자",
  "sentAt": "2026-07-17T21:10:00+09:00",
  "occurredDate": "2026-07-17"
}
```

Validation:

- `body`: required, 1-1000 chars

## 7. Memory APIs

### GET /api/rooms/{roomId}/memories

추억 게시글 목록을 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| filter | N | ALL, PHOTO, COMMENTED |
| date | N | `YYYY-MM-DD` |
| page | N | default 0 |
| size | N | default 12 |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "title": "한강 산책",
      "authorName": "류성열",
      "representativeImageUrl": "/seed/hangang.jpg",
      "imageCount": 3,
      "commentCount": 2,
      "occurredDate": "2026-07-17",
      "createdAt": "2026-07-17T22:00:00+09:00"
    }
  ],
  "page": 0,
  "size": 12,
  "hasNext": false
}
```

### POST /api/rooms/{roomId}/memories

추억 게시글을 작성한다.

Request:

```json
{
  "title": "한강 산책",
  "body": "오랜만에 같이 걸었다.",
  "representativeImageUrl": "/seed/hangang.jpg",
  "imageCount": 3,
  "occurredDate": "2026-07-17"
}
```

Validation:

- `title`: required, 1-100 chars
- `body`: required, 1-5000 chars
- `occurredDate`: required

### GET /api/rooms/{roomId}/memories/{memoryId}

추억 상세를 조회한다.

### POST /api/rooms/{roomId}/memories/{memoryId}/comments

추억 댓글을 작성한다.

Request:

```json
{
  "body": "이날 정말 좋았어."
}
```

## 8. Mission APIs

### GET /api/rooms/{roomId}/missions

미션 목록을 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| status | N | ACTIVE, WAITING_APPROVAL, COMPLETED |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "title": "같이 찍은 사진 올리기",
      "description": "오늘의 사진과 짧은 기록을 남긴다.",
      "status": "WAITING_APPROVAL",
      "roomType": "COUPLE",
      "approval": {
        "approvedCount": 1,
        "activeMemberCount": 2,
        "approvalRate": 50,
        "completionRule": "상대 동의"
      },
      "latestSubmissionId": 1,
      "dueDate": "2026-07-31"
    }
  ]
}
```

### POST /api/rooms/{roomId}/missions

커스텀 미션을 생성한다.

Request:

```json
{
  "title": "같이 찍은 사진 올리기",
  "description": "오늘의 사진과 짧은 기록을 남긴다.",
  "dueDate": "2026-07-31"
}
```

### POST /api/rooms/{roomId}/missions/{missionId}/submissions

미션 인증을 등록한다.

Request:

```json
{
  "body": "오늘 같이 찍은 사진을 남긴다.",
  "imageUrl": "/seed/mission-photo.jpg",
  "occurredDate": "2026-07-17"
}
```

Response:

```json
{
  "id": 1,
  "missionId": 1,
  "status": "WAITING_APPROVAL",
  "approvalRate": 50
}
```

### POST /api/rooms/{roomId}/missions/{missionId}/submissions/{submissionId}/approvals

미션 인증에 동의 또는 반려한다.

Request:

```json
{
  "decision": "APPROVED"
}
```

Response:

```json
{
  "missionId": 1,
  "submissionId": 1,
  "status": "COMPLETED",
  "approvedCount": 2,
  "activeMemberCount": 2,
  "approvalRate": 100
}
```

Edge:

- submitter 본인이 자기 인증에 동의하면 400
- 방 멤버가 아니면 403
- 이미 같은 submission에 결정했으면 409 또는 idempotent update 중 하나로 통일

## 9. Letter APIs

### GET /api/rooms/{roomId}/letters

편지 목록을 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| box | N | RECEIVED, SENT |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "box": "RECEIVED",
      "title": "고마운 마음",
      "counterpartName": "민지",
      "sentAt": "2026-07-17T23:00:00+09:00",
      "occurredDate": "2026-07-17",
      "read": false
    }
  ]
}
```

### POST /api/rooms/{roomId}/letters

편지를 보낸다.

Request:

```json
{
  "receiverMemberId": 2,
  "title": "고마운 마음",
  "body": "오늘 함께해줘서 고마워.",
  "occurredDate": "2026-07-17"
}
```

Validation:

- receiver는 같은 방의 active member여야 한다.
- `title`: required, 1-100 chars
- `body`: required, 1-5000 chars

### GET /api/rooms/{roomId}/letters/{letterId}

편지 상세를 조회한다. 받은 편지이면 read 처리한다.

## 10. Notification APIs

### GET /api/notifications/latest

메인 화면 최신 알림을 3개 조회한다.

Response:

```json
{
  "items": [
    {
      "id": 1,
      "type": "MISSION_APPROVAL_REQUEST",
      "roomId": 1,
      "roomName": "우리 둘의 100일",
      "actorName": "민지",
      "summary": "미션 인증 동의를 기다립니다.",
      "occurredAt": "2026-07-17T22:10:00+09:00",
      "read": false,
      "target": {
        "type": "MISSION",
        "id": 1,
        "url": "/rooms/1/missions?focusSubmissionId=1"
      }
    }
  ]
}
```

### GET /api/notifications

전체 알림 모달 목록을 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| page | N | default 0 |
| size | N | default 20 |

### POST /api/notifications/{notificationId}/read

알림을 읽음 처리한다.

Response:

```json
{
  "read": true
}
```

## 11. Calendar APIs

### GET /api/calendar/month

월간 캘린더 마커를 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| yearMonth | Y | `YYYY-MM` |
| roomId | N | 없으면 전체 방 합산 |

Response:

```json
{
  "yearMonth": "2026-07",
  "filterRoomId": null,
  "days": [
    {
      "date": "2026-07-17",
      "records": {
        "chatCount": 8,
        "memoryCount": 1,
        "missionCount": 1,
        "letterCount": 1
      },
      "roomSummaries": [
        {
          "roomId": 1,
          "roomName": "우리 둘의 100일",
          "chatCount": 8,
          "memoryCount": 1,
          "missionCount": 1,
          "letterCount": 0
        }
      ]
    }
  ]
}
```

### GET /api/calendar/days/{date}/summary

선택 날짜 요약을 조회한다.

Query:

| Name | Required | Description |
| --- | --- | --- |
| roomId | N | 없으면 전체 방 |

Response:

```json
{
  "date": "2026-07-17",
  "rooms": [
    {
      "roomId": 1,
      "roomName": "우리 둘의 100일",
      "chatCount": 8,
      "memoryCount": 1,
      "missionCount": 1,
      "letterCount": 0
    }
  ]
}
```

### GET /api/calendar/days/{date}/records

선택 날짜 기록 상세 화면 데이터를 조회한다.

Response:

```json
{
  "date": "2026-07-17",
  "rooms": [
    {
      "roomId": 1,
      "roomName": "우리 둘의 100일",
      "records": [
        {
          "type": "CHAT",
          "count": 8,
          "url": "/rooms/1/chat?date=2026-07-17"
        },
        {
          "type": "MEMORY",
          "title": "한강 산책",
          "url": "/rooms/1/memories/1"
        }
      ]
    }
  ]
}
```

## 12. API Authorization Matrix

| API group | Required condition |
| --- | --- |
| members/me | `X-Member-Id` member exists |
| rooms list/create | member exists |
| room detail/update | active room member, update requires OWNER |
| invitations create | active room member, preferably OWNER |
| chat/memory/mission/letter | active room member |
| notification | receiver member only |
| calendar | records only from active member rooms |

## 13. Implementation Notes

- Controller는 request validation과 service 호출만 담당한다.
- Service는 Reader, Checker, Recorder, Updater를 조립한다.
- 모든 room-scoped API는 `RoomAccessChecker.validateActiveRoomMember(memberId, roomId)`를 먼저 호출한다.
- 생성 API는 필요한 경우 NotificationRecorder를 호출한다.
- 실패 응답 메시지는 한국어로 작성한다.
- 로그에는 긴 본문, 이메일/전화번호 원문, password를 남기지 않는다.
