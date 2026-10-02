document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const result = document.getElementById('booking-result');
  const message = document.getElementById('booking-message');
  const copyButton = document.getElementById('booking-copy');
  const status = document.getElementById('booking-status');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const time = String(data.get('time') || '').trim();
    message.value = [
      `Здравствуйте! Меня зовут ${String(data.get('name')).trim()}.`,
      `Хочу записаться на услугу: ${String(data.get('service'))}.`,
      time ? `Удобное время: ${time}.` : ''
    ].filter(Boolean).join('\n');
    result.hidden = false;
    status.textContent = 'Сообщение подготовлено на этом устройстве. Скопируйте его и отправьте студии удобным способом.';
  });

  copyButton.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(message.value);
      status.textContent = 'Текст скопирован. Теперь его можно отправить студии.';
    } catch (error) {
      message.focus();
      message.select();
      status.textContent = 'Автокопирование недоступно. Выделите текст и скопируйте его вручную.';
    }
  });
});
