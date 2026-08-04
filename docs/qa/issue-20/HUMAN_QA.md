# Issue 20 Human QA

## Issue

- #20 `[Lv2 설계] 책 주문 도메인 모델 및 DB 스키마 추가`

## 구현 결과

- 책 제작/주문을 위한 `book_presets`, `book_previews`, `book_preview_contents`, `print_orders`, `print_order_contents`, `print_order_status_histories` 테이블을 추가했다.
- 창작 방식은 `TEMPLATE`로 고정했다.
- 상품 프리셋 3종을 seed/migration 기준으로 저장한다.
  - `PHOTOBOOK_A4_SC`: A4 소프트커버 포토북, 24~130p
  - `PHOTOBOOK_A5_SC`: A5 소프트커버 포토북, 50~200p
  - `SQUAREBOOK_HC`: 고화질 스퀘어북 (하드커버), 24~130p
- 미리보기와 주문 콘텐츠는 원본 콘텐츠 변경과 분리되도록 snapshot 구조로 저장한다.
- 실제 결제, 배송, PDF 업로드, 예치금 모델은 스키마 범위에서 제외했다.

## Human QA List

- Docker 재기동 후 DB migration이 정상 적용되는지 확인한다.
- 책 만들기 화면에서 상품 3종이 표시되는지 확인한다.
- 각 상품의 이름, 판형, 커버/제본, 페이지 범위가 화면과 기획 내용에 맞는지 확인한다.
- 책 미리보기 생성 후 DB에 `book_previews`, `book_preview_contents`가 생성되는지 확인한다.
- 주문 생성 후 DB에 `print_orders`, `print_order_contents`, `print_order_status_histories`가 생성되는지 확인한다.
- 주문 snapshot에 상품, 방, 기간, 콘텐츠, 견적 정보가 주문 당시 값으로 남는지 확인한다.

## 제외 확인

- PDF 직접 업로드 UI/API가 노출되지 않아야 한다.
- 결제/배송/예치금 관련 입력값이 필수 플로우에 포함되지 않아야 한다.
