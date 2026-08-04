# Issue 25 Human QA

## Issue

- #25 `[Lv2 구현] 주문 상태 전이 및 취소 기능 구현`

## 구현 결과

- 주문 상태 전이 정책을 서버에서 관리한다.
- 상태 전이 순서:
  - `PAID -> PDF_READY -> CONFIRMED -> IN_PRODUCTION -> PRODUCTION_COMPLETE -> SHIPPED -> DELIVERED`
- 일반 사용자와 운영자는 `PAID`, `PDF_READY` 상태 주문만 취소할 수 있다.
- 취소 결과는 `CANCELLED_REFUND`로 저장한다.
- `ERROR` 상태는 실패/예외 시나리오 표시용 종료 상태로 분류한다.
- 모든 상태 변경은 `print_order_status_histories`에 기록한다.

## Human QA List

- `주문 상태`에서 `BO-SEED-9001` 또는 `BO-SEED-9002`를 연다.
- 취소 버튼이 활성화되어 있는지 확인한다.
- 취소 사유를 입력하고 취소하면 상태가 `취소/환불`로 바뀌는지 확인한다.
- 취소된 주문이 `주문 내역`으로 이동하는지 확인한다.
- `BO-SEED-9003`처럼 `CONFIRMED` 상태 주문에서는 취소 버튼이 비활성화되는지 확인한다.
- 운영자 화면에서 `PAID` 주문의 다음 상태 변경이 `PDF_READY`로 저장되는지 확인한다.
- 종료 상태 주문에서는 다음 상태 변경이 막히는지 확인한다.

## 상태/내역 QA

- 취소 시 `cancelledAt`과 `cancelReason`이 상세 화면에 표시되는지 확인한다.
- 상태 변경 이력이 시간순으로 누적되는지 확인한다.
