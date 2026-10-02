const loginForm = document.getElementById('admin-login');
const editor = document.getElementById('admin-editor');
const adminForm = document.getElementById('admin-form');
const adminStatus = document.getElementById('admin-status');
let db;
let content;
let lastSavedContent;
const loginStatus = document.getElementById('admin-login-status');

const fields = {
  services: [
    { key: 'icon', label: 'Значок (эмодзи)' },
    { key: 'title', label: 'Название услуги', required: true },
    { key: 'description', label: 'Описание', multiline: true },
    { key: 'featured', label: 'Показывать как акцию', checkbox: true }
  ],
  masters: [
    { key: 'name', label: 'Имя мастера', required: true },
    { key: 'role', label: 'Специализация' },
    { key: 'photo', label: 'Фото (JPG, PNG или WebP)', image: true }
  ],
  gallery: [
    { key: 'alt', label: 'Описание фото', required: true },
    { key: 'src', label: 'Фото (JPG, PNG или WebP)', image: true }
  ]
};

const settings = [
  { path: 'brand.eyebrow', label: 'Короткая подпись' },
  { path: 'brand.title', label: 'Название студии', required: true },
  { path: 'brand.subtitle', label: 'Текст на главном экране', multiline: true },
  { path: 'offer.title', label: 'Заголовок акции' },
  { path: 'offer.text', label: 'Описание акции', multiline: true },
  { path: 'contact.address', label: 'Адрес' },
  { path: 'contact.phone', label: 'Телефон', type: 'tel' },
  { path: 'contact.hours', label: 'Часы работы' },
  { path: 'contact.telegram', label: 'Ссылка на Telegram', type: 'url' },
  { path: 'contact.whatsapp', label: 'Ссылка на WhatsApp', type: 'url' }
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function getPath(object, path) { return path.split('.').reduce((value, key) => value?.[key], object) ?? ''; }
function setPath(object, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((node, key) => node[key] ??= {}, object);
  target[last] = value;
}

function fieldControl(field, value, attribute) {
  const name = attribute ? `${attribute}="${field.key}"` : `data-setting="${field.path}"`;
  const escaped = esc(value);
  const required = field.required ? 'required' : '';
  if (field.checkbox) return `<label class="admin-check"><input type="checkbox" ${name} ${value ? 'checked' : ''} /> ${esc(field.label)}</label>`;
  const inputType = field.type || 'text';
  const control = field.multiline
    ? `<textarea ${name} ${required}>${escaped}</textarea>`
    : `<input type="${inputType}" ${name} value="${escaped}" ${required} />`;
  return `<label>${esc(field.label)}${control}</label>`;
}

function renderCollection(name) {
  const root = document.getElementById(`admin-${name}`);
  const list = content[name] || [];
  root.innerHTML = list.length ? list.map((item, index) => {
    const controls = fields[name].map((field) => {
      if (!field.image) return fieldControl(field, item[field.key], 'data-field');
      const url = item[field.key] || '';
      const preview = url ? `<img class="admin-photo-preview" src="${esc(url)}" alt="" />` : '';
      const required = name === 'gallery' && !url ? 'required' : '';
      return `<label>${esc(field.label)}${preview}<input type="file" accept="image/jpeg,image/png,image/webp" data-upload="${field.key}" ${required} /><input type="hidden" data-field="${field.key}" value="${esc(url)}" /><input type="hidden" data-field="${field.key}StoragePath" value="${esc(item[`${field.key}StoragePath`] || '')}" /></label>`;
    }).join('');
    return `<fieldset class="admin-item" data-collection="${name}" data-index="${index}"><legend>${esc(item.title || item.name || item.alt || `Элемент ${index + 1}`)}</legend><input type="hidden" data-field="id" value="${esc(item.id || crypto.randomUUID())}" />${controls}<button class="btn btn--ghost" type="button" data-remove>Удалить</button></fieldset>`;
  }).join('') : '<p class="admin-note">Пока ничего не добавлено.</p>';
}

function syncStateFromForm() {
  for (const input of adminForm.querySelectorAll('[data-setting]')) setPath(content, input.dataset.setting, input.value.trim());
  for (const name of Object.keys(fields)) {
    const cards = [...document.querySelectorAll(`.admin-item[data-collection="${name}"]`)];
    content[name] = cards.map((card) => {
      const item = {};
      for (const input of card.querySelectorAll('[data-field]')) {
        if (input.type === 'checkbox') item[input.dataset.field] = input.checked;
        else item[input.dataset.field] = input.value.trim();
      }
      return item;
    });
  }
}

function drawEditor() {
  document.getElementById('admin-settings').innerHTML = settings.map((field) => fieldControl(field, getPath(content, field.path))).join('');
  Object.keys(fields).forEach(renderCollection);
}

async function loadEditor(session) {
  const { data: permitted, error: permissionError } = await db.rpc('is_site_admin');
  if (permissionError || permitted !== true) {
    await db.auth.signOut();
    throw new Error('Этот аккаунт ещё не добавлен как владелец сайта. Выполните шаг 4 из README.md.');
  }
  const { data, error } = await db.from('site_content').select('data').eq('id', 1).single();
  if (error) throw error;
  content = data.data;
  lastSavedContent = structuredClone(content);
  document.getElementById('admin-user').textContent = `Вошли как ${session.user.email}`;
  loginForm.hidden = true;
  editor.hidden = false;
  drawEditor();
}

if (!window.SITE_SUPABASE_URL || !window.SITE_SUPABASE_KEY || !window.supabase) {
  const note = document.createElement('p');
  note.className = 'admin-note';
  note.textContent = 'Сначала настройте Supabase и заполните js/supabase-config.js по инструкции в README.md.';
  loginForm.before(note);
} else {
  db = window.supabase.createClient(window.SITE_SUPABASE_URL, window.SITE_SUPABASE_KEY);
  db.auth.getSession().then(({ data: { session } }) => session && loadEditor(session).catch((error) => { loginStatus.textContent = error.message; }));
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!db) return;
  loginStatus.textContent = 'Выполняется вход…';
  const formData = new FormData(loginForm);
  const { data, error } = await db.auth.signInWithPassword({ email: formData.get('email'), password: formData.get('password') });
  if (error) { loginStatus.textContent = 'Не удалось войти. Проверьте почту и пароль.'; return; }
  try { await loadEditor(data.session); adminStatus.textContent = ''; }
  catch (error) { loginStatus.textContent = error.message; }
});

