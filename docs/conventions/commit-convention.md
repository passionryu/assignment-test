# Commit Convention

## Basic Format

```text
<type>(scope): Korean summary
```

`type` and `scope` are written in English, and the summary is written in Korean.

## Examples

```text
feat(auth): 회원가입 기능 구현
fix(auth): 회원가입 이메일 검증 오류 수정
docs(agents): PM/PO 에이전트 운영 문서 추가
docs(plan): 과제 요구사항 정리
test(qa): 주문 플로우 E2E 테스트 추가
chore(project): 초기 디렉터리 구조 정리
```

## Types

- `feat`: 기능 추가 또는 요구사항 변경
- `fix`: 버그 수정
- `docs`: 문서 추가 또는 수정
- `test`: 테스트 추가 또는 수정
- `refactor`: 동작 변화 없는 구조 개선
- `style`: UI 스타일, 포맷팅, CSS 수정
- `chore`: 설정, 디렉터리, 메타 작업
- `build`: Docker, 빌드 설정
- `ci`: GitHub Actions 등 CI 설정

## Rules

- 커밋 메시지에 회사명 또는 채용 전형명을 포함하지 않는다.
- 변경 의도가 드러나도록 작성한다.
- 버그 수정이 아닌 요구사항 변경은 `fix`가 아니라 `feat` 또는 `refactor`를 사용한다.
- scope는 변경 범위를 짧게 나타낸다.

## Requirement Change Example

이메일 필드 제거처럼 요구사항이 바뀐 경우에는 `fix`를 사용하지 않는다.

```text
feat(auth): 회원가입 이메일 필드 제거
```
