# Branch Convention

## Basic Format

```text
<type>-<issue-number>
```

Branch names are written in English and ASCII only.

## Examples

```text
feature-1
docs-2
fix-3
test-4
build-5
chore-6
```

## Type Rules

- `feature`: 기능 추가 또는 요구사항 변경
- `fix`: 버그 수정
- `docs`: 문서 추가 또는 수정
- `test`: 테스트 추가 또는 수정
- `refactor`: 동작 변화 없는 구조 개선
- `style`: UI 스타일, 포맷팅, CSS 수정
- `chore`: 설정, 디렉터리, 메타 작업
- `build`: Docker, 빌드 설정
- `ci`: GitHub Actions 등 CI 설정

`doc`은 사용하지 않고, 커밋 컨벤션의 `docs`와 맞춰 `docs`를 사용한다.

## Issue-Based Workflow

- 하나의 브랜치는 하나의 GitHub Issue를 기준으로 생성한다.
- `issue-number`는 GitHub Issue 번호를 사용한다.
- 브랜치명에는 작업 설명을 길게 넣지 않는다.
- 작업 상세, 요구사항, 체크리스트, 산출물 링크는 GitHub Issue와 Project 카드에 기록한다.
- 작업 완료 후 `main`에 반영되어도 이슈 브랜치는 보존한다.
- 브랜치 삭제는 사용자가 명시적으로 요청한 경우에만 수행한다.

## Main Branch Rule

- `main`은 항상 제출 가능한 안정 상태로 유지한다.
- 기능 구현, 문서 작성, 테스트 추가는 이슈 기반 브랜치에서 진행한다.
- 긴급한 경우가 아니면 `main`에 직접 커밋하지 않는다.

## Naming Restrictions

- 브랜치명에 회사명, 채용 전형명, 특정 회사 식별자를 포함하지 않는다.
- 브랜치명에 한글, 공백, 특수문자를 사용하지 않는다.
- 의미가 불분명한 임시 이름을 사용하지 않는다.

## Commit Relation

브랜치 타입과 커밋 타입은 다음처럼 대응한다.

```text
feature-1 -> feat(scope): 한글 요약
docs-2    -> docs(scope): 한글 요약
fix-3     -> fix(scope): 한글 요약
test-4    -> test(scope): 한글 요약
```
