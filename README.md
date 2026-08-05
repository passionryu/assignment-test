# RooMory

**서비스 명:** RooMory - "방마다 추억이 쌓이는 공간"

**설명:** Room + Memory의 합성어로 방마다 추억 게시판, 미션 인증, 편지, 채팅 등의 다양한 콘텐츠의 추억이 쌓이는 공간이라는 의미를 담고 있습니다.

## 1. 서비스 소개

### 어떤 서비스인가

기록방은 커플, 가족, 학급/동아리처럼 여러 사람이 함께 쓰는 공간입니다. 방 안에서 일상 대화, 사진이 포함된 추억, 미션 인증, 개인 편지를 기록하고, 나중에 필요한 기록만 골라 책 형태의 주문 요청까지 만들 수 있습니다.

### 누구를 위한 서비스인가

| 타깃 | 사용 상황 |
| --- | --- |
| 커플 | 기념일, 여행, 일상 대화를 한 권의 기록집으로 남기고 싶을 때 |
| 가족 | 가족 여행 사진, 편지, 함께한 미션을 모아 보관하고 싶을 때 |
| 학급/동아리 | 프로젝트, 활동 인증, 구성원 기록을 정리하고 싶을 때 |
### 주요 기능

| 기능 | 설명 |
| --- | --- |
| 기록방 | 방 생성, 초대 수락/거절, 방 관리, 방 나가기/삭제 보호 
| 채팅 | 방별 메시지 작성과 polling 기반 새 메시지 확인 |
| 추억 게시판 | 사진 업로드, 본문 작성, 댓글 |
| 미션 인증 | 기본/커스텀 미션, 사진 인증, 승인/동의, 댓글 |
| 편지 | 방 구성원 1명에게만 보이는 비공개 편지 |
| 전체 기록 캘린더 | 날짜별 채팅, 미션, 추억, 편지 흐름 확인 |
| 책 만들기 | 방, 상품, 기간, 콘텐츠를 선택해 템플릿 기반 미리보기와 예상 견적 생성 |
| 주문 관리 | 사용자 주문 상태/내역 조회, 운영자 주문 확인과 상태 변경 |

## 2. 실행 방법 (Docker)

아래 명령은 복사해서 그대로 실행할 수 있는 기준 흐름입니다.

