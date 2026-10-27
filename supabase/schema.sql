-- Postgres / Supabase equivalent of the SQLite schema in src/lib/db.ts.
-- The app talks to the database only through src/lib/repo.ts, auth.ts, orders.ts and db.ts,
-- so moving to Postgres means reimplementing those four files against this schema.
-- Row-level security: all access in this app goes through the server with the service role,
-- so enable RLS on every table and add no public policies.

create table products (
  id bigint generated always as identity primary key,
  slug text unique not null, name text not null, subtitle text not null default '',
  gender text not null, category text not null, style text not null, kind text not null, season text not null default 'core',
  price integer not null, mrp integer not null,
  is_new boolean not null default false, is_bestseller boolean not null default false,
  description text not null default '', fabric text not null default '', fit text not null default '',
  care jsonb not null default '[]', details jsonb not null default '[]',
  colors jsonb not null default '[]', sizes jsonb not null default '[]', size_guide text not null default 'one',
  images jsonb not null default '{}',
  rating numeric(2,1) not null default 0, rating_count integer not null default 0, popularity integer not null default 0,
  created_at timestamptz not null default now()
);
create table variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  color text not null, size text not null, stock integer not null default 0 check (stock >= 0),
  unique (product_id, color, size)
);
create table users (
  id bigint generated always as identity primary key,
  email citext unique not null, name text not null, phone text, password_hash text not null,
  created_at timestamptz not null default now()
);
-- If you adopt Supabase Auth instead, drop users/sessions and reference auth.users(id).
create table sessions (token_hash text primary key, user_id bigint not null references users(id) on delete cascade, expires_at timestamptz not null);
create table wishlist (
  user_id bigint not null references users(id) on delete cascade,
  product_id bigint not null references products(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, product_id)
);
create table reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  user_id bigint references users(id) on delete set null,
  author text not null, city text not null default '', rating integer not null check (rating between 1 and 5),
  title text not null, body text not null, verified boolean not null default false, is_sample boolean not null default false,
  created_at timestamptz not null default now(), unique (product_id, user_id)
);
create table coupons (
  code citext primary key, type text not null, value integer not null default 0,
  min_subtotal integer not null default 0, max_discount integer not null default 0,
  description text not null default '', active boolean not null default true, expires_at timestamptz
);
create table orders (
  id bigint generated always as identity primary key,
  number text unique not null, user_id bigint references users(id) on delete set null,
  email text not null, phone text not null,
  status text not null, payment_method text not null, payment_status text not null,
  razorpay_order_id text, razorpay_payment_id text,
  subtotal integer not null, discount integer not null, shipping integer not null, cod_fee integer not null, total integer not null,
  coupon_code text, address jsonb not null, created_at timestamptz not null default now(), paid_at timestamptz
);
create index on orders(user_id);
create index on orders(razorpay_order_id);
create table order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id bigint not null, slug text not null, name text not null, kind text not null,
  color text not null, color_hex text not null, size text not null, qty integer not null, price integer not null
);
create table subscribers (email citext primary key, created_at timestamptz not null default now());

alter table products enable row level security; alter table variants enable row level security;
alter table users enable row level security; alter table sessions enable row level security;
alter table wishlist enable row level security; alter table reviews enable row level security;
alter table coupons enable row level security; alter table orders enable row level security;
alter table order_items enable row level security; alter table subscribers enable row level security;

-- Atomic stock reservation (call inside a transaction when creating an order):
--   update variants set stock = stock - $qty where product_id=$1 and color=$2 and size=$3 and stock >= $qty;
--   -- if no row was updated, abort: the item sold out.
