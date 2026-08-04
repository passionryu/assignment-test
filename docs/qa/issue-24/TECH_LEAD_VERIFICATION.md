# Issue 24 Tech Lead Verification

## Issue

- #24 `[Lv2 구현] 책 주문 생성 및 주문 상태/내역 조회 구현`

## 확인 대상

- `POST /api/book-archive/orders`
- `GET /api/book-archive/orders/status`
- `GET /api/book-archive/orders/history`
- `GET /api/book-archive/orders/{orderId}`
- `BookOrderService.createOrder`

## Happy Path Curl

```bash
curl -s -X POST 'http://localhost:8080/api/book-archive/orders' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 1' \
  -d '{"previewId": 1}'

curl -s 'http://localhost:8080/api/book-archive/orders/status' \
  -H 'X-Member-Id: 1'

curl -s 'http://localhost:8080/api/book-archive/orders/history' \
  -H 'X-Member-Id: 1'
```

## 기대 결과

- 주문 생성 응답의 최초 상태는 `PAID`이다.
- 진행 주문 목록에는 `PAID`, `PDF_READY`, `CONFIRMED`, `IN_PRODUCTION`, `PRODUCTION_COMPLETE`, `SHIPPED`가 포함된다.
- 주문 내역에는 `DELIVERED`, `CANCELLED_REFUND`, `ERROR`가 포함된다.
- 상세 응답에는 주문 콘텐츠 snapshot과 상태 이력이 포함된다.

## Edge Case Curl

```bash
curl -s 'http://localhost:8080/api/book-archive/orders/9007' \
  -H 'X-Member-Id: 1'
```

- 기대값: `404 PRINT_ORDER_NOT_FOUND`

## 상태

- 기존 구현 및 Lv2 AI QA 산출물 기준으로 정리했다.
- 이 문서 작성 커밋에서는 curl을 새로 실행하지 않았다.
