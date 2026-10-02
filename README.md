# Pick Me Studio

Статический сайт с закрытой облачной панелью управления владельца. Файлы и история проекта хранятся в GitHub, сайт публикуется через GitHub Pages, а Supabase хранит редактируемое содержимое, фото и вход владельца. Панель: `/admin.html`.

## Подключение один раз

1. Распакуйте папку `pick-me-studio` и откройте её в VS Code. Создайте в GitHub публичный репозиторий для сайта и загрузите в него всё содержимое папки. Репозиторий нужен публичный для GitHub Pages на бесплатном GitHub Free. Сам сайт будет публичным в любом случае. Не добавляйте сюда пароли или приватные данные.
2. В GitHub откройте **Settings → Pages** и выберите **GitHub Actions** как источник публикации. Файл `.github/workflows/deploy.yml` публикует сайт после отправки изменений в ветку `main`.
3. Создайте проект Supabase. В **SQL Editor** выполните `supabase/setup.sql` целиком. Этот файл создаёт таблицу сайта, правила доступа и хранилище фотографий.
4. В **Authentication → Users** создайте учётную запись владельца. В настройках Auth отключите самостоятельную регистрацию новых пользователей. После создания пользователя в SQL Editor выполните запрос ниже, заменив email. Пароль создайте и храните сами.

   ```sql
   insert into public.site_admins (user_id)
   select id from auth.users where email = 'EMAIL_ВЛАДЕЛЬЦА'
   on conflict do nothing;
   ```

5. В Supabase откройте **Project Settings → API Keys**, скопируйте **Project URL** и **publishable key** (допускается старый `anon` key). Вставьте значения в `js/supabase-config.js`, сохраните и отправьте изменения в GitHub. Publishable/anon key предназначен для клиентского сайта; `secret` и `service_role` key нельзя помещать в сайт или отправлять мне.
6. Дождитесь зелёного завершения GitHub Actions и откройте адрес сайта из **Settings → Pages**. Панель находится по адресу `https://АДРЕС-САЙТА/admin.html`. Войдите созданной учётной записью.

После этого владелец сможет менять номер телефона, адрес, часы, тексты, акции и услуги; добавлять, редактировать и удалять мастеров и фото. При удалении загруженных в Supabase фотографий панель попросит подтвердить их окончательное удаление из хранилища.

## Важно

- Репозиторий GitHub Pages на бесплатном тарифе должен быть публичным, поэтому весь исходный код будет виден. Безопасность панели обеспечивается Supabase Auth, RLS и политиками в `supabase/setup.sql`.
- GitHub хранит и публикует файлы сайта. Supabase отдельно обеспечивает онлайн-редактирование. Git сам по себе не заменяет панель управления.
- Пока `js/supabase-config.js` пуст, главная страница показывает стартовый контент, а панель попросит подключить Supabase.
- Перед публикацией внесите настоящие контакты и фотографии салона.

## Документация сервисов

- [Создание сайта GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Публикация GitHub Pages через Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Политики доступа Supabase Storage](https://supabase.com/docs/guides/storage/security/access-control)
