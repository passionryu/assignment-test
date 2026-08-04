# Lv2 Book Order Human QA

## Preconditions

- Run the app with `docker compose -f service/infra/docker-compose.yml up --build`.
- Open `http://localhost:5173`.
- Seed data is restored on local server startup.
- AI QA report and screen evidence are stored in `docs/qa/issue-27/AI_QA_REPORT.html`.

## Seed Users

- `류성열` (`X-Member-Id: 1`): main user for book creation, order status, history, cancellation.
- `여자친구` (`X-Member-Id: 2`): other-user order permission checks.
- `운영자` (`X-Member-Id: 100`): operator order confirmation MVP.

## Seed Orders

- `9001 / BO-SEED-9001`: `PAID`, user 1, active order, cancellable.
- `9002 / BO-SEED-9002`: `PDF_READY`, user 1, active order, cancellable.
- `9003 / BO-SEED-9003`: `CONFIRMED`, user 1, active order, not cancellable.
- `9004 / BO-SEED-9004`: `DELIVERED`, user 1, history order.
- `9005 / BO-SEED-9005`: `CANCELLED_REFUND`, user 1, history order.
- `9006 / BO-SEED-9006`: `ERROR`, user 1, history order.
- `9007 / BO-SEED-9007`: `PAID`, user 2, other-user permission check order.

## User Flow QA

1. Select `류성열`.
2. Open `추억을 책으로 소장 > 상품 안내`.
3. Confirm this page says the detailed product guide is still in planning.
4. Open `책 만들기`.
5. Confirm the first required step is room selection and only one room can be selected.
6. Select one product among `A4 소프트커버 포토북`, `A5 소프트커버 포토북`, `고화질 스퀘어북 (하드커버)`.
7. Select a period and click `기록 불러오기`.
8. Confirm memories, mission proofs, and letters are loaded automatically from the selected period.
9. Add or remove content and confirm the page limit blocks preview when the product max page is exceeded.
10. Create preview and confirm representative pages, estimated pages, and price snapshot are shown.
11. Click `주문 요청하기`, confirm the modal summary, and create the order.
12. Confirm the new order appears under `주문 상태` as `주문 요청`.

## Order Status And History QA

1. In `주문 상태`, confirm `BO-SEED-9001`, `BO-SEED-9002`, and `BO-SEED-9003` appear.
2. Open `BO-SEED-9001` or `BO-SEED-9002` and confirm `주문 취소` is enabled.
3. Cancel one order and confirm it moves to `주문 내역`.
4. Open `BO-SEED-9003` and confirm cancellation is disabled because the order is already confirmed.
5. In `주문 내역`, confirm `DELIVERED`, `CANCELLED_REFUND`, and `ERROR` orders are visible.

## Operator QA

1. Log out to the user selection screen.
2. Select `운영자`.
3. Confirm the general user sidebar is not shown.
4. Confirm the operator order list shows all users' orders and includes the order requester name.
5. Use the status filter and confirm orders are filtered by selected status.
6. Open a `PAID` order and click the next-status button.
7. Confirm the status changes to `제작 파일 준비` and the status history is appended.
8. Cancel a `PAID` or `PDF_READY` order and confirm it becomes `취소/환불`.
9. Try next status on a cancelled or delivered order and confirm the UI/API rejects the transition.

## Permission QA

- User 1 should not see `BO-SEED-9007` in their `주문 상태`.
- User 1 should receive `404 PRINT_ORDER_NOT_FOUND` when requesting `/api/book-archive/orders/9007`.
- User 1 should receive `403 OPERATOR_ONLY` when requesting `/api/operator/book-orders`.
- Private letters should only appear in book candidates when the selected user has access to those letters.
