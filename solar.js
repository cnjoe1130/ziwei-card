// 真太阳时校准（选填）。只做经度差与均时差，不碰安星逻辑。
// 口径：北京时间 = 东经 120° 平太阳时。校正需要的是经度，不是星历。
import { hourIndex, addDays, ZHI } from './ziwei.js';

// 出生地名 → 东经（取 Aliyun DataV GeoAtlas 各行政区的 center，即政府驻地/城区点，不是几何中心）。
// 覆盖 340 个地级行政区 + 30 个省直辖县级单位；仅中国境内，境外参考系不同、算法不适用。
// 已知取舍：哈尔滨取松北新驻地 126.64（老城 126.53，差 0.4 分钟，不影响时辰）；
// 台北取省级单点，高雄/台中等需手填经度；大兴安岭按驻地加格达奇 124.13 校正过源数据的 124.71。
export const CITIES = [
  { name: '北京', lon: 116.41 }, { name: '天津', lon: 117.19 }, { name: '石家庄', lon: 114.5 },
  { name: '唐山', lon: 118.18 }, { name: '秦皇岛', lon: 119.59 }, { name: '邯郸', lon: 114.49 },
  { name: '邢台', lon: 114.51 }, { name: '保定', lon: 115.48 }, { name: '张家口', lon: 114.88 },
  { name: '承德', lon: 117.94 }, { name: '沧州', lon: 116.86 }, { name: '廊坊', lon: 116.7 },
  { name: '衡水', lon: 115.67 }, { name: '太原', lon: 112.55 }, { name: '大同', lon: 113.3 },
  { name: '阳泉', lon: 113.58 }, { name: '长治', lon: 113.11 }, { name: '晋城', lon: 112.85 },
  { name: '朔州', lon: 112.43 }, { name: '晋中', lon: 112.74 }, { name: '运城', lon: 111 },
  { name: '忻州', lon: 112.73 }, { name: '临汾', lon: 111.52 }, { name: '吕梁', lon: 111.13 },
  { name: '呼和浩特', lon: 111.67 }, { name: '包头', lon: 109.84 }, { name: '乌海', lon: 106.83 },
  { name: '赤峰', lon: 118.96 }, { name: '通辽', lon: 122.26 }, { name: '鄂尔多斯', lon: 109.99 },
  { name: '呼伦贝尔', lon: 119.76 }, { name: '巴彦淖尔', lon: 107.42 }, { name: '乌兰察布', lon: 113.11 },
  { name: '兴安', lon: 122.07 }, { name: '锡林郭勒', lon: 116.09 }, { name: '阿拉善', lon: 105.71 },
  { name: '沈阳', lon: 123.43 }, { name: '大连', lon: 121.62 }, { name: '鞍山', lon: 123 },
  { name: '抚顺', lon: 123.92 }, { name: '本溪', lon: 123.77 }, { name: '丹东', lon: 124.38 },
  { name: '锦州', lon: 121.14 }, { name: '营口', lon: 122.24 }, { name: '阜新', lon: 121.65 },
  { name: '辽阳', lon: 123.18 }, { name: '盘锦', lon: 122.07 }, { name: '铁岭', lon: 123.84 },
  { name: '朝阳', lon: 120.45 }, { name: '葫芦岛', lon: 120.86 }, { name: '长春', lon: 125.32 },
  { name: '吉林', lon: 126.55 }, { name: '四平', lon: 124.37 }, { name: '辽源', lon: 125.15 },
  { name: '通化', lon: 125.94 }, { name: '白山', lon: 126.43 }, { name: '松原', lon: 124.82 },
  { name: '白城', lon: 122.84 }, { name: '延边', lon: 129.51 }, { name: '哈尔滨', lon: 126.64 },
  { name: '齐齐哈尔', lon: 123.96 }, { name: '鸡西', lon: 130.98 }, { name: '鹤岗', lon: 130.28 },
  { name: '双鸭山', lon: 131.16 }, { name: '大庆', lon: 125.11 }, { name: '伊春', lon: 128.9 },
  { name: '佳木斯', lon: 130.36 }, { name: '七台河', lon: 131.02 }, { name: '牡丹江', lon: 129.62 },
  { name: '黑河', lon: 127.5 }, { name: '绥化', lon: 126.99 }, { name: '大兴安岭', lon: 124.13 },
  { name: '上海', lon: 121.47 }, { name: '南京', lon: 118.77 }, { name: '无锡', lon: 120.3 },
  { name: '徐州', lon: 117.18 }, { name: '常州', lon: 119.95 }, { name: '苏州', lon: 120.62 },
  { name: '南通', lon: 120.86 }, { name: '连云港', lon: 119.18 }, { name: '淮安', lon: 119.02 },
  { name: '盐城', lon: 120.14 }, { name: '扬州', lon: 119.42 }, { name: '镇江', lon: 119.45 },
  { name: '泰州', lon: 119.92 }, { name: '宿迁', lon: 118.28 }, { name: '杭州', lon: 120.15 },
  { name: '宁波', lon: 121.55 }, { name: '温州', lon: 120.67 }, { name: '嘉兴', lon: 120.75 },
  { name: '湖州', lon: 120.1 }, { name: '绍兴', lon: 120.58 }, { name: '金华', lon: 119.65 },
  { name: '衢州', lon: 118.87 }, { name: '舟山', lon: 122.11 }, { name: '台州', lon: 121.43 },
  { name: '丽水', lon: 119.92 }, { name: '合肥', lon: 117.28 }, { name: '芜湖', lon: 118.38 },
  { name: '蚌埠', lon: 117.36 }, { name: '淮南', lon: 117.02 }, { name: '马鞍山', lon: 118.51 },
  { name: '淮北', lon: 116.79 }, { name: '铜陵', lon: 117.82 }, { name: '安庆', lon: 117.04 },
  { name: '黄山', lon: 118.32 }, { name: '滁州', lon: 118.32 }, { name: '阜阳', lon: 115.82 },
  { name: '宿州', lon: 116.98 }, { name: '六安', lon: 116.51 }, { name: '亳州', lon: 115.78 },
  { name: '池州', lon: 117.49 }, { name: '宣城', lon: 118.76 }, { name: '福州', lon: 119.31 },
  { name: '厦门', lon: 118.11 }, { name: '莆田', lon: 119.01 }, { name: '三明', lon: 117.64 },
  { name: '泉州', lon: 118.59 }, { name: '漳州', lon: 117.66 }, { name: '南平', lon: 118.18 },
  { name: '龙岩', lon: 117.03 }, { name: '宁德', lon: 119.53 }, { name: '南昌', lon: 115.89 },
  { name: '景德镇', lon: 117.21 }, { name: '萍乡', lon: 113.85 }, { name: '九江', lon: 115.99 },
  { name: '新余', lon: 114.93 }, { name: '鹰潭', lon: 117.03 }, { name: '赣州', lon: 114.94 },
  { name: '吉安', lon: 114.99 }, { name: '宜春', lon: 114.39 }, { name: '抚州', lon: 116.36 },
  { name: '上饶', lon: 117.97 }, { name: '济南', lon: 117 }, { name: '青岛', lon: 120.36 },
  { name: '淄博', lon: 118.05 }, { name: '枣庄', lon: 117.56 }, { name: '东营', lon: 118.66 },
  { name: '烟台', lon: 121.39 }, { name: '潍坊', lon: 119.11 }, { name: '济宁', lon: 116.59 },
  { name: '泰安', lon: 117.13 }, { name: '威海', lon: 122.12 }, { name: '日照', lon: 119.46 },
  { name: '临沂', lon: 118.33 }, { name: '德州', lon: 116.31 }, { name: '聊城', lon: 115.98 },
  { name: '滨州', lon: 118.02 }, { name: '菏泽', lon: 115.47 }, { name: '郑州', lon: 113.67 },
  { name: '开封', lon: 114.34 }, { name: '洛阳', lon: 112.43 }, { name: '平顶山', lon: 113.31 },
  { name: '安阳', lon: 114.35 }, { name: '鹤壁', lon: 114.3 }, { name: '新乡', lon: 113.88 },
  { name: '焦作', lon: 113.24 }, { name: '濮阳', lon: 115.04 }, { name: '许昌', lon: 113.83 },
  { name: '漯河', lon: 114.03 }, { name: '三门峡', lon: 111.19 }, { name: '南阳', lon: 112.54 },
  { name: '商丘', lon: 115.65 }, { name: '信阳', lon: 114.08 }, { name: '周口', lon: 114.65 },
  { name: '驻马店', lon: 114.02 }, { name: '武汉', lon: 114.3 }, { name: '黄石', lon: 115.08 },
  { name: '十堰', lon: 110.79 }, { name: '宜昌', lon: 111.29 }, { name: '襄阳', lon: 112.14 },
  { name: '鄂州', lon: 114.89 }, { name: '荆门', lon: 112.2 }, { name: '孝感', lon: 113.93 },
  { name: '荆州', lon: 112.24 }, { name: '黄冈', lon: 114.88 }, { name: '咸宁', lon: 114.33 },
  { name: '随州', lon: 113.37 }, { name: '恩施', lon: 109.49 }, { name: '长沙', lon: 112.98 },
  { name: '株洲', lon: 113.15 }, { name: '湘潭', lon: 112.94 }, { name: '衡阳', lon: 112.61 },
  { name: '邵阳', lon: 111.47 }, { name: '岳阳', lon: 113.13 }, { name: '常德', lon: 111.69 },
  { name: '张家界', lon: 110.48 }, { name: '益阳', lon: 112.36 }, { name: '郴州', lon: 113.03 },
  { name: '永州', lon: 111.61 }, { name: '怀化', lon: 109.98 }, { name: '娄底', lon: 112.01 },
  { name: '湘西', lon: 109.74 }, { name: '广州', lon: 113.28 }, { name: '韶关', lon: 113.59 },
  { name: '深圳', lon: 114.09 }, { name: '珠海', lon: 113.55 }, { name: '汕头', lon: 116.71 },
  { name: '佛山', lon: 113.12 }, { name: '江门', lon: 113.09 }, { name: '湛江', lon: 110.36 },
  { name: '茂名', lon: 110.92 }, { name: '肇庆', lon: 112.47 }, { name: '惠州', lon: 114.41 },
  { name: '梅州', lon: 116.12 }, { name: '汕尾', lon: 115.36 }, { name: '河源', lon: 114.7 },
  { name: '阳江', lon: 111.98 }, { name: '清远', lon: 113.05 }, { name: '东莞', lon: 113.75 },
  { name: '中山', lon: 113.38 }, { name: '潮州', lon: 116.63 }, { name: '揭阳', lon: 116.36 },
  { name: '云浮', lon: 112.04 }, { name: '南宁', lon: 108.32 }, { name: '柳州', lon: 109.41 },
  { name: '桂林', lon: 110.3 }, { name: '梧州', lon: 111.3 }, { name: '北海', lon: 109.12 },
  { name: '防城港', lon: 108.35 }, { name: '钦州', lon: 108.62 }, { name: '贵港', lon: 109.6 },
  { name: '玉林', lon: 110.15 }, { name: '百色', lon: 106.62 }, { name: '贺州', lon: 111.55 },
  { name: '河池', lon: 108.06 }, { name: '来宾', lon: 109.23 }, { name: '崇左', lon: 107.35 },
  { name: '海口', lon: 110.33 }, { name: '三亚', lon: 109.51 }, { name: '三沙', lon: 112.35 },
  { name: '儋州', lon: 109.58 }, { name: '重庆', lon: 106.5 }, { name: '成都', lon: 104.07 },
  { name: '自贡', lon: 104.77 }, { name: '攀枝花', lon: 101.72 }, { name: '泸州', lon: 105.44 },
  { name: '德阳', lon: 104.4 }, { name: '绵阳', lon: 104.74 }, { name: '广元', lon: 105.83 },
  { name: '遂宁', lon: 105.57 }, { name: '内江', lon: 105.07 }, { name: '乐山', lon: 103.76 },
  { name: '南充', lon: 106.08 }, { name: '眉山', lon: 103.83 }, { name: '宜宾', lon: 104.63 },
  { name: '广安', lon: 106.63 }, { name: '达州', lon: 107.5 }, { name: '雅安', lon: 103 },
  { name: '巴中', lon: 106.75 }, { name: '资阳', lon: 104.64 }, { name: '阿坝', lon: 102.22 },
  { name: '甘孜', lon: 101.96 }, { name: '凉山', lon: 102.26 }, { name: '贵阳', lon: 106.71 },
  { name: '六盘水', lon: 104.85 }, { name: '遵义', lon: 106.94 }, { name: '安顺', lon: 105.93 },
  { name: '毕节', lon: 105.29 }, { name: '铜仁', lon: 109.19 }, { name: '黔西南', lon: 104.9 },
  { name: '黔东南', lon: 107.98 }, { name: '黔南', lon: 107.52 }, { name: '昆明', lon: 102.71 },
  { name: '曲靖', lon: 103.8 }, { name: '玉溪', lon: 102.54 }, { name: '保山', lon: 99.17 },
  { name: '昭通', lon: 103.72 }, { name: '丽江', lon: 100.23 }, { name: '普洱', lon: 100.97 },
  { name: '临沧', lon: 100.09 }, { name: '楚雄', lon: 101.55 }, { name: '红河', lon: 103.38 },
  { name: '文山', lon: 104.24 }, { name: '西双版纳', lon: 100.8 }, { name: '大理', lon: 100.23 },
  { name: '德宏', lon: 98.58 }, { name: '怒江', lon: 98.85 }, { name: '迪庆', lon: 99.71 },
  { name: '拉萨', lon: 91.13 }, { name: '日喀则', lon: 88.89 }, { name: '昌都', lon: 97.18 },
  { name: '林芝', lon: 94.36 }, { name: '山南', lon: 91.77 }, { name: '那曲', lon: 92.06 },
  { name: '阿里', lon: 80.11 }, { name: '西安', lon: 108.95 }, { name: '铜川', lon: 108.98 },
  { name: '宝鸡', lon: 107.14 }, { name: '咸阳', lon: 108.71 }, { name: '渭南', lon: 109.5 },
  { name: '延安', lon: 109.49 }, { name: '汉中', lon: 107.03 }, { name: '榆林', lon: 109.74 },
  { name: '安康', lon: 109.03 }, { name: '商洛', lon: 109.94 }, { name: '兰州', lon: 103.82 },
  { name: '嘉峪关', lon: 98.28 }, { name: '金昌', lon: 102.19 }, { name: '白银', lon: 104.17 },
  { name: '天水', lon: 105.72 }, { name: '武威', lon: 102.63 }, { name: '张掖', lon: 100.46 },
  { name: '平凉', lon: 106.68 }, { name: '酒泉', lon: 98.51 }, { name: '庆阳', lon: 107.64 },
  { name: '定西', lon: 104.63 }, { name: '陇南', lon: 104.93 }, { name: '临夏', lon: 103.21 },
  { name: '甘南', lon: 102.91 }, { name: '西宁', lon: 101.78 }, { name: '海东', lon: 102.1 },
  { name: '海北', lon: 100.9 }, { name: '黄南', lon: 102.02 }, { name: '海南州', lon: 100.62 },
  { name: '果洛', lon: 100.24 }, { name: '玉树', lon: 97.01 }, { name: '海西', lon: 97.37 },
  { name: '银川', lon: 106.28 }, { name: '石嘴山', lon: 106.38 }, { name: '吴忠', lon: 106.2 },
  { name: '固原', lon: 106.29 }, { name: '中卫', lon: 105.19 }, { name: '乌鲁木齐', lon: 87.62 },
  { name: '克拉玛依', lon: 84.87 }, { name: '吐鲁番', lon: 89.18 }, { name: '哈密', lon: 93.51 },
  { name: '昌吉', lon: 87.3 }, { name: '博尔塔拉', lon: 82.07 }, { name: '巴音郭楞', lon: 86.15 },
  { name: '阿克苏', lon: 80.27 }, { name: '克孜勒苏', lon: 76.17 }, { name: '喀什', lon: 75.99 },
  { name: '和田', lon: 79.93 }, { name: '伊犁', lon: 81.32 }, { name: '塔城', lon: 82.99 },
  { name: '阿勒泰', lon: 88.14 }, { name: '台北', lon: 121.51 }, { name: '香港', lon: 114.17 },
  { name: '澳门', lon: 113.55 }, { name: '济源', lon: 112.59 }, { name: '仙桃', lon: 113.45 },
  { name: '潜江', lon: 112.9 }, { name: '天门', lon: 113.17 }, { name: '神农架', lon: 110.67 },
  { name: '五指山', lon: 109.52 }, { name: '琼海', lon: 110.47 }, { name: '文昌', lon: 110.75 },
  { name: '万宁', lon: 110.39 }, { name: '东方', lon: 108.65 }, { name: '定安', lon: 110.35 },
  { name: '屯昌', lon: 110.1 }, { name: '澄迈', lon: 110.01 }, { name: '临高', lon: 109.69 },
  { name: '白沙', lon: 109.45 }, { name: '昌江', lon: 109.05 }, { name: '乐东', lon: 109.18 },
  { name: '陵水', lon: 110.04 }, { name: '保亭', lon: 109.7 }, { name: '琼中', lon: 109.84 },
  { name: '石河子', lon: 86.04 }, { name: '阿拉尔', lon: 81.29 }, { name: '图木舒克', lon: 79.08 },
  { name: '五家渠', lon: 87.53 }, { name: '北屯', lon: 87.82 }, { name: '铁门关', lon: 85.5 },
  { name: '双河', lon: 82.35 }, { name: '可克达拉', lon: 80.64 }, { name: '昆玉', lon: 79.29 },
  { name: '胡杨河', lon: 84.83 },
];

