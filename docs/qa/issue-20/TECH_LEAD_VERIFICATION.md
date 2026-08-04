# Issue 20 Tech Lead Verification

## Issue

- #20 `[Lv2 설계] 책 주문 도메인 모델 및 DB 스키마 추가`

## 확인 대상

- `service/server/src/main/resources/db/migration/V8__create_book_order_tables.sql`
- `service/server/src/main/kotlin/com/recordroom/book/model/BookEntities.kt`
- `service/server/src/main/kotlin/com/recordroom/book/model/BookModels.kt`
- `service/server/src/main/kotlin/com/recordroom/book/service/BookProductCatalog.kt`

## 검증 관점

- `book_presets.uid`를 기준으로 서버 카탈로그와 주문/미리보기 FK가 연결된다.
- `creation_type`은 enum `BookCreationType.TEMPLATE`만 지원한다.
- `print_orders.status`는 `PrintOrderStatus` enum으로 저장/조회한다.
- 미리보기 콘텐츠와 주문 콘텐츠는 `snapshot_json`으로 저장되어 원본 기록 수정과 주문 스냅샷이 분리된다.
- `print_order_status_histories`가 주문 상태 변경 이력을 별도 테이블로 보존한다.

## API 확인 포인트

```bash
curl -s http://localhost:8080/api/book-archive/products -H 'X-Member-Id: 1'
```

- 기대값: 상품 3종이 반환된다.
- 기대값: 모든 상품의 `creationType`은 `TEMPLATE`이다.
- 기대값: 페이지 범위는 A4 24~130, A5 50~200, 스퀘어북 24~130이다.

## 상태

- 기존 구현 및 Lv2 AI QA 산출물 기준으로 정리했다.
- 이 문서 작성 커밋에서는 서버 테스트를 새로 실행하지 않았다.
