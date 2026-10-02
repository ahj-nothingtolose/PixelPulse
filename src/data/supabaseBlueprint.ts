export const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- PixelPulse: 9:16 Vertical Photography Network — Supabase PostgreSQL Schema
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Enable UUID generation extension
create extension if not exists "pgcrypto";

-- 2. USERS / PROFILES TABLE (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  handle text unique not null check (char_length(handle) >= 3),
  display_name text not null,
  avatar_url text,
  avatar_color text default '#E11D48',
  bio text default '',
  location text default '',
  equipment text default '',
  followers_count integer default 0 not null,
  following_count integer default 0 not null,
  created_at timestamptz default now() not null
);

-- 3. POSTS TABLE (Strict 9:16 Vertical Media & Darkroom Filter Metadata)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  aspect_ratio text default '9:16' not null,
  caption text default '',
  location text default '',
  category text default 'Street & Night',
  exif_summary text default '35mm · f/1.8 · ISO 400',
  edit_settings jsonb default '{
    "exposure": 0,
    "contrast": 0,
    "saturation": 0,
    "temperature": 0,
    "isBlackAndWhite": false
  }'::jsonb not null,
  likes_count integer default 0 not null,
  comments_count integer default 0 not null,
  created_at timestamptz default now() not null
);

-- 4. LIKES TABLE (Composite Unique Constraint prevents duplicate likes)
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id)
);

-- 5. COMMENTS TABLE
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null check (char_length(trim(text)) > 0),
  created_at timestamptz default now() not null
);

-- 6. AUTOMATIC LIKE COUNTER TRIGGER
create or replace function public.handle_post_like_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.handle_post_like_count();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "9:16 Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Authenticated users can insert 9:16 posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Authenticated users can toggle own likes"
  on public.likes for all using (auth.uid() = user_id);

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can post comments"
  on public.comments for insert with check (auth.uid() = user_id);`;

export const SUPABASE_STORAGE_SQL = `-- ============================================================================
-- Supabase Storage Bucket & Policies for 9:16 Rendered Canvas Images
-- ============================================================================

-- 1. Create public bucket 'pixelpulse-media' (5MB limit, JPEG/PNG/WebP only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pixelpulse-media',
  'pixelpulse-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- 2. Allow public read access to all 9:16 photos
create policy "Public Access to 9:16 Photos"
  on storage.objects for select
  using (bucket_id = 'pixelpulse-media');

-- 3. Allow authenticated users to upload into their own user_id folder
create policy "Authenticated Users Upload 9:16 Photos"
  on storage.objects for insert
  with check (
    bucket_id = 'pixelpulse-media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );`;

export const SUPABASE_CLIENT_SNIPPET = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an edited 9:16 HTML5 Canvas Blob to Supabase Storage
 * and creates the corresponding row in public.posts
 */
export async function publishVerticalPost({
  canvas,
  userId,
  caption,
  location,
  exifSummary,
  editSettings,
}: {
  canvas: HTMLCanvasElement;
  userId: string;
  caption: string;
  location: string;
  exifSummary: string;
  editSettings: Record<string, unknown>;
}) {
  // 1. Export 9:16 HTML5 Canvas (1080x1920) as compressed JPEG Blob
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  );
  if (!blob) throw new Error('Failed to encode 9:16 canvas image');

  // 2. Upload to Supabase Storage bucket 'pixelpulse-media'
  const filePath = \`\${userId}/\${Date.now()}-9x16.jpg\`;
  const { error: uploadError } = await supabase.storage
    .from('pixelpulse-media')
    .upload(filePath, blob, { contentType: 'image/jpeg', upsert: false });

  if (uploadError) throw uploadError;

  // 3. Retrieve public CDN URL
  const { data: urlData } = supabase.storage
    .from('pixelpulse-media')
    .getPublicUrl(filePath);

  // 4. Insert Post record into PostgreSQL
  const { data: post, error: dbError } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      image_url: urlData.publicUrl,
      aspect_ratio: '9:16',
      caption,
      location,
      exif_summary: exifSummary,
      edit_settings: editSettings,
    })
    .select('*, profiles(handle, display_name, avatar_url)')
    .single();

  if (dbError) throw dbError;
  return post;
}`;
