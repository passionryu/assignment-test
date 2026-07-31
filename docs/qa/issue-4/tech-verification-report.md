# Tech Verification Report

- 대상 Issue: #4
- 상태: PASS
- 검증 일시: 2026-07-31
- 브랜치: feature-4

## 구현 요약

- 사용자 프로필 조회, 프로필 수정, 비밀번호 변경 API를 추가했다.
- 알림 설정 조회/저장 API를 추가했다.
- `X-Member-Id` 기반 local MVP 인증 실패 시 한국어 오류 응답을 반환한다.
- 클라이언트는 프로필 카드, 프로필 수정, 비밀번호 변경, 알림 설정, 로그아웃 확인, 위험 액션 자리 표시를 제공한다.

## Build Verification

| 항목 | 결과 |
|---|---|
| `./gradlew bootJar --no-daemon` | PASS |
| `npm run build` | PASS |
| `docker compose -f service/infra/docker-compose.yml config --quiet` | PASS |
| `docker compose -f service/infra/docker-compose.yml up --build -d app-db app-server app-client` | PASS |
| `GET /api/health` | PASS: `{"status":"UP","database":"UP"}` |

## curl Happy Cases

| 케이스 | 기대 결과 | 결과 |
|---|---|---|
| `GET /api/members/me` | 현재 회원 프로필 조회 | PASS, HTTP 200 |
| `PATCH /api/members/me/profile` | `displayName`, `profileImageUrl` 수정 | PASS, HTTP 200 |
| `POST /api/members/me/password` | 비밀번호 변경 요청 처리 | PASS, HTTP 200 |
| `GET /api/members/me/notification-settings` | 알림 설정 조회 | PASS, HTTP 200 |
| `PUT /api/members/me/notification-settings`, `allEnabled=true` | 개별 알림 전체 true 저장 | PASS, HTTP 200 |
| `PUT /api/members/me/notification-settings`, `allEnabled=false` | 개별 알림 값을 각각 저장 | PASS, HTTP 200 |

## curl Edge Cases

| 케이스 | 기대 결과 | 결과 |
|---|---|---|
| `X-Member-Id` 없음 | 한국어 인증 오류 | PASS, HTTP 401 |
| `X-Member-Id` 숫자 아님 | 한국어 인증 오류 | PASS, HTTP 401 |
| 빈 `displayName` | 한국어 validation 오류 | PASS, HTTP 400 |
| `email`, `phoneNumber` 수정 시도 | DB 값 변경 없음 | PASS, HTTP 200 후 기존 값 유지 |
| 8자 미만 `newPassword` | 한국어 validation 오류 | PASS, HTTP 400 |

## Public Repository Check

| 항목 | 결과 |
|---|---|
| 공개 저장소 금지 식별 문자열 | PASS, 발견 없음 |
| 실제 secret/API key/webhook URL 노출 | PASS, 발견 없음 |

## Notes

- 회원 탈퇴는 화면상 위험 액션 자리만 두고, 실제 삭제/soft delete 구현은 별도 이슈로 분리한다.
- Lv1 범위에서는 실제 세션/토큰 인증 대신 기존 local MVP 방식인 `X-Member-Id`를 유지한다.
