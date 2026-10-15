// ============ STATE ============
const DEFAULT_STATE = {
  senderName: 'Ярослав Тюриков',
  shortName: 'Ярослав',
  balance: 6916.54,
  expenses: 31263,
  income: 57655,
  showDetails: true,
  screen: 'home',
  selectedOp: null,
  lastTransfer: null,
  transfer: { amount: '', phone: '', name: '' },
  operations: [
    { id: 1, date: '24 марта', name: 'Фирузахон А.', cat: 'Переводы', sub: 'Дебетовая карта', amt: 300, sign: '+', av: { img: true }, group: '+1 186,85 ₽' },
    { id: 2, date: '24 марта', name: 'Ашан', cat: 'Супермаркеты', sub: 'Дебетовая карта', amt: 99.99, sign: '-', av: { letter: 'А', bg: '#e63946' } },
    { id: 3, date: '24 марта', name: 'Вывод с брокерского сч.', cat: 'Переводы', sub: 'Дебетовая карта', amt: 785.82, sign: '+', av: { img: true } },
    { id: 4, date: '24 марта', name: 'Ярослав Т.', cat: 'Переводы', sub: 'Дебетовая карта', amt: 284, sign: '+', av: { img: true } },
    { id: 5, date: '24 марта', name: 'Ашан', cat: 'Супермаркеты', sub: 'Дебетовая карта', amt: 82.98, sign: '-', av: { letter: 'А', bg: '#e63946' } },
    { id: 6, date: '23 марта', name: 'Вкусно — и точка', cat: 'Супермаркеты', sub: 'Дебетовая карта', amt: 505, sign: '-', av: { letter: 'В', bg: '#2d6a1f' } },
    { id: 7, date: '23 марта', name: 'Ярослав Т.', cat: 'Переводы', sub: 'Дебетовая карта', amt: 504, sign: '-', av: { img: true } },
  ]
};

const previewScreen = new URLSearchParams(window.location.search).get('preview');
const isPreview = ['operation', 'receipt', 'success', 'result'].includes(previewScreen);
const STORAGE_KEY = 'tbank_mobile_demo_state';
let state = loadState();
let sheetReturnFocus = null;

function loadState() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_STATE));
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.operations)) return defaults;
      return { ...defaults, ...parsed, screen: 'home', selectedOp: null, lastTransfer: null, transfer: { ...defaults.transfer } };
    }
  } catch(e) {}
  return defaults;
}
function saveState() {
  if (isPreview) return; // Reference previews never overwrite the user's demo data.
  const { screen, selectedOp, lastTransfer, transfer, successIntro, receiptReturn, ...persist } = state;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persist)); } catch(e) {
    announce('Браузер не разрешает сохранение. Данные доступны до закрытия страницы.');
  }
}
function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

