// 结果页的白话层：只从实际盘面取数据。
// 写法约束：先给一句人话，再给术语；不用「在这里最…也最…」这类套式。

import { ZHI } from './ziwei.js';

export const HUA_LEGEND = '禄 = 多出来的一点甜头 · 权 = 想自己说了算 · 科 = 要面子 · 忌 = 心里的缺口';

// mech：这股劲从哪来，尽量落在一个具体场面里；act：在这件事上会怎么做；pace：两个人的起跑顺序。
export const STAR = {
  紫微: {
    mech: '一桌人干坐着，最后总是你先开口。不是爱出风头，是那个冷场你坐不住。别人以为你爱做主，其实你更怕事情没人管，烂在那里。',
    act: '把场面撑住，把事定下来',
    pace: '先把规矩立起来，再动手',
  },
  天机: {
    mech: '事情还没发生，你已经在心里过了三遍：万一呢，要是那样呢。别人嫌你想太多，可你靠这个躲过不少坑。难受的不是想，是想到了却没来得及说。',
    act: '提前把几种可能排一遍',
    pace: '先想清楚几步，再开口',
  },
  太阳: {
    mech: '群里有人问路，你第一个回；朋友开口借力，你不好意思说没有。给的时候是真不觉得亏，等到自己需要搭把手，才发现名单上没剩几个。',
    act: '先把人照应到，再管自己',
    pace: '先照顾别人，再轮到自己',
  },
  武曲: {
    mech: '你不太会说漂亮话。委屈、面子这些，你都往后放——不是不在意，是觉得讲出来也解决不了。看一件事，你先看它成不成，再看它好不好看。',
    act: '把事做完，把账算清',
    pace: '先看结果，过程往后放',
  },
  天同: {
    mech: '你不是没主意，是觉得争起来太累。别人抢着要的东西，你心里也会动一下，然后多半摆摆手：算了，也不是非它不可。只是偶尔会想，是不是太早就算了。',
    act: '先让自己松下来',
    pace: '先缓一缓，不急着表态',
  },
  廉贞: {
    mech: '有句话别人说得出口，你说不出口；有件事别人做得，你做不得。你心里有一条自己画的线，线以内怎么都行，线外一步都不让。而且你不解释那条线在哪——碰了才知道。',
    act: '守住那条别人看不见的线',
    pace: '先划线，再谈别的',
  },
  天府: {
    mech: '出门前你会看一眼电量，点菜前会先看价格，答应人之前先想好退路。别人说你保守，你只是不想把自己逼到没得选。你的安全感很具体：冰箱是满的，卡里有余额，门锁是好的。',
    act: '留一手，不把话说死',
    pace: '先留好后路，再往前走',
  },
  太阴: {
    mech: '别人一句话，你能听出三种意思；当场不说，回去能想半宿。不是没感觉，是感受太多，得先在心里排好队才敢拿出来。小细节你记得住，也容易被它绊住。',
    act: '先在心里过一遍再开口',
    pace: '先把情绪消化完，再表态',
  },
  贪狼: {
    mech: '新开的店、没去过的城市、别人的活法，你都想去摸一下。别人以为你贪玩，其实你是怕这辈子只活了一种可能——一种，太少了。',
    act: '把新鲜的东西先摸一遍',
    pace: '先试了再说，理由后补',
  },
  巨门: {
    mech: '你不信「大概就是这样」。话里有一处含糊，你会追着问，直到问明白——哪怕问明白之后场面不好看。你不是爱挑刺，你是受不了糊里糊涂地答应。',
    act: '把话摊开，问到清楚为止',
    pace: '先问清楚，再答应',
  },
  天相: {
    mech: '你擅长在规矩里把事办成：不给谁难堪，也不让自己难看。两边都下不来台的时候，你总能找出一句让大家都过得去的话。代价是，最想说的那句你很少说。',
    act: '把场面圆过去，不让人难堪',
    pace: '先顾场面，再谈对错',
  },
  天梁: {
    mech: '你身上有股「长辈气」：谁家有事都愿意先跟你说一声，你也不太会拒绝，习惯先把人兜住再讲道理。轮到自己难受，却常常找不到那个能兜住你的人。',
    act: '先把人兜住，再讲道理',
    pace: '先把人兜住，再讲道理',
  },
  七杀: {
    mech: '你不太等大家商量好。看准了就动手，边做边修，错了也认。你的问题不是不敢，是很少给自己留回头的余地。',
    act: '看准了就动手',
    pace: '先动手，边做边改',
  },
  破军: {
    mech: '不好用就拆，过时了就换，哪怕那是你自己一点点搭起来的。别人舍不得已经投进去的那些，你只心疼耗在里面的日子。',
    act: '先拆了再说',
    pace: '先拆掉，再重建',
  },
};

