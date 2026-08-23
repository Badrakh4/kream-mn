alter table public.products
  add column if not exists source_url text,
  add column if not exists source_name text,
  add column if not exists source_product_id text,
  add column if not exists price_krw integer,
  add column if not exists exchange_rate numeric,
  add column if not exists exchange_rate_date date,
  add column if not exists imported_at timestamptz,
  add column if not exists last_synced_at timestamptz,
  add column if not exists import_status text;

alter table public.products
  drop constraint if exists products_source_url_https_check,
  add constraint products_source_url_https_check
    check (source_url is null or source_url ~ '^https://');

alter table public.products
  drop constraint if exists products_price_krw_positive_check,
  add constraint products_price_krw_positive_check
    check (price_krw is null or price_krw > 0);

alter table public.products
  drop constraint if exists products_exchange_rate_positive_check,
  add constraint products_exchange_rate_positive_check
    check (exchange_rate is null or exchange_rate > 0);