// ============ HELPERS ============
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const parseMoney = value => {
  const text = String(value ?? '').trim().replace(/\s/g, '');
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(text)) return NaN;
  const number = Number(text.replace(',', '.'));
  return Number.isFinite(number) && number <= 999999999.99 ? Math.round(number * 100) / 100 : NaN;
};
const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;
const validTransfer = () => {
  const amount = parseMoney(state.transfer.amount);
  return amount > 0 && amount <= state.balance && /^7\d{10}$/.test(state.transfer.phone.replace(/\D/g, '')) && state.transfer.name.trim().length > 0;
};
function announce(message) {
  const region = document.getElementById('announcements');
  if (region) region.textContent = message;
}
const fmt = n => {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const [int, dec] = abs.toFixed(2).split('.');
  const intSp = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + (dec === '00' ? intSp : intSp + ',' + dec);
};
const fmtInt = n => Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const nowTime = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
};
const nowDateLong = () => {
  const d = new Date();
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  return `${d.getDate()} ${months[d.getMonth()]} • ${nowTime()}`;
};
const nowReceiptDate = () => {
  const d = new Date();
  const p = n => String(n).padStart(2,'0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}  ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const initial = name => (name || '?').trim()[0].toUpperCase();
const randomColor = () => {
  const palette = ['#e63946','#2d6a1f','#4891f5','#af52de','#ff9500','#34c759','#5856d6','#ff2d55','#1c1c1e','#ffcc00'];
  return palette[Math.floor(Math.random()*palette.length)];
};

// ============ SVG ICONS ============
const svg = (path, w=24, h=24, extra='') =>
  `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" aria-hidden="true" ${extra}>${path}</svg>`;
const ICONS = {
  search: svg(`<circle cx="11" cy="11" r="8" stroke="#8e8e93" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="#8e8e93" stroke-width="2" stroke-linecap="round"/>`, 16, 16),
  chevDown: svg(`<path d="M2 4l3 3 3-3" stroke="#1c1c1e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`, 10, 10),
  chevRight: svg(`<path d="M9 18l6-6-6-6" stroke="#c7c7cc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`, 16, 16),
  back: svg(`<path d="M15 18l-6-6 6-6" stroke="#4891f5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`, 22, 22),
  close: svg(`<path d="M18 6L6 18M6 6l12 12" stroke="#8e8e93" stroke-width="2.2" stroke-linecap="round"/>`, 22, 22),
  settings: svg(`<circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`, 22, 22),
  user: svg(`<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="#8e8e93" stroke-width="1.8" fill="none"/>`, 22, 22),
  trash: svg(`<polyline points="3 6 5 6 21 6" stroke="#8e8e93" stroke-width="1.8" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="#8e8e93" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="#8e8e93" stroke-width="1.8" stroke-linecap="round"/><path d="M9 6V4h6v2" stroke="#8e8e93" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`, 20, 20),
  share: svg(`<circle cx="18" cy="5" r="3" stroke="#4891f5" stroke-width="2"/><circle cx="6" cy="12" r="3" stroke="#4891f5" stroke-width="2"/><circle cx="18" cy="19" r="3" stroke="#4891f5" stroke-width="2"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#4891f5" stroke-width="2"/>`, 20, 20),
  star: svg(`<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#4891f5" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`, 20, 20),
  repeat: svg(`<path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" stroke="#4891f5" stroke-width="1.8" stroke-linecap="round" fill="none"/>`, 20, 20),
  eyeOff: svg(`<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#4891f5" stroke-width="1.8" fill="none" stroke-linecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#4891f5" stroke-width="1.8" stroke-linecap="round"/>`, 20, 20),
  refresh: svg(`<path d="M1 4v6h6M23 20v-6h-6" stroke="#4891f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="#4891f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, 14, 14),
  arrow: svg(`<path d="M5 12h14M12 5l7 7-7 7" stroke="#4891f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, 20, 20),
  plus: svg(`<line x1="12" y1="5" x2="12" y2="19" stroke="#4891f5" stroke-width="2.2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="#4891f5" stroke-width="2.2" stroke-linecap="round"/>`, 20, 20),
  qr: svg(`<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" stroke="#4891f5" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 17v4" stroke="#4891f5" stroke-width="1.8" fill="none"/>`, 20, 20),
  wave: svg(`<path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9s3-3 4.5-3S18 8.5 19.5 8.5 22 7 22 7" stroke="#4891f5" stroke-width="1.8" stroke-linecap="round" fill="none"/>`, 20, 20),
  signal: svg(`<rect x="0" y="4" width="3" height="8" rx="1" fill="black"/><rect x="4" y="2.5" width="3" height="9.5" rx="1" fill="black"/><rect x="8" y="1" width="3" height="11" rx="1" fill="black"/><rect x="12" y="0" width="3" height="12" rx="1" fill="black" opacity="0.3"/>`, 18, 12),
  wifi: svg(`<path d="M8 2C10.5 2 12.7 3.1 14.2 4.8L15.5 3.3C13.6 1.3 11 0 8 0C5 0 2.4 1.3 0.5 3.3L1.8 4.8C3.3 3.1 5.5 2 8 2Z" fill="black"/><path d="M8 5.5C9.6 5.5 11 6.2 12 7.3L13.3 5.8C11.9 4.4 10.1 3.5 8 3.5C5.9 3.5 4.1 4.4 2.7 5.8L4 7.3C5 6.2 6.4 5.5 8 5.5Z" fill="black"/><circle cx="8" cy="11" r="1.5" fill="black"/>`, 16, 12),
  navHome: svg(`<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#FFDD2D" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="#FFDD2D" stroke-width="1.8" fill="none"/>`),
  navPay: svg(`<rect x="2" y="5" width="20" height="14" rx="2" stroke="#8e8e93" stroke-width="1.8" fill="none"/><line x1="2" y1="10" x2="22" y2="10" stroke="#8e8e93" stroke-width="1.8"/>`),
  navCity: svg(`<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#8e8e93" stroke-width="1.8" fill="none"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8e8e93" stroke-width="1.8" fill="none"/>`),
  navChat: svg(`<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`),
  navShop: svg(`<circle cx="9" cy="21" r="1" fill="#8e8e93"/><circle cx="20" cy="21" r="1" fill="#8e8e93"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.67L23 6H6" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linecap="round"/>`),
  filterBars: svg(`<line x1="18" y1="20" x2="18" y2="10" stroke="#4891f5" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="#4891f5" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="#4891f5" stroke-width="2" stroke-linecap="round"/>`, 22, 22),
  promo: svg(`<path d="M21.21 15.89A10 10 0 118 2.83" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M22 12A10 10 0 0012 2v10z" fill="#fff"/>`, 18, 18),
  fabPlus: svg(`<path d="M12 5v14M5 12h14" stroke="#1c1c1e" stroke-width="2.5" stroke-linecap="round"/>`, 28, 28),
  edit: svg(`<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linecap="round"/>`, 13, 13),
};

// Filled, two-tone icons match the visual weight of the mobile references.
Object.assign(ICONS, {
  star: svg('<path d="m12 1.8 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1L12 1.8Z" fill="#5DA0F6"/><path d="m12 1.8 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3V1.8Z" fill="#78B2FB"/>'),
  repeat: svg('<path d="M5 6h10v12H5a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4Z" fill="#A9CEF9"/><path d="M5 4h9V1l8 7-8 7v-4H8a2 2 0 0 0-2 2v3H2V8a4 4 0 0 1 3-4Z" fill="#438CF5"/>'),
  eyeOff: svg('<circle cx="12" cy="12" r="10" fill="#83B4FB"/><path d="M12 2a10 10 0 0 1 0 20V2Z" fill="#438CF5"/><circle cx="12" cy="12" r="4" fill="#F2F5FF"/><path d="M4 21 21 4" stroke="#438CF5" stroke-width="3" stroke-linecap="round"/>'),
  category: svg('<path d="m13 2 8 7-8 7v-4H3V6h10V2Z" fill="#72D1E4"/><path d="m11 9-8 7 8 7v-4h10v-6H11V9Z" fill="#9CE1EC"/>'),
  pencil: svg('<path d="m15 3 6 6L9 21H3v-6L15 3Z" fill="#438CF5"/><path d="m15 3 3-3 6 6-3 3-6-6Z" fill="#9BC2FC"/>', 15, 15),
  share: svg('<path d="M12 15V2m0 0L8 6m4-4 4 4M5 10H3v11h18V10h-2" stroke="#438CF5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  silent: svg('<path d="M6 8c0-4 3-6 6-6 4 0 6 3 6 6v7l2 3H4l2-3V8Z" fill="white"/><path d="M10 21h4" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="m3 1 18 21" stroke="#000" stroke-width="4"/><path d="m3 1 18 21" stroke="white" stroke-width="2"/>', 14, 17),
  statusSignal: svg('<rect x="2" y="15" width="4" height="7" rx="1.2" fill="white"/><rect x="8" y="11" width="4" height="11" rx="1.2" fill="white"/><rect x="14" y="6" width="4" height="16" rx="1.2" fill="white"/><rect x="20" y="2" width="4" height="20" rx="1.2" fill="#666"/>'),
  statusWifi: svg('<path d="M2 7a16 16 0 0 1 20 0M5 11a11 11 0 0 1 14 0M8.5 15a5.5 5.5 0 0 1 7 0" stroke="white" stroke-width="2.7" stroke-linecap="round"/><path d="m10 18 2 3 2-3h-4Z" fill="white"/>'),
  successCheck: svg('<path d="m5 12 4.5 4.5L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
  receipt: svg('<path d="M5 3h14v19l-3-2-4 2-4-2-3 2V3Z" fill="#8CB9FA"/><path d="M3 2h18v3H3V2Z" fill="#438CF5"/><path d="M8 9h8M8 13h6" stroke="#438CF5" stroke-width="2" stroke-linecap="round"/>'),
  sbp: svg('<path d="M2 2v20l6-5V7L2 2Z" fill="#784B9F"/><path d="m2 2 12 7-6 4V7L2 2Z" fill="#E62C6C"/><path d="m2 22 12-7-6-4v6l-6 5Z" fill="#28A8DD"/><path d="m9 7 12 7-7 4-5-3 6-1-6-4V7Z" fill="#42B472"/><path d="m9 7 12 7-5-8-7-5v6Z" fill="#F7B42C"/>', 32, 23),
});

// ============ COMPONENTS ============
function statusBar() {
  return `<header class="demo-status" aria-label="Демонстрационное приложение. Реальные платежи не выполняются.">
    <span class="status-brand">Т-БАНК</span>
  </header>`;
}

function bottomNav() {
  return `
    <nav class="_nav_1h6e9_1">
      <div class="_item_1h6e9_21" style="color:#FFDD2D">
        <span class="_badge_1h6e9_35">1</span>
        ${ICONS.navHome}
        <span style="color:#FFDD2D">Главная</span>
      </div>
      <div class="_item_1h6e9_21" style="color:#8e8e93">
        ${ICONS.navPay}
        <span style="color:#8e8e93">Платежи</span>
      </div>
      <div class="_item_1h6e9_21" style="color:#8e8e93">
        ${ICONS.navCity}
        <span style="color:#8e8e93">Город</span>
      </div>
      <div class="_item_1h6e9_21" style="color:#8e8e93">
        <span class="_badge_1h6e9_35">20</span>
        ${ICONS.navChat}
        <span style="color:#8e8e93">Чат</span>
      </div>
      <div class="_item_1h6e9_21" style="color:#8e8e93">
        ${ICONS.navShop}
        <span style="color:#8e8e93">Витрина</span>
      </div>
    </nav>
  `;
}

// ============ SCREEN: HOME ============
function screenHome() {
  return `
    <div class="_screen_riypy_1">
      ${statusBar()}
      <div class="_content_riypy_11">
        <div class="_userRow_riypy_20">
          <div class="_userLeft_riypy_27">
            <div class="_userAvatar_riypy_33">${ICONS.user}</div>
            <div class="_userName_riypy_44">
              <span>${escapeHTML(state.shortName)}</span>
              ${ICONS.chevDown}
            </div>
          </div>
          <button class="_settingsBtn_riypy_53" data-go="settings" aria-label="Настройки">${ICONS.settings}</button>
        </div>

        <div class="_search_riypy_64">${ICONS.search}<span>Поиск</span></div>

        <div class="_widgetGrid_riypy_77">
          <div class="_widget_riypy_77" data-go="operations">
            <div class="_widgetTitle_riypy_91">Все операции</div>
            <div class="_widgetSub_riypy_99">Трат в апреле</div>
            <div class="_widgetAmount_riypy_105">${fmtInt(state.expenses)} ₽</div>
            <div style="height:6px;border-radius:3px;background:#e5e5ea;overflow:hidden;margin-top:8px">
              <div style="display:flex;height:100%">
                <div style="width:38%;background:linear-gradient(90deg,#44aaff,#2299cc)"></div>
                <div style="width:18%;background:#ff9500"></div>
                <div style="width:12%;background:#af52de"></div>
                <div style="width:8%;background:#ff2d55"></div>
                <div style="width:8%;background:#34c759"></div>
                <div style="width:6%;background:#5ac8fa"></div>
              </div>
            </div>
          </div>
          <div class="_widget_riypy_77">
            <div class="_widgetRow_riypy_111">
              <div class="_widgetTitle_riypy_91">Кэшбэк${"\n"}и бонусы</div>
              <div class="_widgetBadge_riypy_118">1</div>
            </div>
            <div class="_cashbackIcons_riypy_128">
              <div class="_cashbackCircle_riypy_133" style="background:#ffcc00">🎯</div>
              <div class="_cashbackCircle_riypy_133" style="background:#3a3a3c">🔨</div>
              <div class="_cashbackCircle_riypy_133" style="background:#7c3aed">🍷</div>
            </div>
          </div>
        </div>

        <div class="_quickCard_riypy_144">
          <div class="_quickRow_riypy_151">
            <div class="_quickItem_riypy_156" data-go="transfer">
              <div class="_quickIcon_riypy_165">${ICONS.arrow}</div>
              <div class="_quickLabel_riypy_175">Перевести${"\n"}по телефону</div>
            </div>
            <div class="_quickItem_riypy_156">
              <div class="_quickIcon_riypy_165">${ICONS.plus}</div>
              <div class="_quickLabel_riypy_175">Пополнить${"\n"}Black</div>
            </div>
            <div class="_quickItem_riypy_156">
              <div class="_quickIcon_riypy_165">${ICONS.qr}</div>
              <div class="_quickLabel_riypy_175">Сканировать${"\n"}QR-код</div>
            </div>
            <div class="_quickItem_riypy_156">
              <div class="_quickIcon_riypy_165">${ICONS.wave}</div>
              <div class="_quickLabel_riypy_175">Оплатить${"\n"}айфоном</div>
            </div>
          </div>
        </div>

        <div class="_accountCard_riypy_184" data-go="operations">
          <div class="_accountLeft_riypy_195">
            <div class="_accountAvatar_riypy_201"><span>₽</span></div>
            <div class="_accountInfo_riypy_218">
              <div class="_accountAmount_riypy_220">${fmt(state.balance)} ₽</div>
              <div class="_accountName_riypy_226">Black</div>
            </div>
          </div>
          <div class="_accountBadge_riypy_232">
            ${svg(`<path d="M2 19h20M3 19l2-9 5 4 2-7 2 7 5-4 2 9H3z" stroke="#fff" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`, 12, 12)}
            <span>9 Р</span>
          </div>
        </div>

        <div class="_accountCard_riypy_184">
          <div class="_accountLeft_riypy_195">
            <div class="_accountAvatar_riypy_201"><span>$</span></div>
            <div class="_accountInfo_riypy_218">
              <div class="_accountAmount_riypy_220">0,01 $</div>
              <div class="_accountName_riypy_226">Black USD</div>
            </div>
          </div>
        </div>

        <div class="_accountCard_riypy_184">
          <div class="_accountLeft_riypy_195">
            <div class="_accountAvatar_riypy_201"><span>€</span></div>
            <div class="_accountInfo_riypy_218">
              <div class="_accountAmount_riypy_220">0 €</div>
              <div class="_accountName_riypy_226">Black EUR</div>
            </div>
          </div>
        </div>

        <div style="height:20px"></div>
      </div>
      ${bottomNav()}
    </div>
  `;
}

// ============ SCREEN: OPERATIONS ============
function groupedOps() {
  const groups = {};
  state.operations.forEach(op => {
    if (!groups[op.date]) groups[op.date] = [];
    groups[op.date].push(op);
  });
  return Object.entries(groups).map(([date, items]) => {
    const total = items.reduce((s, o) => s + (o.sign === '+' ? o.amt : -o.amt), 0);
    const sign = total >= 0 ? '+' : '−';
    return { date, items, total: `${sign}${fmt(Math.abs(total))} ₽` };
  });
}

function renderOp(op) {
  const av = op.av.img
    ? `<img src="assets/transfer-mark.svg" alt="" style="width:44px;height:44px;border-radius:22px;object-fit:cover">`
    : `<div class="_opAvatar_15ho2_172" style="background:${op.av.bg}"><span class="_opLetter_15ho2_183">${escapeHTML(op.av.letter)}</span></div>`;
  const wrapStart = op.av.img
    ? `<div class="_opAvatar_15ho2_172" style="background:transparent">`
    : '';
  const wrapEnd = op.av.img ? `</div>` : '';
  const color = op.sign === '+' ? '#34c759' : '#1c1c1e';
  const amtTxt = (op.sign === '+' ? '+' : '') + fmt(op.amt) + ' ₽';
  return `
    <div class="_opItem_15ho2_161" data-op="${op.id}">
      ${wrapStart}${av}${wrapEnd}
      <div class="_opInfo_15ho2_189">
        <div class="_opRow_15ho2_194">
          <span class="_opName_15ho2_200">${escapeHTML(op.name)}</span>
          <span class="_opAmount_15ho2_210" style="color:${color}">${amtTxt}</span>
        </div>
        <div class="_opRow_15ho2_194">
          <span class="_opCategory_15ho2_217">${escapeHTML(op.cat)}</span>
          <span class="_opSub_15ho2_223">${op.sub}</span>
        </div>
      </div>
    </div>
  `;
}

function screenOperations() {
  const groups = groupedOps();
  return `
    <div class="_screen_15ho2_1">
      ${statusBar()}
      <div class="_header_15ho2_12">
        <span class="_closeBtn_15ho2_21" data-go="home">Закрыть</span>
        <span class="_headerTitle_15ho2_28">Операции</span>
        ${ICONS.filterBars}
      </div>
      <div class="_content_15ho2_34">
        <div class="_search_15ho2_42">${ICONS.search}<span>Поиск</span></div>
        <div class="_filters_15ho2_54">
          <div class="_filterYellow_15ho2_63">Апрель ▾</div>
          <div class="_filterYellow_15ho2_63">Black ✕</div>
          <div class="_filterGray_15ho2_74">Без переводов</div>
        </div>
        <div class="_summaryGrid_15ho2_85">
          <div class="_summaryCard_15ho2_92">
            <div class="_summaryAmount_15ho2_98">${fmtInt(state.expenses)} ₽</div>
            <div class="_summarySub_15ho2_104">Траты</div>
            <div style="height:6px;border-radius:3px;background:#e5e5ea;overflow:hidden;margin-top:8px">
              <div style="display:flex;height:100%">
                <div style="width:38%;background:linear-gradient(90deg,#44aaff,#2299cc)"></div>
                <div style="width:18%;background:#ff9500"></div>
                <div style="width:12%;background:#af52de"></div>
                <div style="width:8%;background:#ff2d55"></div>
                <div style="width:8%;background:#34c759"></div>
                <div style="width:6%;background:#5ac8fa"></div>
              </div>
            </div>
          </div>
          <div class="_summaryCard_15ho2_92">
            <div class="_summaryAmount_15ho2_98">${fmtInt(state.income)} ₽</div>
            <div class="_summarySub_15ho2_104">Доходы</div>
            <div style="height:6px;border-radius:3px;background:#34c759;margin-top:8px"></div>
          </div>
        </div>
        <div class="_promo_15ho2_110">
          <div class="_promoIcon_15ho2_120">${ICONS.promo}</div>
          <div>
            <div class="_promoTitle_15ho2_131">Доступна рассрочка</div>
            <div class="_promoSub_15ho2_137">Для 2 операций на сумму 2 211,96</div>
          </div>
        </div>
        ${groups.map(g => `
          <div>
            <div class="_dateHeader_15ho2_142">
              <span class="_dateLabel_15ho2_150">${escapeHTML(g.date)}</span>
              <span class="_dateTotal_15ho2_156">${g.total}</span>
            </div>
            ${g.items.map(renderOp).join('')}
          </div>
        `).join('')}
        <div style="height:80px"></div>
      </div>
      <button class="_fab_15ho2_229" data-go="transfer">${ICONS.fabPlus}</button>
      ${bottomNav()}
    </div>
  `;
}

// ============ SCREEN: TRANSFER ============
function screenTransfer() {
  const t = state.transfer;
  const num = parseMoney(t.amount);
  const isValid = validTransfer();
  const overBalance = num > state.balance;
  return `
    <div class="_screen_1t5vl_1">
      ${statusBar()}
      <div class="_header_1t5vl_11">
        <button class="_backBtn_1t5vl_19" data-go="home" aria-label="На главную">${ICONS.back}</button>
        <span class="_headerTitle_1t5vl_26">Перевод по телефону</span>
        <div style="width:34px"></div>
      </div>
      <div class="_body_1t5vl_32">
        <div class="_amountCard_1t5vl_43">
          <div class="_amountWrap_1t5vl_52">
            <input id="amt" class="_amountInput_1t5vl_59" type="text" inputmode="decimal" aria-label="Сумма перевода" placeholder="0" maxlength="12" value="${escapeHTML(t.amount)}">
            <span class="_currency_1t5vl_72">₽</span>
          </div>
        </div>
        <div class="_fieldCard_1t5vl_80">
          <div class="_fieldRow_1t5vl_87">
            <label class="_label_1t5vl_95" for="phone">Номер телефона</label>
            <input id="phone" class="_input_1t5vl_102" type="tel" autocomplete="off" placeholder="+7 (___) ___-__-__" value="${escapeHTML(t.phone)}">
          </div>
          <div class="_fieldRow_1t5vl_87">
            <label class="_label_1t5vl_95" for="rcpt">Имя получателя</label>
            <input id="rcpt" class="_input_1t5vl_102" type="text" autocomplete="off" placeholder="Получатель демоперевода" maxlength="60" value="${escapeHTML(t.name)}">
          </div>
        </div>
        <p class="_accountCardLabel_1t5vl_125">Списать с</p>
        <div class="_accountCard_1t5vl_116">
          <div class="_accountIcon_1t5vl_133"><span style="color:#fff;font-weight:700;font-size:14px">₽</span></div>
          <div class="_accountInfo_1t5vl_144">
            <div class="_accountName_1t5vl_148">Black</div>
            <div class="_accountBalance_1t5vl_154">${fmt(state.balance)} ₽</div>
          </div>
          ${ICONS.chevRight}
        </div>
        <div class="_error_1t5vl_159" id="transferError" role="status">${overBalance ? 'Сумма больше остатка на счёте' : ''}</div>
      </div>
      <div class="_footer_1t5vl_167">
        <p class="demo-notice">Учебная операция: деньги не переводятся.</p>
        <button class="_submitBtn_1t5vl_173 ${isValid ? '_submitBtnActive_1t5vl_184' : '_submitBtnDisabled_1t5vl_188'}" ${isValid ? '' : 'disabled'} id="submitTransfer">Выполнить демоперевод</button>
      </div>
      ${bottomNav()}
    </div>
  `;
}

// ============ SCREEN: OPERATION DETAILS ============
function screenTransferSuccess() {
  const op = state.selectedOp;
  if (!op) return screenHome();
  const phase = state.successIntro ? 'intro' : 'details';
  return `<div class="_screen_55ji0_1 confirmation-screen">
    ${statusBar()}
    <section class="confirmation-sheet" id="confirmationSheet" data-phase="${phase}" aria-label="Результат демонстрационного перевода">
      <button class="confirmation-close" data-go="home">Закрыть</button>
      <div class="confirmation-pulse" aria-hidden="true"></div>
      <div class="confirmation-bank" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="40" fill="#179C35"/><path d="M58 25a23 23 0 1 0 4 23" stroke="white" stroke-width="5" stroke-linecap="round"/><path d="m30 38 9 7 21-16" stroke="white" stroke-width="5" stroke-linecap="square" stroke-linejoin="round"/></svg>
      </div>
      <div class="confirmation-tick" aria-hidden="true">${ICONS.successCheck}</div>
      <div class="confirmation-amount">−${fmt(op.amt)} ₽</div>
      <div class="confirmation-details" id="confirmationDetails" ${phase === 'intro' ? 'inert' : ''}>
        <div class="confirmation-recipient">
          <h1>${escapeHTML(op.name)}</h1>
          ${op.phone ? `<p>${escapeHTML(displayPhone(op.phone))}</p>` : ''}
        </div>
        <button class="confirmation-receipt" data-go="receipt">${ICONS.receipt}<span>Квитанция</span></button>
        <section class="confirmation-account operation-card">
          <h2>Перевод со счёта ${ICONS.sbp}</h2>
          <div class="operation-account">
            <div class="operation-account-icon" aria-hidden="true"><span>₽</span></div>
            <div class="operation-account-text">
              <div class="operation-account-name">${escapeHTML(op.accountName || state.accountName || 'Black')}</div>
              <div class="confirmation-balances"><s>${fmt(op.balanceBefore ?? roundMoney((op.balanceAfter ?? state.balance) + op.amt))} ₽</s><span aria-hidden="true">➜</span><span>${fmt(op.balanceAfter ?? state.balance)} ₽</span></div>
            </div>
          </div>
        </section>
        <button class="confirmation-done" data-go="opDetails">Готово</button>
      </div>
      <span class="sr-only" role="status">Демоперевод выполнен. Реальный платёж не выполнялся.</span>
    </section>
  </div>`;
}

function screenOpDetails() {
  const op = state.selectedOp;
  if (!op) return screenHome();
  const color = op.sign === '+' ? '#34a868' : '#303132';
  const sign = op.sign === '+' ? '+' : '−';
  return `
    <div class="_screen_55ji0_1 detail-screen">
      ${statusBar()}
      <section class="operation-sheet" aria-label="Демонстрационные детали операции">
        <div class="operation-top">
          <span class="operation-date">${escapeHTML(op.dateLong || op.date + ' • 11:47')}</span>
          <button class="operation-close" data-go="operations" aria-label="Закрыть операцию">${ICONS.close}</button>
        </div>
        <div class="operation-content">
          <div class="operation-hero">
            <img src="assets/transfer-mark.svg" class="operation-logo" alt="">
            <h1 class="operation-name">${escapeHTML(op.name)}</h1>
            <div class="operation-badges">
              <span class="operation-category">${ICONS.category}<span>${escapeHTML(op.cat)}</span></span>
              <button class="operation-edit" id="editCategory" aria-label="Изменить категорию">${ICONS.pencil}</button>
            </div>
            <div class="operation-amount" style="color:${color}">${sign}${fmt(op.amt)} ₽</div>
          </div>
          <div class="operation-actions" aria-label="Действия с операцией" tabindex="0">
            <button class="operation-action" id="favoriteOp" aria-pressed="${!!op.favorite}">${ICONS.star}<span>${op.favorite ? 'В избранном' : 'Избранное'}</span></button>
            <button class="operation-action" id="repeatOp">${ICONS.repeat}<span>Повторить</span></button>
            <button class="operation-action" id="excludeOp" aria-pressed="${!!op.excluded}">${ICONS.eyeOff}<span>${op.excluded ? 'Учитывать' : 'Не учитывать'}</span></button>
            <button class="operation-action" id="askDelete">${ICONS.trash}<span>Удалить</span></button>
          </div>
          <div class="operation-cards">
            <section class="operation-card">
              <div class="operation-card-head">
                <h2>Перевод</h2>
                <button class="operation-help" data-go="receipt">Справка</button>
              </div>
              <div class="operation-account">
                <div class="operation-account-icon" aria-hidden="true"><span>₽</span></div>
                <div class="operation-account-text">
                  <div class="operation-account-name">${escapeHTML(op.accountName || state.accountName || 'Black')}</div>
                  <div class="operation-account-balance">${fmt(op.balanceAfter ?? state.balance)} ₽</div>
                </div>
                ${ICONS.chevRight}
              </div>
            </section>
            ${state.showDetails && op.phone ? `
            <section class="operation-card operation-requisites">
              <h2>Реквизиты</h2>
              <div class="operation-phone-label">Номер телефона</div>
              <div class="operation-phone">${escapeHTML(displayPhone(op.phone))}</div>
            </section>` : ''}
          </div>
        </div>
        <div id="sheet"></div>
      </section>
    </div>
  `;
}

function displayPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (/^7\d{10}$/.test(digits)) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  return phone;
}

function categoryEditor() {
  return `<div class="category-editor" id="categoryBackdrop">
    <form class="category-editor-card" id="categoryForm" role="dialog" aria-modal="true" aria-labelledby="categoryTitle">
      <h2 id="categoryTitle">Категория операции</h2>
      <label for="categoryInput">Название категории
        <input id="categoryInput" maxlength="40" required value="${escapeHTML(state.selectedOp.cat)}">
      </label>
      <div class="category-editor-actions">
        <button type="button" id="cancelCategory">Отмена</button>
        <button type="submit">Сохранить</button>
      </div>
    </form>
  </div>`;
}

function updateOperation(patch, extra = {}) {
  const updated = { ...state.selectedOp, ...patch };
  setState({ ...extra, selectedOp: updated, operations: state.operations.map(op => op.id === updated.id ? updated : op) });
}

function sheetDelete() {
  const op = state.selectedOp;
  return `
    <div class="_overlay_55ji0_222" id="overlay"></div>
    <div class="_sheet_55ji0_235" role="dialog" aria-modal="true" aria-labelledby="deleteTitle">
      <div class="_sheetHandle_55ji0_258"></div>
      <div class="_sheetIcon_55ji0_266">${svg(`<polyline points="3 6 5 6 21 6" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"/><path d="M9 6V4h6v2" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, 28, 28)}</div>
      <h2 class="_sheetTitle_55ji0_277" id="deleteTitle">Удалить демооперацию?</h2>
      <div class="_sheetSub_55ji0_283">Операция «<span class="_sheetName_55ji0_291">${escapeHTML(op.name)}</span>» будет удалена из локальной истории.</div>
      <div class="_sheetBtns_55ji0_296">
        <button class="_sheetCancel_55ji0_304" id="cancelDel">Отмена</button>
        <button class="_sheetConfirm_55ji0_313" id="confirmDel">Удалить</button>
      </div>
    </div>
  `;
}

// ============ SCREEN: RECEIPT ============
function screenReceipt() {
  // Always use the operation the user opened, not the last created transfer.
  const tr = state.selectedOp;
  if (!tr) return screenHome();
  const rows = [
    ['Перевод', 'По номеру телефона'],
    ['Статус', 'Успешно'],
    ['Сумма', `${fmt(tr.amt)} ₽`],
    ['Комиссия', '0 ₽'],
    ['Отправитель', tr.senderName || state.senderName],
    ...(tr.phone ? [['Телефон получателя', formatPhone(tr.phone)]] : []),
    ['Получатель', tr.name || tr.recipient || ''],
    ['Описание операции', tr.description || `Внутренний перевод на договор${tr.contractNo ? '\n' + tr.contractNo : ''}`],
  ];
  return `
    <div class="_screen_cjsg3_1 receipt-screen">
      ${statusBar()}
      <section class="receipt-sheet" aria-label="Образец квитанции">
        <div class="receipt-header">
          <button class="receipt-close" data-go="${state.receiptReturn === 'transferSuccess' ? 'transferSuccess' : 'opDetails'}">Закрыть</button>
          <h1>Квитанция</h1>
          <button class="receipt-share" id="shareReceipt" aria-label="Поделиться демообразцом">${ICONS.share}</button>
        </div>
        <div class="receipt-scroll">
          <article class="receipt-paper">
            <img src="assets/receipt-mark.svg" class="receipt-logo" alt="">
            <p class="receipt-date">${escapeHTML(tr.receiptDate || tr.dateLong || tr.date)}</p>
            <div class="receipt-total"><span>Итого</span><span>${fmt(tr.amt)} ₽</span></div>
            <div class="receipt-divider"></div>
            <dl class="receipt-table">
              ${rows.map(([label, value]) => `<div class="receipt-row"><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}
            </dl>
            <img src="assets/reference-stamp.png" class="receipt-reference-stamp" alt="Изображение печати из референса, учебный образец">
            <div class="receipt-divider"></div>
            <footer class="receipt-footer">
              <p>Квитанция № ${escapeHTML(tr.receiptNo || 'DEMO-' + tr.id)}</p>
              <p>По вопросам зачисления обращайтесь к получателю</p>
              <p>Служба поддержки fb@tbank.ru</p>
            </footer>
            <div class="receipt-watermarks" aria-hidden="true"><span>ОБРАЗЕЦ · ДЕМО</span><span>ОБРАЗЕЦ · ДЕМО</span><span>ОБРАЗЕЦ · ДЕМО</span></div>
          </article>
          <p class="receipt-sample-caption">Учебный образец. Не является банковским документом.</p>
        </div>
      </section>
    </div>
  `;
}

async function shareReceipt() {
  const op = state.selectedOp;
  if (!op) return;
  const text = `ОБРАЗЕЦ. Не является банковским документом.\nДемонстрационная операция № DEMO-${op.id}\nСумма: ${fmt(op.amt)} ₽\nРеальный перевод не выполнялся.`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Образец квитанции — ДЕМО', text });
    } else {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `demo-receipt-${op.id}.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Демообразец сохранён. Реальный перевод не выполнялся.');
    }
  } catch (error) {
    if (error.name !== 'AbortError') announce('Не удалось поделиться образцом. Попробуйте ещё раз.');
  }
}

// ============ SCREEN: SETTINGS ============
function screenSettings() {
  return `
    <div class="_screen_1vfp6_1">
      ${statusBar()}
      <div class="_header_1vfp6_11">
        <button class="_backBtn_1vfp6_19" data-go="home" aria-label="На главную">${ICONS.back}</button>
        <span class="_headerTitle_1vfp6_26">Настройки</span>
        <div style="width:34px"></div>
      </div>
      <div class="_scroll_1vfp6_32">
        <div class="_section_1vfp6_43">
          <span class="_sectionTitle_1vfp6_56">Отправитель</span>
          <div class="_card_1vfp6_66">
            <div>
              <label class="_fieldLabel_1vfp6_76" for="setSender">Имя отправителя</label>
              <input class="_input_1vfp6_84" id="setSender" maxlength="60" placeholder="Иван Иванов" value="${escapeHTML(state.senderName)}">
            </div>
          </div>
        </div>
        <div class="_section_1vfp6_43">
          <span class="_sectionTitle_1vfp6_56">Счёт Black</span>
          <div class="_card_1vfp6_66">
            <div>
              <label class="_fieldLabel_1vfp6_76" for="setBalance">Остаток на счёте (₽)</label>
              <input class="_input_1vfp6_84" id="setBalance" inputmode="decimal" placeholder="6916.54" value="${state.balance}">
            </div>
          </div>
        </div>
        <div class="_section_1vfp6_43">
          <div class="_sectionRow_1vfp6_50">
            <span class="_sectionTitle_1vfp6_56">Траты и доходы</span>
            <button class="_randomBtn_1vfp6_140" id="randomBtn">${ICONS.refresh}Случайное</button>
          </div>
          <div class="_card_1vfp6_66">
            <div class="_row_1vfp6_99">
              <div class="_halfField_1vfp6_105">
                <label class="_fieldLabel_1vfp6_76" for="setExpenses">Траты (₽)</label>
                <input class="_input_1vfp6_84" id="setExpenses" inputmode="decimal" placeholder="31263" value="${state.expenses}">
              </div>
              <div class="_halfField_1vfp6_105">
                <label class="_fieldLabel_1vfp6_76" for="setIncome">Доходы (₽)</label>
                <input class="_input_1vfp6_84" id="setIncome" inputmode="decimal" placeholder="57655" value="${state.income}">
              </div>
            </div>
            <div class="_statsPreview_1vfp6_112">
              <div class="_statPill_1vfp6_119">
                <span class="_statPillVal_1vfp6_128">${fmtInt(state.expenses)} ₽</span>
                <span class="_statPillLabel_1vfp6_134">Траты</span>
              </div>
              <div class="_statPill_1vfp6_119">
                <span class="_statPillVal_1vfp6_128">${fmtInt(state.income)} ₽</span>
                <span class="_statPillLabel_1vfp6_134">Доходы</span>
              </div>
            </div>
          </div>
        </div>
        <div class="_section_1vfp6_43">
          <span class="_sectionTitle_1vfp6_56">Отображение</span>
          <div class="_card_1vfp6_66">
            <div class="_toggleRow_1vfp6_157">
              <div class="_toggleInfo_1vfp6_164">
                <span class="_toggleLabel_1vfp6_171">Детали операции</span>
                <span class="_toggleSub_1vfp6_177">Показывать блок «Детали операции» в окне перевода</span>
              </div>
              <button class="_toggle_1vfp6_157 ${state.showDetails ? '_toggleOn_1vfp6_195' : ''}" id="toggleDet" role="switch" aria-label="Детали операции" aria-checked="${state.showDetails}">
                <div class="_toggleThumb_1vfp6_199"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="_footer_1vfp6_216">
        <button class="_saveBtn_1vfp6_222" id="saveBtn">Сохранить</button>
      </div>
    </div>
  `;
}

// ============ RENDER ============
function render() {
  const root = document.getElementById('root');
  const previousScreen = document.body.dataset.screen;
  document.body.dataset.screen = state.screen;
  root.dataset.transition = previousScreen !== state.screen ? 'enter' : 'idle';
  const screens = {
    home: screenHome,
    operations: screenOperations,
    transfer: screenTransfer,
    transferSuccess: screenTransferSuccess,
    opDetails: screenOpDetails,
    receipt: screenReceipt,
    settings: screenSettings,
  };
  root.innerHTML = (screens[state.screen] || screenHome)();
  root.firstElementChild?.insertAdjacentHTML('beforeend', '<footer class="app-demo-caption">Учебный макет</footer>');
  attachHandlers();
  if (previousScreen !== state.screen) window.scrollTo(0, 0);
}

// ============ HANDLERS ============
function attachHandlers() {
  document.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const target = el.dataset.go;
      if (target === 'opDetails' && !state.selectedOp) return;
      setState({ screen: target, ...(target === 'receipt' ? { lastTransfer: null, receiptReturn: state.screen } : {}) });
    });
  });

  document.querySelectorAll('[data-op]').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.op);
      const op = state.operations.find(o => o.id === id);
      if (op) setState({ selectedOp: op, screen: 'opDetails' });
    });
  });

  // Transfer screen
  const amt = document.getElementById('amt');
  const phone = document.getElementById('phone');
  const rcpt = document.getElementById('rcpt');
  if (amt) {
    amt.addEventListener('input', () => {
      state.transfer.amount = amt.value.replace(/[^\d.,]/g, '');
      amt.value = state.transfer.amount;
      updateSubmitBtn();
    });
  }
  if (phone) {
    phone.addEventListener('input', () => {
      state.transfer.phone = formatPhone(phone.value);
      phone.value = state.transfer.phone;
      updateSubmitBtn();
    });
  }
  if (rcpt) {
    rcpt.addEventListener('input', () => {
      state.transfer.name = rcpt.value;
      updateSubmitBtn();
    });
  }
  const submit = document.getElementById('submitTransfer');
  if (submit) {
    submit.addEventListener('click', doTransfer);
  }

  const repeat = document.getElementById('repeatOp');
  if (repeat) repeat.onclick = () => {
    const op = state.selectedOp;
    setState({ screen: 'transfer', transfer: { amount: String(op.amt).replace('.', ','), phone: op.phone ? formatPhone(op.phone) : '', name: op.name } });
  };
  const favorite = document.getElementById('favoriteOp');
  if (favorite) favorite.onclick = () => {
    const active = !state.selectedOp.favorite;
    updateOperation({ favorite: active });
    document.getElementById('favoriteOp').focus({ preventScroll: true });
    announce(active ? 'Операция добавлена в избранное.' : 'Операция удалена из избранного.');
  };
  const exclude = document.getElementById('excludeOp');
  if (exclude) exclude.onclick = () => {
    const op = state.selectedOp;
    const excluded = !op.excluded;
    const field = op.sign === '+' ? 'income' : 'expenses';
    const delta = excluded ? Math.min(state[field], op.amt) : (op.exclusionDelta ?? op.amt);
    updateOperation({ excluded, exclusionDelta: excluded ? delta : 0 }, { [field]: roundMoney(state[field] + (excluded ? -delta : delta)) });
    document.getElementById('excludeOp').focus({ preventScroll: true });
    announce(excluded ? 'Операция исключена из статистики.' : 'Операция снова учитывается в статистике.');
  };
  const editCategory = document.getElementById('editCategory');
  if (editCategory) editCategory.onclick = () => {
    mountSheet(categoryEditor(), 'categoryInput');
    document.getElementById('cancelCategory').onclick = closeSheet;
    document.getElementById('categoryBackdrop').onclick = event => {
      if (event.target.id === 'categoryBackdrop') closeSheet();
    };
    document.getElementById('categoryForm').onsubmit = event => {
      event.preventDefault();
      const cat = document.getElementById('categoryInput').value.trim();
      if (!cat) return;
      updateOperation({ cat });
      document.getElementById('editCategory').focus({ preventScroll: true });
    };
  };
  const share = document.getElementById('shareReceipt');
  if (share) share.onclick = shareReceipt;

  const confirmation = document.getElementById('confirmationSheet');
  if (confirmation && state.successIntro) {
    const reveal = () => {
      if (document.getElementById('confirmationSheet') !== confirmation) return;
      state.successIntro = false;
      confirmation.dataset.phase = 'details';
      document.getElementById('confirmationDetails').inert = false;
    };
    // Keep the same SVG node while it shrinks and moves into the corner badge.
    setTimeout(reveal, window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 1200);
  }

  // Operation details — delete sheet
  const askDel = document.getElementById('askDelete');
  if (askDel) {
    askDel.addEventListener('click', () => {
      mountSheet(sheetDelete(), 'cancelDel');
      document.getElementById('cancelDel').onclick = closeSheet;
      document.getElementById('overlay').onclick = closeSheet;
      document.getElementById('confirmDel').onclick = () => {
        const id = state.selectedOp.id;
        const op = state.selectedOp;
        const ops = state.operations.filter(o => o.id !== id);
        const restoredBalance = roundMoney(op.sign === '-' ? state.balance + op.amt : state.balance - op.amt);
        setState({ operations: ops, balance: restoredBalance, selectedOp: null, screen: 'operations' });
      };
    });
  }

  // Settings
  const setSender = document.getElementById('setSender');
  const setBalance = document.getElementById('setBalance');
  const setExpenses = document.getElementById('setExpenses');
  const setIncome = document.getElementById('setIncome');
  const toggle = document.getElementById('toggleDet');
  const random = document.getElementById('randomBtn');
  const saveBtn = document.getElementById('saveBtn');

  if (toggle) toggle.onclick = () => {
    state.showDetails = !state.showDetails;
    saveState();
    toggle.classList.toggle('_toggleOn_1vfp6_195');
    toggle.setAttribute('aria-checked', state.showDetails);
  };

  if (random) random.onclick = () => {
    setExpenses.value = Math.floor(5000 + Math.random()*60000);
    setIncome.value = Math.floor(20000 + Math.random()*80000);
  };

  if (saveBtn) saveBtn.onclick = () => {
    const newSender = (setSender.value || '').trim();
    const shortName = newSender.split(' ')[0] || 'Ярослав';
    const balance = parseMoney(setBalance.value || '0');
    const expenses = parseMoney(setExpenses.value || '0');
    const income = parseMoney(setIncome.value || '0');
    if (![balance, expenses, income].every(Number.isFinite)) {
      announce('Введите положительные суммы, не более двух знаков после запятой.');
      return;
    }
    saveBtn.textContent = 'Сохранено';
    saveBtn.classList.add('_saveBtnDone_1vfp6_235');
    setTimeout(() => {
      setState({ senderName: newSender || state.senderName, shortName, balance, expenses, income, screen: 'home' });
    }, 500);
  };
}

function mountSheet(markup, focusId) {
  sheetReturnFocus = document.activeElement?.id || null;
  const sheet = document.getElementById('sheet');
  sheet.innerHTML = markup;
  sheet.onkeydown = event => {
    if (event.key === 'Escape') { event.preventDefault(); closeSheet(); }
    if (event.key !== 'Tab') return;
    const controls = sheet.querySelectorAll('button, input');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.getElementById(focusId)?.focus();
}

function closeSheet() {
  const s = document.getElementById('sheet');
  if (s) s.innerHTML = '';
  if (sheetReturnFocus) document.getElementById(sheetReturnFocus)?.focus({ preventScroll: true });
}

function updateSubmitBtn() {
  const t = state.transfer;
  const num = parseMoney(t.amount);
  const isValid = validTransfer();
  const error = document.getElementById('transferError');
  if (error) error.textContent = num > state.balance ? 'Сумма больше остатка на счёте' : (t.amount && !Number.isFinite(num) ? 'Введите сумму, не более двух знаков после запятой' : '');
  const btn = document.getElementById('submitTransfer');
  if (btn) {
    btn.classList.toggle('_submitBtnActive_1t5vl_184', isValid);
    btn.classList.toggle('_submitBtnDisabled_1t5vl_188', !isValid);
    btn.disabled = !isValid;
  }
}

function formatPhone(v) {
  let digits = String(v).replace(/\D/g, '');
  if (!digits) return '';
  if (digits[0] === '8') digits = '7' + digits.slice(1);
  else if (digits[0] !== '7') digits = '7' + digits;
  digits = digits.slice(0, 11);
  let out = '+7';
  if (digits.length > 1) out += ' (' + digits.slice(1, 4);
  if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
  if (digits.length >= 7) out += '-' + digits.slice(7, 9);
  if (digits.length >= 9) out += '-' + digits.slice(9, 11);
  return out;
}

function doTransfer() {
  const t = state.transfer;
  const num = parseMoney(t.amount);
  if (!validTransfer()) return;
  const id = Math.max(0, ...state.operations.map(o => o.id)) + 1;
  const op = {
    id,
    date: 'Сегодня',
    dateLong: nowDateLong(),
    name: t.name.trim(),
    cat: 'Переводы',
    sub: 'Дебетовая карта',
    amt: num,
    sign: '-',
    av: { letter: initial(t.name), bg: randomColor() },
    phone: t.phone,
    receiptDate: nowReceiptDate(),
    receiptNo: `DEMO-${id}`,
    senderName: state.senderName,
    balanceBefore: state.balance,
    balanceAfter: roundMoney(state.balance - num),
  };
  const newOps = [op, ...state.operations];
  setState({
    operations: newOps,
    balance: op.balanceAfter,
    transfer: { amount: '', phone: '', name: '' },
    selectedOp: op,
    lastTransfer: op,
    screen: 'transferSuccess',
    successIntro: true,
  });
}

// ============ INIT ============
if (isPreview) {
  const example = {
    id: 1000, date: '10 октября', dateLong: '10 октября • 21:28',
    name: 'Получатель Т.', senderName: 'Демо Отправитель',
    cat: 'Переводы', sub: 'Дебетовая карта', amt: 210, sign: '-',
    av: { img: true }, phone: '+7 (000) 000-00-00', balanceBefore: 10116.37, balanceAfter: 9906.37,
    receiptDate: '10.10.2026  21:28:42', receiptNo: 'DEMO-1000',
  };
  state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), balance: 9906.37,
    senderName: 'Демо Отправитель', shortName: 'Демо', operations: [example],
    screen: previewScreen === 'receipt' ? 'receipt' : (['success', 'result'].includes(previewScreen) ? 'transferSuccess' : 'opDetails'),
    successIntro: previewScreen === 'success', selectedOp: example };
}
render();
