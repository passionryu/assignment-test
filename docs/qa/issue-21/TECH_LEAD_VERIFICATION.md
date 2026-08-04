# Issue 21 Tech Lead Verification

## Issue

- #21 `[Lv2 구현] 책 만들기 방/기간/콘텐츠 선택 API/UI 구현`

## 확인 대상

- `GET /api/book-archive/rooms`
- `GET /api/book-archive/content-candidates`
- `POST /api/book-archive/previews`
- `BookArchiveService`
- `BookContentRepository`
- `BookPageEstimator`
- `BookPageLimitChecker`

## Happy Path Curl

```bash
curl -s 'http://localhost:8080/api/book-archive/rooms' \
  -H 'X-Member-Id: 1'

curl -s 'http://localhost:8080/api/book-archive/content-candidates?roomId=1&productUid=PHOTOBOOK_A4_SC&startDate=2026-08-01&endDate=2026-08-31' \
  -H 'X-Member-Id: 1'
```

## Edge Case Curl

```bash
curl -s 'http://localhost:8080/api/book-archive/content-candidates?roomId=1&productUid=PHOTOBOOK_A4_SC&startDate=2026-08-31&endDate=2026-08-01' \
  -H 'X-Member-Id: 1'

curl -s -X POST 'http://localhost:8080/api/book-archive/previews' \
  -H 'Content-Type: application/json' \
  -H 'X-Member-Id: 1' \
  -d '{"roomId":1,"bookSpecUid":"PHOTOBOOK_A4_SC","title":"QA","quantity":1,"periodStartDate":"2026-08-01","periodEndDate":"2026-08-31","contents":[]}'
```

## 기대 결과

- 방 목록은 현재 사용자가 참여 중인 방만 반환한다.
- 기간 후보 조회는 기본 후보와 추가 후보를 분리해 반환한다.
- 시작일이 종료일보다 늦으면 `BOOK_PERIOD_INVALID`가 반환된다.
- 빈 콘텐츠 preview 요청은 `BOOK_CONTENT_REQUIRED`가 반환된다.
- 중복 콘텐츠 preview 요청은 `BOOK_CONTENT_DUPLICATED`가 반환된다.
- 접근 불가 콘텐츠 preview 요청은 `BOOK_CONTENT_ACCESS_DENIED`가 반환된다.

## 상태

- 기존 구현 및 Lv2 AI QA 산출물 기준으로 정리했다.
- 이 문서 작성 커밋에서는 curl을 새로 실행하지 않았다.
