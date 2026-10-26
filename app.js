import { computeChart, patternKey, ZHI } from './ziwei.js';
import { getReading } from './content.js';
import { explainChart, pairReading, HUA_LEGEND } from './explain.js';
import { openChartAnimation } from './animation.js';
import { CITIES, trueSolar, dstWindow, lonFromInput, findCity } from './solar.js';

const $ = (id) => document.getElementById(id);
const el = {
  form: $('form'), date: $('date'), time: $('time'), error: $('error'),
  intro: $('intro'), result: $('result'), card: $('card'), cardFrame: $('cardFrame'),
  chart: $('chart'), birth: $('birth'), vtype: $('vtype'), vline: $('vline'), vcost: $('vcost'),
  juChar: $('juChar'), juName: $('juName'), coreSub: $('coreSub'), coreLunar: $('coreLunar'),
  coreHua: $('coreHua'),
  exMing: $('exMing'), exMingMeta: $('exMingMeta'), exShen: $('exShen'), exShenMeta: $('exShenMeta'),
  exJi: $('exJi'), exJiMeta: $('exJiMeta'), exChips: $('exChips'), exLegend: $('exLegend'),
  exQuestion: $('exQuestion'), exQuestionBox: $('exQuestionBox'), plainList: $('plainList'),
  stageChart: $('stageChart'),
  pairForm: $('pairForm'), pairDate: $('pairDate'), pairTime: $('pairTime'), pairError: $('pairError'),
  pairResult: $('pairResult'), pairCards: $('pairCards'), pairBlocks: $('pairBlocks'),
  pairAsks: $('pairAsks'), pairShare: $('pairShare'),
  facts: $('facts'), copy: $('copy'), save: $('save'), share: $('share'), back: $('back'),
  random: $('random'), toast: $('toast'), lightbox: $('lightbox'), lightboxInner: $('lightboxInner'),
  calibCity: $('calibCity'), calibLon: $('calibLon'), calibDstBox: $('calibDstBox'),
  cityList: $('cityList'),
  calibDst: $('calibDst'), calibDstWin: $('calibDstWin'), calibOut: $('calibOut'),
  calibNotes: $('calibNotes'), solarBar: $('solarBar'),
  anim: $('anim'),
};

const GRID_POS = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};
const HUA_CLASS = { 禄: 'lu', 权: 'quan', 科: 'ke', 忌: 'ji' };
const pad = (n) => String(n).padStart(2, '0');
const ymdText = (o) => `${o.y}-${pad(o.m)}-${pad(o.d)}`;
const hmText = (o) => `${pad(o.h)}:${pad(o.min)}`;

let current = null;
let pair = null;
let toastTimer = 0;

function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2200);
}

/* 移动端/iOS Safari 里原生的平滑滚动 API 在 fixed/transform 容器内行为不可靠，统一用 rect 手动滚 */
function scrollToEl(node, offset) {
  const r = node.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top - (offset || 24), behavior: 'smooth' });
}

function fitCard() {
  if (el.result.hidden) return;
  const host = el.stageChart.clientWidth;
  if (!host) return;
  const width = Math.min(host, 560);
  const scale = width / 1080;
  el.card.style.transform = `scale(${scale})`;
  el.cardFrame.style.width = `${width}px`;
  el.cardFrame.style.height = `${1440 * scale}px`;
}

