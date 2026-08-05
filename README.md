# Assignment Test

여러 사람이 함께 쓰는 기록방 서비스입니다. 사용자는 로그인 대신 준비된 체험 계정을 선택해 방에 들어가고, 채팅, 추억 게시글, 미션 인증, 편지를 남긴 뒤 선택한 기록을 템플릿 기반 책 주문 요청으로 이어갈 수 있습니다.

## 제출 상태

- Lv1: 기록방 핵심 기능 구현 및 QA 증적 정리
- Lv2: 템플릿 기반 책 만들기, 예상 견적, 주문 상태 관리, 운영자 주문 확인 MVP 구현
- Lv3: 최종 UI/UX 정리, 모바일 대응, E2E 검증, 제출 문서 정리 진행 단계
- Project Board: [Assignment Test Kanban](https://github.com/users/passionryu/projects/6)
- 제출 문서: [docs/submission.md](docs/submission.md)

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, lucide-react |
| Backend | Kotlin, Spring Boot 3.3, Spring Web, Spring Data JPA, QueryDSL |
| Database | PostgreSQL 16, Flyway |
| Infra | Docker Compose |
| Test/QA | Gradle test, Vite build, curl smoke test, issue-scoped QA evidence |

## 로컬 실행

루트 경로에서 선택적으로 `.env`를 생성합니다. 기본값으로 실행할 수 있지만, 로컬 DB 계정이나 API 주소를 바꾸려면 `.env.example`을 복사해 수정합니다.

```bash
cp .env.example .env
```

Docker Compose로 전체 서비스를 실행합니다.

```bash
docker compose -f service/infra/docker-compose.yml up --build
```

접속 주소:

| 항목 | 주소 |
| --- | --- |
| Client | http://localhost:5173 |
| Server | http://localhost:8080 |
| Health check | http://localhost:8080/api/health |

중지:

```bash
docker compose -f service/infra/docker-compose.yml down
```

## 환경 변수

`.env`는 git에 커밋하지 않습니다. 아래 값은 로컬 실행용 예시이며 외부 서비스 키가 아닙니다.

| 변수 | 기본값/예시 | 설명 |
| --- | --- | --- |
| `POSTGRES_DB` | `assignment_test` | 로컬 PostgreSQL DB 이름 |
| `POSTGRES_USER` | `assignment_user` | 로컬 PostgreSQL 사용자 |
| `POSTGRES_PASSWORD` | `assignment_password` | 로컬 PostgreSQL 비밀번호 예시 |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | 프론트엔드가 호출할 API base URL |
| `SERVER_PORT` | `8080` | 백엔드 서버 포트 |
| `SPRING_DATASOURCE_URL` | Docker Compose에서 자동 주입 | 백엔드 DB 접속 URL |
| `SPRING_DATASOURCE_USERNAME` | Docker Compose에서 자동 주입 | 백엔드 DB 사용자 |
| `SPRING_DATASOURCE_PASSWORD` | Docker Compose에서 자동 주입 | 백엔드 DB 비밀번호 |
| `SEED_ENABLED` | `true` | 로컬 seed 데이터 삽입 여부 |
| `MEMORY_UPLOAD_DIR` | `uploads/memories` | 추억 게시글 이미지 저장 위치 |
| `MISSION_UPLOAD_DIR` | `uploads/missions` | 미션 인증 이미지 저장 위치 |

## 체험 계정

첫 화면에서 사용자를 선택합니다. 선택한 사용자의 id는 API 요청의 `X-Member-Id` 헤더로 전달됩니다.

| 구분 | 이름 | id | 용도 |
| --- | --- | --- | --- |
| 일반 사용자 | 류성열 | `1` | 커플/가족/프로젝트 방 방장 |
| 일반 사용자 | 여자친구 | `2` | 커플방 구성원, 일부 방 방장 |
| 일반 사용자 | 아버지 | `3` | 가족방 구성원 |
| 일반 사용자 | 지훈 | `4` | 프로젝트방 구성원 |
| 운영자 | 운영자 | `100` | 책 주문 확인, 상태 변경, 취소 처리 |

curl로 직접 API를 확인할 때는 헤더를 지정합니다.

```bash
curl -s -H "X-Member-Id: 1" http://localhost:8080/api/book-archive/products
curl -s -H "X-Member-Id: 100" http://localhost:8080/api/operator/book-orders
```

## Seed 데이터

Docker 실행 시 `SEED_ENABLED=true`로 로컬 검증용 데이터가 삽입됩니다.

| 데이터 | 내용 |
| --- | --- |
| 사용자 | 일반 사용자 4명, 운영자 1명 |
| 기록방 | 커플, 가족, 학급/동아리 유형의 참여 방과 초대받은 방 |
| 채팅 | 방별 최근 대화 |
| 추억 게시판 | 사진이 포함된 게시글과 댓글 |
| 미션 인증 | 기본/커스텀 미션, 사진 인증, 승인/동의, 댓글 |
| 편지 | 특정 구성원에게만 보이는 비공개 편지 |
| 책 주문 | 진행/완료/취소/오류 상태를 포함한 책 주문 20건 |

## Lv1 구현 범위

- 로그인 대신 고정 체험 사용자 선택
- 방 생성, 초대 수락/거절, 방 관리 대시보드, 방 나가기/삭제 보호 흐름
- 방 단위 채팅과 폴링 기반 새 메시지 확인
- 추억 게시판 사진 업로드, 본문 작성, 댓글
- 방 타입별 기본 미션 20개, 커스텀 미션, 사진 인증, 승인/동의, 댓글
- 구성원 1명에게만 보내는 비공개 편지
- 날짜별 기록 흐름을 확인하는 전체 기록 캘린더
- 프로필/알림 설정과 기본 QA 증적 정리

## Lv2 구현 범위

Lv2의 핵심은 사용자가 기록방 콘텐츠를 골라 책 주문 요청에 가까운 흐름을 만드는 것입니다. 실제 제작, 결제, 배송은 구현하지 않고 로컬 데이터로 상태를 관리합니다.

사용자 메뉴:

| 메뉴 | 역할 |
| --- | --- |
| 상품 안내 | 지원 상품 3종 안내 |
| 책 만들기 | 방, 상품, 기간, 콘텐츠를 선택해 미리보기와 견적 생성 |
| 주문 상태 | 제작 전부터 배송 중까지 진행 주문 확인 |
| 주문 내역 | 완료, 취소, 오류 주문 확인 |

책 만들기 흐름:

1. 책으로 만들 방 1개 선택
2. 상품 3종 중 1개 선택
3. 캘린더에서 기간 선택
4. 불러올 콘텐츠 유형 선택
5. 자동으로 불러온 추억, 미션, 편지, 채팅 중 포함할 기록 조정
6. 페이지 제한 검증
7. 템플릿 기반 미리보기와 mock 견적 확인
8. 주문 요청 생성

지원 상품:

| 코드 | 노출명 | 판형 | 커버/제본 | 페이지 범위 | 가격 정책 |
| --- | --- | --- | --- | --- | --- |
| `PHOTOBOOK_A4_SC` | A4 소프트커버 포토북 | 210x297mm | 소프트커버 / 무선제본 | 24~130p | 기본 32,000원, 40p 초과 300원/p, 배송비 3,000원 |
| `PHOTOBOOK_A5_SC` | A5 소프트커버 포토북 | 148x210mm | 소프트커버 / 무선제본 | 50~200p | 기본 28,000원, 50p 초과 220원/p, 배송비 3,000원 |
| `SQUAREBOOK_HC` | 고화질 스퀘어북 (하드커버) | 204x204mm | 하드커버 / 양장제본 | 24~130p | 기본 46,000원, 40p 초과 420원/p, 배송비 3,000원 |

페이지 산정 기준:

| 콘텐츠 | 기준 |
| --- | --- |
| 편지 | 기본 2p |
| 미션 인증 | 기본 2p, 댓글이 많으면 추가 |
| 추억 게시글 | 기본 2p, 사진/댓글 수에 따라 추가 |
| 채팅 묶음 | 메시지 수 기준으로 1p 이상 |

주문 상태:

| 상태 | 의미 |
| --- | --- |
| `PAID` | 주문 요청 |
| `PDF_READY` | 제작 파일 준비 |
| `CONFIRMED` | 주문 확정 |
| `IN_PRODUCTION` | 제작 중 |
| `PRODUCTION_COMPLETE` | 제작 완료 |
| `SHIPPED` | 배송 중 |
| `DELIVERED` | 배송 완료 |
| `CANCELLED_REFUND` | 취소/환불 |
| `ERROR` | 오류 |

운영자 기능:

- 사용자 선택 화면에서 운영자 계정을 선택하면 주문 관리 화면으로 진입합니다.
- 전체 주문 조회, 필터/정렬, CSV 다운로드, 주문 상세 조회, 다음 상태 변경, 주문 취소를 지원합니다.
- 운영자 기능은 일반 사용자 사이드바에 노출하지 않습니다.

CSV 다운로드 기준:

| 버튼 | 다운로드 범위 |
| --- | --- |
| 전체 데이터 CSV | 전체 주문 데이터 |
| 필터링 데이터 CSV | 현재 필터 조건에 맞는 데이터 |
| 선택한 데이터 CSV | 체크박스로 선택한 데이터 |

## Book Print API 대응 정책

이 프로젝트는 Book Print API의 개념을 직접 호출하지 않고 로컬 mock/fallback으로 구현합니다.

| 구분 | 실제 외부 API 연동 | 이 프로젝트 구현 |
| --- | --- | --- |
| 상품 조회 | 외부 상품 API 호출 가능 | DB seed 기반 상품 3종 고정 |
| 창작 방식 | 템플릿 바인딩, PDF 직접 업로드, 혼합 방식 가능 | `TEMPLATE` 방식만 지원 |
| PDF 업로드 | 완성 PDF 파일 업로드 가능 | 구현 범위 제외 |
| 미리보기 | 실제 제작 파일 기반일 수 있음 | 선택 기록을 템플릿 페이지에 배치한 화면 미리보기 |
| 견적 | 외부 견적 API 기반 가능 | 로컬 가격 정책으로 mock 계산 |
| 주문 생성 | 외부 주문 API 호출 가능 | 로컬 DB에 주문 요청과 스냅샷 저장 |
| 상태 변경 | 외부 제작/배송 상태와 동기화 가능 | 운영자 화면에서 로컬 상태 전이 |
| 결제/환불 | 실제 결제/환불 연동 가능 | 구현 범위 제외 |
| 배송/웹훅 | 실제 배송/웹훅 연동 가능 | 구현 범위 제외 |

따라서 외부 API 키, 비밀번호, 운영 서버 인증 정보는 필요하지 않으며 저장하지 않습니다.

## 테스트 방법

프론트엔드 빌드:

```bash
cd service/client
npm ci
npm run build
```

백엔드 테스트:

```bash
cd service/server
./gradlew test
```

Docker smoke test:

```bash
docker compose -f service/infra/docker-compose.yml up --build
curl -s http://localhost:8080/api/health
curl -s -H "X-Member-Id: 1" http://localhost:8080/api/book-archive/products
curl -s -H "X-Member-Id: 100" http://localhost:8080/api/operator/book-orders
```

## QA 증적 위치

QA 결과는 이슈 단위로 `docs/qa/issue-{issueNumber}/`에 정리합니다.

| 범위 | 위치 |
| --- | --- |
| Lv1 QA | `docs/qa/issue-3` ~ `docs/qa/issue-13` |
| Lv2 QA | `docs/qa/issue-20` ~ `docs/qa/issue-32` |
| Lv2 AI QA HTML | `docs/qa/issue-27/AI_QA_REPORT.html` |
| Human QA 체크리스트 | 각 이슈 디렉토리의 `HUMAN_QA.md` |
| Tech Lead 검증 | 각 이슈 디렉토리의 `TECH_LEAD_VERIFICATION.md` |

## 주요 제한 사항

- 실제 계정/비밀번호 인증이 아니라 과제 검증용 사용자 선택 방식입니다.
- 채팅은 WebSocket이 아니라 polling 방식입니다.
- 업로드 파일은 로컬 파일 시스템에 저장됩니다.
- 책 제작은 템플릿 기반 mock 미리보기와 로컬 견적 계산입니다.
- PDF 직접 업로드, 혼합 제작 방식, 실결제, 실환불, 실배송, 예치금, 웹훅은 구현하지 않았습니다.
- 운영자 화면은 과제 검증용 MVP이며 실제 권한 시스템이나 운영 감사 로그 수준까지 확장하지 않았습니다.
