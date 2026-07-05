create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  full_name text,
  avatar_url text,
  email text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  is_admin boolean default false,
  user_type text,
  university text,
  company text,
  job_title text,
  income_range text,
  interests text[] default '{}',
  bio text,
  purpose text,
  invitation_code text,
  social_links jsonb default '{}',
  anonymous_title text,
  show_income boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text,
  display_name text,
  email text,
  user_type text,
  university text,
  company text,
  job_title text,
  income_range text,
  interests text[] default '{}',
  bio text,
  purpose text,
  invitation_code text,
  social_links jsonb default '{}',
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text unique not null,
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  title text not null,
  body text not null,
  category text,
  tags text[] default '{}',
  is_anonymous boolean default false,
  visibility text default 'public',
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  is_anonymous boolean default false,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text,
  location text,
  starts_at timestamptz,
  capacity integer,
  price integer,
  target_audience text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete cascade,
  target_type text,
  target_id uuid,
  reason text,
  detail text,
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.is_approved(target_user uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = target_user and status = 'approved');
$$;

create or replace function public.is_admin(target_user uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = target_user and is_admin = true);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, status)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

do $$
declare
  t text;
begin
  foreach t in array array['profiles','applications','rooms','posts','comments','likes','events','event_registrations','reports']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "approved can read profiles" on public.profiles for select using (public.is_approved() or public.is_admin());
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin profile update" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "profile insert own" on public.profiles for insert with check (auth.uid() = id);

create policy "application insert" on public.applications for insert with check (auth.uid() is null or auth.uid() = user_id);
create policy "own application read" on public.applications for select using (auth.uid() = user_id or public.is_admin());
create policy "admin application update" on public.applications for update using (public.is_admin()) with check (public.is_admin());

create policy "approved read rooms" on public.rooms for select using (public.is_approved() or public.is_admin());
create policy "admin write rooms" on public.rooms for all using (public.is_admin()) with check (public.is_admin());

create policy "approved read posts" on public.posts for select using ((public.is_approved() or public.is_admin()) and is_hidden = false);
create policy "admin read posts" on public.posts for select using (public.is_admin());
create policy "approved create posts" on public.posts for insert with check (public.is_approved() and auth.uid() = user_id);
create policy "own update posts" on public.posts for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "admin delete posts" on public.posts for delete using (public.is_admin());

create policy "approved read comments" on public.comments for select using ((public.is_approved() or public.is_admin()) and is_hidden = false);
create policy "approved create comments" on public.comments for insert with check (public.is_approved() and auth.uid() = user_id);
create policy "own update comments" on public.comments for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "approved read likes" on public.likes for select using (public.is_approved() or public.is_admin());
create policy "approved like" on public.likes for insert with check (public.is_approved() and auth.uid() = user_id);
create policy "own unlike" on public.likes for delete using (auth.uid() = user_id);

create policy "approved read events" on public.events for select using (public.is_approved() or public.is_admin());
create policy "admin write events" on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "approved read registrations" on public.event_registrations for select using (auth.uid() = user_id or public.is_admin());
create policy "approved register event" on public.event_registrations for insert with check (public.is_approved() and auth.uid() = user_id);

create policy "own report insert" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "admin read reports" on public.reports for select using (public.is_admin());
create policy "admin update reports" on public.reports for update using (public.is_admin()) with check (public.is_admin());

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger applications_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger rooms_updated_at before update on public.rooms for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger comments_updated_at before update on public.comments for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger reports_updated_at before update on public.reports for each row execute function public.set_updated_at();

insert into public.rooms (name, slug, category, description) values
('27卒・28卒トップ就活', 'top-shukatsu-27-28', '就活', '外資、商社、メガベンチャーなどを見据える学生の情報交換ルーム。'),
('外資コンサル', 'strategy-consulting', '転職', 'ケース、カルチャー、キャリアの本音を共有するルーム。'),
('外資金融', 'global-finance', '転職', 'IBD、マーケット、PEなど金融キャリアの意思決定ログ。'),
('総合商社', 'sogo-shosha', 'キャリア', '商社志望者と若手社員のキャリア対話。'),
('メガベンチャー', 'mega-venture', 'キャリア', '成長企業でのキャリア、事業開発、転職の話。'),
('起業準備', 'startup-prep', '起業', '起業アイデア、共同創業、検証ログを共有。'),
('AI・生成AI', 'generative-ai', 'AI', 'AI活用、副業、プロダクト開発の実践知。'),
('副業', 'side-business', '副業', '本業を持ちながら次の収入源をつくる。'),
('海外MBA', 'global-mba', '学び', 'MBA準備、留学、キャリアチェンジの相談。'),
('投資・資産形成', 'investment', '投資', '資産形成、スタートアップ投資、学びの共有。'),
('東京グルメ・会食', 'tokyo-dining', 'ライフスタイル', '会食、接待、気持ちのよい店選び。'),
('海外旅行・ライフスタイル', 'global-lifestyle', 'ライフスタイル', '移動、休暇、海外生活の知見。')
on conflict (slug) do nothing;

insert into public.events (title, description, event_type, location, starts_at, capacity, price, target_audience) values
('外コン・商社若手キャリア会', '若手プロフェッショナル同士でキャリアの本音を話す少人数会。', 'オフライン', '東京都内', now() + interval '10 days', 20, 3000, '若手社会人・学生'),
('AI副業アイデア会', '生成AIを使った副業テーマを持ち寄る実践会。', 'オンライン', 'Zoom', now() + interval '14 days', 50, 0, '副業・AI関心層'),
('起業準備中の人限定ピッチ会', '検証中のアイデアを5分で共有しフィードバックを得る会。', 'オンライン', 'Zoom', now() + interval '21 days', 30, 0, '起業志向層'),
('海外MBA検討者ミートアップ', '出願準備、キャリア設計、資金計画を話すミートアップ。', 'オフライン', '丸の内', now() + interval '28 days', 16, 2500, '海外MBA検討者'),
('ハイクラス転職の本音会', '転職エージェントに寄りすぎない、候補者同士のリアルな情報交換。', 'オンライン', 'Zoom', now() + interval '35 days', 40, 0, '若手プロフェッショナル')
on conflict do nothing;
