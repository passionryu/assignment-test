create table if not exists mission_comments (
    id bigserial primary key,
    mission_id bigint not null references missions (id),
    author_member_id bigint not null references members (id),
    body text not null,
    created_at timestamptz not null default now(),
    deleted_at timestamptz
);

create index if not exists idx_mission_comments_mission_created_at on mission_comments (mission_id, created_at);