export const PALACE = {
  命宫: {
    q: '你本来的反应',
    shen: '你后来使的劲，还是回到自己身上。',
    line: '没人看着的时候你下意识怎么反应，那一格就是命宫。装不出来。',
    ask: '你现在这个反应，是你选的，还是顺手用惯了？',
    hua: {
      禄: '你最顺手的那一面藏不住，别人见一面就记住了。',
      权: '你怎么过日子、怎么安排自己，不太愿意让别人来定。',
      科: '你挺在意自己在别人眼里是什么样。嘴上说无所谓，出门前还是要照一下镜子。',
      忌: '你对自己有一套过不去的要求。别人劝不动，你自己也停不下来。',
    },
  },
  兄弟: {
    q: '平辈之间',
    shen: '你后来不少劲花在同辈、同事和伙伴身上：一起做事，或者替人收拾。',
    line: '借钱、随礼、帮忙顶班——平辈之间的账，你心里记得比嘴上清楚。',
    ask: '身边这些人，是伙伴，还是你一直在让的人？',
    hua: {
      禄: '你肯在朋友身上花时间：聚餐、问候、搭把手，你都愿意先开口。',
      权: '和同辈相处，你习惯拿主意，至少不愿意被人安排。',
      科: '一群人里，你容易被推出来代表大家说话。',
      忌: '朋友之间的小事你容易想多，话到嘴边又咽回去。',
    },
  },
  夫妻: {
    q: '亲密关系',
    shen: '你后来把劲使在关系里：经营它，或者一遍遍修补它。',
    line: '越亲近，你越容易露出没设防的那一面，也越容易在那个人面前不讲道理。',
    ask: '你交出去了什么，又留了什么没交？',
    hua: {
      禄: '你在关系里愿意先给，给的时候不太算计。',
      权: '关系里的大事你想说了算，方向不太肯交出去。',
      科: '你在关系里要体面，难看的那些不太愿意摊开。',
      忌: '同一句话你能反复想很久，越想越绕，对方却早忘了。',
    },
  },
  子女: {
    q: '你养出来的东西',
    shen: '你后来把劲使在养东西上：孩子、作品、你带的人。',
    line: '孩子、作品、你带的人，都是你亲手养大、又慢慢不听你的东西。',
    ask: '你养的那件事，是在长大，还是只是在占你的时间？',
    hua: {
      禄: '对自己养出来的东西，你很舍得往里加：时间、钱、心思都行。',
      权: '孩子、作品、你带的人，你想按自己的方式来管。',
      科: '你养出来的东西，你希望它拿得出手，也怕它给你丢人。',
      忌: '你放不下手，也放不下心，总想再多看一眼。',
    },
  },
  财帛: {
    q: '你和钱',
    shen: '你后来把劲使在挣钱和花钱上，钱是你的记分牌。',
    line: '钱在你这里不只是数字，它决定你说话时腰杆能挺多直。',
    ask: '你是在挣钱，还是在用钱换一点安心？',
    hua: {
      禄: '钱到你手里是流动的，你不太怕花，也不太怕再挣。',
      权: '钱怎么花、往哪投，你不喜欢别人插手。',
      科: '你花钱讲究值不值，也不太愿意显得寒酸。',
      忌: '钱这件事容易让你发紧，越紧越算，越算越不安。',
    },
  },
  疾厄: {
    q: '身体和承受力',
    shen: '你后来把劲使在身体上：保养它，或者硬扛它。',
    line: '身体的账，你习惯先欠着，等它自己来收。',
    ask: '你上一次真的休息，是什么时候？',
    hua: {
      禄: '你对自己身体还算大方，累了会真的去歇。',
      权: '连休息你都要自己安排，别人劝你停，你未必听。',
      科: '你不愿意让人看见自己虚弱的那一面。',
      忌: '你不太会喊停，往往是身体先替你踩刹车。',
    },
  },
  迁移: {
    q: '出门在外的你',
    shen: '你后来把劲使在往外走上：换城市、换圈子、换活法。',
    line: '换个地方、换一群人，你会变成另一个版本的自己——有时候连你自己都意外。',
    ask: '换个地方，你会松开哪一部分？',
    hua: {
      禄: '换个环境你反而放得开，也更愿意先开口搭话。',
      权: '一出门你更敢拍板，也更愿意站在人前。',
      科: '在外头你容易被记住，也容易被议论。',
      忌: '换环境你适应得慢，得先熬过一段不安。',
    },
  },
  仆役: {
    q: '你身边的人',
    shen: '你后来把劲使在人身上：带人、帮人，也被人消耗。',
    line: '你身边站着谁，决定了你遇事时第一个电话打给谁。',
    ask: '一直在帮你的人，你谢过吗？',
    hua: {
      禄: '你愿意先帮人，人情也就一点一点攒下来了。',
      权: '你带人时要求高，也不太放心把事交出去。',
      科: '你在人群里口碑不差，关键时候有人愿意替你说句话。',
      忌: '热闹散了你要缓很久，人多的场合格外耗。',
    },
  },
  官禄: {
    q: '你做事的场子',
    shen: '你后来把劲使在工作上，那儿是你的主场。',
    line: '工作里你靠什么站住，比你能熬多少夜更说明问题。',
    ask: '你现在做的事，是在积累，还是在交差？',
    hua: {
      禄: '工作上你舍得下本钱，也愿意为长期的东西等。',
      权: '工作里你要话语权，宁可多扛，也不愿被安排。',
      科: '你做的事容易被看见，也因此更怕做不漂亮。',
      忌: '同一个坎你容易反复踩，也很难真的放下。',
    },
  },
  田宅: {
    q: '你的地盘',
    shen: '你后来把劲使在安顿上：房子、家、一个自己的角落。',
    line: '你住的地方，比你说出来的话更能说明你要什么。',
    ask: '你住的那个地方，像你吗？',
    hua: {
      禄: '你愿意把钱和心思花在住的地方，家是你的回血点。',
      权: '家里怎么摆、日子怎么过，你希望自己说了算。',
      科: '你把住的地方当门面，也当自己的作品。',
      忌: '你对「有一个自己的地方」这件事，比一般人更执着。',
    },
  },
  福德: {
    q: '你一个人的时候',
    shen: '你后来把劲使在让自己舒服上：爱好、消遣、独处的方式。',
    line: '一个人待着的时候你怎么过，最接近你本来的样子。',
    ask: '你独处的时候，是在放松，还是在耗？',
    hua: {
      禄: '独处时你很会给自己找乐子，享受这件事不太亏待自己。',
      权: '连放松你都有自己的标准和讲究。',
      科: '你独处的品味，其实很在意有没有人懂。',
      忌: '一个人待着容易反刍，放松对你来说并不轻松。',
    },
  },
  父母: {
    q: '上面的人',
    shen: '你后来把劲使在上面的关系里：长辈、规矩、期待。',
    line: '长辈给过你什么，也拿走过你什么——这两笔账，经常是同一笔。',
    ask: '你是在替谁完成期待？',
    hua: {
      禄: '你和长辈之间有一条能走通的路，有事你愿意开口。',
      权: '面对长辈和规矩，你嘴上未必顶，心里有自己的主意。',
      科: '你希望得到长辈认可，也一直在这件事上用力。',
      忌: '和长辈之间总有一句话没说完，也总有一份期待背着。',
    },
  },
};