function renderCells(chart) {
  const fragment = document.createDocumentFragment();
  for (const p of chart.palaces) {
    const cell = document.createElement('div');
    cell.className = 'cell' + (p.isMing ? ' is-ming' : '');
    cell.dataset.branch = p.branch;
    const [row, col] = GRID_POS[p.branch];
    cell.style.gridArea = `${row} / ${col}`;

    const name = document.createElement('div');
    name.className = 'cell-name';
    name.textContent = p.name;

    const stars = document.createElement('div');
    stars.className = 'cell-stars';
    if (p.stars.length) {
      for (const s of p.stars) {
        const line = document.createElement('div');
        line.className = 'star';
        line.textContent = s.name;
        if (s.sihua) {
          const hua = document.createElement('i');
          hua.className = `hua hua-${HUA_CLASS[s.sihua]}`;
          hua.textContent = s.sihua;
          line.appendChild(hua);
        }
        stars.appendChild(line);
      }
    } else {
      const empty = document.createElement('span');
      empty.className = 'cell-empty';
      empty.textContent = '空宫';
      stars.appendChild(empty);
      if (p.isMing) {
        const borrow = document.createElement('span');
        borrow.className = 'cell-borrow';
        borrow.textContent = `借 ${chart.mingStars.map((s) => s.name).join(' · ')}`;
        stars.appendChild(borrow);
      }
    }

    const branch = document.createElement('div');
    branch.className = 'cell-branch';
    branch.textContent = p.branchName;

    cell.append(name, stars, branch);
    if (p.isMing) {
      const seal = document.createElement('div');
      seal.className = 'seal';
      seal.textContent = p.isShen ? '命身' : '命';
      if (p.isShen) seal.style.minWidth = '36px';
      cell.appendChild(seal);
    } else if (p.isShen) {
      const shen = document.createElement('div');
      shen.className = 'shen';
      shen.textContent = '身';
      cell.appendChild(shen);
    }
    fragment.appendChild(cell);
  }
  el.chart.querySelectorAll('.cell').forEach((n) => n.remove());
  el.chart.insertBefore(fragment, el.chart.querySelector('.core'));
}

// ---------- 时辰校准（选填）：默认路径不经过这里 ----------

el.cityList.append(...CITIES.map((c) => {
  const o = document.createElement('option');
  o.value = c.name;
  o.label = `东经 ${c.lon.toFixed(2)}°`;
  return o;
}));

let linkCalibrated = false;

