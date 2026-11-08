const challenges = [
  { id: '25k-1step', category: '1-Step', account: 25000, price: 149, targets: [10], dailyLoss: 4, totalLoss: 8 },
  { id: '50k-1step', category: '1-Step', account: 50000, price: 249, targets: [10], dailyLoss: 4, totalLoss: 8 },
  { id: '25k-2step', category: '2-Step', account: 25000, price: 119, targets: [8, 5], dailyLoss: 5, totalLoss: 10 },
  { id: '50k-2step', category: '2-Step', account: 50000, price: 199, targets: [8, 5], dailyLoss: 5, totalLoss: 10 }
];

const catalog = document.querySelector('#catalog');
const catalogStatus = document.querySelector('#catalog-status');
const filterButtons = document.querySelectorAll('[data-filter]');
const details = document.querySelector('#challenge-details');
const applyButton = document.querySelector('#details-apply');
const form = document.querySelector('#application-form');
const challengeSelect = document.querySelector('#app-challenge');
const nameInput = document.querySelector('#app-name');
const result = document.querySelector('#application-result');
const themeButton = document.querySelector('#theme-toggle');
const numberFormat = new Intl.NumberFormat('en-US');

function dollars(amount) {
  return '$' + numberFormat.format(amount).replaceAll(',', ' ');
}

function targetsText(challenge) {
  return challenge.targets.map(target => target + '%').join(' / ');
}

function renderCatalog(category) {
  const visible = category === 'all'
    ? challenges
    : challenges.filter(challenge => challenge.category === category);

  catalog.innerHTML = visible.map(challenge => `
    <div class="col-12 col-sm-6 col-xl-3">
      <article class="card challenge h-100">
        <div class="card-body d-flex flex-column p-3 p-lg-4">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
            <span class="badge challenge-tag">${challenge.category}</span>
            <span class="small text-body-secondary">Демо</span>
          </div>
          <h3 class="challenge-name mb-1">${dollars(challenge.account)}</h3>
          <p class="small text-body-secondary mb-3">Розмір рахунку</p>
          <dl class="detail-list small mb-3">
            <div><dt>Ціль прибутку</dt><dd>${targetsText(challenge)}</dd></div>
            <div><dt>Денний ліміт</dt><dd>${challenge.dailyLoss}%</dd></div>
            <div><dt>Загальний ліміт</dt><dd>${challenge.totalLoss}%</dd></div>
          </dl>
          <p class="challenge-price mt-auto mb-3">${dollars(challenge.price)} <span class="small fw-normal text-body-secondary">за участь</span></p>
          <button class="btn btn-outline-secondary w-100" type="button" data-bs-toggle="modal" data-bs-target="#challenge-details"
                  data-challenge="${challenge.id}" aria-label="Умови ${dollars(challenge.account)} · ${challenge.category}">Деталі <i class="bi bi-arrow-up-right ms-1" aria-hidden="true"></i></button>
        </div>
      </article>
    </div>`).join('');
  catalogStatus.textContent = 'Челенджів у списку: ' + visible.length;
}

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    for (const option of filterButtons) {
      option.classList.toggle('active', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    }
    renderCatalog(button.dataset.filter);
  });
}

for (const challenge of challenges) {
  challengeSelect.add(new Option(dollars(challenge.account) + ' · ' + challenge.category, challenge.id));
}

details.addEventListener('show.bs.modal', event => {
  const challenge = challenges.find(item => item.id === event.relatedTarget?.dataset.challenge);
  if (!challenge) {
    event.preventDefault();
    return;
  }

  details.querySelector('#details-title').textContent = dollars(challenge.account) + ' · ' + challenge.category;
  details.querySelector('#details-data').innerHTML = `
    <div><dt>Вартість участі</dt><dd>${dollars(challenge.price)}</dd></div>
    ${challenge.targets.map((target, index) => `
      <div><dt>Ціль етапу ${index + 1}</dt><dd>${target}% · ${dollars(challenge.account * target / 100)}</dd></div>`).join('')}
    <div><dt>Денний ліміт збитку</dt><dd>${challenge.dailyLoss}%</dd></div>
    <div><dt>Загальний ліміт збитку</dt><dd>${challenge.totalLoss}%</dd></div>`;
  applyButton.dataset.challenge = challenge.id;
});

applyButton.addEventListener('click', () => {
  challengeSelect.value = applyButton.dataset.challenge;
  result.className = 'mt-3 mb-0';
  result.textContent = '';
  // Move focus after Bootstrap closes the modal and restores its trigger.
  details.addEventListener('hidden.bs.modal', () => {
    requestAnimationFrame(() => nameInput.focus());
  }, { once: true });
});

function validateName() {
  nameInput.setCustomValidity(nameInput.value.trim().length < 2 ? 'Введи щонайменше два символи.' : '');
}

nameInput.addEventListener('input', validateName);

form.addEventListener('submit', event => {
  event.preventDefault();
  validateName();
  result.className = 'mt-3 mb-0';
  result.textContent = '';

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    form.querySelector(':invalid').focus();
    return;
  }

  result.classList.add('alert', 'alert-success');
  result.textContent = 'Готово. Демо-заявку на ' + challengeSelect.selectedOptions[0].textContent + ' перевірено.';
  globalThis.bootstrap?.Toast.getOrCreateInstance(document.querySelector('#application-toast')).show();
  form.reset();
  nameInput.setCustomValidity('');
  form.classList.remove('was-validated');
});

themeButton.addEventListener('click', () => {
  const root = document.documentElement;
  const light = root.dataset.bsTheme === 'dark';
  root.dataset.bsTheme = light ? 'light' : 'dark';
  themeButton.setAttribute('aria-pressed', String(light));
  themeButton.setAttribute('aria-label', light ? 'Перемкнути темну тему' : 'Перемкнути світлу тему');
  themeButton.firstElementChild.className = light ? 'bi bi-moon-stars' : 'bi bi-sun';
});

renderCatalog('all');