const ORDER = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

const nb = (name) => [...name].join('\u2060');
const joinStars = (names) => names.map(nb).join('、');
const full = (name) => (name.endsWith('宫') ? name : `${name}宫`);

export function explainChart(chart) {
  const ming = chart.palaces.find((p) => p.isMing);
  const shen = chart.palaces.find((p) => p.isShen);
  const mingNames = chart.mingStars.map((s) => s.name);
  const lead = STAR[mingNames[0]];
  const second = mingNames[1] ? STAR[mingNames[1]] : null;

  let mingText = lead ? lead.mech : '';
  if (second) mingText += `旁边还坐着${nb(mingNames[1])}：你会${second.act}。`;

  const mingMeta = chart.borrowed
    ? `命宫空宫 · 借对宫 ${mingNames.join('、')} · 在${ZHI[chart.mingBranch]}宫`
    : `命宫 · ${ZHI[chart.mingBranch]} · ${mingNames.join('、')}坐命`;

  let shenText;
  let shenMeta;
  if (shen.isMing) {
    shenText = '身宫和命宫在同一格：你后来使的劲，还是第一反应那一股，没换过。';
    shenMeta = `身宫 · ${full(shen.name)} · 与命宫同宫`;
  } else {
    shenText = `身宫落在${full(shen.name)}。${PALACE[shen.name].shen}`;
    shenMeta = `身宫 · ${full(shen.name)}${shen.stars.length ? ` · ${shen.stars.map((s) => s.name).join('、')}` : ' · 空宫'}`;
  }

  const ji = chart.sihuaList.find((h) => h.hua === '忌');
  const jiBlock = ji && ji.palaceName
    ? {
      text: PALACE[ji.palaceName].hua.忌,
      meta: `${ji.star}化忌 · ${full(ji.palaceName)}${ji.aux ? ' · 辅星' : ''}`,
      ask: PALACE[ji.palaceName].ask,
      palaceName: ji.palaceName,
    }
    : null;

  const chips = chart.sihuaList
    .filter((h) => h.hua !== '忌' && h.palaceName)
    .map((h) => ({
      star: h.star,
      hua: h.hua,
      palaceName: h.palaceName,
      label: `${h.star}·${h.hua}`,
      where: full(h.palaceName),
    }));

  const rows = ORDER.map((name) => {
    const p = chart.palaces.find((x) => x.name === name);
    const mainStars = p.stars.map((s) => s.name);
    const huaHere = chart.sihuaList.filter((h) => h.palaceName === name);

    let starsLine;
    if (mainStars.length) {
      starsLine = `${joinStars(mainStars)}坐${full(name)}：${p.stars.map((s) => STAR[s.name]?.act).filter(Boolean).join('；')}。`;
    } else if (p.isMing && chart.borrowed) {
      starsLine = `命宫空着，借对面那格的${joinStars(chart.mingStars.map((s) => s.name))}来读。`;
    } else {
      const opp = chart.palaces.find((x) => x.branch === (p.branch + 6) % 12);
      starsLine = `这一格没有主星。事情多半跟着环境走，也看对面${full(opp.name)}的脸色——不是没人管。`;
    }

    return {
      name,
      branch: p.branchName,
      node: p.branch,
      stars: mainStars.length ? mainStars.join('、') : '空宫',
      marks: [p.isMing ? '命' : '', p.isShen ? '身' : ''].filter(Boolean).join(''),
      isMing: p.isMing,
      hua: huaHere.map((h) => ({ hua: h.hua, star: h.star })),
      body: {
        q: PALACE[name].q,
        line: PALACE[name].line,
        stars: starsLine,
        hua: huaHere.map((h) => `${h.star}化${h.hua}：${PALACE[name].hua[h.hua]}`),
        ask: PALACE[name].ask,
      },
    };
  });

  return {
    ming: { text: mingText, meta: mingMeta },
    shen: { text: shenText, meta: shenMeta },
    ji: jiBlock,
    chips,
    rows,
  };
}