document.getElementById('admin-logout').addEventListener('click', async () => {
  await db.auth.signOut();
  editor.hidden = true;
  loginForm.hidden = false;
});

document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
  syncStateFromForm();
  const collection = button.dataset.add;
  const fresh = { id: crypto.randomUUID() };
  if (collection === 'services') Object.assign(fresh, { icon: '✨', title: '', description: '', featured: false });
  if (collection === 'masters') Object.assign(fresh, { name: '', role: '', photo: '', photoStoragePath: '' });
  if (collection === 'gallery') Object.assign(fresh, { alt: '', src: '', srcStoragePath: '' });
  content[collection].push(fresh);
  renderCollection(collection);
  document.querySelector(`#admin-${collection} [data-index="${content[collection].length - 1}"] input:not([type=hidden]):not([type=file])`)?.focus();
}));

document.querySelectorAll('.admin-list').forEach((root) => {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const card = button.closest('.admin-item');
    const name = card.querySelector('legend').textContent;
    if (!window.confirm(`Удалить «${name}» после сохранения изменений?`)) return;
    syncStateFromForm();
    const collection = card.dataset.collection;
    content[collection].splice(Number(card.dataset.index), 1);
    renderCollection(collection);
  });

  root.addEventListener('change', async (event) => {
    const fileInput = event.target.closest('[data-upload]');
    if (!fileInput || !fileInput.files?.[0]) return;
    const file = fileInput.files[0];
    const card = fileInput.closest('.admin-item');
    const status = adminStatus;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      status.textContent = 'Выберите JPG, PNG или WebP размером до 5 МБ.';
      fileInput.value = '';
      return;
    }
    status.textContent = 'Загружаю фотографию…';
    const folder = card.dataset.collection;
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from('site-images').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (error) { status.textContent = `Фото не загружено: ${error.message}`; return; }
    const { data } = db.storage.from('site-images').getPublicUrl(path);
    const photoField = fileInput.dataset.upload;
    card.querySelector(`[data-field="${photoField}"]`).value = data.publicUrl;
    card.querySelector(`[data-field="${photoField}StoragePath"]`).value = path;
    const preview = card.querySelector('.admin-photo-preview');
    if (preview) preview.src = data.publicUrl;
    else fileInput.insertAdjacentHTML('beforebegin', `<img class="admin-photo-preview" src="${esc(data.publicUrl)}" alt="" />`);
    status.textContent = 'Фото загружено. Нажмите «Сохранить изменения», чтобы опубликовать.';
  });
});

adminForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!adminForm.reportValidity()) return;
  syncStateFromForm();
  const oldPaths = new Set([...(lastSavedContent.masters || []).map((item) => item.photoStoragePath), ...(lastSavedContent.gallery || []).map((item) => item.srcStoragePath)].filter(Boolean));
  const currentPaths = new Set([...(content.masters || []).map((item) => item.photoStoragePath), ...(content.gallery || []).map((item) => item.srcStoragePath)].filter(Boolean));
  const removedPaths = [...oldPaths].filter((path) => !currentPaths.has(path));
  if (removedPaths.length && !window.confirm(`Изменения навсегда удалят ${removedPaths.length} фотографий из облачного хранилища. Продолжить?`)) return;
  adminStatus.textContent = 'Сохраняю…';
  const { error } = await db.from('site_content').update({ data: content, updated_at: new Date().toISOString() }).eq('id', 1);
  if (error) { adminStatus.textContent = `Не удалось сохранить: ${error.message}`; return; }
  if (removedPaths.length) {
    const { error: imageError } = await db.storage.from('site-images').remove(removedPaths);
    if (imageError) { adminStatus.textContent = `Изменения сохранены, но старые фото не удалось удалить из хранилища: ${imageError.message}`; lastSavedContent = structuredClone(content); return; }
  }
  lastSavedContent = structuredClone(content);
  adminStatus.textContent = 'Изменения сохранены. Они появятся на сайте после обновления страницы.';
});


// Password setup and recovery for the site owner.
const recoveryButton = document.createElement('button');
recoveryButton.type = 'button';
recoveryButton.className = 'btn btn--ghost';
recoveryButton.textContent = 'Задать или восстановить пароль';
loginForm.querySelector('button[type="submit"]').after(recoveryButton);

const recoveryForm = document.createElement('form');
recoveryForm.className = 'admin-card';
recoveryForm.hidden = true;
recoveryForm.innerHTML =
  '<h2>Задайте новый пароль</h2>' +
  '<label class="booking__field">Новый пароль<input name="new-password" type="password" autocomplete="new-password" minlength="8" required /></label>' +
  '<label class="booking__field">Повторите пароль<input name="confirm-password" type="password" autocomplete="new-password" minlength="8" required /></label>' +
  '<button class="btn btn--primary" type="submit">Сохранить пароль</button>' +
  '<p class="admin-note" data-recovery-status aria-live="polite"></p>';
loginForm.after(recoveryForm);
const recoveryStatus = recoveryForm.querySelector('[data-recovery-status]');

function showRecoveryForm() {
  loginForm.hidden = true;
  editor.hidden = true;
  recoveryForm.hidden = false;
  recoveryStatus.textContent = 'Введите и подтвердите новый пароль.';
}

recoveryButton.addEventListener('click', async () => {
  const email = loginForm.elements.namedItem('email');
  if (!email.reportValidity()) return;
  loginStatus.textContent = 'Отправляю письмо…';
  const { error } = await db.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: window.location.href.split('#')[0]
  });
  loginStatus.textContent = error
    ? 'Не удалось отправить письмо. Проверьте настройки почты Supabase.'
    : 'Письмо отправлено. Перейдите по ссылке в письме, чтобы задать пароль.';
});

recoveryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = recoveryForm.elements.namedItem('new-password').value;
  const confirmation = recoveryForm.elements.namedItem('confirm-password').value;
  if (password !== confirmation) {
    recoveryStatus.textContent = 'Пароли не совпадают.';
    return;
  }
  recoveryStatus.textContent = 'Сохраняю пароль…';
  const { error } = await db.auth.updateUser({ password });
  if (error) {
    recoveryStatus.textContent = 'Не удалось сохранить пароль. Возможно, ссылка уже устарела.';
    return;
  }
  recoveryStatus.textContent = 'Пароль сохранён. Открываю панель…';
  const { data: { session } } = await db.auth.getSession();
  if (session) await loadEditor(session);
  else {
    recoveryForm.hidden = true;
    loginForm.hidden = false;
    loginStatus.textContent = 'Пароль сохранён. Теперь войдите с новым паролем.';
  }
});

db.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') showRecoveryForm();
});
if (window.location.hash.includes('type=recovery')) showRecoveryForm();
