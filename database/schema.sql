-- Tabelas do sistema de autoatendimento do restaurante
-- Rodar no SQL Editor do Supabase, nesta ordem (products depende de categories)

create table categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    description varchar(255),
    icon varchar(50),
    display_order integer not null default 0,
    active boolean not null default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null,
    name varchar(150) not null,
    description varchar(500),
    price numeric(10, 2) not null,
    available boolean not null default true,
    active boolean not null default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),

    constraint fk_products_category
        foreign key (category_id)
        references categories(id)
);