// 中国夏令时，1986–1991，起止当日均在 02:00 切换。逐年查表，不用"月中旬"模糊区间。
export const DST_WINDOWS = {
  1986: { from: [5, 4], to: [9, 14] },
  1987: { from: [4, 12], to: [9, 13] },
  1988: { from: [4, 10], to: [9, 11] },
  1989: { from: [4, 16], to: [9, 17] },
  1990: { from: [4, 15], to: [9, 16] },
  1991: { from: [4, 14], to: [9, 15] },
};

const COMMON_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const LEAP = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function dayOfYear(y, m, d) {
  const lens = [...COMMON_LEN];
  if (LEAP(y)) lens[1] = 29;
  let n = d;
  for (let i = 0; i < m - 1; i++) n += lens[i];
  return n;
}

// 该日期是否落在夏令时窗口内（只按日期判，用于决定要不要显示勾选框）
export function dstWindow(y, m, d) {
  const w = DST_WINDOWS[y];
  if (!w) return null;
  const from = w.from[0] * 100 + w.from[1];
  const to = w.to[0] * 100 + w.to[1];
  const day = m * 100 + d;
  return day >= from && day <= to ? w : null;
}

// 该时刻是否真的处在夏令时（起止当日的 02:00 才切换）
function dstActiveAt(y, m, d, h) {
  const w = DST_WINDOWS[y];
  if (!w) return false;
  const day = m * 100 + d;
  const from = w.from[0] * 100 + w.from[1];
  const to = w.to[0] * 100 + w.to[1];
  if (day < from || day > to) return false;
  if (day === from || day === to) return h >= 2;
  return true;
}

