# Issue 22 Tech Lead Verification

## Issue

- #22 `[Lv2 구현] 상품 안내 placeholder 및 상품 선택 UI 구현`

## 확인 대상

- `GET /api/book-archive/products`
- `BookProductCatalog`
- `V8__create_book_order_tables.sql`
- `service/client/src/main.tsx`
- `service/client/src/styles.css`

## Product Curl

```bash
curl -s 'http://localhost:8080/api/book-archive/products' \
  -H 'X-Member-Id: 1'
```

## 기대 결과

- `PHOTOBOOK_A4_SC`가 `A4 소프트커버 포토북`으로 반환된다.
- `PHOTOBOOK_A5_SC`가 `A5 소프트커버 포토북`으로 반환된다.
- `SQUAREBOOK_HC`가 `고화질 스퀘어북 (하드커버)`로 반환된다.
- `creationType`은 모두 `TEMPLATE`이다.
- 상품 순서는 A4, A5, 스퀘어북 순서다.

## Edge Case

```bash
curl -s 'http://localhost:8080/api/book-archive/content-candidates?roomId=1&productUid=UNKNOWN&startDate=2026-08-01&endDate=2026-08-31' \
  -H 'X-Member-Id: 1'
```

- 기대값: `400 BOOK_PRODUCT_NOT_FOUND`

## 상태

- 기존 구현 및 Lv2 AI QA 산출물 기준으로 정리했다.
- 이 문서 작성 커밋에서는 curl을 새로 실행하지 않았다.
