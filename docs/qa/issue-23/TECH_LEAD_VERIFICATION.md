# Issue 23 Tech Lead Verification

## Issue

- #23 `[Lv2 구현] 템플릿 기반 책 미리보기와 예상 페이지/견적 계산 구현`

## 확인 대상

- `POST /api/book-archive/previews`
- `BookArchiveService.createPreview`
- `BookPreviewComposer`
- `BookEstimateCalculator`
- `BookPageEstimator`
- `BookPageLimitChecker`

## Happy Path Curl

```bash
curl -s -X POST 'http://localhost:8080/api/book-archive/previews' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 1' \
  -d '{
    "roomId": 1,
    "bookSpecUid": "PHOTOBOOK_A4_SC",
    "title": "우리 둘의 8월 기록집",
    "quantity": 2,
    "periodStartDate": "2026-08-01",
    "periodEndDate": "2026-08-31",
    "contents": [
      {"type": "MEMORY", "sourceId": 347},
      {"type": "MISSION", "sourceId": 102}
    ]
  }'
```

## 기대 결과

- `previewId`가 생성된다.
- `creationType`은 `TEMPLATE`이다.
- `summary.estimatedPageCount`, `pageRange`, `estimate`, `pages`가 함께 반환된다.
- `estimate.totalPrice`는 상품 기본가, 추가 페이지 금액, 배송비, 수량을 반영한다.

## Edge Case

- 수량이 0 또는 11 이상이면 `BOOK_QUANTITY_INVALID`가 반환된다.
- 제목이 120자를 초과하면 `BOOK_TITLE_TOO_LONG`이 반환된다.
- 상품 최대 페이지를 넘으면 `BOOK_PAGE_LIMIT_EXCEEDED`가 반환된다.

## 상태

- 기존 구현 및 Lv2 AI QA 산출물 기준으로 정리했다.
- 이 문서 작성 커밋에서는 curl을 새로 실행하지 않았다.
