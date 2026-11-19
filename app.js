const form = document.querySelector('#quote-form');
const volume = document.querySelector('#volume');
const summary = document.querySelector('#summary');
const request = document.querySelector('#request');
const status = document.querySelector('#status');
const dimensions = ['length', 'width', 'height'];
const format = new Intl.NumberFormat('uk-UA', { maximumSignificantDigits: 8 });

function cargoVolume() {
  const values = dimensions.map(name => form.elements[name].valueAsNumber);
  const boxes = form.elements.boxes.valueAsNumber;
  if (values.some(value => !(value > 0)) || !(boxes > 0)) return null;
  const cubicMeters = values.reduce((result, value) => result * value, boxes) / 1_000_000;
  return Number.isFinite(cubicMeters) ? cubicMeters : null;
}

form.addEventListener('input', () => {
  const hasDimensions = dimensions.some(name => form.elements[name].value !== '');
  for (const name of dimensions) form.elements[name].required = hasDimensions;
  form.elements.boxes.required = hasDimensions;
  const measuredVolume = cargoVolume();
  volume.textContent = measuredVolume === null ? '' : 'Загальний об’єм: ' + format.format(measuredVolume) + ' м³';
  request.hidden = true;
});

const initialMode = new URLSearchParams(location.search).get('mode');
if (initialMode && [...form.elements.mode.options].some(opt => opt.value === initialMode)) {
  form.elements.mode.value = initialMode;
}

for (const link of document.querySelectorAll('[data-mode]')) {
  link.addEventListener('click', () => {
    form.elements.mode.value = link.dataset.mode;
    request.hidden = true;
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const city = data.get('city').trim();
  const product = data.get('product').trim();
  if (!city || !product) {
    status.textContent = 'Вкажіть місто доставки й опишіть товар.';
    summary.value = '';
    request.hidden = false;
    form.elements[city ? 'product' : 'city'].focus();
    return;
  }
  const lines = ['Добрий день! Прошу розрахувати доставку з Китаю в Україну.',
    'Спосіб: ' + data.get('mode'), 'Місто доставки: ' + city, 'Товар: ' + product];
  if (data.get('weight')) lines.push('Загальна вага: ' + data.get('weight') + ' кг');
  const measuredVolume = cargoVolume();
  if (measuredVolume !== null) {
    lines.push('Коробки: ' + data.get('boxes') + ' шт., ' + dimensions.map(name => data.get(name)).join(' × ') + ' см',
      'Загальний об’єм: ' + format.format(measuredVolume) + ' м³');
  }
  summary.value = lines.join('\n');
  status.textContent = 'Запит підготовлено. Скопіюйте його для листування з менеджером або зателефонуйте.';
  request.hidden = false;
  summary.focus();
});

document.querySelector('#copy').addEventListener('click', async () => {
  if (!summary.value) return;
  try {
    await navigator.clipboard.writeText(summary.value);
    status.textContent = 'Запит скопійовано.';
  } catch {
    summary.focus();
    summary.select();
    status.textContent = 'Текст виділено. Скопіюйте його вручну.';
  }
});
