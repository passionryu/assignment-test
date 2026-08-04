create table if not exists book_presets (
    uid varchar(40) primary key,
    display_name varchar(80) not null,
    size_name varchar(40) not null,
    width_mm integer not null,
    height_mm integer not null,
    cover_type varchar(40) not null,
    binding_type varchar(40) not null,
    paper_description varchar(120) not null,
    min_page integer not null,
    max_page integer not null,
    base_price integer not null,
    included_page_count integer not null,
    additional_page_price integer not null,
    shipping_price integer not null,
    creation_type varchar(30) not null,
    note varchar(255) not null
);

insert into book_presets (
    uid,
    display_name,
    size_name,
    width_mm,
    height_mm,
    cover_type,
    binding_type,
    paper_description,
    min_page,
    max_page,
    base_price,
    included_page_count,
    additional_page_price,
    shipping_price,
    creation_type,
    note
) values
    (
        'PHOTOBOOK_A4_SC',
        'A4 소프트커버 포토북',
        'A4',
        210,
        297,
        'SOFTCOVER',
        '무선제본',
        '사진 중심 템플릿에 적합한 큰 판형',
        24,
        130,
        32000,
        40,
        300,
        3000,
        'TEMPLATE',
        '큰 사진과 긴 기록을 넉넉하게 보여주는 소프트커버 상품'
    ),
    (
        'PHOTOBOOK_A5_SC',
        'A5 소프트커버 포토북',
        'A5',
        148,
        210,
        'SOFTCOVER',
        '무선제본',
        '텍스트와 사진이 섞인 일상 기록에 적합한 휴대형 판형',
        50,
        200,
        28000,
        50,
        220,
        3000,
        'TEMPLATE',
        '추억 게시글, 미션, 편지를 길게 담기 좋은 소프트커버 상품'
    ),
    (
        'SQUAREBOOK_HC',
        '고화질 스퀘어북 (하드커버)',
        'Square',
        204,
        204,
        'HARDCOVER',
        '양장제본',
        '대표 사진과 기념일 기록을 강조하는 정사각 판형',
        24,
        130,
        46000,
        40,
        420,
        3000,
        'TEMPLATE',
        '기념 선물용 완성도를 강조한 하드커버 상품'
    )
on conflict (uid) do update set
    display_name = excluded.display_name,
    size_name = excluded.size_name,
    width_mm = excluded.width_mm,
    height_mm = excluded.height_mm,
    cover_type = excluded.cover_type,
    binding_type = excluded.binding_type,
    paper_description = excluded.paper_description,
    min_page = excluded.min_page,
    max_page = excluded.max_page,
    base_price = excluded.base_price,
    included_page_count = excluded.included_page_count,
    additional_page_price = excluded.additional_page_price,
    shipping_price = excluded.shipping_price,
    creation_type = excluded.creation_type,
    note = excluded.note;

create table if not exists book_previews (
    id bigserial primary key,
    member_id bigint not null references members (id),
    room_id bigint not null references rooms (id),
    book_spec_uid varchar(40) not null references book_presets (uid),
    creation_type varchar(30) not null,
    title varchar(120) not null,
    quantity integer not null,
    period_start_date date not null,
    period_end_date date not null,
    estimated_page_count integer not null,
    base_price integer not null,
    additional_page_price integer not null,
    shipping_price integer not null,
    total_price integer not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
);

create index if not exists idx_book_previews_member_created_at on book_previews (member_id, created_at desc);
create index if not exists idx_book_previews_room_created_at on book_previews (room_id, created_at desc);

create table if not exists book_preview_contents (
    id bigserial primary key,
    preview_id bigint not null references book_previews (id) on delete cascade,
    content_type varchar(30) not null,
    source_id bigint not null,
    title varchar(120) not null,
    occurred_date date not null,
    page_count integer not null,
    sort_order integer not null,
    snapshot_json text not null,
    constraint uq_book_preview_contents_preview_sort unique (preview_id, sort_order)
);

create index if not exists idx_book_preview_contents_preview on book_preview_contents (preview_id);
create index if not exists idx_book_preview_contents_source on book_preview_contents (content_type, source_id);

create table if not exists print_orders (
    id bigserial primary key,
    order_no varchar(40) not null unique,
    member_id bigint not null references members (id),
    room_id bigint not null references rooms (id),
    preview_id bigint references book_previews (id),
    book_spec_uid varchar(40) not null references book_presets (uid),
    creation_type varchar(30) not null,
    title varchar(120) not null,
    quantity integer not null,
    period_start_date date not null,
    period_end_date date not null,
    estimated_page_count integer not null,
    base_price integer not null,
    additional_page_price integer not null,
    shipping_price integer not null,
    total_price integer not null,
    status varchar(40) not null,
    requested_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    cancelled_at timestamptz,
    cancel_reason varchar(255)
);

create index if not exists idx_print_orders_member_requested_at on print_orders (member_id, requested_at desc);
create index if not exists idx_print_orders_status_requested_at on print_orders (status, requested_at desc);
create index if not exists idx_print_orders_room_requested_at on print_orders (room_id, requested_at desc);

create table if not exists print_order_contents (
    id bigserial primary key,
    order_id bigint not null references print_orders (id) on delete cascade,
    content_type varchar(30) not null,
    source_id bigint not null,
    title varchar(120) not null,
    occurred_date date not null,
    page_count integer not null,
    sort_order integer not null,
    snapshot_json text not null,
    constraint uq_print_order_contents_order_sort unique (order_id, sort_order)
);

create index if not exists idx_print_order_contents_order on print_order_contents (order_id);

create table if not exists print_order_status_histories (
    id bigserial primary key,
    order_id bigint not null references print_orders (id) on delete cascade,
    previous_status varchar(40),
    next_status varchar(40) not null,
    changed_by_member_id bigint references members (id),
    memo varchar(255),
    changed_at timestamptz not null default now()
);

create index if not exists idx_print_order_status_histories_order_changed_at
    on print_order_status_histories (order_id, changed_at desc);
