// 排盘过程动画：把一张已算好的盘，按「输入 → 十二宫 → 定命宫 → 定五局 → 起紫微 → 安主星 → 四化」重演一遍。
// 只消费 computeChart 的结果，不参与排盘；1× 全程约 44–53 秒（腊月+亥时为最坏路径，仍 <60s）。
import { GAN, ZHI, monthCN, dayCN } from './ziwei.js';

const GRID_POS = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};
const HOUR_CN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 六十甲子纳音全名（与 ziwei.js 内 NAYIN 五行序列一一对应），只为文案展示
const NAYIN_FULL = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
];
const HUA_CLASS = { 禄: 'lu', 权: 'quan', 科: 'ke', 忌: 'ji' };
const JU_ROWS = [['水', '二局'], ['木', '三局'], ['金', '四局'], ['土', '五局'], ['火', '六局']];
const ZIWEI_REST = ['天机', '太阳', '武曲', '天同', '廉贞'];
const TIANFU_ALL = ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];

const mod = (n, m) => ((n % m) + m) % m;

function nayinName(gan, zhi) {
  const g = GAN.indexOf(gan);
  const b = ZHI.indexOf(zhi);
  for (let n = 0; n < 60; n++) {
    if (n % 10 === g && n % 12 === b) return NAYIN_FULL[Math.floor(n / 2)];
  }
  return '';
}

