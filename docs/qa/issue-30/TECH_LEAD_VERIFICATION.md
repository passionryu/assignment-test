# Issue 30 Tech Lead Verification

## Issue

- #30 `[Lv2 고도화] 기록 선택 상세 보기 및 책 구성 순서 UX 개선`

## 확인 대상

- `service/client/src/main.tsx`
- `service/client/src/styles.css`
- `service/server/src/main/kotlin/com/recordroom/book/controller/BookArchiveController.kt`
- `service/server/src/main/kotlin/com/recordroom/book/service/BookArchiveService.kt`

## 구현 확인

- `BookContentFilter`, `BookContentOrderMode`, `BookContentDetailModalState`를 추가해 기록 선택 화면의 필터, 정렬, 상세 modal 상태를 관리한다.
- 선택 콘텐츠는 `orderedBookContentCandidates` 기준으로 계산하므로 미리보기 요청의 콘텐츠 배열 순서도 사용자가 선택한 책 구성 순서를 따른다.
- `BookContentLibrary`는 필터 탭, 날짜 순/콘텐츠 순 segmented control, 타입 순서 이동 버튼, 기록 카드 목록을 담당한다.
- `BookCompositionOrderPanel`은 현재 선택된 콘텐츠의 최종 책 배치 순서를 표시한다.
- `BookContentDetailModal`은 추억 게시글, 미션 인증, 편지, 채팅 타입별 상세 내용을 분기해 표시한다.
- `2p` 단순 표기는 `2p 할당`으로 변경했고, tooltip에는 콘텐츠 타입별 페이지 산정 기준을 넣었다.
- Human QA 피드백에 따라 상세 보기 눈 아이콘 버튼을 제거하고 카드 본문 hover/focus affordance로 대체했다.
- Human QA 피드백에 따라 콘텐츠 순 타입 조정 UI를 `순서 설정` 팝오버에서 즉시 노출형 타입 순서 컨트롤로 변경했다.
- Human QA 피드백에 따라 수량 입력을 커스텀 stepper로 변경했다.
- Human QA 피드백에 따라 필터를 `전체/선택됨/미선택` 상태 row와 `추억/미션/편지/채팅` 타입 row로 분리했다.
- Human QA 피드백에 따라 콘텐츠 커스텀 카드와 선택 요약 카드 높이를 동일하게 맞추고, 기록 목록은 카드 내부 스크롤로 제한했다.
- Human QA 피드백에 따라 책 구성 순서 전체 목록을 우측 카드에서 제거하고, 스크롤 가능한 modal로 전환했다.
- Human QA 피드백에 따라 책 만들기 페이지 내부 `이전` 버튼을 제거했다.
- Human QA 피드백에 따라 `전체 순서 보기` 버튼을 분홍색 CTA로 변경했다.
- Human QA 피드백에 따라 기록 후보 불러오기에는 콘텐츠 타입 선택 필수 조건과 `contentTypes` API 파라미터를 추가했다.
- Human QA 피드백에 따라 기록 후보 불러오기에는 최소 3초 보장 로딩 modal과 방/날짜/콘텐츠 안내 문구를 추가했다.
- Human QA 피드백에 따라 미리보기 계산 완료 안내를 상단 notice가 아닌 modal로 전환했다.
- Human QA 피드백에 따라 콘텐츠 순 타입 조정 컨트롤을 absolute overlay로 표시해 기록 목록이 아래로 밀리지 않게 했다.
- Human QA 피드백에 따라 방 선택 단계의 `.book-room-grid`를 1열 목록으로 고정하고 방 정보를 가로형 요약 카드로 정리했다.
- Human QA 피드백에 따라 `BookPeriodRangeCalendar`를 추가해 캘린더의 두 날짜 클릭으로 책 생성 기간을 설정할 수 있게 했다.
- Human QA 피드백에 따라 책 기간 캘린더는 선택 방 기준 활동만 표시하도록 `buildBookPeriodCalendar`에서 캘린더 데이터를 방 기준으로 필터링한다.
- Human QA 피드백에 따라 콘텐츠 타입 선택 UI를 4열 카드형으로 확대하고, `기록 불러오기` CTA를 기간 선택 카드 하단으로 이동했다.

