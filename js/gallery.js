/* ============================================================
   СПИСОК ФОТО ГАЛЕРЕИ
   ------------------------------------------------------------
   Чтобы ДОБАВИТЬ фото — скопируй строку и вставь ниже.
   Чтобы УДАЛИТЬ — удали строку.
   ------------------------------------------------------------
   Фото складывай в папку: images/gallery/
   ============================================================ */

const gallery = [
  { src: "images/gallery/work-1.jpg", alt: "Работа мастера студии — фото 1" },
  { src: "images/gallery/work-2.jpg", alt: "Работа мастера студии — фото 2" },
  { src: "images/gallery/work-3.jpg", alt: "Работа мастера студии — фото 3" },
  { src: "images/gallery/work-4.jpg", alt: "Работа мастера студии — фото 4" }
];

/* ------------------------------------------------------------
   Настройки: сколько фото показывать сразу и по сколько
   подгружать по кнопке «Показать ещё»
   ------------------------------------------------------------ */
const GALLERY_INITIAL = 4;   // показывать сразу
const GALLERY_STEP    = 6;   // добавлять за один клик

/* --- Дальше код сам отрисует галерею, трогать не надо --- */

let galleryShown = 0;

function renderGallery(container, from, to) {
  const slice = gallery.slice(from, to);
  const html = slice.map(function (item, i) {
    const index = from + i;
    return `
      <button class="gallery__item" type="button" data-index="${index}" aria-label="Открыть фото: ${item.alt}">
        <img src="${item.src}" alt="${item.alt}" loading="lazy" />
      </button>
    `;
  }).join('');
  container.insertAdjacentHTML('beforeend', html);
}

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('gallery-grid');
  const moreBtn = document.getElementById('gallery-more');
  if (!grid) return;

  // Первая партия
  renderGallery(grid, 0, GALLERY_INITIAL);
  galleryShown = Math.min(GALLERY_INITIAL, gallery.length);

  // Кнопка «Показать ещё»
  if (moreBtn) {
    if (galleryShown >= gallery.length) {
      moreBtn.style.display = 'none';
    }
    moreBtn.addEventListener('click', function () {
      const from = galleryShown;
      const to = Math.min(galleryShown + GALLERY_STEP, gallery.length);
      renderGallery(grid, from, to);
      galleryShown = to;

      if (galleryShown >= gallery.length) {
        moreBtn.style.display = 'none';
      }
    });
  }

  // ==== ЛАЙТБОКС ====
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox__close" aria-label="Закрыть">×</button>
    <button class="lightbox__nav lightbox__nav--prev" aria-label="Назад">‹</button>
    <img class="lightbox__img" src="" alt="" />
    <button class="lightbox__nav lightbox__nav--next" aria-label="Вперёд">›</button>
  `;
  document.body.appendChild(lightbox);

  const lbImg   = lightbox.querySelector('.lightbox__img');
  const lbClose = lightbox.querySelector('.lightbox__close');
  const lbPrev  = lightbox.querySelector('.lightbox__nav--prev');
  const lbNext  = lightbox.querySelector('.lightbox__nav--next');

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lbImg.src = gallery[index].src;
    lbImg.alt = gallery[index].alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % gallery.length;
    lbImg.src = gallery[currentIndex].src;
    lbImg.alt = gallery[currentIndex].alt;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    lbImg.src = gallery[currentIndex].src;
    lbImg.alt = gallery[currentIndex].alt;
  }

  // Клик по картинке — открыть лайтбокс
  grid.addEventListener('click', function (e) {
    const item = e.target.closest('.gallery__item');
    if (!item) return;
    openLightbox(Number(item.dataset.index));
  });

  // Управление
  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', showNext);
  lbPrev.addEventListener('click', showPrev);

  // Клик по фону — закрыть
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Клавиатура
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
});
