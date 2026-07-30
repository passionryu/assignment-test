create table if not exists members (
    id bigint primary key,
    display_name varchar(50) not null,
    username varchar(40) not null unique,
    email varchar(255) not null unique,
    phone_number varchar(30) not null unique,
    profile_image_url varchar(500),
    password_hash varchar(255) not null,
    is_deleted boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists rooms (
    id bigint primary key,
    name varchar(80) not null,
    description varchar(255),
    type varchar(20) not null,
    owner_member_id bigint not null references members (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    archived_at timestamptz
);

create index if not exists idx_rooms_owner_member_id on rooms (owner_member_id);
create index if not exists idx_rooms_created_at on rooms (created_at);

create table if not exists room_members (
    id bigint primary key,
    room_id bigint not null references rooms (id),
    member_id bigint not null references members (id),
    role varchar(20) not null,
    joined_at timestamptz not null default now(),
    left_at timestamptz,
    constraint uq_room_members_room_member unique (room_id, member_id)
);

create index if not exists idx_room_members_member_id on room_members (member_id);

create table if not exists room_invitations (
    id bigint primary key,
    room_id bigint not null references rooms (id),
    inviter_member_id bigint not null references members (id),
    invitee_email varchar(255),
    invitee_phone_number varchar(30),
    invitee_member_id bigint references members (id),
    status varchar(20) not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    responded_at timestamptz,
    constraint ck_room_invitations_invitee_required check (
        invitee_email is not null or invitee_phone_number is not null
    )
);

create index if not exists idx_room_invitations_room_status on room_invitations (room_id, status);
create index if not exists idx_room_invitations_member_status on room_invitations (invitee_member_id, status);
create index if not exists idx_room_invitations_email_status on room_invitations (invitee_email, status);
create index if not exists idx_room_invitations_phone_status on room_invitations (invitee_phone_number, status);