export function openChartAnimation(chart) {
  const prev = document.getElementById('animOverlay');
  if (prev) prev.remove();

  const L = chart.lunar;
  const month = L.monthUsed;
  const hi = L.hourIndex;
  const gz = chart.mingStem + ZHI[chart.mingBranch];
  const nayin = nayinName(chart.mingStem, ZHI[chart.mingBranch]);
  const starBranch = {};
  for (const p of chart.palaces) for (const st of p.stars) starBranch[st.name] = p.branch;

  const overlay = document.createElement('div');
  overlay.id = 'animOverlay';
  overlay.className = 'anim-overlay';
  overlay.innerHTML = `
    <button type="button" class="anim-close" aria-label="关闭动画">${String.fromCharCode(215)}</button>
    <div class="anim-stage">
      <p class="anim-eyebrow"></p>
      <h3 class="anim-title"></h3>
      <div class="anim-board">
        ${chart.palaces.map((p) => {
          const [r, c] = GRID_POS[p.branch];
          return `<div class="anim-cell" data-b="${p.branch}" style="grid-area:${r} / ${c}">
            <span class="ac-pname">${p.name}</span>
            <span class="ac-gz">${p.stemName}${p.branchName}</span>
            <div class="ac-stars"></div>
            <span class="ac-stamp">${p.isMing ? '命' + (p.isShen ? ' 身' : '') : (p.isShen ? '身' : '')}</span>
          </div>`;
        }).join('')}
        <div class="anim-core">
          <span class="core-gz"></span>
          <div class="core-julist"></div>
          <span class="core-big"></span>
          <span class="core-ju"></span>
          <span class="core-nayin"></span>
        </div>
        <div class="anim-dot"><span class="dot-label"></span></div>
      </div>
      <div class="anim-inputs">
        <div class="anim-pill"><span>年</span><b>${L.yearGanZhi}</b></div>
        <div class="anim-pill"><span>月</span><b>${monthCN(L.month)}</b></div>
        <div class="anim-pill"><span>日</span><b>${dayCN(L.day)}</b></div>
        <div class="anim-pill"><span>时</span><b>${L.hourName}时</b></div>
      </div>
      <p class="anim-foot"><span>你的盘 · ${L.text}</span><span>按排盘规则重建 · 全部是表</span></p>
    </div>
    <div class="anim-controls">
      <div class="anim-speeds">
        <button type="button" data-x="1" class="on">1×</button>
        <button type="button" data-x="1.5">1.5×</button>
        <button type="button" data-x="2">2×</button>
      </div>
      <button type="button" class="anim-replay">重播</button>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const board = overlay.querySelector('.anim-board');
  const dot = overlay.querySelector('.anim-dot');
  const dotLabel = overlay.querySelector('.dot-label');
  const cellEl = (b) => overlay.querySelector(`.anim-cell[data-b="${b}"]`);
  const setHead = (eyebrow, titleHtml) => {
    overlay.querySelector('.anim-eyebrow').textContent = eyebrow;
    overlay.querySelector('.anim-title').innerHTML = titleHtml;
  };

  let hideTimer = 0;
  function flashCell(b) {
    const c = cellEl(b);
    c.classList.add('hit');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => c.classList.remove('hit'), 420);
  }
  function tag(b, text) {
    const c = cellEl(b);
    let t = c.querySelector('.ac-tag');
    if (!t) { t = document.createElement('span'); t.className = 'ac-tag'; c.appendChild(t); }
    t.textContent = text;
  }
  function dotTo(b, label) {
    const [r, c] = GRID_POS[b];
    dot.style.left = `${(c - 0.5) * 25}%`;
    dot.style.top = `${(r - 0.5) * 25}%`;
    dot.classList.add('on');
    dotLabel.textContent = label;
    flashCell(b);
  }
  function starOn(name) {
    const b = starBranch[name];
    const sp = document.createElement('span');
    sp.className = 'ac-star';
    sp.textContent = name;
    cellEl(b).querySelector('.ac-stars').appendChild(sp);
    flashCell(b);
  }
  function huaOn({ star, hua }) {
    const sp = [...cellEl(starBranch[star]).querySelectorAll('.ac-star')]
      .find((n) => n.textContent === star);
    if (!sp) return;
    sp.classList.add('is-hua');
    const i = document.createElement('i');
    i.className = 'ac-hua hua-' + HUA_CLASS[hua];
    i.textContent = hua;
    sp.appendChild(i);
  }

  // ---------- 时间轴 ----------
  const steps = [];
  let cursor = 0;
  const at = (delay, fn) => { cursor += delay; steps.push({ t: cursor, fn }); };
  const pills = [...overlay.querySelectorAll('.anim-pill')];
  const juList = overlay.querySelector('.core-julist');
  const julRows = JU_ROWS.map(([wx, ju]) => {
    const row = document.createElement('div');
    row.className = 'ju-row';
    row.innerHTML = `<b>${wx}</b><span>${ju}</span>`;
    juList.appendChild(row);
    return row;
  });
  const palaceOrder = [];
  for (let i = 0; i < 12; i++) palaceOrder.push(chart.palaces[mod(chart.mingBranch + i, 12)]);
  const monthBranch = mod(2 + month - 1, 12);

  // 输入
  at(0, () => {
    setHead('输入', `农历 <em>${monthCN(L.month)}${dayCN(L.day)}</em> · <em>${L.hourName}时</em>`);
    board.classList.add('on');
  });
  pills.forEach((p, i) => at(i === 0 ? 800 : 550, () => p.classList.add('on')));

  // 十二宫
  at(700, () => setHead('十二宫', '位置固定，先落宫名'));
  for (const p of palaceOrder) at(650, () => { cellEl(p.branch).classList.add('on'); flashCell(p.branch); });

  // 第一步 · 定命宫（顺数到生月）
  at(950, () => { setHead('第一步 · 定命宫', '从<em>寅</em>起正月，顺数到生月'); dotTo(2, '正月'); });
  at(500, () => tag(2, '正月'));
  for (let m = 2; m <= month; m++) {
    at(520, () => { const b = mod(2 + m - 1, 12); dotTo(b, monthCN(m)); tag(b, monthCN(m)); });
  }
  at(1050, () => dotTo(monthBranch, `落在${ZHI[monthBranch]}`));

  // 第一步 · 定命宫（逆数到生时）
  at(850, () => setHead('第一步 · 定命宫', `再从<em>${ZHI[monthBranch]}</em>起子时，逆数到生时`));
  at(500, () => { dotTo(monthBranch, '子时'); tag(monthBranch, '子时'); });
  for (let x = 1; x <= hi; x++) {
    at(520, () => { const b = mod(monthBranch - x, 12); dotTo(b, `${HOUR_CN[x]}时`); tag(b, `${HOUR_CN[x]}时`); });
  }
  at(1050, () => {
    dotTo(chart.mingBranch, `落在${ZHI[chart.mingBranch]}`);
    cellEl(chart.mingBranch).classList.add('ming-on');
  });
  at(700, () => {
    overlay.querySelector('.core-gz').textContent = `命宫 · ${gz}`;
    overlay.querySelector('.core-gz').classList.add('on');
  });

  // 第二步 · 定五局
  at(1000, () => {
    setHead('第二步 · 定五局', `命宫干支<em>${gz}</em>，纳音「${nayin}」`);
    dot.classList.remove('on');
    overlay.querySelectorAll('.ac-tag').forEach((n) => n.remove());
    juList.classList.add('on');
  });
  julRows.forEach((row) => at(360, () => row.classList.add('on')));
  at(800, () => {
    julRows[chart.ju - 2].classList.add('row-hit');
    setHead('第二步 · 定五局', `命宫<em>${gz}</em>，纳音属${chart.wuxing} → <em>${chart.juName}</em>`);
  });
  at(850, () => {
    juList.classList.remove('on');
    overlay.querySelector('.core-big').textContent = chart.wuxing;
    overlay.querySelector('.core-ju').textContent = chart.juName;
    overlay.querySelector('.core-nayin').textContent = `纳音「${nayin}」`;
    overlay.querySelector('.core-big').classList.add('on');
    overlay.querySelector('.core-ju').classList.add('on');
    overlay.querySelector('.core-nayin').classList.add('on');
  });

  // 第三步 · 起紫微
  at(1050, () => setHead('第三步 · 起紫微',
    `<em>${chart.juName}</em> × <em>${dayCN(L.day)}</em> 查表 → 紫微在<em>${ZHI[chart.ziweiBranch]}</em>`));
  at(1000, () => starOn('紫微'));

  // 第四步 · 安主星
  at(950, () => setHead('第四步 · 安主星', '<em>紫微系</em> 逆排，一步不差'));
  for (const n of ZIWEI_REST) at(900, () => starOn(n));
  at(800, () => setHead('第四步 · 安主星', '<em>天府系</em> 顺排，八星归位'));
  for (const n of TIANFU_ALL) at(850, () => starOn(n));

  // 第五步 · 四化
  at(950, () => setHead('第五步 · 四化', `生年天干<em>${chart.yearGan}</em>，四化各盖一个戳`));
  for (const h of chart.sihuaPlaced) at(900, () => huaOn(h));

  // 收尾
  at(1150, () => {
    setHead('所以', '不需要抬头看天，一张<em>算</em>出来的盘');
    if (chart.borrowed) {
      const sp = document.createElement('span');
      sp.className = 'ac-borrow';
      sp.textContent = `借 ${chart.mingStars.map((s) => s.name).join(' · ')}`;
      cellEl(chart.mingBranch).querySelector('.ac-stars').appendChild(sp);
    }
  });
  // 1× 总时长 = cursor（约 44s；腊月+亥时最坏约 53s）

  // ---------- 播放引擎 ----------
  let raf = 0, last = null, elapsed = 0, idx = 0, speed = 1;

  function resetScene() {
    cancelAnimationFrame(raf);
    raf = 0; last = null; elapsed = 0; idx = 0;
    board.classList.remove('on');
    overlay.querySelectorAll('.anim-cell').forEach((c) => {
      c.classList.remove('on', 'hit', 'ming-on');
      c.querySelector('.ac-stars').replaceChildren();
    });
    pills.forEach((p) => p.classList.remove('on'));
    overlay.querySelectorAll('.ac-tag').forEach((n) => n.remove());
    overlay.querySelectorAll('.core-gz,.core-big,.core-ju,.core-nayin').forEach((n) => {
      n.classList.remove('on');
      n.textContent = '';
    });
    juList.classList.remove('on');
    julRows.forEach((r) => r.classList.remove('on', 'row-hit'));
    dot.classList.remove('on');
    dotLabel.textContent = '';
    setHead('', '');
  }

  function frame(now) {
    if (last === null) last = now;
    elapsed += (now - last) * speed;
    last = now;
    while (idx < steps.length && steps[idx].t <= elapsed) steps[idx++].fn();
    if (idx < steps.length) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function play() { resetScene(); raf = requestAnimationFrame(frame); }

  function close() {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    document.body.style.overflow = '';
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);

  overlay.querySelector('.anim-close').addEventListener('click', close);
  overlay.querySelector('.anim-replay').addEventListener('click', play);
  overlay.querySelectorAll('.anim-speeds button').forEach((btn) => {
    btn.addEventListener('click', () => {
      speed = parseFloat(btn.dataset.x);
      overlay.querySelectorAll('.anim-speeds button').forEach((b) => b.classList.toggle('on', b === btn));
    });
  });

  play();
}
