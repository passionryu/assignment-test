# Issue #4 QA Report

- 대상 Issue: #4 `[구현] 프로필 및 설정 기능 구현`
- 대상 브랜치: `feature-4`
- 구현 커밋: `9024290 feat(profile): 프로필 및 설정 기능 구현`
- 리뷰 커밋: `3343df5 docs(review): 이슈 4 리뷰 통과 기록`
- 검증 시각: 2026-07-31 14:15:58 KST
- 판정: PASS

## 검증 환경

- Docker 실행: `docker compose -f service/infra/docker-compose.yml up --build -d app-db app-server app-client`
- 서버 Health: `GET http://localhost:8080/api/health`
- 클라이언트: `http://localhost:5173`
- E2E 도구: Playwright

## Happy Case

| 항목 | 결과 | 확인 내용 |
|---|---:|---|
| 프로필 카드 표시 | PASS | 아바타, 이름, 아이디, 이메일, 전화번호가 표시된다. |
| 이메일/전화번호 수정 제한 | PASS | 이메일과 전화번호는 수정 가능한 입력으로 노출되지 않는다. |
| 회원 정보 수정 | PASS | 이름과 프로필 이미지 URL 저장 후 프로필 카드에 변경값이 반영된다. |
| 비밀번호 변경 UI | PASS | 현재 비밀번호와 새 비밀번호 입력 UI가 표시된다. |
| 비밀번호 변경 정상 피드백 | PASS | 유효한 새 비밀번호 입력 시 성공 피드백이 표시된다. |
| 전체 알림 ON | PASS | 전체 알림을 ON으로 두면 채팅, 편지, 추억, 미션 토글이 모두 ON으로 맞춰진다. |
| 개별 알림 조정 | PASS | 전체 알림 OFF 상태에서 개별 알림 토글을 조정할 수 있다. |
| 알림 설정 유지 | PASS | 새로고침 후에도 저장된 전체/개별 알림 상태가 유지된다. |
| 로그아웃 취소 | PASS | 로그아웃 모달에서 취소 시 모달이 닫히고 화면이 유지된다. |
| 로그아웃 확인 | PASS | Lv1 범위에서 확인 버튼 클릭 시 모달이 닫히는 확인 흐름이 동작한다. |
| 회원 탈퇴 안내 | PASS | 실제 탈퇴 API 없이 위험 액션 안내와 비활성 버튼만 표시된다. |

## Failure / Edge Case

| 항목 | 결과 | 재현 절차 | 기대 결과 | 실제 결과 |
|---|---:|---|---|---|
| 빈 이름 저장 | PASS | 회원 정보 수정에서 이름을 빈 값으로 저장한다. | 저장 거부와 오류 메시지 표시 | `이름을 입력해 주세요.` 메시지가 표시된다. |
| 짧은 새 비밀번호 | PASS | 새 비밀번호에 8자 미만 값을 입력하고 변경한다. | 변경 거부와 오류 메시지 표시 | `새 비밀번호는 8자 이상이어야 합니다.` 메시지가 표시된다. |

## Evidence

| 파일 | 내용 |
|---|---|
| `docs/qa/issue-4/evidence/01-initial-profile-settings.png` | 초기 프로필/설정 화면 |
| `docs/qa/issue-4/evidence/02-profile-update-success.png` | 회원 정보 수정 성공 |
| `docs/qa/issue-4/evidence/03-profile-empty-name-error.png` | 빈 이름 실패 케이스 |
| `docs/qa/issue-4/evidence/04-password-short-error.png` | 짧은 비밀번호 실패 케이스 |
| `docs/qa/issue-4/evidence/05-password-change-success.png` | 비밀번호 변경 정상 피드백 |
| `docs/qa/issue-4/evidence/06-notification-all-on.png` | 전체 알림 ON 상태 |
| `docs/qa/issue-4/evidence/07-notification-individual-adjusted.png` | 개별 알림 조정 상태 |
| `docs/qa/issue-4/evidence/08-notification-persisted-after-reload.png` | 새로고침 후 알림 설정 유지 |
| `docs/qa/issue-4/evidence/09-logout-modal-open.png` | 로그아웃 확인 모달 |
| `docs/qa/issue-4/evidence/10-logout-confirmed-flow.png` | 로그아웃 확인 후 흐름 |
| `docs/qa/issue-4/evidence/11-withdraw-placeholder.png` | 회원 탈퇴 placeholder |
| `docs/qa/issue-4/evidence/issue-4-e2e.webm` | E2E 녹화 |
| `docs/qa/issue-4/evidence/issue-4-trace.zip` | Playwright trace |
| `docs/qa/issue-4/evidence/issue-4-e2e-result.json` | 자동 검증 결과 JSON |

## Notes

- 알림 설정은 별도 저장 버튼 없이 토글 변경 시 즉시 저장되는 구조로 검증했다.
- 사용자 흐름을 막는 BLOCKER/CRITICAL 결함은 발견되지 않았다.
- Issue는 닫지 않고 PM Final Check 단계로 넘긴다.
