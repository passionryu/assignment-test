# Coding Convention

## Purpose

이 문서는 프로젝트 구현 중 지켜야 할 코드 작성 기준을 정의한다.

핵심 목표는 다음과 같다.

- 서비스 레이어만 읽어도 유스케이스 흐름을 이해할 수 있어야 한다.
- 정책, 검증, 조회, 상태 변경, 외부 연동 책임이 코드에 드러나야 한다.
- 오류가 발생했을 때 로그만 보고 언제, 어디서, 왜 실패했는지 파악할 수 있어야 한다.
- 공개 저장소에 회사명, 채용 전형명, 민감 정보가 남지 않아야 한다.

## Backend Layer Rule

백엔드는 다음 책임 경계를 기본으로 한다.

- Controller: HTTP 요청/응답, DTO 변환, application service 호출
- Service: 유스케이스 흐름 orchestration
- Policy / Validator / Checker: 비즈니스 정책 판단과 검증
- Reader: 조회 책임
- Recorder: 이력, 이벤트, 감사 기록 책임
- Updater: 상태 변경 책임
- Requester / Client: 외부 시스템 요청 책임
- Repository / Adapter: 저장소 또는 외부 인프라 경계

Controller에는 비즈니스 규칙, 저장소 호출, 외부 연동, 정책 검증을 넣지 않는다.

## Backend Package Rule

도메인 패키지는 책임별 하위 패키지를 둔다.

```text
com.recordroom.{domain}/
  controller/
  service/
  repository/
  model/
```

적용 기준:

- `controller`: HTTP endpoint와 request/response 연결
- `service`: 유스케이스 흐름 orchestration
- `repository`: JPA repository, QueryDSL 조회 구현, 저장소 adapter
- `model`: Entity, request DTO, response DTO, projection

단순 health check처럼 도메인 모델이 없는 영역은 `controller`만 둘 수 있다.

## Persistence Rule

백엔드 데이터 접근은 JPA + QueryDSL을 기준으로 한다.

- 단순 단건 조회/저장은 Spring Data JPA repository를 우선 사용한다.
- 조건 조합, 조인, 집계가 필요한 조회는 QueryDSL 기반 repository 구현으로 작성한다.
- Flyway migration은 유지하며, JPA entity는 migration schema와 일치해야 한다.
- 고정 seed ID와 런타임 자동 생성 ID가 충돌하지 않도록 identity sequence 보정 기준을 유지한다.
- 직접 SQL/JdbcTemplate은 migration, seed, health smoke처럼 인프라 성격이 강한 영역에 제한한다.

## Service Orchestration

Service의 메인 메서드는 유스케이스 흐름이 보이게 작성한다.

권장 흐름:

```text
조회 -> 검증 -> 결정/계산 -> 수행/요청 -> 기록/상태 변경 -> 반환
```

권장 예시:

```kotlin
val content = contentReader.readPublishedContent(contentId)

orderPolicyChecker.validateOrderableContent(content)

val orderPrice = orderPriceCalculator.calculatePrice(content, request.quantity)

val order = orderRecorder.recordOrder(memberId, content, orderPrice)

return OrderCreateResponse.from(order)
```

피해야 할 예시:

```kotlin
validate()
process()
executeBusinessLogic()
handleResult()
```

메인 서비스 메서드를 한 줄짜리 private method로 숨기지 않는다. 각 줄이 의미 있는 비즈니스 단계라면 길어져도 허용한다.

## Collaborator Comment Rule

메인 서비스 레이어에서 호출하는 외부 책임 객체의 public method 위에는 항상 한국어 한 줄 주석을 작성한다.

주석은 "무엇을 한다"가 아니라 "왜 이 규칙이나 책임이 필요한가"를 설명한다.

좋은 예:

```kotlin
class OrderPolicyChecker {
    // 판매 중단된 콘텐츠는 사용자가 결제할 수 없으므로 주문 가능 상태를 검증한다.
    fun validateOrderableContent(content: Content) {
        // ...
    }
}
```

나쁜 예:

```kotlin
class OrderPolicyChecker {
    // 주문 가능 여부를 검증한다.
    fun validate(content: Content) {
        // ...
    }
}
```

