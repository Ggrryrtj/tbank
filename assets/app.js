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

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('tbank_state');
    if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
  } catch(e) {}
  return { ...DEFAULT_STATE };
}
function saveState() {
  const { screen, selectedOp, lastTransfer, transfer, ...persist } = state;
  localStorage.setItem('tbank_state', JSON.stringify(persist));
}
function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

// ============ HELPERS ============
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
  `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" ${extra}>${path}</svg>`;
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

// ============ COMPONENTS ============
function statusBar() {
  return '';
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
              <span>${state.shortName}</span>
              ${ICONS.chevDown}
            </div>
          </div>
          <button class="_settingsBtn_riypy_53" data-go="settings">${ICONS.settings}</button>
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
    ? `<img src="assets/tbank-logo.png" style="width:44px;height:44px;border-radius:22px;object-fit:cover">`
    : `<div class="_opAvatar_15ho2_172" style="background:${op.av.bg}"><span class="_opLetter_15ho2_183">${op.av.letter}</span></div>`;
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
          <span class="_opName_15ho2_200">${op.name}</span>
          <span class="_opAmount_15ho2_210" style="color:${color}">${amtTxt}</span>
        </div>
        <div class="_opRow_15ho2_194">
          <span class="_opCategory_15ho2_217">${op.cat}</span>
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
              <span class="_dateLabel_15ho2_150">${g.date}</span>
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
  const num = parseFloat(t.amount.replace(',', '.')) || 0;
  const isValid = num > 0 && num <= state.balance && t.phone.replace(/\D/g,'').length >= 11 && t.name.trim().length > 0;
  const overBalance = num > state.balance;
  return `
    <div class="_screen_1t5vl_1">
      ${statusBar()}
      <div class="_header_1t5vl_11">
        <button class="_backBtn_1t5vl_19" data-go="home">${ICONS.back}</button>
        <span class="_headerTitle_1t5vl_26">Перевод по телефону</span>
        <div style="width:34px"></div>
      </div>
      <div class="_body_1t5vl_32">
        <div class="_amountCard_1t5vl_43">
          <div class="_amountWrap_1t5vl_52">
            <input id="amt" class="_amountInput_1t5vl_59" type="text" inputmode="decimal" placeholder="0" value="${t.amount}">
            <span class="_currency_1t5vl_72">₽</span>
          </div>
        </div>
        <div class="_fieldCard_1t5vl_80">
          <div class="_fieldRow_1t5vl_87">
            <span class="_label_1t5vl_95">Номер телефона</span>
            <input id="phone" class="_input_1t5vl_102" type="tel" placeholder="+7 (___) ___-__-__" value="${t.phone}">
          </div>
          <div class="_fieldRow_1t5vl_87">
            <span class="_label_1t5vl_95">Имя получателя</span>
            <input id="rcpt" class="_input_1t5vl_102" type="text" placeholder="Фирузахон А." maxlength="60" value="${t.name}">
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
        ${overBalance ? '<div class="_error_1t5vl_159">Сумма больше остатка на счёте</div>' : ''}
      </div>
      <div class="_footer_1t5vl_167">
        <button class="_submitBtn_1t5vl_173 ${isValid ? '_submitBtnActive_1t5vl_184' : '_submitBtnDisabled_1t5vl_188'}" ${isValid ? '' : 'disabled'} id="submitTransfer">Перевести</button>
      </div>
      ${bottomNav()}
    </div>
  `;
}