```bash
# 저장소 클론
git clone https://github.com/passionryu/assignment-test.git
cd assignment-test

# 환경변수 준비
# 기본값으로도 실행할 수 있지만, 로컬 포트/DB 계정 변경이 필요하면 .env를 수정합니다.
cp .env.example .env

# 실행
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

## 3. 완성한 레벨

| 레벨 | 상태     | 구현 내용                                                              |
| --- |--------|--------------------------------------------------------------------|
| Lv1 | 완료     | 기록방, 채팅, 추억 게시판, 미션 인증, 편지, 전체 기록 캘린더                              |
| Lv2 | 완료     | 템플릿 기반 책 만들기, 상품 선택, 미리보기/견적, 주문 생성, 주문 상태/내역, 운영자 주문 관리           |
| Lv3 | 80% 완료 | 거시적 UI/UX 개선과 README 정리 진행. 최종 E2E, 최종 제출 문서 보강 - Mobile UI 대응 미완료 |


## 4. 사용자 경험(UI/UX) 설계

### 타깃 사용자

- 가입 절차 없이 서비스를 바로 확인해야 하는 과제 심사자
- 방 단위로 여러 사람의 기록을 모으고 싶은 일반 사용자
- 책 주문 요청과 상태 관리를 확인해야 하는 운영자 역할 사용자

### 핵심 화면/흐름

화면 정의서는 GitHub에서 바로 확인할 수 있도록 PDF 링크를 연결했습니다.

| 구분 | 문서 |
| --- | --- |
| Lv1 화면 정의서 | [SCREEN-001-main-page-screen-spec.pdf](docs/plan/screen-spec/v1.0/SCREEN-001-main-page-screen-spec.pdf) |
| Lv2 화면 정의서 | [SCREEN-004-lv2-book-order-screen-spec.pdf](docs/plan/screen-spec/v2.0/SCREEN-004-lv2-book-order-screen-spec.pdf) |

### 의도적으로 넣지 않은 것

| 제외한 기능 | 제외 이유 |
| --- | --- |
| 실제 회원가입/로그인 | 과제 검증 속도를 위해 사용자 선택 방식 채택 |
| WebSocket 채팅 | 핵심 과제 범위 대비 polling으로 충분하다고 판단 |
| PDF 직접 업로드 | 현재 서비스의 기록 기반 책 만들기 흐름과 맞지 않아 Lv2 범위에서 제외 |
| 실결제/실환불/실배송 | 주문 상태 관리 검증이 목적이므로 mock 상태 전이로 대체 |
| 예치금 모델 | 과제 구현 범위와 사용자 흐름 대비 과하다고 판단 |

### 주요 화면 캡처

심사자가 실행 전 핵심 화면 흐름을 빠르게 확인할 수 있도록 데스크톱 기준 캡처를 정리했습니다.
채팅 화면은 최종 캡처 확보 후 추가합니다.

<details>
<summary>사용자 선택 화면 - 일반 사용자와 운영자 계정을 구분해 체험을 시작하는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/user-selection.png" alt="사용자 선택 화면" width="900"> |

</details>

<details>
<summary>홈/전체 기록 캘린더 화면 - 참여 기록방 요약과 날짜별 기록 흐름을 함께 확인하는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/home-calendar.png" alt="홈/전체 기록 캘린더 화면" width="900"> |

</details>

<details>
<summary>방 관리 대시보드 화면 - 새 방 생성, 초대 수락/거절, 참여 기록방 초대를 관리하는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/room-dashboard.png" alt="방 관리 대시보드 화면" width="900"> |

</details>

<details>
<summary>추억 게시판 화면 - 사진과 글을 남기고 댓글로 함께 기록을 이어가는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/memory-board.png" alt="추억 게시판 화면" width="900"> |

</details>

<details>
<summary>미션 인증 화면 - 방별 미션 인증, 동의 상태, 댓글을 확인하는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/mission-verification.png" alt="미션 인증 화면" width="900"> |

</details>

<details>
<summary>편지 화면 - 특정 멤버에게 보낸 비공개 편지를 확인하고 작성하는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/letters.png" alt="편지 화면" width="900"> |

</details>

<details>
<summary>책 만들기 화면 - 방, 상품, 기간, 콘텐츠를 고르고 템플릿 기반 책 주문으로 이어가는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/book-maker.png" alt="책 만들기 화면" width="900"> |

</details>

<details>
<summary>주문 상태/주문 상세 모달 화면 - 주문 목록에서 진행 단계와 상태 이력, 주문 상세를 확인하는 화면</summary>

| 데스크톱 화면 캡처 |
| --- |
| <img src="docs/assets/readme/screenshots/order-detail-modal.png" alt="주문 상태/주문 상세 모달 화면" width="900"> |

</details>

## 5. 기술 스택 및 아키텍처

### 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, lucide-react |
| Backend | Kotlin, Spring Boot 3.3, Spring Web, Spring Data JPA, QueryDSL |
| Database | PostgreSQL 16, Flyway |
| Infra | Docker Compose |
| Test/QA | Gradle test, Vite build, curl smoke test, issue-scoped QA evidence |

### 기술 선택 근거

작성 예정: 최종 제출 전 작성자 관점에서 프론트엔드, 백엔드, DB 선택 근거를 보강합니다.

현재 1차 정리 기준:

- React/Vite: 실무와 학부에서 반복 사용한 스택이라 UI 구현을 빠르게 진행할 수 있어 채택함
- Kotlin/Spring Boot: 실무/학부 과제에서 REST API와 JPA 기반 서버를 많이 다뤄 과제 범위에 맞춰 안정적으로 구현하기 쉬워 채택함
- PostgreSQL/Flyway: 관계형 데이터 관리와 마이그레이션 경험이 있어 팀 협업처럼 유지보수 가능한 구조를 빠르게 구성할 수 있어 채택함
- Docker Compose: 실무 운영/과제 실행 환경에서 동일 조건 재현이 쉬워 심사 환경에서 재현성이 높기 때문에 채택함

### 디렉터리 구조

```text
assignment-test
├── README.md                  # 제출자가 가장 먼저 확인하는 프로젝트 안내 문서
├── .env.example               # 로컬 실행용 환경변수 예시. 실제 비밀값은 커밋하지 않음
├── docs                       # 기획, QA, 제출 산출물을 모아 둔 문서 영역
│   ├── assets                 # README/제출 문서에서 참조하는 이미지 자산
│   │   └── readme
│   │       └── screenshots    # README 주요 화면 캡처
│   ├── agents                 # AI 에이전트 협업 구조와 산출물 근거
│   │   └── assets
│   │       └── agent-system-architecture.png
│   ├── conventions            # 브랜치, 커밋, 작업 흐름 컨벤션
│   │   └── ...
│   ├── dev-spec               # 기능 구현 전후의 개발 명세와 API 흐름
│   │   └── ...
│   ├── plan                   # PM/PO, 화면 정의, 사용자 흐름 기획 산출물
│   │   └── screen-spec
│   │       ├── v1.0           # Lv1 화면 정의서와 승인 기록
│   │       │   ├── SCREEN-001-main-page-screen-spec.pdf
│   │       │   ├── screen-spec.md
│   │       │   ├── user-flow.md
│   │       │   ├── approval-log.md
│   │       │   └── screens/
│   │       ├── v2.0           # Lv2 책 주문 화면 정의서와 승인 기록
│   │       │   ├── SCREEN-004-lv2-book-order-screen-spec.pdf
│   │       │   ├── screen-spec.md
│   │       │   ├── user-flow.md
│   │       │   └── approval-log.md
│   │       └── v3.0           # Lv3 UI/UX 개선 계획 산출물
│   │           ├── screen-spec.md
│   │           ├── user-flow.md
│   │           └── approval-log.md
│   ├── qa                     # 이슈별 Human QA, 기술 검증, AI QA 결과
│   │   ├── issue-3/
│   │   ├── issue-4/
│   │   ├── ...
│   │   ├── issue-27/          # Lv2 책 주문 AI QA HTML과 검증 기록
│   │   │   ├── AI_QA_REPORT.html
│   │   │   ├── HUMAN_QA.md
│   │   │   └── TECH_LEAD_VERIFICATION.md
│   │   └── issue-32/
│   └── submission.md          # 제출용 보조 문서 초안
├── service                    # 실제 애플리케이션 코드
│   ├── client                 # React/Vite 프론트엔드
│   │   ├── src                # 화면, 상태, API 클라이언트
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── server                 # Kotlin/Spring Boot 백엔드
│   │   ├── src                # 도메인, API, 영속성, seed
│   │   ├── build.gradle.kts
│   │   └── gradlew
│   └── infra                  # Docker Compose와 로컬 실행 인프라
│       └── docker-compose.yml
├── test-results               # Playwright 등 자동 검증 산출물
│   └── playwright
└── tmp                        # 로컬 임시 파일. 제출 판단 근거에는 사용하지 않음
```
### Book Print API 대응 정책

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

외부 API 키, 비밀번호, 운영 서버 인증 정보는 필요하지 않으며 저장하지 않습니다.

## 6. AI 도구 사용 내역

개발 과정에서 AI 도구를 사용한 내역은 긍정/부정 영향을 모두 포함해 최종 제출 전 보강합니다.

| AI 도구 | 활용 내용 |
| --- | --- |
| Codex | Multi-Agent 시스템 가동, 개발 |
| Perplexity | 자료 조사, 기존 서비스 벤치마킹 |
| GPT | 기타 AI 작업 |

작성 예정: AI가 만든 결과를 그대로 사용하지 않고 어떤 부분을 검토/수정했는지 보강합니다.

## 7. 설계 의도

### 왜 이 서비스 아이디어를 선택했는가

작성 예정: 작성자 관점에서 서비스 아이디어 선택 배경을 보강합니다.

현재 1차 정리 기준:

- 기록은 채팅, 사진, 미션, 편지처럼 여러 형태로 흩어지기 쉽습니다.
- 기록방은 여러 사람이 함께 남긴 기록을 방 단위로 모으고, 필요할 때 책으로 소장하는 흐름에 적합합니다.
- Lv2의 책 주문 과제와 기존 기록 서비스가 자연스럽게 연결됩니다.

### 사업 가능성을 어떻게 보는가

작성 예정: 타깃 사용자, 결제 가능성, 반복 사용 가능성, 운영 비용 관점에서 작성자 판단을 보강합니다.

### 더 시간이 있었다면 추가할 기능

작성 예정: 최종 구현 범위를 확정한 뒤 추가하고 싶은 기능을 보강합니다.

후보:

- 실제 인증/권한 시스템
- WebSocket 기반 실시간 채팅
- 실제 외부 제작 API 연동
- 결제/배송/환불 연동
- PDF 다운로드 또는 인쇄용 파일 생성
- 모바일 UI 고도화
