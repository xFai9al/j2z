-- Run this in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)

create table if not exists public.links (
  id          uuid        default gen_random_uuid() primary key,
  slug        text        unique not null,
  original_url text       not null,
  clicks      bigint      default 0 not null,
  created_at  timestamptz default now() not null
);

create index if not exists links_slug_idx on public.links (slug);

-- Row Level Security
alter table public.links enable row level security;

create policy "Public read"   on public.links for select using (true);
create policy "Public insert" on public.links for insert with check (true);
create policy "Public update" on public.links for update using (true);
