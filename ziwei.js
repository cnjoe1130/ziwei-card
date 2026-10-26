// 紫微斗数排盘（仅十四主星）
// 规则：农历月定命宫；子时换日；闰月十五日后按下月；不取庙旺。

export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const NAYIN = [
  '金', '火', '木', '土', '金', '火', '水', '土', '金', '木',
  '水', '土', '火', '木', '水', '金', '火', '木', '土', '金',
  '火', '水', '土', '金', '木', '水', '土', '火', '木', '水',
];
const JU_BY_WUXING = { 水: 2, 木: 3, 金: 4, 土: 5, 火: 6 };
const JU_CN = { 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };

const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

// 紫微系（逆布）与天府系（顺布）相对紫微/天府的宫位差
const ZIWEI_SERIES = [['紫微', 0], ['天机', -1], ['太阳', -3], ['武曲', -4], ['天同', -5], ['廉贞', -8]];
const TIANFU_SERIES = [['天府', 0], ['太阴', 1], ['贪狼', 2], ['巨门', 3], ['天相', 4], ['天梁', 5], ['七杀', 6], ['破军', 10]];

// 生年四化：年干 -> {星: 化}
const SIHUA = {
  甲: { 廉贞: '禄', 破军: '权', 武曲: '科', 太阳: '忌' },
  乙: { 天机: '禄', 天梁: '权', 紫微: '科', 太阴: '忌' },
  丙: { 天同: '禄', 天机: '权', 文昌: '科', 廉贞: '忌' },
  丁: { 太阴: '禄', 天同: '权', 天机: '科', 巨门: '忌' },
  戊: { 贪狼: '禄', 太阴: '权', 右弼: '科', 天机: '忌' },
  己: { 武曲: '禄', 贪狼: '权', 天梁: '科', 文曲: '忌' },
  庚: { 太阳: '禄', 武曲: '权', 太阴: '科', 天同: '忌' },
  辛: { 巨门: '禄', 太阳: '权', 文曲: '科', 文昌: '忌' },
  壬: { 天梁: '禄', 紫微: '权', 左辅: '科', 武曲: '忌' },
  癸: { 破军: '禄', 巨门: '权', 太阴: '科', 贪狼: '忌' },
};

const MONTH_CN = { 正: 1, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 冬: 11, 腊: 12, 十一: 11, 十二: 12 };
const HOUR_CN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 1900–2100 农历年编码（寿星天文历 sxtwl 生成并逐日校验）
// 低 4 位：闰月；bit16：闰月大小；bit15..4：正月至十二月大小
const LUNAR_INFO = [
  19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970,
  19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343,
  18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800,
  25958, 54432, 59984, 92821, 23248, 11104, 100067, 37600, 116951, 51536,
  54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423,
  27808, 46416, 86869, 19872, 42416, 83315, 21168, 43432, 59728, 27296,
  44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176,
  38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46752, 103846,
  38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256,
  19189, 18800, 25776, 29859, 59984, 27480, 23232, 43872, 38613, 37600,
  51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893,
  43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312,
  31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576,
  23200, 30371, 38608, 19195, 19152, 42192, 118966, 53840, 54560, 56645,
  46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448,
  84835, 37744, 18936, 18800, 25776, 92326, 59984, 27296, 108228, 43744,
  37600, 53987, 51552, 54615, 54432, 55888, 23893, 22176, 42704, 21972,
  21200, 43448, 43344, 46240, 46758, 44368, 21920, 43940, 42416, 21168,
  45683, 26928, 29495, 27296, 44368, 84821, 19296, 42352, 21732, 53600,
  59752, 54560, 55968, 92838, 22224, 19168, 43476, 41680, 53584, 62034,
  54560,
];
const LUNAR_BASE = Date.UTC(1900, 0, 31);
const LUNAR_MAX_OFFSET = Math.floor((Date.UTC(2100, 11, 31) - LUNAR_BASE) / 86400000);

const mod = (n, m) => ((n % m) + m) % m;

function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
function leapDays(y) { return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29; }
function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
function yearDays(y) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  if (leapMonth(y)) sum += leapDays(y);
  return sum;
}

export function hourIndex(h) {
  if (h === 23) return 0;
  return Math.floor((h + 1) / 2) % 12;
}

// 公历（北京时间）转农历
export function solarToLunar(y, m, d) {
  let off = Math.floor((Date.UTC(y, m - 1, d) - LUNAR_BASE) / 86400000);
  if (off < 0 || off > LUNAR_MAX_OFFSET) throw new Error('仅支持 1900-01-31 至 2100-12-31');
  let year = 1900;
  while (year <= 2100) {
    const yd = yearDays(year);
    if (off < yd) break;
    off -= yd;
    year++;
  }
  const leap = leapMonth(year);
  let month = 1;
  let isLeap = false;
  for (month = 1; month <= 12; month++) {
    const days = monthDays(year, month);
    if (off < days) { isLeap = false; break; }
    off -= days;
    if (month === leap) {
      const ld = leapDays(year);
      if (off < ld) { isLeap = true; break; }
      off -= ld;
    }
  }
  return { year, yearGanZhi: ganzhiOfYear(year), month, isLeap, day: off + 1 };
}