function formInput() {
  const dm = (el.date.value || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const tm = (el.time.value || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!dm || !tm) return null;
  return { y: +dm[1], m: +dm[2], d: +dm[3], h: +tm[1], min: +tm[2] };
}

function calibState() {
  return { lon: lonFromInput(el.calibCity.value, el.calibLon.value), isDST: el.calibDst.checked };
}

function updateCalib() {
  const inp = formInput();
  const win = inp ? dstWindow(inp.y, inp.m, inp.d) : null;
  el.calibDstBox.hidden = !win;
  if (win) {
    el.calibDstWin.textContent =
      `${inp.y} 年 ${win.from[0]} 月 ${win.from[1]} 日 02:00 — ${win.to[0]} 月 ${win.to[1]} 日 02:00`;
  } else {
    el.calibDst.checked = false;
  }

  const notes = [];
  const typed = (el.calibCity.value || '').trim();
  const city = findCity(typed);
  const lon = city ? city.lon : lonFromInput('', el.calibLon.value);

  if (!inp) {
    el.calibOut.textContent = '先填出生日期和时间。';
    el.calibOut.classList.remove('is-changed');
    if (linkCalibrated) notes.push('链接里的时间已经是校准后的真太阳时；再选城市会在校准值上再校一次。');
    renderCalibNotes(notes);
    return;
  }
  if (lon == null) {
    if (typed && !city) notes.push(`「${typed}」不在表里：从建议里选一个，或在右边手填东经度。`);
    else if (el.calibLon.value !== '') notes.push('经度要落在 73–135（东经为正）。');
    else notes.push('选一个出生城市，或直接填东经度。');
    if (linkCalibrated) notes.push('链接里的时间已经是校准后的真太阳时；再选城市会在校准值上再校一次。');
    el.calibOut.textContent = '';
    el.calibOut.classList.remove('is-changed');
    renderCalibNotes(notes);
    return;
  }

  const r = trueSolar({ ...inp, lon, isDST: el.calibDst.checked });
  const day = r.crossDay ? `${r.solar.m} 月 ${r.solar.d} 日 ` : '';
  el.calibOut.textContent =
    `真太阳时 ≈ ${day}${hmText(r.solar)} → ${r.solarHourName}时`
    + `（北京时间 ${hmText(inp)} ${r.clockHourName}时 → ${r.changed ? '已调整' : '无需调整'}）`;
  el.calibOut.classList.toggle('is-changed', r.changed);
  notes.push(city
    ? `按 ${city.name} · 东经 ${city.lon.toFixed(2)}° 校正。`
    : `按手填东经 ${lon.toFixed(2)}° 校正。`);

  if (r.changed) {
    notes.push(`排盘改用 ${ymdText(r.solar)} ${hmText(r.solar)}；${r.clockHourName}时 → ${r.solarHourName}时，跨了时辰界限。`);
    if (inp.h === 23 && r.solar.h !== 23) {
      notes.push('原本 23:00 之后按次日子时换日，校回亥时后不再换日。');
    }
  } else {
    notes.push('没跨时辰界限、也不跨日：排盘结果与不填城市完全一致。');
  }
  if (r.crossDay) notes.push(`日期一起${r.dayShift > 0 ? '后' : '前'}移一天：${ymdText(r.solar)}。`);
  if (el.calibDst.checked && !r.dstApplied) {
    notes.push('出生时刻在当天 02:00 之前，夏令时还没开始，这一段按钟表时间算。');
  }
  if (win && !el.calibDst.checked) {
    notes.push('出生日落在当年夏令时窗口内：钟表时间被拨快过一小时，勾上再算一次更准。');
  }
  if (linkCalibrated) notes.push('链接里的时间已经是校准后的真太阳时；再选城市会在校准值上再校一次。');
  renderCalibNotes(notes);
}

function renderCalibNotes(list) {
  el.calibNotes.replaceChildren(...list.map((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    return li;
  }));
}

for (const node of [el.date, el.time, el.calibCity, el.calibLon]) {
  node.addEventListener('input', updateCalib);
  node.addEventListener('change', updateCalib);
}
el.calibDst.addEventListener('change', updateCalib);
updateCalib();

function renderFacts(chart, input, solar, fromLink) {
  const stars = chart.mingStars.map((s) => s.name).join(' · ')
    + (chart.borrowed ? '（命宫无主星，借对宫）' : '');
  const rows = [
    ['公历', solar
      ? `${ymdText(solar.clock)} ${hmText(solar.clock)}（北京时间）`
      : `${ymdText(input)} ${hmText(input)}（${fromLink ? '真太阳时 · 链接已校准' : '北京时间'}）`],
    ...(solar ? [['真太阳时', `${ymdText(solar.solar)} ${hmText(solar.solar)}（已用于排盘）`]] : []),
    ['农历', chart.lunar.text],
    ['命宫', `${ZHI[chart.mingBranch]}宫 · ${chart.mingStem}${ZHI[chart.mingBranch]} · ${chart.juName}`],
    ['身宫', `${ZHI[chart.shenBranch]}宫`],
    ['命宫主星', stars],
    ['生年四化', chart.sihuaList.map((s) => `${s.star}化${s.hua}`
      + (s.aux ? `（辅星，在${s.palaceName}宫，只记不绘）` : '')).join(' · ')],
  ];
  const nodes = [];
  for (const [k, v] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    nodes.push(dt, dd);
  }
  el.facts.replaceChildren(...nodes);
}

function renderExplain(chart) {
  const ex = explainChart(chart);
  el.exMing.textContent = ex.ming.text;
  el.exMingMeta.textContent = ex.ming.meta;
  el.exShen.textContent = ex.shen.text;
  el.exShenMeta.textContent = ex.shen.meta;

  if (ex.ji) {
    el.exJi.textContent = ex.ji.text;
    el.exJiMeta.textContent = ex.ji.meta;
    el.exQuestionBox.hidden = false;
    el.exQuestion.textContent = ex.ji.ask;
  } else {
    el.exJi.textContent = '这张盘的化忌没有落在可读的宫位上。';
    el.exJiMeta.textContent = '';
    el.exQuestionBox.hidden = true;
  }

  el.exLegend.textContent = HUA_LEGEND;
  el.exChips.replaceChildren(...ex.chips.map((c) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.palace = c.palaceName;
    btn.className = 'chip';
    const star = document.createElement('b');
    star.textContent = c.star;
    const hua = document.createElement('i');
    hua.className = `hua-${HUA_CLASS[c.hua]}`;
    hua.textContent = c.hua;
    const where = document.createElement('span');
    where.textContent = c.where;
    btn.append(star, hua, where);
    li.appendChild(btn);
    return li;
  }));

  el.plainList.replaceChildren(...ex.rows.map((r) => {
    const li = document.createElement('li');
    li.className = 'palace-row' + (r.isMing ? ' is-ming' : '');
    li.dataset.name = r.name;
    li.dataset.branch = r.node;

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'pr-head';
    head.setAttribute('aria-expanded', 'false');

    const name = document.createElement('b');
    name.className = 'pr-name';
    name.textContent = r.name;
    head.appendChild(name);

    if (r.marks) {
      const mark = document.createElement('i');
      mark.className = 'pr-mark';
      mark.textContent = r.marks;
      head.appendChild(mark);
    }

    const branch = document.createElement('i');
    branch.className = 'pr-branch';
    branch.textContent = r.branch;
    head.appendChild(branch);

    const stars = document.createElement('span');
    stars.className = 'pr-stars';
    stars.textContent = r.stars;
    head.appendChild(stars);

    for (const h of r.hua) {
      const badge = document.createElement('em');
      badge.className = `pr-hua hua-${HUA_CLASS[h.hua]}`;
      badge.textContent = h.hua;
      badge.title = `${h.star}化${h.hua}`;
      head.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'pr-body';
    const inner = document.createElement('div');
    inner.className = 'pr-inner';

    const q = document.createElement('p');
    q.className = 'pr-q';
    q.textContent = r.body.q;
    const line = document.createElement('p');
    line.className = 'pr-line';
    line.textContent = r.body.line;
    const starLine = document.createElement('p');
    starLine.className = 'pr-star-line';
    starLine.textContent = r.body.stars;

    inner.append(q, line, starLine);

    if (r.body.hua.length) {
      const huaList = document.createElement('ul');
      huaList.className = 'pr-hua-lines';
      for (const t of r.body.hua) {
        const item = document.createElement('li');
        item.textContent = t;
        huaList.appendChild(item);
      }
      inner.appendChild(huaList);
    }

    const ask = document.createElement('p');
    ask.className = 'pr-ask';
    ask.textContent = `想一想：${r.body.ask}`;
    inner.appendChild(ask);

    const locate = document.createElement('button');
    locate.type = 'button';
    locate.className = 'pr-locate';
    locate.dataset.branch = String(r.node);
    locate.textContent = '在盘上看看 ↑';
    inner.appendChild(locate);

    body.appendChild(inner);
    li.append(head, body);
    return li;
  }));

  const first = el.plainList.querySelector('.palace-row');
  if (first) setRowOpen(first, true);
}

function setRowOpen(li, open) {
  li.classList.toggle('open', open);
  const head = li.querySelector('.pr-head');
  if (head) head.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function spotCell(branch) {
  const cell = el.chart.querySelector(`.cell[data-branch="${branch}"]`);
  if (!cell) return;
  el.chart.querySelectorAll('.cell.spot').forEach((n) => n.classList.remove('spot'));
  void cell.offsetWidth;
  cell.classList.add('spot');
  setTimeout(() => cell.classList.remove('spot'), 1600);
}

function openPalace(name, options = {}) {
  const li = el.plainList.querySelector(`.palace-row[data-name="${name}"]`);
  if (!li) return;
  el.plainList.querySelectorAll('.palace-row.open').forEach((n) => {
    if (n !== li) setRowOpen(n, false);
  });
  setRowOpen(li, true);
  spotCell(li.dataset.branch);
  if (options.scroll) scrollToEl(li);
}

function renderPair(inputB, options = {}) {
  if (!current) return false;
  let chartB;
  try {
    chartB = computeChart(inputB);
  } catch (err) {
    el.pairError.textContent = err.message;
    return false;
  }
  el.pairError.textContent = '';

  const keyB = chartB.borrowed ? '' : patternKey(chartB.mingStars);
  const readingB = getReading(keyB) || {
    label: chartB.mingStars.map((s) => s.name).join(' · ') + '坐命',
    line: '这张盘的判词还没写完。',
    cost: '',
  };
  const data = pairReading(current.chart, chartB);

  const cards = [
    { who: '你', reading: current.reading, facts: data.cards.a },
    { who: '对方', reading: readingB, facts: data.cards.b },
  ];
  el.pairCards.replaceChildren(...cards.map((c) => {
    const box = document.createElement('div');
    box.className = 'pair-card';
    const who = document.createElement('p');
    who.className = 'pc-who';
    who.textContent = c.who;
    const line = document.createElement('p');
    line.className = 'pc-line';
    line.textContent = c.reading.line;
    const meta = document.createElement('p');
    meta.className = 'pc-meta';
    meta.textContent = `命宫 · ${c.facts.ming}\n身宫 · ${c.facts.shen}　忌 · ${c.facts.ji}\n夫妻宫 · ${c.facts.spouse}`;
    box.append(who, line, meta);
    return box;
  }));

  el.pairBlocks.replaceChildren(...data.blocks.map((b) => {
    const row = document.createElement('div');
    row.className = 'pair-block';
    const label = document.createElement('span');
    label.textContent = b.label;
    const text = document.createElement('p');
    text.textContent = b.text;
    row.append(label, text);
    return row;
  }));

  const askLabel = document.createElement('p');
  askLabel.className = 'pa-label';
  askLabel.textContent = '各自可以问对方一句';
  const askRows = data.asks.map((a) => {
    const row = document.createElement('div');
    row.className = 'pa-row';
    const who = document.createElement('b');
    who.textContent = a.who;
    const q = document.createElement('p');
    q.textContent = a.text;
    row.append(who, q);
    return row;
  });
  el.pairAsks.replaceChildren(askLabel, ...askRows);

  el.pairResult.hidden = false;
  pair = { input: inputB, chart: chartB, reading: readingB };
  syncUrl(current, inputB);
  if (options.scroll !== false) {
    scrollToEl(el.pairResult);
  }
  return true;
}

function shareUrl(src, extra) {
  if (!/^https?:$/.test(location.protocol)) return null;
  const s = src.su || src;
  let url = `${location.origin}${location.pathname}?d=${s.y}-${pad(s.m)}-${pad(s.d)}&t=${pad(s.h)}:${pad(s.min)}`;
  if (src.st) url += '&st=1';
  if (extra) {
    url += `&d2=${extra.y}-${pad(extra.m)}-${pad(extra.d)}&t2=${pad(extra.h)}:${pad(extra.min)}`;
  }
  return url;
}

function syncUrl(input, extra) {
  const url = shareUrl(input, extra);
  if (!url) return;
  try { history.replaceState(null, '', url); } catch { /* file:// 等环境忽略 */ }
}

function render(input, options = {}) {
  const calib = 'calib' in options ? options.calib : calibState();
  let solar = null;
  let chartInput = input;
  if (calib && calib.lon != null) {
    const r = trueSolar({ ...input, lon: calib.lon, isDST: calib.isDST });
    if (r.changed) {
      solar = r;
      chartInput = r.solar;
    }
  }

  let chart;
  try {
    chart = computeChart(chartInput);
  } catch (err) {
    el.error.textContent = err.message;
    return false;
  }
  el.error.textContent = '';

  if (solar) {
    el.solarBar.textContent = `本盘时辰已按出生地真太阳时校准：钟表 ${ymdText(solar.clock)} ${hmText(solar.clock)}`
      + ` → 真太阳时 ${ymdText(solar.solar)} ${hmText(solar.solar)}（${solar.solarHourName}时）`;
    el.solarBar.hidden = false;
  } else if (options.fromLink) {
    el.solarBar.textContent = '本盘时辰已按出生地真太阳时校准：链接里的日期与时间就是校准后的真太阳时；出生地不随链接传输。';
    el.solarBar.hidden = false;
  } else {
    el.solarBar.hidden = true;
  }

  const key = chart.borrowed ? '' : patternKey(chart.mingStars);
  const reading = getReading(key) || {
    label: chart.mingStars.map((s) => s.name).join(' · ') + '坐命',
    line: '这张盘的判词还没写完。',
    cost: '—— 内容缺省',
  };

  el.card.dataset.ju = chart.wuxing;
  el.birth.textContent = `${input.y}.${pad(input.m)}.${pad(input.d)} ${pad(input.h)}:${pad(input.min)}`;
  el.vtype.textContent = reading.label;
  el.vline.textContent = reading.line;
  el.vline.classList.toggle('long', reading.line.length >= 24);
  el.vcost.textContent = reading.cost;
  el.juChar.textContent = chart.wuxing;
  el.juName.textContent = chart.juName;
  el.coreSub.textContent = `命宫 ${ZHI[chart.mingBranch]} · 身宫 ${ZHI[chart.shenBranch]}`;
  el.coreLunar.textContent = chart.lunar.text;
  el.coreHua.replaceChildren(...chart.sihuaPlaced.map((s) => {
    const item = document.createElement('span');
    const hua = document.createElement('b');
    hua.className = `hua-${HUA_CLASS[s.hua]}`;
    hua.textContent = s.hua;
    item.append(hua, s.star);
    return item;
  }));

  renderCells(chart);
  renderFacts(chart, input, solar, options.fromLink);
  renderExplain(chart);
  el.result.dataset.ju = chart.wuxing;

  pair = null;
  el.pairResult.hidden = true;
  el.pairError.textContent = '';

  el.intro.hidden = true;
  el.result.hidden = false;
  current = { ...input, chart, reading, su: solar ? solar.solar : null, st: Boolean(solar) || Boolean(options.fromLink) };
  fitCard();
  if (options.updateUrl !== false) syncUrl(current);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return true;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

el.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dateValue = el.date.value;
  if (!dateValue) {
    el.error.textContent = '先选一个出生日期。';
    return;
  }
  const [y, m, d] = dateValue.split('-').map(Number);
  const [h, min] = (el.time.value || '12:00').split(':').map(Number);
  linkCalibrated = false;
  render({ y, m, d, h, min: min || 0 });
});

el.random.addEventListener('click', () => {
  const y = 1950 + Math.floor(Math.random() * 55);
  const m = 1 + Math.floor(Math.random() * 12);
  const d = 1 + Math.floor(Math.random() * 28);
  const h = Math.floor(Math.random() * 23);
  const min = Math.floor(Math.random() * 60);
  el.date.value = `${y}-${pad(m)}-${pad(d)}`;
  el.time.value = `${pad(h)}:${pad(min)}`;
  linkCalibrated = false;
  render({ y, m, d, h, min }, { calib: { lon: null } });
  updateCalib();
});

el.back.addEventListener('click', () => {
  el.result.hidden = true;
  el.intro.hidden = false;
  if (/^https?:$/.test(location.protocol)) {
    try { history.replaceState(null, '', location.pathname); } catch { /* ignore */ }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

el.pairForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!current) return;
  if (!el.pairDate.value) {
    el.pairError.textContent = '先选对方的出生日期。';
    return;
  }
  const [y, m, d] = el.pairDate.value.split('-').map(Number);
  const [h, min] = (el.pairTime.value || '12:00').split(':').map(Number);
  renderPair({ y, m, d, h, min: min || 0 });
});

el.pairShare.addEventListener('click', async () => {
  if (!current) return;
  const url = shareUrl(current, pair?.input);
  if (!url) {
    toast('本地打开时没有可分享的链接');
    return;
  }
  const ok = await copyText(url);
  toast(ok ? '这一对的链接已复制' : '复制失败');
});

el.copy.addEventListener('click', async () => {
  if (!current) return;
  const url = shareUrl(current);
  const text = `${current.reading.label}｜${current.reading.line}\n${current.reading.cost}\n—— 紫微十二宫${url ? '\n' + url : ''}`;
  const ok = await copyText(text);
  toast(ok ? '判词已复制，可以直接发出去' : '复制失败，请手动选中');
});

el.share.addEventListener('click', async () => {
  if (!current) return;
  const url = shareUrl(current);
  if (!url) {
    toast('本地打开时没有可分享的链接');
    return;
  }
  const ok = await copyText(url);
  toast(ok ? '链接已复制' : '复制失败');
});

el.save.addEventListener('click', async () => {
  if (!current || !window.htmlToImage) {
    toast('导出组件未加载');
    return;
  }
  toast('正在生成 1080×1440…');
  try {
    const dataUrl = await window.htmlToImage.toPng(el.card, {
      width: 1080,
      height: 1440,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: '#f2e9d8',
      style: { transform: 'none' },
    });
    // 手机浏览器对 dataURL 下载普遍无响应；探测不到 download 能力就走灯箱长按回退
    if ('download' in document.createElement('a')) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `紫微-${current.reading.label}-${current.y}${pad(current.m)}${pad(current.d)}.png`;
      a.click();
      toast('已生成下载；手机端若无响应，再点一次→长按保存');
    } else {
      showLightboxImage(dataUrl);
      toast('长按图片保存到相册');
    }
  } catch (err) {
    console.error(err);
    toast('生成失败，可以直接截图');
  }
});