메인 서비스 메서드 내부에는 과도한 주석을 달지 않는다. 서비스 흐름은 호출되는 클래스명과 메서드명으로 읽혀야 한다.

## Naming Rule

클래스명과 메서드명은 책임과 도메인 의미가 드러나게 작성한다.

피한다:

```text
Util
Helper
Manager
CommonService
process()
handle()
execute()
check()
update()
```

권장 suffix:

- `Reader`: 도메인 리소스 또는 view 조회
- `Validator` / `Checker`: 정책, invariant, eligibility 검증
- `Decider`: 정책 결과 결정
- `Calculator`: 금액, 수량, 점수 등 값 계산
- `Requester`: 외부 시스템 요청
- `Updater`: 상태 변경
- `Recorder`: 이력, 이벤트, 감사 기록 저장
- `Mapper`: 계층 간 DTO 변환

권장 메서드명:

```text
readPublishedContent()
validateOrderableContent()
calculateOrderPrice()
recordOrderCreated()
requestPaymentApproval()
updateOrderAsPaid()
```

## Private Method Rule

Service의 private method는 최소화한다.

허용하는 경우:

- 단순 반복 제거
- 같은 메서드 문맥에서만 쓰이는 작은 로컬 로직
- 별도 책임 객체로 분리할 정도의 정책 의미가 없는 경우

외부 책임 객체로 분리해야 하는 경우:

- 정책적 의미가 있다.
- 재사용 가능성이 있다.
- 검증 책임이 명확하다.
- 도메인 용어로 이름 붙일 수 있다.
- 외부 시스템 연동 책임이다.
- 상태 변경이나 기록 책임이다.

## Logging Rule

실패 로그는 다음 질문에 바로 답할 수 있어야 한다.

- 언제 실패했는가?
- 어디서 실패했는가?
- 왜 실패했는가?

`언제`는 로그 프레임워크 timestamp와 `requestId`로 추적한다. 모든 HTTP 요청에는 `requestId`를 부여하고, 가능하면 응답 헤더에도 같은 값을 반환한다.

`어디서`는 logger name과 `what`으로 추적한다. HTTP 요청 실패라면 `what`에 `POST /api/orders`처럼 API를 남기고, 내부 책임 객체나 외부 연동 실패라면 `what`에 `ClassName.methodName`을 남긴다.

`왜`는 `reason`에 검색 가능한 reason code 또는 안전하게 정리된 실패 원인을 남긴다.

실패 로그 메시지는 다음 형식을 사용한다.

```text
[행위 영역] 실패 내용. who=..., what=..., requestData=..., reason=...
```

필수 key:

- `who`: 행위 주체. 예: `anonymous`, `memberId:1`, `adminId:2`, `system`
- `what`: 수행하려던 API, 클래스 메서드, 비즈니스 행위. 예: `POST /api/orders`, `OrderService.createOrder`, `paymentApproval`
- `requestData`: 원인 파악에 필요한 요청 정보. 민감 정보는 마스킹하거나 생략한다.
- `reason`: 실패 원인. 사람이 읽을 수 있고 검색 가능한 reason code를 사용한다.

권장 예시:

```kotlin
logWarn {
    "[주문 생성] 판매 중단 콘텐츠 주문으로 주문 생성 실패. " +
        "who=memberId:$memberId, " +
        "what=POST /api/orders, " +
        "requestData=contentId:${request.contentId},quantity:${request.quantity}, " +
        "reason=content_not_orderable"
}
```

외부 시스템 실패 예시:

```kotlin
logError(exception) {
    "[결제 승인] 외부 결제 승인 요청 실패. " +
        "who=memberId:$memberId, " +
        "what=PaymentRequester.requestPaymentApproval, " +
        "requestData=orderId:$orderId,paymentId:$paymentId, " +
        "reason=${exception.message ?: "unknown"}"
}
```

HTTP 요청 완료 로그는 다음 정보를 포함한다.

- HTTP method
- URI
- status
- elapsedMs
- requestId

## Log Level Rule

