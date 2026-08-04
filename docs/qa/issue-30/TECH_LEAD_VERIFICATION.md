# Issue 30 Tech Lead Verification

## Issue

- #30 `[Lv2 고도화] 기록 선택 상세 보기 및 책 구성 순서 UX 개선`

## 확인 대상

- `service/client/src/main.tsx`
- `service/client/src/styles.css`

## 구현 확인

- `BookContentFilter`, `BookContentOrderMode`, `BookContentDetailModalState`를 추가해 기록 선택 화면의 필터, 정렬, 상세 modal 상태를 관리한다.
- 선택 콘텐츠는 `orderedBookContentCandidates` 기준으로 계산하므로 미리보기 요청의 콘텐츠 배열 순서도 사용자가 선택한 책 구성 순서를 따른다.
- `BookContentLibrary`는 필터 탭, 날짜 순/콘텐츠 순 segmented control, 타입 순서 이동 버튼, 기록 카드 목록을 담당한다.
- `BookCompositionOrderPanel`은 현재 선택된 콘텐츠의 최종 책 배치 순서를 표시한다.
- `BookContentDetailModal`은 추억 게시글, 미션 인증, 편지, 채팅 타입별 상세 내용을 분기해 표시한다.
- `2p` 단순 표기는 `2p 할당`으로 변경했고, tooltip에는 콘텐츠 타입별 페이지 산정 기준을 넣었다.
- Human QA 피드백에 따라 상세 보기 눈 아이콘 버튼을 제거하고 카드 본문 hover/focus affordance로 대체했다.
- Human QA 피드백에 따라 콘텐츠 순 타입 조정 UI를 `순서 설정` 팝오버로 이동했다.
- Human QA 피드백에 따라 수량 입력을 커스텀 stepper로 변경했다.

## 검증 명령

```bash
cd service/client
npm run build
```

```bash
git diff --check
```

## 검증 결과

- `npm run build` 통과.
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

## 상태

- 구현 및 1차 검증 완료.
- 사용자 Human QA 대기 상태다.
