const form = document.querySelector('#contact-form');
const draft = document.querySelector('#sms-draft');
const preview = document.querySelector('#sms-preview');
const openSms = document.querySelector('#open-sms');
const smsRecipient = openSms.getAttribute('href');

for (const field of [form.elements.name, form.elements.message]) {
  field.addEventListener('input', () => field.setCustomValidity(''));
}

form.addEventListener('input', () => {
  draft.hidden = true;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const message = form.elements.message.value.trim();

  form.elements.name.setCustomValidity(name ? '' : 'Вкажіть ваше ім’я.');
  form.elements.message.setCustomValidity(message ? '' : 'Введіть повідомлення.');
  if (!form.reportValidity()) return;

  const lines = ['Запит до Postavka', name];
  if (phone) lines.push('Телефон: ' + phone);
  lines.push(message);

  preview.value = lines.join('\n');
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const separator = isAppleMobile ? '&' : '?';
  openSms.href = smsRecipient + separator + 'body=' + encodeURIComponent(preview.value);
  draft.hidden = false;
  preview.focus();
});

form.hidden = false;
