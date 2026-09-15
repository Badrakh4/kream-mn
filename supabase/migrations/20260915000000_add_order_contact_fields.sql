alter table public.orders
  add column if not exists facebook_profile_url text,
  add column if not exists messenger_username text,
  add column if not exists instagram_username text;

update public.orders
set messenger_username = nullif(trim(regexp_replace(messenger, '^@+', '')), '')
where messenger_username is null
  and messenger is not null;