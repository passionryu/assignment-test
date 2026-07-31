# Issue #5 QA 레포트

- 최종 판정: PASS
- QA Level: Focused QA
- Full QA: 실행하지 않음
- 대상 브랜치: `feature-5`
- 구현 커밋: `dfbf855 feat(rooms): 방 리스트 및 사이드바 구현`
- 리뷰 커밋: `db0d2ef docs(review): 이슈 5 코드 리뷰 통과 기록`
- 검증 시각: 2026. 7. 31. 오후 4:36:54

## HTML 보고서

- [QA_레포트.html](QA_레포트.html)

## Evidence

- 홈/기본 선택 방: [focused-01-home-default-room.png](evidence/focused-01-home-default-room.png)
- 선택 방 변경과 placeholder: [focused-02-selected-room-chat-placeholder.png](evidence/focused-02-selected-room-chat-placeholder.png)
- 방 리스트 골격: [focused-03-room-list.png](evidence/focused-03-room-list.png)
- 설정 진입: [focused-04-settings-entry.png](evidence/focused-04-settings-entry.png)
- 자동 검증 결과: [issue-5-focused-qa-result.json](evidence/issue-5-focused-qa-result.json)

## Note

- favicon.ico 404는 브라우저 기본 부수 요청으로 분리했다. 앱 JS console error/pageerror는 없었다.
- PASS이므로 영상/trace는 저장하지 않았다.