- `info`: 정상 요청 완료, 주요 상태 변경 성공
- `warn`: 예상 가능한 비즈니스 검증 실패, 사용자 입력 오류, 권한 부족
- `error`: 외부 시스템 장애, DB 장애, 예기치 못한 예외, 데이터 정합성 훼손 가능성

검증 실패를 무조건 `error`로 남기지 않는다. 운영자가 즉시 확인해야 할 장애와 사용자가 정상적으로 만들 수 있는 실패를 구분한다.

## Sensitive Data Rule

로그에 남기지 않는다.

- 비밀번호 원문
- access token / refresh token 원문
- API key
- webhook URL
- 결제 수단 원문
- 사용자의 긴 입력 원문
- 개인정보 전문

필요한 경우 일부만 마스킹해서 남긴다.

```text
email=ryu***@example.com
token=eyJhbGciOi...
password=masked
```

## User Error Response Rule

사용자에게 반환하는 오류 메시지는 한국어로 작성한다.

사용자 응답에 내부 구현 상세를 노출하지 않는다.

- stack trace
- SQL 상세
- class name
- 외부 시스템 원문 오류
- token, secret
- 내부 exception message

사용자 메시지는 다음 행동을 이해할 수 있어야 한다.

```text
주문할 수 없는 콘텐츠입니다.
로그인이 만료되었습니다. 다시 로그인해주세요.
입력한 정보를 다시 확인해주세요.
```

## API Documentation Rule

API 문서화 도구를 사용하는 경우 endpoint에는 한국어 설명을 작성한다.

- `summary`: 기능 이름
- `description`: 언제 쓰이고 어떤 결과를 반환하는지 설명

단순히 함수명을 반복하지 않는다.

## Frontend Structure Rule

프론트엔드는 사용자의 실제 작업 흐름이 먼저 읽히게 구성한다.

권장 책임 경계:

- Page / Route: 화면 진입점, 주요 section 조립, URL parameter 처리
- Feature Component: 하나의 사용자 기능 또는 화면 흐름 담당
- UI Component: 재사용 가능한 순수 UI
- API Client: 서버 요청과 response parsing
- Hook: 화면 상태, form 상태, API 호출 상태처럼 재사용 가능한 view logic
- Mapper / Formatter: 서버 데이터를 화면 표시 모델로 변환

Page 파일에 API 호출, 복잡한 form 검증, 긴 상태 전환 로직을 모두 넣지 않는다.

## Frontend User Flow Rule

화면 구현은 기능 목록이 아니라 사용자 흐름 기준으로 작성한다.

각 주요 화면은 다음 상태를 가진다.

- 기본 상태
- loading 상태
- empty 상태
- error 상태
- success 또는 completed 상태

사용자가 다음 행동을 알 수 없는 빈 화면이나 오류 화면을 만들지 않는다.

## Frontend Component Rule

Component는 한 가지 변경 이유를 가져야 한다.

피한다:

- 하나의 component가 API 호출, form 검증, modal, table, toast를 모두 처리하는 구조
- props drilling이 깊어져 화면 흐름을 읽기 어려운 구조
- 같은 버튼, card, form field 스타일을 화면마다 새로 작성하는 구조

권장한다:

- 서버 데이터 조회와 화면 표시 책임을 분리한다.
- 반복 UI는 작은 component로 분리하되, 의미 없는 wrapper component는 만들지 않는다.
- component 이름은 화면에서의 역할이 드러나게 작성한다.

예:

```text
ContentListPage
ContentFilterBar
ContentCard
OrderSummaryPanel
OrderSubmitButton
```

## Frontend API Rule

API 요청은 화면 component 안에 흩뿌리지 않는다.

- API path, method, request, response 타입은 한 곳에서 관리한다.
- 서버 response를 그대로 모든 component에 퍼뜨리지 않는다.
- 화면에 필요한 형태가 다르면 mapper나 formatter에서 변환한다.
- 실패 응답은 사용자에게 안전한 한국어 메시지로 변환한다.
- loading 중 중복 submit이 발생하지 않게 막는다.

## Frontend Form Rule

Form은 입력, 검증, 제출, 실패 복구가 명확해야 한다.