el.anim.addEventListener('click', () => {
  if (!current) {
    toast('先起一盘，再看排盘过程');
    return;
  }
  openChartAnimation(current.chart);
});

el.card.addEventListener('click', () => {
  if (!current) return;
  const clone = el.card.cloneNode(true);
  clone.removeAttribute('id');
  clone.style.transform = 'none';
  clone.style.cursor = 'default';
  el.lightboxInner.replaceChildren(lightboxCloseButton(), clone);
  el.lightbox.hidden = false;
  el.lightbox.scrollTop = 0;
  document.body.style.overflow = 'hidden';
});

el.plainList.addEventListener('click', (e) => {
  const locate = e.target.closest('.pr-locate');
  if (locate) {
    spotCell(locate.dataset.branch);
    scrollToEl(el.cardFrame);
    return;
  }
  const head = e.target.closest('.pr-head');
  if (!head) return;
  const li = head.closest('.palace-row');
  if (li.classList.contains('open')) {
    setRowOpen(li, false);
  } else {
    openPalace(li.dataset.name);
  }
});

el.exChips.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-palace]');
  if (!btn) return;
  openPalace(btn.dataset.palace, { scroll: true });
});

function lightboxCloseButton() {
  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'lb-close';
  x.textContent = String.fromCharCode(215);
  x.setAttribute('aria-label', '关闭放大图');
  x.addEventListener('click', closeLightbox);
  return x;
}