// ============ SCREEN: OPERATION DETAILS ============
function screenOpDetails() {
  const op = state.selectedOp;
  if (!op) return screenHome();
  const color = op.sign === '+' ? '#34c759' : '#1c1c1e';
  const sign = op.sign === '+' ? '+' : '-';
  const isTransferOut = op.cat === 'Переводы' && op.sign === '-';
  return `
    <div class="_screen_55ji0_1">
      ${statusBar()}
      <div class="_topBar_55ji0_12">
        <span class="_dateText_55ji0_20">${op.dateLong || op.date + ' • 11:47'}</span>
        <div class="_topActions_55ji0_26">
          <button class="_deleteBtn_55ji0_32" id="askDelete">${ICONS.trash}</button>
          <button class="_closeBtn_55ji0_32" data-go="operations">${ICONS.close}</button>
        </div>
      </div>
      <div class="_content_55ji0_39">
        <div class="_hero_55ji0_48">
          <div class="_heroLogo_55ji0_56">
            <img src="assets/tbank-logo.png" style="width:72px;height:72px;border-radius:36px;object-fit:cover">
          </div>
          <div class="_heroName_55ji0_64">${op.name}</div>
          <div class="_heroBadges_55ji0_70">
            <div class="_badge_55ji0_76"><span>🔄</span><span class="_badgeText_55ji0_85">${op.cat}</span></div>
            <div class="_editBadge_55ji0_91">${ICONS.edit}</div>
          </div>
          <div class="_heroAmount_55ji0_101" style="color:${color}">${sign}${fmtInt(op.amt)} ₽</div>
        </div>
        <div class="_quickActions_55ji0_108">
          <div class="_quickItem_55ji0_117">${ICONS.star}<span class="_quickLabel_55ji0_130">Избранное</span></div>
          <div class="_quickItem_55ji0_117" data-go="transfer">${ICONS.repeat}<span class="_quickLabel_55ji0_130">Повторить</span></div>
          <div class="_quickItem_55ji0_117">${ICONS.eyeOff}<span class="_quickLabel_55ji0_130">Не учитывать</span></div>
        </div>
        <div class="_card_55ji0_138">
          <div class="_cardHeader_55ji0_146">
            <span class="_cardTitle_55ji0_153">Перевод</span>
            <span class="_cardLink_55ji0_159" data-go="receipt">Справка</span>
          </div>
          <div class="_accountRow_55ji0_167">
            <div class="_accountIcon_55ji0_175"><span style="color:#fff;font-weight:700;font-size:14px">₽</span></div>
            <div class="_accountInfo_55ji0_185">
              <div class="_accountName_55ji0_190">Black</div>
              <div class="_accountSub_55ji0_196">${fmt(state.balance)} ₽</div>
            </div>
            ${ICONS.chevRight}
          </div>
        </div>
        ${op.phone ? `
        <div class="_card_55ji0_138" style="margin-top:10px">
          <div class="_cardTitle_55ji0_153" style="margin-bottom:10px">Реквизиты</div>
          <div style="border-top:1px solid #f2f2f7;padding-top:10px">
            <div style="font-size:12px;color:#8e8e93;margin-bottom:4px">Номер телефона</div>
            <div style="font-size:17px;font-weight:600">${op.phone}</div>
          </div>
        </div>` : ''}
        ${isTransferOut ? `
        <div style="padding:14px 16px 0">
          <button class="_submitBtn_1t5vl_173 _submitBtnActive_1t5vl_184" data-go="receipt">Получить квитанцию</button>
        </div>` : ''}
        <div style="height:30px"></div>
      </div>
      <div id="sheet"></div>
    </div>
  `;
}