export function addDays(y, m, d, n) {
  const t = new Date(Date.UTC(y, m - 1, d) + n * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function ganzhiOfYear(year) {
  return GAN[mod(year - 4, 10)] + ZHI[mod(year - 4, 12)];
}

export function dayCN(n) {
  const d = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  return d[n] || String(n);
}

export function monthCN(n) {
  return ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'][n] || n + '月';
}

function nayinOf(ganIdx, zhiIdx) {
  for (let n = 0; n < 60; n++) {
    if (n % 10 === ganIdx && n % 12 === zhiIdx) return NAYIN[Math.floor(n / 2)];
  }
  throw new Error('干支不存在');
}

// 五虎遁：年干 -> 寅宫天干
function yinStemOf(yearGan) {
  const g = GAN.indexOf(yearGan);
  return [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][g];
}

export function computeChart({ y, m, d, h, min = 0 }) {
  let sy = y, sm = m, sd = d;
  if (h === 23) ({ y: sy, m: sm, d: sd } = addDays(y, m, d, 1)); // 晚子时换日

  const lunar = solarToLunar(sy, sm, sd);
  const hi = hourIndex(h);
  const yearGan = lunar.yearGanZhi[0];

  // 闰月十五之后按下月
  let month = lunar.month;
  if (lunar.isLeap && lunar.day > 15) month += 1;

  const mingBranch = mod(2 + (month - 1) - hi, 12);
  const shenBranch = mod(2 + (month - 1) + hi, 12);

  const yinStem = yinStemOf(yearGan);
  const branchDelta = (b) => mod(b - 2, 12); // 自寅宫顺行步数（跨 12 宫，不是取负）
  const mingStem = mod(yinStem + branchDelta(mingBranch), 10);
  const wuxing = nayinOf(mingStem, mingBranch);
  const ju = JU_BY_WUXING[wuxing];

  // 紫微星：局数除生日，借数偶数顺行、奇数逆行
  const q = Math.ceil(lunar.day / ju);
  const borrow = q * ju - lunar.day;
  const ziweiBranch = mod(2 + (q - 1) + (borrow % 2 === 0 ? borrow : -borrow), 12);
  const tianfuBranch = mod(4 - ziweiBranch, 12);

  const stars = Array.from({ length: 12 }, () => []);
  for (const [name, off] of ZIWEI_SERIES) stars[mod(ziweiBranch + off, 12)].push(name);
  for (const [name, off] of TIANFU_SERIES) stars[mod(tianfuBranch + off, 12)].push(name);

  const sihua = SIHUA[yearGan] || {};
  const palaces = Array.from({ length: 12 }, (_, b) => {
    const pname = PALACE_NAMES[mod(mingBranch - b, 12)];
    const stem = mod(yinStem + branchDelta(b), 10);
    return {
      branch: b,
      branchName: ZHI[b],
      stem,
      stemName: GAN[stem],
      name: pname,
      isMing: b === mingBranch,
      isShen: b === shenBranch,
      stars: stars[b].map((name) => ({ name, sihua: sihua[name] || null })),
    };
  });

  const ming = palaces[mingBranch];
  const opposite = palaces[mod(mingBranch + 6, 12)];
  const borrowed = ming.stars.length === 0;

  // 可承四化的四颗辅星：文昌/文曲按生时，左辅/右弼按生月（不绘，只用于定位四化）
  const auxBranch = {
    文昌: mod(10 - hi, 12), // 戌上起子时，逆数
    文曲: mod(4 + hi, 12),  // 辰上起子时，顺数
    左辅: mod(4 + (month - 1), 12),  // 辰上起正月，顺数
    右弼: mod(10 - (month - 1), 12), // 戌上起正月，逆数
  };
  const placed = new Set(palaces.flatMap((p) => p.stars.map((s) => s.name)));
  const palaceNameOfBranch = (b) => PALACE_NAMES[mod(mingBranch - b, 12)];

  const sihuaList = Object.entries(sihua).map(([star, hua]) => {
    const onChart = placed.has(star);
    const b = onChart
      ? palaces.find((p) => p.stars.some((s) => s.name === star)).branch
      : auxBranch[star];
    return { star, hua, aux: !onChart, palaceName: b === undefined ? null : palaceNameOfBranch(b) };
  });

  const lunarText = `${lunar.yearGanZhi}年 ${lunar.isLeap ? '闰' : ''}${monthCN(lunar.month)}${dayCN(lunar.day)} ${HOUR_CN[hi]}时`;

  return {
    input: { y, m, d, h, min },
    solar: { y: sy, m: sm, d: sd },
    lunar: { ...lunar, text: lunarText, hourIndex: hi, hourName: HOUR_CN[hi], monthUsed: month },
    yearGan,
    mingBranch,
    shenBranch,
    mingStem: GAN[mingStem],
    wuxing,
    ju,
    juName: `${wuxing}${JU_CN[ju]}局`,
    ziweiBranch,
    tianfuBranch,
    ziweiBranchName: ZHI[ziweiBranch],
    palaces,
    mingStars: (borrowed ? opposite.stars : ming.stars).map((s) => ({ ...s, borrowed })),
    borrowed,
    sihuaList,
    sihuaPlaced: sihuaList.filter((s) => !s.aux),
  };
}

// 命宫主星组合的稳定 key（按固定星序）
export const STAR_ORDER = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
export function patternKey(stars) {
  return stars.map((s) => s.name).sort((a, b) => STAR_ORDER.indexOf(a) - STAR_ORDER.indexOf(b)).join('+');
}