- label과 input을 명확히 연결한다.
- 필수값, 길이, 형식 오류는 제출 전 또는 제출 직후 화면 안에서 보여준다.
- 제출 실패 시 사용자가 입력한 값을 잃지 않는다.
- 제출 중에는 submit button을 비활성화하거나 pending 상태를 보여준다.
- 서버 검증 오류는 field error 또는 form-level error로 분리한다.

## Frontend State Rule

상태는 필요한 위치에만 둔다.

- 서버에서 다시 계산 가능한 값은 중복 state로 보관하지 않는다.
- 화면 안에서만 쓰는 값은 local state로 둔다.
- 여러 화면이 공유하는 값만 global state 후보로 본다.
- URL로 표현할 수 있는 검색 조건, 필터, page number는 가능하면 URL state로 둔다.
- derived state는 변수나 selector로 계산하고 별도 state로 복제하지 않는다.

## Frontend UX Rule

UI는 최종 사용자가 반복해서 사용할 수 있게 만든다.

- 주요 CTA는 화면에서 한 번에 이해되어야 한다.
- destructive action은 확인 절차나 되돌릴 수 있는 흐름을 둔다.
- 클릭 후 아무 반응 없는 상태를 만들지 않는다.
- 모바일과 데스크톱에서 주요 흐름이 모두 완료되어야 한다.
- 긴 텍스트가 버튼, 카드, 표 안에서 깨지지 않게 한다.
- 빈 상태에는 사용자가 다음으로 할 수 있는 행동을 제공한다.

## Frontend Accessibility Rule

기본 접근성을 지킨다.

- 클릭 가능한 요소는 `button` 또는 `a`를 사용한다.
- input에는 label 또는 접근 가능한 이름을 제공한다.
- modal, drawer, dropdown은 keyboard focus 흐름을 고려한다.
- 이미지에는 의미 있는 `alt`를 제공하고, 장식 이미지는 비워 둔다.
- 색상만으로 상태를 전달하지 않는다.

## Frontend Error Handling Rule

사용자에게 보이는 오류 메시지는 한국어로 작성한다.

사용자에게 내부 정보를 노출하지 않는다.

- stack trace
- server exception name
- SQL 상세
- token
- API key
- 내부 endpoint debug 정보

권장 메시지:

```text
콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
주문 정보를 저장하지 못했습니다. 입력값을 다시 확인해주세요.
로그인이 필요합니다.
```

개발 중 console log를 남기더라도 민감 정보와 긴 사용자 입력 원문은 출력하지 않는다.

## Frontend Test Rule

핵심 사용자 흐름은 Playwright E2E 검증 대상으로 둔다.

우선 검증 대상:

- 콘텐츠 목록 조회
- 콘텐츠 상세 조회
- 주문 생성 happy path
- 주문 생성 실패 path
- 모바일 주요 화면
- 새로고침 후 주요 상태 유지

테스트는 사용자가 보는 label, role, text를 우선 사용한다. 안정적인 선택자가 필요할 때만 `data-testid`를 사용한다.

## Final Checklist

백엔드 구현 후 다음을 확인한다.

- Controller가 얇은가?
- Service 메서드에서 유스케이스 흐름이 읽히는가?
- Service가 호출하는 외부 책임 객체 public method에 한국어 한 줄 주석이 있는가?
- 정책, 조회, 기록, 외부 연동 책임이 이름으로 드러나는가?
- 실패 로그에 `who`, `what`, `requestData`, `reason`이 있는가?
- 로그만 보고 언제, 어디서, 왜 실패했는지 추적 가능한가?
- 사용자 응답에 내부 구현이나 민감 정보가 노출되지 않는가?

프론트엔드 구현 후 다음을 확인한다.

- 주요 화면에 loading, empty, error 상태가 있는가?
- form 제출 중복과 실패 복구가 처리되는가?
- API 호출이 component에 흩어지지 않았는가?
- 모바일과 데스크톱에서 핵심 흐름이 모두 가능한가?
- 사용자가 보는 오류 메시지가 안전한 한국어인가?
- Playwright로 검증할 수 있는 사용자 흐름이 명확한가?