function sheetDelete() {
  const op = state.selectedOp;
  return `
    <div class="_overlay_55ji0_222" id="overlay"></div>
    <div class="_sheet_55ji0_235">
      <div class="_sheetHandle_55ji0_258"></div>
      <div class="_sheetIcon_55ji0_266">${svg(`<polyline points="3 6 5 6 21 6" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"/><path d="M9 6V4h6v2" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, 28, 28)}</div>
      <div class="_sheetTitle_55ji0_277">Удалить операцию?</div>
      <div class="_sheetSub_55ji0_283">Операция «<span class="_sheetName_55ji0_291">${op.name}</span>» будет удалена из истории.</div>
      <div class="_sheetBtns_55ji0_296">
        <button class="_sheetCancel_55ji0_304" id="cancelDel">Отмена</button>
        <button class="_sheetConfirm_55ji0_313" id="confirmDel">Удалить</button>
      </div>
    </div>
  `;
}

// ============ SCREEN: RECEIPT ============
function screenReceipt() {
  const tr = state.lastTransfer || state.selectedOp;
  if (!tr) return screenHome();
  const amt = tr.amt || 0;
  const phone = tr.phone || '';
  const name = tr.name || tr.recipient || '';
  const dt = tr.receiptDate || nowReceiptDate();
  const num = tr.receiptNo || ('1-' + Math.floor(Math.random()*9e8 + 1e8) + '-' + Math.floor(Math.random()*900+100) + '-' + Math.floor(Math.random()*900+100));
  return `
    <div class="_screen_cjsg3_1">
      ${statusBar()}
      <div class="_header_cjsg3_11">
        <span class="_closeBtn_cjsg3_20" data-go="opDetails">Закрыть</span>
        <span class="_headerTitle_cjsg3_28">Квитанция</span>
        <button class="_shareBtn_cjsg3_34">${ICONS.share}</button>
      </div>
      <div class="_scroll_cjsg3_41">
        <div class="_card_cjsg3_48">
          <div class="_logoWrap_cjsg3_57">
            <img src="assets/tbank-logo.png" class="_logoImg_cjsg3_61" alt="T-Bank">
          </div>
          <span class="_datetime_cjsg3_68">${dt}</span>
          <div class="_totalRow_cjsg3_74">
            <span class="_totalLabel_cjsg3_82">Итого</span>
            <span class="_totalAmount_cjsg3_88">${fmtInt(amt)} ₽</span>
          </div>
          <div class="_divider_cjsg3_94"></div>
          <div class="_table_cjsg3_102">
            <div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Перевод</span><span class="_tValue_cjsg3_124">По номеру телефона</span></div>
            <div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Статус</span><span class="_tValue_cjsg3_124">Успешно</span></div>
            <div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Сумма</span><span class="_tValue_cjsg3_124">${fmtInt(amt)} ₽</span></div>
            <div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Комиссия</span><span class="_tValue_cjsg3_124">Без комиссии</span></div>
            <div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Отправитель</span><span class="_tValue_cjsg3_124">${state.senderName}</span></div>
            ${phone ? `<div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Телефон получателя</span><span class="_tValue_cjsg3_124">${phone}</span></div>` : ''}
            <div class="_tableRow_cjsg3_110"><span class="_tLabel_cjsg3_117">Получатель</span><span class="_tValue_cjsg3_124">${name}</span></div>
          </div>
          <div class="_stampWrap_cjsg3_132">
            <img src="assets/podpis.png" class="_stampImg_cjsg3_139" alt="">
          </div>
          <div class="_divider_cjsg3_94"></div>
          <div class="_footer_cjsg3_147">
            <p class="_footerReceipt_cjsg3_155">Квитанция № ${num}</p>
            <p class="_footerNote_cjsg3_160">По вопросам зачисления обращайтесь к получателю</p>
            <p class="_footerSupport_cjsg3_166">Служба поддержки <span class="_footerLink_cjsg3_171">fb@tbank.ru</span></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ SCREEN: SETTINGS ============
function screenSettings() {
  return `
    <div class="_screen_1vfp6_1">
      ${statusBar()}
      <div class="_header_1vfp6_11">
        <button class="_backBtn_1vfp6_19" data-go="home">${ICONS.back}</button>
        <span class="_headerTitle_1vfp6_26">Настройки</span>
        <div style="width:34px"></div>
      </div>
      <div class="_scroll_1vfp6_32">
        <div class="_section_1vfp6_43">
          <span class="_sectionTitle_1vfp6_56">Отправитель</span>
          <div class="_card_1vfp6_66">
            <div>
              <label class="_fieldLabel_1vfp6_76">Имя отправителя</label>
              <input class="_input_1vfp6_84" id="setSender" placeholder="Иван Иванов" value="${state.senderName}">
            </div>
          </div>
        </div>
        <div class="_section_1vfp6_43">
          <span class="_sectionTitle_1vfp6_56">Счёт Black</span>
          <div class="_card_1vfp6_66">
            <div>
              <label class="_fieldLabel_1vfp6_76">Остаток на счёте (₽)</label>
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
                <label class="_fieldLabel_1vfp6_76">Траты (₽)</label>
                <input class="_input_1vfp6_84" id="setExpenses" inputmode="decimal" placeholder="31263" value="${state.expenses}">
              </div>
              <div class="_halfField_1vfp6_105">
                <label class="_fieldLabel_1vfp6_76">Доходы (₽)</label>
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
              <button class="_toggle_1vfp6_157 ${state.showDetails ? '_toggleOn_1vfp6_195' : ''}" id="toggleDet" role="switch" aria-checked="${state.showDetails}">
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
  const screens = {
    home: screenHome,
    operations: screenOperations,
    transfer: screenTransfer,
    opDetails: screenOpDetails,
    receipt: screenReceipt,
    settings: screenSettings,
  };
  root.innerHTML = (screens[state.screen] || screenHome)();
  attachHandlers();
}

// ============ HANDLERS ============
function attachHandlers() {
  document.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const target = el.dataset.go;
      if (target === 'opDetails' && !state.selectedOp) return;
      setState({ screen: target });
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

  // Operation details — delete sheet
  const askDel = document.getElementById('askDelete');
  if (askDel) {
    askDel.addEventListener('click', () => {
      document.getElementById('sheet').innerHTML = sheetDelete();
      document.getElementById('cancelDel').onclick = closeSheet;
      document.getElementById('overlay').onclick = closeSheet;
      document.getElementById('confirmDel').onclick = () => {
        const id = state.selectedOp.id;
        const op = state.selectedOp;
        const ops = state.operations.filter(o => o.id !== id);
        const restoredBalance = op.sign === '-' ? state.balance + op.amt : state.balance - op.amt;
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
    const balance = parseFloat((setBalance.value || '0').replace(',', '.')) || 0;
    const expenses = parseFloat((setExpenses.value || '0').replace(',', '.')) || 0;
    const income = parseFloat((setIncome.value || '0').replace(',', '.')) || 0;
    saveBtn.textContent = 'Сохранено';
    saveBtn.classList.add('_saveBtnDone_1vfp6_235');
    setTimeout(() => {
      setState({ senderName: newSender || state.senderName, shortName, balance, expenses, income, screen: 'home' });
    }, 500);
  };
}

function closeSheet() {
  const s = document.getElementById('sheet');
  if (s) s.innerHTML = '';
}

function updateSubmitBtn() {
  const t = state.transfer;
  const num = parseFloat((t.amount || '').replace(',', '.')) || 0;
  const phoneOk = (t.phone || '').replace(/\D/g,'').length >= 11;
  const nameOk = (t.name || '').trim().length > 0;
  const isValid = num > 0 && num <= state.balance && phoneOk && nameOk;
  const btn = document.getElementById('submitTransfer');
  if (btn) {
    btn.classList.toggle('_submitBtnActive_1t5vl_184', isValid);
    btn.classList.toggle('_submitBtnDisabled_1t5vl_188', !isValid);
    btn.disabled = !isValid;
  }
}

function formatPhone(v) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  let out = '+7';
  if (digits.length > 1) out += ' (' + digits.slice(1, 4);
  if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
  if (digits.length >= 7) out += '-' + digits.slice(7, 9);
  if (digits.length >= 9) out += '-' + digits.slice(9, 11);
  return out;
}

function doTransfer() {
  const t = state.transfer;
  const num = parseFloat(t.amount.replace(',', '.'));
  if (!num || num > state.balance) return;
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
    receiptNo: '1-' + Math.floor(Math.random()*9e8 + 1e8) + '-' + Math.floor(Math.random()*900+100) + '-' + Math.floor(Math.random()*900+100),
  };
  const newOps = [op, ...state.operations];
  setState({
    operations: newOps,
    balance: state.balance - num,
    transfer: { amount: '', phone: '', name: '' },
    selectedOp: op,
    lastTransfer: op,
    screen: 'opDetails',
  });
}

// ============ INIT ============
render();
setInterval(() => {
  const times = document.querySelectorAll('._time_12kgh_9');
  times.forEach(t => t.textContent = nowTime());
}, 30000);