function showLightboxImage(dataUrl) {
  const img = document.createElement('img');
  img.className = 'lb-image';
  img.alt = '长按这张图可保存到相册';
  img.src = dataUrl;
  el.lightboxInner.replaceChildren(lightboxCloseButton(), img);
  el.lightbox.hidden = false;
  el.lightbox.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  el.lightbox.hidden = true;
  el.lightboxInner.replaceChildren();
  document.body.style.overflow = '';
}
el.lightbox.addEventListener('click', (e) => {
  if (e.target === el.lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.lightbox.hidden) closeLightbox();
});

window.addEventListener('resize', fitCard);
if ('ResizeObserver' in window) new ResizeObserver(fitCard).observe(el.stageChart);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCard);

(function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const dateRaw = params.get('d');
  if (!dateRaw) return;
  const dm = dateRaw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const tm = (params.get('t') || '12:00').match(/^(\d{1,2}):(\d{2})$/);
  if (!dm || !tm) return;
  const st = params.get('st') === '1';
  linkCalibrated = st;
  el.date.value = `${dm[1]}-${pad(+dm[2])}-${pad(+dm[3])}`;
  el.time.value = `${pad(+tm[1])}:${tm[2]}`;
  render({ y: +dm[1], m: +dm[2], d: +dm[3], h: +tm[1], min: +tm[2] },
    { updateUrl: false, fromLink: st, calib: null });
  updateCalib();

  const date2 = params.get('d2');
  if (!date2) return;
  const dm2 = date2.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const tm2 = (params.get('t2') || '12:00').match(/^(\d{1,2}):(\d{2})$/);
  if (!dm2 || !tm2) return;
  el.pairDate.value = `${dm2[1]}-${pad(+dm2[2])}-${pad(+dm2[3])}`;
  el.pairTime.value = `${pad(+tm2[1])}:${tm2[2]}`;
  renderPair({ y: +dm2[1], m: +dm2[2], d: +dm2[3], h: +tm2[1], min: +tm2[2] }, { scroll: false });
})();