## 검증 명령

```bash
cd service/client
npm run build
```

```bash
git diff --check
```

```bash
cd service/server
./gradlew test
```

```bash
curl -I http://127.0.0.1:5173
```

## 검증 결과

- `npm run build` 통과.
- `./gradlew test` 통과.
- `git diff --check` 통과.
- Vite dev server를 `http://127.0.0.1:5173`로 기동했고 `curl -I` 기준 `200 OK` 응답을 확인했다.
- 브라우저에서 `방 선택 -> 상품 선택 -> 기간 선택 -> 기록 선택` 진입을 확인했다.
- 기록 선택 화면에서 필터 탭 `전체65/추억14/미션7/편지40/채팅4/선택됨41` 노출을 확인했다.
- 첫 번째 기록의 `2p 할당` 표기와 페이지 산정 tooltip 문구를 확인했다.
- 카드 본문 클릭 시 편지 상세 modal이 열리고 보낸 사람, 받는 사람, 본문, 날짜가 표시되는 것을 확인했다.
- 체크박스 클릭 시 선택 수가 `41개 · 87p`에서 `40개 · 85p`로 갱신되고 modal은 열리지 않는 것을 확인했다.
- `콘텐츠 순` 선택 시 우측 책 구성 순서가 `추억 게시글 -> 미션 인증 -> 편지 -> 채팅` 기준으로 바뀌는 것을 확인했다.
- `편지 순서를 위로 이동` 버튼 클릭 시 책 구성 순서가 `추억 게시글 -> 편지 -> 미션 인증 -> 채팅`으로 변경되는 것을 확인했다.
- `선택됨` 필터 선택 시 41개 기록만 표시되고, 보이는 기록이 모두 체크 상태인 것을 확인했다.
- Human QA 피드백 반영 후 브라우저에서 기록 카드 오른쪽 눈 아이콘 버튼이 0개인 것을 확인했다.
- 기록 카드 본문 클릭으로 추억 게시글 상세 modal이 열리는 것을 확인했다.
- `콘텐츠 순` 클릭 시 `순서 설정` 팝오버가 열리고 타입 순서 목록이 팝오버 안에 표시되는 것을 확인했다.
- 수량 stepper에서 `+` 클릭 시 `1 -> 2`, `-` 클릭 시 `2 -> 1`로 변경되고 최소값에서 `-` 버튼이 비활성화되는 것을 확인했다.
- 최신 반영 후 필터 윗줄 `전체65/선택됨41/미선택24`, 아랫줄 `추억14/미션7/편지40/채팅4` 노출을 확인했다.
- 콘텐츠 커스텀 카드와 선택 요약 카드 높이가 모두 `620px`이고, 좌측 기록 목록은 내부 스크롤 상태인 것을 확인했다.
- 우측 `책 구성 순서` 카드 직계 목록은 0개이고 `전체 순서 보기41개` 버튼만 표시되는 것을 확인했다.
- `전체 순서 보기` 클릭 시 `책 구성 순서` modal이 열리고, 41개 전체 순서 목록이 modal 내부 스크롤로 표시되는 것을 확인했다.
- 책 만들기 기록 선택 단계에서 `이전` 버튼이 0개인 것을 확인했다.
- 최신 추가 피드백 반영 후 `npm run build`, `git diff --check`, `curl -I http://127.0.0.1:5173`를 재수행했다.
- 콘텐츠 타입 선택 및 3초 로딩 modal 추가 후 `npm run build`, `./gradlew test`, `git diff --check`, `curl -I http://127.0.0.1:5173`를 재수행했다.
- 캘린더 기간 선택, 콘텐츠 타입 카드 확대, 하단 CTA 이동, 방 선택 1열 목록화 반영 후 `npm run build`, `./gradlew test`, `git diff --check`를 재수행했다.
- 최신 추가 피드백에 대한 in-app browser 직접 클릭 검증은 browser URL 정책이 `localhost:5173` 이동을 차단해 수행하지 못했다. 앱 서버는 정상 응답 상태이며, 사용자가 화면에서 Human QA로 확인해야 한다.

## 상태

- 구현 및 빌드/서버 응답 검증 완료.
- 사용자 Human QA 대기 상태다.
