/* ============================================================
   СПИСОК МАСТЕРОВ
   ------------------------------------------------------------
   Чтобы ДОБАВИТЬ мастера — скопируй блок { ... } и заполни.
   Чтобы УДАЛИТЬ — просто удали весь блок мастера (с { до },).
   ------------------------------------------------------------
   Поля:
     name  — имя мастера
     role  — специализация (например «Лашмейкер · бровист»)
     photo — путь к фото, например "images/masters/anna.jpg"
             если фото пока нет — оставь пустую строку ""
   ============================================================ */

const masters = [
  { name: "Гульназ", role: "Ламинирование ресниц и бровей", photo: "images/masters/gulnaz.jpeg" }
];

/* --- Дальше код сам отрисует мастеров, трогать не надо --- */

function createMasterCard(master) {
  const photoContent = master.photo
    ? `<img src="${master.photo}" alt="${master.name}" />`
    : `<span>Фото</span>`;

  return `
    <article class="master">
      <div class="master__photo">${photoContent}</div>
      <h3 class="master__name">${master.name}</h3>
      <p class="master__role">${master.role}</p>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', function () {
  // Превью на главной — первые 3 мастера
  const previewEl = document.getElementById('masters-preview');
  if (previewEl) {
    previewEl.innerHTML = masters.slice(0, 3).map(createMasterCard).join('');
  }

  // Полный список на странице мастеров
  const fullEl = document.getElementById('masters-full');
  if (fullEl) {
    fullEl.innerHTML = masters.map(createMasterCard).join('');
  }
});