function spouseOf(chart) {
  const p = chart.palaces.find((x) => x.name === '夫妻');
  if (p.stars.length) return { names: p.stars.map((s) => s.name), borrowed: false };
  const opp = chart.palaces.find((x) => x.branch === (p.branch + 6) % 12);
  return { names: opp.stars.map((s) => s.name), borrowed: true };
}

const listNames = (names) => (names.length ? joinStars(names) : '没有主星');

export function pairReading(a, b) {
  const paceA = STAR[a.mingStars[0]?.name]?.pace;
  const paceB = STAR[b.mingStars[0]?.name]?.pace;
  const shenA = a.palaces.find((p) => p.isShen);
  const shenB = b.palaces.find((p) => p.isShen);
  const jiA = a.sihuaList.find((h) => h.hua === '忌');
  const jiB = b.sihuaList.find((h) => h.hua === '忌');
  const spouseA = spouseOf(a);
  const spouseB = spouseOf(b);
  const mingA = a.mingStars.map((s) => s.name);
  const mingB = b.mingStars.map((s) => s.name);

  const hitAB = spouseA.names.filter((n) => mingB.includes(n));
  const hitBA = spouseB.names.filter((n) => mingA.includes(n));

  let paceText;
  if (!paceA || !paceB) {
    paceText = '有一边的命宫空着，动作顺序这一项先跳过——借来的星，说快了容易冤了人。';
  } else if (paceA === paceB) {
    paceText = `你们做事的顺序撞在一起了：都${paceA}。好处是不用解释，坏处是两个人会一起踩进同一个坑，还没人拉。`;
  } else {
    paceText = `你${paceA}；对方${paceB}。同一件事，你们的起跑顺序不一样：你等对方的时候，容易把「慢」听成「不在乎」；对方等你的时候，可能觉得你太急。`;
  }

  let looksText;
  if (!spouseA.names.length && !spouseB.names.length) {
    looksText = '两边的夫妻宫都空着，这一项先跳过。它本来也只说明「像不像」，不说明能不能过下去。';
  } else {
    const partA = spouseA.names.length
      ? `你夫妻宫里的${listNames(spouseA.names)}${spouseA.borrowed ? '（空宫，借对宫）' : ''}，`
        + (hitAB.length
          ? `正好和对方命宫的${joinStars(hitAB)}撞上了。按老话讲，对方挺像你会被吸引的那一类。`
          : `和对方命宫的${listNames(mingB)}不是一路。星只说明像不像，合不合还得看相处。`)
      : '你的夫妻宫没有可读的主星，这一边先空着。';
    const partB = spouseB.names.length
      ? `反过来，对方夫妻宫是${listNames(spouseB.names)}${spouseB.borrowed ? '（借对宫）' : ''}，`
        + (hitBA.length
          ? `也落在你的命宫上。两个人容易一开始就看对眼。`
          : `和你的命宫不是一路。`)
      : '对方那边的夫妻宫也空着。';
    looksText = `${partA}${partB}夫妻宫看的是「你会被什么人吸引」，不是保证你会遇到谁。`;
  }

  const shenText = shenA.name === shenB.name
    ? `你们的劲都使在「${PALACE[shenA.name].q}」上。这件事上不用多解释就懂，也最容易争「到底谁更懂」。`
    : `你的劲使在「${PALACE[shenA.name].q}」，对方的劲使在「${PALACE[shenB.name].q}」。不一定撞车，怕的是各忙各的，久了不知道对方在忙什么。`;

  let jiText;
  if (jiA?.palaceName && jiB?.palaceName) {
    jiText = jiA.palaceName === jiB.palaceName
      ? `你们的化忌都落在${full(jiA.palaceName)}。这是最容易一拍即合的地方，也是最容易一起钻牛角尖的地方。`
      : `你的化忌在${full(jiA.palaceName)}，对方在${full(jiB.palaceName)}。雷区不一样：你疼的地方，对方可能没感觉，别拿自己那套去劝。`;
  } else {
    jiText = '有一边的化忌没有落在可读的宫位上，这一项先跳过。';
  }

  return {
    cards: {
      a: {
        ming: `${mingA.join('、')}坐命`,
        shen: full(shenA.name),
        ji: jiA?.palaceName ? full(jiA.palaceName) : '—',
        spouse: listNames(spouseA.names),
      },
      b: {
        ming: `${mingB.join('、')}坐命`,
        shen: full(shenB.name),
        ji: jiB?.palaceName ? full(jiB.palaceName) : '—',
        spouse: listNames(spouseB.names),
      },
    },
    blocks: [
      { label: '动作顺序', text: paceText },
      { label: '互相像不像', text: looksText },
      { label: '劲往哪使', text: shenText },
      { label: '各自的雷区', text: jiText },
    ],
    asks: [
      jiA?.palaceName ? { who: '你', text: PALACE[jiA.palaceName].ask } : null,
      jiB?.palaceName ? { who: '对方', text: PALACE[jiB.palaceName].ask } : null,
    ].filter(Boolean),
  };
}
