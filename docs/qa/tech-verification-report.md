# Tech Verification Report

## curl Verification

### Environment

- branch: feature-3
- docker command: `docker compose -f service/infra/docker-compose.yml up --build`
- server url: `http://localhost:8080`
- client url: `http://localhost:5173`

### Issue #3 Scope

- server skeleton
- client skeleton
- PostgreSQL connection
- Flyway migration
- local seed runner
- health check API
- README execution guide

### Happy Cases

| Case | Result | Note |
| --- | --- | --- |
| Server health check | Pass | `GET /api/health` returned `{"status":"UP","database":"UP"}` |
| Client page load | Pass | `HEAD http://localhost:5173` returned HTTP 200 |
| DB migration and seed | Pass | Flyway applied 3 migrations and seed inserted 4 members, 3 rooms, 6 room members, 1 notification setting |
| Seed idempotence | Pass | Server restart kept the same seed counts |
| Client production build | Pass | `npm run build` completed successfully |
| Docker compose config | Pass | `docker compose -f service/infra/docker-compose.yml config` completed successfully |
| Docker client build context | Pass | `.dockerignore` reduced client build context to source files |

### Edge Cases

| Case | Result | Note |
| --- | --- | --- |
| DB unavailable | Deferred | Covered by DB-dependent startup and `/api/health`; explicit failure simulation is left for later QA because the container currently depends on a healthy DB |

### Known Issues

- Full Lv1 feature curl cases are handled by later feature issues.
- Local machine has Java and Node, but no local Gradle binary. Server build was verified through Docker's Gradle image.
