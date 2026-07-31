alter table notifications
    add column if not exists actor_member_id bigint references members (id);

create index if not exists idx_notifications_actor_member_id on notifications (actor_member_id);
