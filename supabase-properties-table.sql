-- 매물 등록 폼(src/components/join/registration.tsx)을 저장할 테이블
-- Supabase 대시보드 > SQL Editor 에서 그대로 실행하면 됩니다.
-- 정책(policy)은 "drop policy if exists" 후 "create policy" 하는 방식이라
-- 여러 번 실행해도 에러 없이 안전합니다.

create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,

  -- Step 1: 기본 정보
  address text not null,
  sub_address text,
  zonecode text,
  building_type text not null,
  total_floor integer,
  current_floor integer,

  -- Step 2: 상세 정보
  title text not null,
  description text,
  thumbnail_url text,
  detail_image_urls text[] not null default '{}',

  -- Step 3: 가격 및 관리비
  deal_type text,
  price numeric,
  management_fee numeric,
  no_management_fee boolean not null default false,
  included_items text[] not null default '{}',

  -- 매물 상태: review(검토중) / published(게시) / private(비공개)
  status text not null default 'review',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

-- 본인이 등록한 매물만 조회/수정/삭제할 수 있도록 제한
-- (같은 이름의 정책이 이미 있으면 지우고 다시 만듦 -> 여러 번 실행해도 안전)
drop policy if exists "properties_select_own" on public.properties;
create policy "properties_select_own"
  on public.properties for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "properties_insert_own" on public.properties;
create policy "properties_insert_own"
  on public.properties for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "properties_update_own" on public.properties;
create policy "properties_update_own"
  on public.properties for update
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "properties_delete_own" on public.properties;
create policy "properties_delete_own"
  on public.properties for delete
  to authenticated
  using (auth.uid() = owner_id);

-- =========================================================
-- 이미지 업로드용 Storage 버킷 + 접근 정책
-- =========================================================

-- "property-images" 라는 이름의 공개 버킷(사진 창고)을 만듦
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- 로그인한 사용자는 "본인 아이디로 시작하는 폴더"에만 업로드할 수 있음
-- (예: 업로드 경로가 "{내 uid}/파일이름" 형태여야 통과됨)
drop policy if exists "property_images_insert_own" on storage.objects;
create policy "property_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 사진은 매물 목록/상세 화면에서 누구나 볼 수 있어야 하므로 전체 공개로 읽기 허용
drop policy if exists "property_images_select_all" on storage.objects;
create policy "property_images_select_all"
  on storage.objects for select
  to public
  using (bucket_id = 'property-images');

-- 본인이 올린 사진만 삭제할 수 있음
drop policy if exists "property_images_delete_own" on storage.objects;
create policy "property_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- properties 테이블을 예전 버전(이미지 컬럼 없는 상태)으로 이미 만들었다면
-- 아래 두 줄도 실행해서 컬럼을 추가해 주세요. (이미 있으면 무시됨)
-- =========================================================
alter table public.properties add column if not exists thumbnail_url text;
alter table public.properties add column if not exists detail_image_urls text[] not null default '{}';
