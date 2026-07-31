create table if not exists notifications (
    id bigserial primary key,
    receiver_member_id bigint not null references members (id),
    room_id bigint references rooms (id),
    type varchar(40) not null,
    title varchar(120) not null,
    message varchar(255) not null,
    target_type varchar(40),
    target_id bigint,
    occurred_date date,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_notifications_receiver_created_at on notifications (receiver_member_id, created_at);
create index if not exists idx_notifications_receiver_read_at on notifications (receiver_member_id, read_at);

create table if not exists notification_settings (
    member_id bigint primary key references members (id),
    all_enabled boolean not null,
    chat_enabled boolean not null,
    letter_enabled boolean not null,
    memory_enabled boolean not null,
    mission_enabled boolean not null,
    updated_at timestamptz not null default now()
);
