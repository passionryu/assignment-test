# Issue #5 QA 레포트

- 최종 판정: PASS
- QA Level: Focused QA
- Full QA: 실행하지 않음
- 대상 브랜치: `feature-5`
- 수정 커밋: `5e9ca3c fix(rooms): 선택 방 하위 메뉴 위치 유지`
- 리뷰 커밋: `70db409 docs(review): 이슈 5 Human QA 수정 재검토`
- 검증 시각: 2026. 7. 31. PM 5:32:50

## HTML 보고서

- [QA_레포트.html](QA_레포트.html)

## Evidence

- 최초 진입 - 최상단 방 기존 위치 inline 펼침: [focused-01-home-default-room.png](evidence/focused-01-home-default-room.png)
- 7월 가족 선택 - 기존 위치 inline 펼침: [focused-02-family-inline-expand.png](evidence/focused-02-family-inline-expand.png)
- 여름 프로젝트반 선택 - 편지 placeholder 컨텍스트 유지: [focused-03-project-placeholder.png](evidence/focused-03-project-placeholder.png)
- 방 리스트 페이지 골격 유지: [focused-04-room-list.png](evidence/focused-04-room-list.png)
- 자동 검증 결과: [issue-5-focused-qa-result.json](evidence/issue-5-focused-qa-result.json)

## 재검증 요약

- 최초 진입 시 최상단 방이 기존 첫 위치에서 선택되고, 바로 아래에 하위 메뉴가 펼쳐지는 것을 확인했다.
- `7월 가족`, `여름 프로젝트반` 선택 시 방 항목이 최상단으로 이동하지 않고 기존 위치에서 inline 펼쳐지는 것을 확인했다.
- 채팅/추억 게시판/미션 인증/편지 placeholder 이동 후에도 선택 방 컨텍스트가 유지되는 것을 확인했다.
- 방 리스트와 설정 진입을 확인했다.

## Note

- 브라우저 기본 favicon.ico 요청 404는 앱 JS/API 오류가 아니므로 non-blocking으로 분리했다.
- PASS이므로 영상/trace는 저장하지 않았다.
