# Assignment Test

A full-stack web application prototype built for a timed implementation assignment.

## Status

Lv1 implementation skeleton is in progress.

## Project Board

- [Assignment Test Kanban](https://github.com/users/passionryu/projects/6)

## AI Agent System

![AI Agent System](docs/agents/assets/agent-system-architecture.png)

## Project Goals

- Build a browser-based full-stack web application.
- Provide a one-command Docker execution path.
- Include seed data so reviewers can inspect the service immediately.
- Document planning, implementation, review, and QA evidence in the repository.

## Directory Structure

```text
docs/
  plan/       Planning, requirements, decisions, AI usage, and screen specs
  dev-spec/   Feature-level implementation specs
  qa/         Issue-scoped verification, review, security, and QA reports

docs/qa/
  issue-3/
    테크리드_에이전트_1차검증.md
    코드리뷰_에이전트_코드_리뷰.md
    보안_에이전트_보안_리뷰.md
    QA_레포트.md
  issue-4/
    테크리드_에이전트_1차검증.md
    코드리뷰_에이전트_코드_리뷰.md
    보안_에이전트_보안_리뷰.md
    QA_레포트.md
  issue-5/
    테크리드_에이전트_1차검증.md
    코드리뷰_에이전트_코드_리뷰.md
    보안_에이전트_보안_리뷰.md
    QA_레포트.md

service/
  server/     Backend application
  client/     Frontend application
  infra/      Docker and deployment-related configuration

test-results/
  playwright/ Playwright evidence reports, screenshots, videos, and traces
```

New AI QA runs use `docs/qa/issue-{issueNumber}/QA_레포트.html` as the primary browser-readable report. Existing Markdown QA reports remain as historical records or short indexes.

## Execution

Run the local workspace with Docker:

```bash
docker compose -f service/infra/docker-compose.yml up --build
```

Local URLs:

- Client: http://localhost:5173
- Server: http://localhost:8080
- Health check: http://localhost:8080/api/health

Default local API header:

```text
X-Member-Id: 1
```

The Docker setup starts PostgreSQL, runs server migrations, inserts local seed data, and serves the Vite client.