// 用户手打的写法与表名不一致时的兜底：州府旧称、驻地别名
const CITY_ALIAS = { 伊宁: '伊犁', 加格达奇: '大兴安岭', 共和: '海南州' };
const CITY_TAIL = /(林区|自治州|自治县|地区|盟|市|县|旗)$/u;

export function findCity(query) {
  const q = String(query || '').trim();
  if (!q) return null;
  const exact = CITIES.find((c) => c.name === q);
  if (exact) return exact;
  const base = q.replace(CITY_TAIL, '') || q;
  const hit = CITIES.find((c) => c.name === base || c.name === CITY_ALIAS[q] || c.name === CITY_ALIAS[base]);
  if (hit) return hit;
  const starts = CITIES.filter((c) => c.name.startsWith(q) || q.startsWith(c.name));
  return starts.length === 1 ? starts[0] : null;
}

export function lonFromInput(cityName, lonRaw) {
  const city = findCity(cityName);
  if (city) return city.lon;
  const n = Number.parseFloat(lonRaw);
  return Number.isFinite(n) && n >= 73 && n <= 135 ? n : null;
}

// 返回校准后的日期与时分；changed 为 true 才会影响排盘
export function trueSolar({ y, m, d, h, min, lon, isDST }) {
  const clock = h * 60 + min;
  const dstApplied = Boolean(isDST) && dstActiveAt(y, m, d, h);
  const t = clock - (dstApplied ? 60 : 0);
  const geo = (lon - 120) * 4;
  const B = ((360 * (dayOfYear(y, m, d) - 81)) / 364) * (Math.PI / 180);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const raw = t + geo + eot;              // 不在这里 mod，跨日要带出去
  const dayShift = Math.floor(raw / 1440);
  const mins = ((raw % 1440) + 1440) % 1440;
  const sh = Math.floor(mins / 60);
  const sm = Math.floor(mins % 60);
  const date = addDays(y, m, d, dayShift);
  const solar = { y: date.y, m: date.m, d: date.d, h: sh, min: sm };
  const crossDay = dayShift !== 0;
  const changed = hourIndex(h) !== hourIndex(sh) || crossDay;
  return {
    clock: { y, m, d, h, min },
    solar,
    dayShift,
    crossDay,
    geo,
    eot,
    dstApplied,
    changed,
    input: changed ? solar : { y, m, d, h, min },
    clockHourName: ZHI[hourIndex(h)],
    solarHourName: ZHI[hourIndex(sh)],
  };
}
