-- ============================================================
-- FireSwan 运营后台 · Supabase Schema
-- 在 Supabase Dashboard → SQL Editor 里执行此文件
-- ============================================================

-- 商品表
create table if not exists products (
  id text primary key,               -- 商品 ID (18位数字)
  internal_name text not null default '',
  full_name text not null default '',
  created_at timestamptz default now()
);

-- 每日订单汇总表
create table if not exists daily_orders (
  id serial primary key,
  product_id text not null references products(id),
  date date not null,
  total_orders int not null default 0,
  total_units int not null default 0,
  organic_orders int not null default 0,
  paid_orders int not null default 0,
  unique(product_id, date)
);

-- 每日价格档明细表
create table if not exists daily_prices (
  id serial primary key,
  product_id text not null references products(id),
  date date not null,
  unit_price numeric(10,2) not null,
  orders int not null default 0,
  units int not null default 0,
  organic int not null default 0,
  paid int not null default 0,
  unique(product_id, date, unit_price)
);

-- 开启 Row Level Security（允许匿名读）
alter table products enable row level security;
alter table daily_orders enable row level security;
alter table daily_prices enable row level security;

create policy "public read products" on products for select using (true);
create policy "public read daily_orders" on daily_orders for select using (true);
create policy "public read daily_prices" on daily_prices for select using (true);

-- 允许 service_role 写入（API route 用 service key）
create policy "service write products" on products for all using (true);
create policy "service write daily_orders" on daily_orders for all using (true);
create policy "service write daily_prices" on daily_prices for all using (true);
