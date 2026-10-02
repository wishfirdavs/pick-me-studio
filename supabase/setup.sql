-- Pick Me Studio: run this once in Supabase Dashboard > SQL Editor.
-- Use only the publishable key in js/supabase-config.js. Never put a secret/service key in the site.
create table if not exists public.site_content (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;
create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.site_admins where user_id = (select auth.uid())); $$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;
grant select on public.site_content to anon, authenticated;
grant update (data, updated_at) on public.site_content to authenticated;
drop policy if exists "Anyone can read website content" on public.site_content;
create policy "Anyone can read website content" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "Only site admins can update website content" on public.site_content;
create policy "Only site admins can update website content" on public.site_content for update to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
drop policy if exists "Public can view site images" on storage.objects;
create policy "Public can view site images" on storage.objects for select to anon, authenticated using (bucket_id = 'site-images');
drop policy if exists "Site admins can upload site images" on storage.objects;
create policy "Site admins can upload site images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and (select public.is_site_admin()));
drop policy if exists "Site admins can update site images" on storage.objects;
create policy "Site admins can update site images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and (select public.is_site_admin())) with check (bucket_id = 'site-images' and (select public.is_site_admin()));
drop policy if exists "Site admins can delete site images" on storage.objects;
create policy "Site admins can delete site images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and (select public.is_site_admin()));
insert into public.site_content (id, data) values (1, $json$
{
  "brand":{"eyebrow":"салон красоты · студия эстетики","title":"Pick Me Studio","subtitle":"Ресницы, брови, ногти, макияж и локоны — всё для твоего идеального образа в одном месте"},
  "offer":{"title":"Макияж + Локоны со скидкой","text":"Полный образ под ключ — макияж и укладка. Идеально для выпускного, свадьбы, фотосессии или особенного вечера."},
  "contact":{"address":"","phone":"","hours":"","telegram":"","whatsapp":""},
  "services":[
    {"id":"lamination","icon":"👁️","title":"Ламинирование ресниц и бровей","description":"Долговременная укладка, питание и блеск. Эффект до 6–8 недель."},
    {"id":"lashes","icon":"✨","title":"Наращивание ресниц","description":"Классика, 2D, 3D, объёмные и нестандартные типы. Подберём изгиб и длину под форму глаз."},
    {"id":"nails","icon":"💅","title":"Наращивание ногтей","description":"Стандартные формы и нестандартные дизайны: френч, градиент, роспись, стразы, 3D."},
    {"id":"manicure","icon":"🌸","title":"Маникюр","description":"Аппаратный и комбинированный. Покрытие гель-лаком, уход за кутикулой."},
    {"id":"pedicure","icon":"🦶","title":"Педикюр","description":"Обработка стоп, покрытие, уход. Комфорт и аккуратность."},
    {"id":"makeup","icon":"💄","title":"Макияж","description":"Дневной, вечерний, свадебный, фото. Подбираем под тип кожи и образ."},
    {"id":"curls","icon":"🌀","title":"Локоны","description":"Голливудская волна, мягкие локоны, укладка на торжество."},
    {"id":"look","icon":"🎀","title":"Макияж + Локоны","description":"Комплексный образ для выпускного, свадьбы или фотосессии.","featured":true}
  ],
  "masters":[{"id":"gulnaz","name":"Гульназ","role":"Ламинирование ресниц и бровей","photo":"images/masters/gulnaz.jpeg"}],
  "gallery":[
    {"id":"work-1","src":"images/gallery/work-1.jpg","alt":"Работа мастера студии — фото 1"},
    {"id":"work-2","src":"images/gallery/work-2.jpg","alt":"Работа мастера студии — фото 2"},
    {"id":"work-3","src":"images/gallery/work-3.jpg","alt":"Работа мастера студии — фото 3"},
    {"id":"work-4","src":"images/gallery/work-4.jpg","alt":"Работа мастера студии — фото 4"}
  ]
}
$json$::jsonb) on conflict (id) do nothing;
-- Create the owner in Authentication > Users. Then replace the email and run this separately:
-- insert into public.site_admins (user_id) select id from auth.users where email = 'OWNER_EMAIL_HERE' on conflict do nothing;
