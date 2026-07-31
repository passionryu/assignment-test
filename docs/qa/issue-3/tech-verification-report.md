# Tech Verification Report

## curl Verification

### Environment

- branch: feature-3
- docker command: `docker compose -f service/infra/docker-compose.yml up --build -d app-db app-server app-client`
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

### Review Fix Verification

| Case | Result | Note |
| --- | --- | --- |
| CR-001 identity migration | Pass | Added `V4__add_identity_to_member_and_room_tables.sql` to attach identity generation to `members`, `rooms`, `room_members`, `room_invitations` without rewriting already-applied migrations. |
| CR-001 runtime room insert | Pass | `insert into rooms (name, description, type, owner_member_id) values (...) returning id` succeeded without explicit id and returned `id=5`; transaction rolled back. |
| CR-001 seed sequence sync | Pass | `LocalSeedRunner` now calls `syncIdentitySequences()` after fixed-id seed upserts. |
| Seed idempotence after restart | Pass | After `docker compose ... restart app-server`, counts stayed `members=4`, `rooms=3`, `room_members=6`, `notification_settings=1`. |
| SEC-001 request id normalization | Pass | Invalid `X-Request-Id` is replaced with a generated UUID before MDC/response header use. |
| SEC-001 member id normalization | Pass | Invalid `X-Member-Id: abc` was logged as `who=invalid`; missing header remains `who=anonymous`. |

### Happy Cases

| Case | Result | Note |
| --- | --- | --- |
| Server health check | Pass | `GET /api/health` returned `{"status":"UP","database":"UP"}`. |
| Client page load | Pass | `HEAD http://localhost:5173` returned HTTP 200 in the previous Issue #3 verification. |
| DB migration and seed | Pass | Flyway validated 4 migrations and seed inserted 4 members, 3 rooms, 6 room members, 1 notification setting. |
| Seed idempotence | Pass | Server restart kept the same seed counts. |
| Client production build | Pass | `npm run build` completed successfully. |
| Docker compose config | Pass | `docker compose -f service/infra/docker-compose.yml config --quiet` completed successfully. |
| Docker app stack build | Pass | `docker compose -f service/infra/docker-compose.yml up --build -d app-db app-server app-client` rebuilt and started db, server, client. |
| Docker client build context | Pass | `.dockerignore` reduced client build context to source files. |

### Commands Executed

```bash
npm run build

docker compose -f service/infra/docker-compose.yml config --quiet

docker compose -f service/infra/docker-compose.yml up --build -d app-db app-server app-client

curl -s http://localhost:8080/api/health

docker compose -f service/infra/docker-compose.yml exec -T app-db psql -U assignment_user -d assignment_test -v ON_ERROR_STOP=1 -c "begin; insert into rooms (name, description, type, owner_member_id) values ('검토용 방', 'rollback', 'GROUP', 1) returning id; rollback;"

docker compose -f service/infra/docker-compose.yml restart app-server

docker compose -f service/infra/docker-compose.yml exec -T app-db psql -U assignment_user -d assignment_test -At -c "select 'members=' || count(*) from members union all select 'rooms=' || count(*) from rooms union all select 'room_members=' || count(*) from room_members union all select 'notification_settings=' || count(*) from notification_settings;"
```

### Edge Cases

| Case | Result | Note |
| --- | --- | --- |
| DB unavailable | Deferred | Covered by DB-dependent startup and `/api/health`; explicit failure simulation is left for later QA because the container currently depends on a healthy DB. |
| Existing DB with V1 already applied | Pass | V4 adds identity generation to existing tables, avoiding mutation of previously-applied V1 migration history. |

### Known Issues

- Full Lv1 feature curl cases are handled by later feature issues.
- Local machine has Java and Node, but no local Gradle binary. Server build was verified through Docker's Gradle image.
