const DEFAULT_SITE_CONTENT = {
  brand: { eyebrow: 'салон красоты · студия эстетики', title: 'Pick Me Studio', subtitle: 'Ресницы, брови, ногти, макияж и локоны — всё для твоего идеального образа в одном месте' },
  offer: { title: 'Макияж + Локоны со скидкой', text: 'Полный образ под ключ — макияж и укладка. Идеально для выпускного, свадьбы, фотосессии или особенного вечера.' },
  contact: { address: '', phone: '', hours: '', telegram: '', whatsapp: '' },
  services: [
    { id: 'lamination', icon: '👁️', title: 'Ламинирование ресниц и бровей', description: 'Долговременная укладка, питание и блеск. Эффект до 6–8 недель.' },
    { id: 'lashes', icon: '✨', title: 'Наращивание ресниц', description: 'Классика, 2D, 3D, объёмные и нестандартные типы. Подберём изгиб и длину под форму глаз.' },
    { id: 'nails', icon: '💅', title: 'Наращивание ногтей', description: 'Стандартные формы и нестандартные дизайны: френч, градиент, роспись, стразы, 3D.' },
    { id: 'manicure', icon: '🌸', title: 'Маникюр', description: 'Аппаратный и комбинированный. Покрытие гель-лаком, уход за кутикулой.' },
    { id: 'pedicure', icon: '🦶', title: 'Педикюр', description: 'Обработка стоп, покрытие, уход. Комфорт и аккуратность.' },
    { id: 'makeup', icon: '💄', title: 'Макияж', description: 'Дневной, вечерний, свадебный, фото. Подбираем под тип кожи и образ.' },
    { id: 'curls', icon: '🌀', title: 'Локоны', description: 'Голливудская волна, мягкие локоны, укладка на торжество.' },
    { id: 'look', icon: '🎀', title: 'Макияж + Локоны', description: 'Комплексный образ для выпускного, свадьбы или фотосессии.', featured: true }
  ],
  masters: [{ id: 'gulnaz', name: 'Гульназ', role: 'Ламинирование ресниц и бровей', photo: 'images/masters/gulnaz.jpeg' }],
  gallery: [1, 2, 3, 4].map((n) => ({ id: `work-${n}`, src: `images/gallery/work-${n}.jpg`, alt: `Работа мастера студии — фото ${n}` }))
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function safeWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function renderService(service) {
  return `<article class="service${service.featured ? ' service--accent' : ''}">${service.featured ? '<span class="service__badge">Акция</span>' : ''}<div class="service__icon">${escapeHtml(service.icon)}</div><h3 class="service__title">${escapeHtml(service.title)}</h3><p class="service__text">${escapeHtml(service.description)}</p></article>`;
}

function renderMaster(master) {
  const photo = master.photo
    ? `<img src="${escapeHtml(master.photo)}" alt="${escapeHtml(master.name)}" loading="lazy" />`
    : '<span>Фото</span>';
  return `<article class="master"><div class="master__photo">${photo}</div><h3 class="master__name">${escapeHtml(master.name)}</h3><p class="master__role">${escapeHtml(master.role)}</p></article>`;
}

function renderContacts(contact) {
  const info = document.querySelector('.contacts__info');
  if (!info) return;
  const rows = [];
  if (contact.address) rows.push(`<div class="contact-item"><span class="contact-item__label">Адрес</span><p>${escapeHtml(contact.address)}</p></div>`);
  if (contact.phone) {
    const tel = contact.phone.replace(/[^+\d]/g, '');
    rows.push(`<div class="contact-item"><span class="contact-item__label">Телефон</span><p><a href="tel:${escapeHtml(tel)}">${escapeHtml(contact.phone)}</a></p></div>`);
  }
  if (contact.hours) rows.push(`<div class="contact-item"><span class="contact-item__label">Часы работы</span><p>${escapeHtml(contact.hours)}</p></div>`);
  const socials = [];
  const telegram = safeWebUrl(contact.telegram);
  const whatsapp = safeWebUrl(contact.whatsapp);
  if (telegram) socials.push(`<a href="${escapeHtml(telegram)}" target="_blank" rel="noopener noreferrer">Telegram</a>`);
  if (whatsapp) socials.push(`<a href="${escapeHtml(whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
  if (socials.length) rows.push(`<div class="contact-item"><span class="contact-item__label">Связаться</span><p class="socials">${socials.join('')}</p></div>`);
  if (!rows.length) rows.push('<div class="contact-item"><span class="contact-item__label">Контакты</span><p>Адрес и способы связи можно добавить в панели управления сайтом.</p></div>');
  info.innerHTML = rows.join('');
  const map = document.querySelector('.contacts__map');
  if (map) map.innerHTML = `<span>${contact.address ? escapeHtml(contact.address) : 'Добавьте адрес студии в панели управления'}<br>${contact.address ? 'Здесь можно разместить карту' : ''}</span>`;
}

function renderGallery(items) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  const moreButton = document.getElementById('gallery-more');
  const initial = Math.min(4, items.length);
  let shown = initial;
  const render = (from, to) => {
    grid.insertAdjacentHTML('beforeend', items.slice(from, to).map((item, i) => `<button class="gallery__item" type="button" data-index="${from + i}" aria-label="Открыть фото: ${escapeHtml(item.alt)}"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" /></button>`).join(''));
  };
  grid.innerHTML = '';
  render(0, initial);
  if (!moreButton) return;
  moreButton.hidden = shown >= items.length;
  moreButton.onclick = () => {
    render(shown, Math.min(shown + 4, items.length));
    shown = Math.min(shown + 4, items.length);
    moreButton.hidden = shown >= items.length;
  };

  const lightbox = document.querySelector('.lightbox');
  if (lightbox) lightbox.remove();
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Просмотр фотографии');
  box.innerHTML = '<button class="lightbox__close" aria-label="Закрыть">×</button><button class="lightbox__nav lightbox__nav--prev" aria-label="Назад">‹</button><img class="lightbox__img" src="" alt="" /><button class="lightbox__nav lightbox__nav--next" aria-label="Вперёд">›</button>';
  document.body.appendChild(box);
  let current = 0;
  const img = box.querySelector('.lightbox__img');
  const show = (index) => { current = (index + items.length) % items.length; img.src = items[current].src; img.alt = items[current].alt; };
  const close = () => { box.classList.remove('is-open'); document.body.style.overflow = ''; };
  grid.onclick = (event) => { const item = event.target.closest('.gallery__item'); if (!item) return; show(Number(item.dataset.index)); box.classList.add('is-open'); document.body.style.overflow = 'hidden'; box.querySelector('.lightbox__close').focus(); };
  box.querySelector('.lightbox__close').onclick = close;
  box.querySelector('.lightbox__nav--prev').onclick = () => show(current - 1);
  box.querySelector('.lightbox__nav--next').onclick = () => show(current + 1);
  box.onclick = (event) => { if (event.target === box) close(); };
  document.onkeydown = (event) => {
    if (!box.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'ArrowLeft') show(current - 1);
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  let content = DEFAULT_SITE_CONTENT;
  const configured = window.SITE_SUPABASE_URL && window.SITE_SUPABASE_KEY && window.supabase;
  if (configured) {
    try {
      const client = window.supabase.createClient(window.SITE_SUPABASE_URL, window.SITE_SUPABASE_KEY);
      const { data, error } = await client.from('site_content').select('data').eq('id', 1).single();
      if (error) throw error;
      content = data.data;
    } catch (error) {
      console.error('Не удалось загрузить данные сайта из облака:', error.message);
    }
  }
  window.currentSiteContent = content;
  window.siteContentReady = true;

  const eyebrow = document.querySelector('.hero__eyebrow');
  if (eyebrow) eyebrow.textContent = content.brand.eyebrow;
  const title = document.querySelector('.hero__title');
  if (title) {
    title.replaceChildren(document.createTextNode(content.brand.title.replace(/\s*Studio$/i, ' ')));
    if (/Studio$/i.test(content.brand.title)) {
      const studio = document.createElement('span'); studio.textContent = 'Studio'; title.appendChild(studio);
    }
  }
  const subtitle = document.querySelector('.hero__subtitle');
  if (subtitle) subtitle.textContent = content.brand.subtitle;
  const offerTitle = document.querySelector('.offer__title');
  if (offerTitle) offerTitle.textContent = content.offer.title;
  const offerText = document.querySelector('.offer__text');
  if (offerText) offerText.textContent = content.offer.text;
  const serviceGrid = document.getElementById('services-list');
  if (serviceGrid) serviceGrid.innerHTML = content.services.map(renderService).join('');
  const bookingSelect = document.querySelector('#booking-form select[name="service"]');
  if (bookingSelect) {
    const firstOption = bookingSelect.options[0];
    bookingSelect.replaceChildren(firstOption);
    content.services.forEach((service) => {
      const option = document.createElement('option');
      option.value = service.title;
      option.textContent = service.title;
      bookingSelect.appendChild(option);
    });
    const otherOption = document.createElement('option');
    otherOption.textContent = 'Хочу уточнить';
    bookingSelect.appendChild(otherOption);
  }
  const preview = document.getElementById('masters-preview');
  if (preview) preview.innerHTML = content.masters.slice(0, 3).map(renderMaster).join('');
  const full = document.getElementById('masters-full');
  if (full) full.innerHTML = content.masters.map(renderMaster).join('');
  renderContacts(content.contact);
  renderGallery(content.gallery);
});
