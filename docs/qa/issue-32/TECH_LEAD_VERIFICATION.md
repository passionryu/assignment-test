# Issue 32 Tech Lead Verification

## Issue

- #32 `[Lv2 고도화] 주문 상태·내역·운영자 주문 관리 테이블 UI 구현`

## 확인 대상

- `service/client/src/main.tsx`
- `service/client/src/styles.css`

## 구현 확인

- `OrderTableToolbar`, `PrintOrderDataTable`, `useOrderTableState`를 추가해 주문 상태/주문 내역/운영자 화면에서 공통 테이블 UI를 사용한다.
- 테이블 필터는 주문일 범위, 상태, 검색어, 정렬, 표시 개수, 액션 가능 여부를 지원한다.
- CSV 다운로드는 현재 화면, 필터 전체, 선택 항목 기준으로 분리했다.
- 고객 화면의 액션 필터는 `취소 가능만`, 운영자 화면의 액션 필터는 `처리 가능만`으로 분리해 같은 체크박스 UI가 화면별 의미에 맞게 동작한다.
- 주문 행 클릭과 `보기` 버튼은 기존 상세 조회 패널 흐름을 유지한다.
- 운영자 화면은 선택 주문 일괄 다음 상태 변경을 지원하며, 상태 변경 API는 기존 `/operator/book-orders/{id}/next-status`를 순차 호출한다.
- 좁은 화면에서도 테이블은 카드형으로 전환하지 않고 `overflow-x: auto`와 고정 최소 너비로 가로 스크롤된다.

## 검증 명령

```bash
cd service/client
npm run build
```

```bash
cd service/server
./gradlew test
```

```bash
git diff --check
```

## 검증 결과

- `npm run build` 통과.
- `./gradlew test` 통과.
- `git diff --check` 통과.
- 서버 API 계약은 변경하지 않았고, 기존 주문 상세/취소/운영자 상태 변경 API를 클라이언트 UI에서 재사용했다.

## 상태

- 구현 및 기본 검증 완료.
- 사용자 Human QA 대기 상태다.
