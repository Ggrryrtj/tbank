// Theme toggle
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const moonSVG = `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="#fff"/>`;
const sunSVG = themeIcon.innerHTML;
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.style.background = document.body.classList.contains('dark') ? '#ffdd2d' : '#af52de';
  themeIcon.innerHTML = document.body.classList.contains('dark') ? moonSVG : sunSVG;
});

// Operations data
const operations = [
  { date: '24 марта', total: '+1 186,85 ₽', items: [
    { name: 'Фирузахон А.', cat: 'Переводы · Дебетовая карта', amt: '+300 ₽', plus: true, av: 'Ф', bg: '#ffcc00' },
    { name: 'Ашан', cat: 'Супермаркеты · Дебетовая карта', amt: '99,99 ₽', av: 'А', bg: '#e63946' },
    { name: 'Вывод с брокерского сч.', cat: 'Переводы · Дебетовая карта', amt: '+785,82 ₽', plus: true, av: 'Т', bg: '#ffdd2d' },
    { name: 'Ярослав Т.', cat: 'Переводы · Дебетовая карта', amt: '+284 ₽', plus: true, av: 'Я', bg: '#5856d6' },
    { name: 'Ашан', cat: 'Супермаркеты · Дебетовая карта', amt: '82,98 ₽', av: 'А', bg: '#e63946' },
  ]},
  { date: '23 марта', total: '−1 009 ₽', items: [
    { name: 'Вкусно — и точка', cat: 'Рестораны · Дебетовая карта', amt: '505 ₽', av: 'В', bg: '#2d6a1f' },
    { name: 'Ярослав Т.', cat: 'Переводы · Дебетовая карта', amt: '504 ₽', av: 'Я', bg: '#5856d6' },
  ]},
  { date: '22 марта', total: '−612 ₽', items: [
    { name: 'Пятёрочка', cat: 'Супермаркеты · Дебетовая карта', amt: '412 ₽', av: 'П', bg: '#e30613' },
    { name: 'Метро', cat: 'Транспорт · Дебетовая карта', amt: '200 ₽', av: 'М', bg: '#0078d2' },
  ]},
];

function openOperations() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-header">
      <button class="close">Закрыть</button>
      <div class="title">Операции</div>
      <div class="spacer"></div>
    </div>
    <div class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input placeholder="Поиск"></div>
    <div class="op-list">
      ${operations.map(group => `
        <div class="op-date"><span class="label">${group.date}</span><span class="total">${group.total}</span></div>
        ${group.items.map(op => `
          <div class="op">
            <span class="op-av" style="background:${op.bg}">${op.av}</span>
            <div class="op-info">
              <div class="op-row"><span class="op-name">${op.name}</span><span class="op-amt ${op.plus ? 'plus' : ''}">${op.amt}</span></div>
              <div class="op-cat">${op.cat}</div>
            </div>
          </div>
        `).join('')}
      `).join('')}
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.close').addEventListener('click', () => modal.remove());
}

// Card "Все операции" → open list
document.querySelector('.card.stats').addEventListener('click', openOperations);

// Accounts
document.querySelectorAll('.account').forEach(a => {
  a.addEventListener('click', () => openOperations());
});

// Bottom nav switching
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const tab = item.dataset.tab;
    if (tab === 'chat') {
      alert('Чат: 20 новых сообщений');
    } else if (tab === 'pay') {
      alert('Раздел "Платежи"');
    } else if (tab === 'city') {
      alert('Раздел "Город"');
    } else if (tab === 'shop') {
      alert('Раздел "Витрина"');
    }
  });
});

// Profile click
document.getElementById('profileBtn').addEventListener('click', () => {
  alert('Профиль: Ярослав');
});

// Action buttons
document.querySelectorAll('.action').forEach((b, i) => {
  const labels = ['Перевод по телефону', 'Пополнение Black', 'Сканирование QR', 'Оплата айфоном'];
  b.addEventListener('click', () => alert(labels[i]));
});
