# Issue 25 Tech Lead Verification

## Issue

- #25 `[Lv2 구현] 주문 상태 전이 및 취소 기능 구현`

## 확인 대상

- `POST /api/book-archive/orders/{orderId}/cancel`
- `POST /api/operator/book-orders/{orderId}/next-status`
- `POST /api/operator/book-orders/{orderId}/cancel`
- `BookOrderService.cancelMyOrder`
- `BookOrderService.advanceOrderStatusAsOperator`

## Happy Path Curl

```bash
curl -s -X POST 'http://localhost:8080/api/book-archive/orders/9001/cancel' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 1' \
  -d '{"reason":"QA 취소 확인"}'

curl -s -X POST 'http://localhost:8080/api/operator/book-orders/9001/next-status' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 100' \
  -d '{"memo":"QA 다음 상태 변경"}'
```

## Edge Case Curl

```bash
curl -s -X POST 'http://localhost:8080/api/book-archive/orders/9003/cancel' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 1' \
  -d '{"reason":"확정 주문 취소 시도"}'

curl -s -X POST 'http://localhost:8080/api/operator/book-orders/9005/next-status' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 100' \
  -d '{"memo":"취소 주문 전이 시도"}'
```

## 기대 결과

- `PAID`, `PDF_READY` 주문 취소는 `CANCELLED_REFUND`로 변경된다.
- `CONFIRMED` 이후 주문 취소는 `400 ORDER_CANCEL_NOT_ALLOWED`로 거부된다.
- 다음 상태가 없는 종료 상태 전이는 `400 ORDER_STATUS_TRANSITION_NOT_ALLOWED`로 거부된다.
- 상태 변경 시 `print_order_status_histories`가 추가된다.

## 상태

- 기존 구현 및 Lv2 AI QA 산출물 기준으로 정리했다.
- 이 문서 작성 커밋에서는 curl을 새로 실행하지 않았다.
