create table if not exists chat_messages (
    id bigserial primary key,
    room_id bigint not null references rooms (id),
    sender_member_id bigint not null references members (id),
    body text not null,
    sent_at timestamptz not null default now(),
    occurred_date date not null,
    deleted_at timestamptz
);

create index if not exists idx_chat_messages_room_sent_at on chat_messages (room_id, sent_at);
create index if not exists idx_chat_messages_room_occurred_date on chat_messages (room_id, occurred_date);

create table if not exists memory_posts (
    id bigserial primary key,
    room_id bigint not null references rooms (id),
    author_member_id bigint not null references members (id),
    title varchar(120) not null,
    body text not null,
    representative_image_url varchar(500),
    image_count integer not null default 0,
    occurred_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create index if not exists idx_memory_posts_room_created_at on memory_posts (room_id, created_at);
create index if not exists idx_memory_posts_room_occurred_date on memory_posts (room_id, occurred_date);

create table if not exists memory_comments (
    id bigserial primary key,
    memory_post_id bigint not null references memory_posts (id),
    author_member_id bigint not null references members (id),
    body text not null,
    created_at timestamptz not null default now(),
    deleted_at timestamptz
);

create index if not exists idx_memory_comments_post_created_at on memory_comments (memory_post_id, created_at);

create table if not exists missions (
    id bigserial primary key,
    room_id bigint not null references rooms (id),
    title varchar(120) not null,
    description text not null,
    status varchar(30) not null,
    created_by_member_id bigint not null references members (id),
    created_at timestamptz not null default now(),
    completed_at timestamptz
);

create index if not exists idx_missions_room_status on missions (room_id, status);

create table if not exists mission_submissions (
    id bigserial primary key,
    mission_id bigint not null references missions (id),
    submitter_member_id bigint not null references members (id),
    body text not null,
    image_url varchar(500),
    occurred_date date not null,
    submitted_at timestamptz not null default now()
);

create index if not exists idx_mission_submissions_mission_submitted_at on mission_submissions (mission_id, submitted_at);

create table if not exists mission_approvals (
    id bigserial primary key,
    mission_submission_id bigint not null references mission_submissions (id),
    approver_member_id bigint not null references members (id),
    decision varchar(20) not null,
    decided_at timestamptz not null default now(),
    constraint uq_mission_approvals_submission_approver unique (mission_submission_id, approver_member_id)
);

create table if not exists letters (
    id bigserial primary key,
    room_id bigint not null references rooms (id),
    sender_member_id bigint not null references members (id),
    receiver_member_id bigint not null references members (id),
    title varchar(120) not null,
    body text not null,
    occurred_date date not null,
    sent_at timestamptz not null default now(),
    read_at timestamptz,
    deleted_by_sender_at timestamptz,
    deleted_by_receiver_at timestamptz
);

create index if not exists idx_letters_room_sent_at on letters (room_id, sent_at);
create index if not exists idx_letters_receiver_sent_at on letters (receiver_member_id, sent_at);
create index if not exists idx_letters_sender_sent_at on letters (sender_member_id, sent_at);
