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
  total_orders int not null default 0,   -- 成交 + 退货总和
  total_units int not null default 0,
  organic_orders int not null default 0,
  paid_orders int not null default 0,
  refund_orders int not null default 0,  -- 退货订单数
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
  refund int not null default 0,         -- 该价格档退货数
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

-- ============================================================
-- 迁移脚本：已有数据库执行这两行补列即可（新建库不需要）
-- alter table daily_orders add column if not exists refund_orders int not null default 0;
-- alter table daily_prices add column if not exists refund int not null default 0;
-- ============================================================

-- ============================================================
-- 达人明细表（按产品+日期+达人+渠道聚合）
-- ============================================================
create table if not exists creator_daily (
  id serial primary key,
  product_id text not null references products(id),
  date date not null,
  creator text not null,
  channel text not null default '',         -- 视频 / 直播
  orders int not null default 0,
  organic_orders int not null default 0,
  paid_orders int not null default 0,
  refund_orders int not null default 0,
  unique(product_id, date, creator, channel)
);

-- 达人佣金率分布表（按产品+日期+达人+佣金率+类型聚合）
create table if not exists creator_commission (
  id serial primary key,
  product_id text not null references products(id),
  date date not null,
  creator text not null,
  commission_type text not null,            -- organic / paid
  commission_rate text not null,            -- 原始字符串如 "10%"
  orders int not null default 0,
  unique(product_id, date, creator, commission_type, commission_rate)
);

alter table creator_daily enable row level security;
alter table creator_commission enable row level security;

create policy "public read creator_daily" on creator_daily for select using (true);
create policy "public read creator_commission" on creator_commission for select using (true);
create policy "service write creator_daily" on creator_daily for all using (true);
create policy "service write creator_commission" on creator_commission for all using (true);

-- 迁移（已有库执行）：
-- 在 Supabase SQL Editor 执行上面的 create table 语句即可
