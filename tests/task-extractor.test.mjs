// taskExtractor / isTaskLine 的测试。
//
// 规格来源：docs/construction/SUPPORTED_EXPRESSIONS.md §4（动作词表）
//
// **顺序是有意的：先反向，再正向。**
// 识别类功能最常见的失败是误检，不是漏检。把「哪些不能判成任务」钉死在前，
// 后面再放宽正向词表时就不会悄悄退化成「什么都是任务」。
//
// 样例全部自行编造，不含任何真实聊天记录。
//
// 基准时间与 time-parser.test.mjs 保持一致：2026-10-09（周五）10:00。

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { domain, toLocal } from './load-domain.mjs';

const { isTaskLine } = domain;

// taskExtractor 返回的是 vm realm 的数组，deepEqual 前要搬回本 realm（见 load-domain.mjs）
const taskExtractor = (text) => toLocal(domain.taskExtractor(text));

// ---------------------------------------------------------------------------
// §4 反向 —— 整行寒暄不得判为任务
// ---------------------------------------------------------------------------

// §4「反向」清单全文，21 个。数量有断言：增删词表必须同步改这里。
const FILLER_WORDS = [
  '收到', '好的', '好', '嗯', '哦', '明白了', '了解', '没问题', '辛苦了', '谢谢', '谢了',
  '哈哈', '哈哈哈', '在吗', '早', '早安', '晚安', '已阅', 'OK', 'ok', '嗯嗯'
];

describe('§4 反向：整行寒暄不是任务', () => {
  test('清单共 21 个词', () => {
    assert.equal(FILLER_WORDS.length, 21);
  });

  for (const w of FILLER_WORDS) {
    test(`「${w}」不是任务`, () => {
      assert.equal(isTaskLine(w), false);
    });
  }

  // 真实聊天里寒暄几乎总带标点或重复，光测裸词不够
  const DECORATED = [
    '收到。', '收到！', '收到~', '好的。', '好的好的', '嗯嗯嗯', '好的，好的',
    ' 好的 ', 'OK！', 'ok~', '谢谢！！', '哈哈哈，哈哈哈'
  ];

  for (const line of DECORATED) {
    test(`「${line}」不是任务（带标点/重复）`, () => {
      assert.equal(isTaskLine(line), false);
    });
  }

  test('纯标点与空白不是任务', () => {
    for (const line of ['', '   ', '。。。', '？？？', '\t']) {
      assert.equal(isTaskLine(line), false, `「${line}」`);
    }
  });

  test('非字符串输入不是任务', () => {
    for (const v of [null, undefined, 123, {}, []]) {
      assert.equal(isTaskLine(v), false, String(v));
    }
  });
});

describe('反向的边界：含寒暄词但整行不是寒暄', () => {
  // 这是反向规则真正的风险面 —— 用子串匹配就会把这些真任务误杀。
  const STILL_TASKS = [
    ['收到，明天发你', '发'],
    ['好的，我明天处理', '处理'],
    ['辛苦了，麻烦再改一版', '麻烦'],
    ['谢谢，帮我确认一下会议室', '帮我'],
    ['嗯，记得带身份证', '记得'],
    ['没问题，我下午提交', '提交'],
    ['在吗？帮我看下这份数据', '帮我'],
    ['了解，那我先更新文档', '更新']
  ];

  for (const [line, hit] of STILL_TASKS) {
    test(`「${line}」是任务（命中「${hit}」）`, () => {
      assert.equal(isTaskLine(line), true);
    });
  }
});

describe('反向的边界：既无动作词也无寒暄', () => {
  const NOT_TASKS = [
    '今天天气不错',
    '我明天上午有课',
    '这个方案我看过了',
    '周末打算去哪儿玩',
    '你昨天说的那个事我知道了'
  ];

  for (const line of NOT_TASKS) {
    test(`「${line}」不是任务`, () => {
      assert.equal(isTaskLine(line), false);
    });
  }
});

// ---------------------------------------------------------------------------
// §4 正向 —— 动作词表
// ---------------------------------------------------------------------------

// 与 SUPPORTED_EXPRESSIONS.md §4 一一对应。「Phase5补充」是 Phase 5 新增的，
// 「Phase8补充」是 Phase 8 用真实语料补的，文档里均已同步标注。
const ACTION_WORDS = {
  请求: ['麻烦', '请你', '帮忙', '帮我', '需要你', '给我', '发我', '找一下', '交给你', '麻烦你'],
  提醒: ['记得', '别忘了', '不要忘记', '提醒我', '注意'],
  交付推进: ['提交', '上传', '发', '回复', '确认', '处理', '安排', '完成', '跟进', '核对',
    '整理', '更新', '准备', '修改', '检查', '落实', '对接', '审批', '同步'],
  截止: ['截止', 'deadline', '之前给我', '之前发我'],
  紧迫: ['尽快', '马上', '抓紧', '赶紧', '第一时间', '立刻'],
  Phase5补充: ['开会', '会议', '汇报', '参加', '报名', '签到', '出差', '报销',
    '缴费', '预约', '取件', '反馈'],
  // Phase 8 用 10 组真实语料（82 行）的未命中行逐词测出来的 15 个词。
  // 判据是「语义单一且指向一件待办事项」，不是「出现次数多」——
  // 刻意不补的 7 个词与理由见 SUPPORTED_EXPRESSIONS.md §4「已知漏检」。
  Phase8补充: ['交', '缴', '到期', '申请', '申报', '考试', '模拟考', '体测', '体检',
    '招新', '彩排', '续借', '归还', '接龙', '填写']
};

const TOTAL_ACTION_WORDS = Object.values(ACTION_WORDS).reduce((n, a) => n + a.length, 0);
// §4 原表 = 请求 10 + 提醒 5 + 交付推进 19 + 截止 4 = 38
const SECTION4_WORDS = ACTION_WORDS.请求.length + ACTION_WORDS.提醒.length
  + ACTION_WORDS.交付推进.length + ACTION_WORDS.截止.length;

describe('§4 正向：每个动作词都能触发', () => {
  // 数量有断言：增删词表必须同步改本文件与 SUPPORTED_EXPRESSIONS.md §4。
  test('§4 原表 38 个词（未被 Phase 5 / Phase 8 改动）', () => {
    assert.equal(SECTION4_WORDS, 38);
  });

  test('Phase 5 结束时的 56 个词（原表 38 + 紧迫 6 + 补充 12）', () => {
    const phase5 = SECTION4_WORDS + ACTION_WORDS.紧迫.length + ACTION_WORDS.Phase5补充.length;
    assert.equal(phase5, 56);
  });

  test('Phase 8 补充 15 个词，总数 71（= 56 + 15）', () => {
    assert.equal(ACTION_WORDS.Phase8补充.length, 15);
    assert.equal(TOTAL_ACTION_WORDS, 71);
  });

  // §1.E 与 §4 紧迫类是**两张用途不同的清单**，不要求逐一对应：
  // §1.E 是「时间表达」（决定截止时间与 fuzzy），§4 是「这行是任务」的信号。
  // `越快越好` 属于前者不属于后者——单说一句「越快越好」是应答，不是任务。
  // 这条断言把两张表的不对称钉住，防止后人「顺手对齐」把它塞进 §4。
  // （`马上就好` 不同：它含子串「马上」，而「马上」在 §4 里，所以它**会**被判成任务——
  //  那是已知误检，锚在下面的「已知误检」一节，不是这里。）
  test('「越快越好」单独出现不是任务（它只在 §1.E，不在 §4）', () => {
    assert.equal(isTaskLine('越快越好'), false);
    // 句中有动作词时，它才作为紧迫度生效
    assert.equal(isTaskLine('把报名表交一下，越快越好'), true);
  });

  for (const [category, words] of Object.entries(ACTION_WORDS)) {
    for (const w of words) {
      test(`[${category}] 「${w}」触发任务`, () => {
        assert.equal(isTaskLine(w), true);
      });
    }
  }
});

describe('§4 正向：自然句子', () => {
  const TASKS = [
    ['麻烦你把报告发我', '请求'],
    ['请你明天之前回复我', '请求'],
    ['帮忙确认一下会议时间', '请求'],
    ['需要你签个字', '请求'],
    ['给我一份参会名单', '请求'],
    ['找一下上次的合同', '请求'],

    ['记得带身份证', '提醒'],
    ['别忘了交作业', '提醒'],
    ['提醒我下午取快递', '提醒'],
    ['注意查收邮件', '提醒'],

    ['周三之前提交初稿', '交付推进'],
    ['把材料上传到共享盘', '交付推进'],
    ['回复一下客户的问题', '交付推进'],
    ['确认一下会议室', '交付推进'],
    ['处理一下这个工单', '交付推进'],
    ['安排一下明天的行程', '交付推进'],
    ['跟进一下进度', '交付推进'],
    ['核对一下数据', '交付推进'],
    ['整理会议纪要', '交付推进'],
    ['更新一下文档', '交付推进'],
    ['准备明天的材料', '交付推进'],
    ['修改一下方案', '交付推进'],
    ['检查一遍代码', '交付推进'],
    ['落实一下责任人', '交付推进'],
    ['对接一下供应商', '交付推进'],
    ['审批一下报销单', '交付推进'],
    ['同步一下进度', '交付推进'],

    ['截止时间是周五', '截止'],
    ['deadline 是周五', '截止'],

    ['尽快把测试环境搭好', '紧迫'],
    ['马上把流程走一遍', '紧迫'],
    ['第一时间同步给我', '紧迫'],

    ['周三下午开会', 'Phase5补充'],
    ['参加下周一的技术分享', 'Phase5补充'],
    ['这周内把报名费缴了', 'Phase5补充'],
    ['预约下周三的体检', 'Phase5补充'],
    ['下班前去取件', 'Phase5补充'],
    ['给个反馈', 'Phase5补充'],

    ['周五之前把实验报告交给我', 'Phase8补充'],
    ['辩论队招新，这周三下午在体育馆', 'Phase8补充'],
    ['借的书下周到期，记得续借', 'Phase8补充'],
    ['下个月体检，记得空腹', 'Phase8补充'],
    ['把报名表填写完整', 'Phase8补充']
  ];

  for (const [line, category] of TASKS) {
    test(`[${category}] 「${line}」是任务`, () => {
      assert.equal(isTaskLine(line), true);
    });
  }
});

// ---------------------------------------------------------------------------
// taskExtractor：整段文本 → 候选任务句
// ---------------------------------------------------------------------------

describe('taskExtractor 切分与筛选', () => {
  test('多行文本里只留任务行，保持原顺序', () => {
    const text = [
      '收到',
      '明天下午三点前把报告发我',
      '哈哈哈',
      '辛苦了',
      '周五之前发我初稿',
      '好的',
      '在吗'
    ].join('\n');

    assert.deepEqual(taskExtractor(text), [
      '明天下午三点前把报告发我',
      '周五之前发我初稿'
    ]);
  });

  test('保留重复行（去重是 UI 的事，不是识别的事）', () => {
    const text = '明天发我\n明天发我';
    assert.deepEqual(taskExtractor(text), ['明天发我', '明天发我']);
  });

  test('容忍 CRLF 与首尾空白', () => {
    const text = '  明天发我  \r\n\r\n\t周五之前提交\r\n';
    assert.deepEqual(taskExtractor(text), ['明天发我', '周五之前提交']);
  });

  test('空文本与纯寒暄 → 空数组', () => {
    assert.deepEqual(taskExtractor(''), []);
    assert.deepEqual(taskExtractor('收到\n好的\n嗯嗯'), []);

    // 空白行不算任务（isFillerLine 把空串也算作寒暄）
    assert.deepEqual(taskExtractor('\n\n  \n'), []);
  });

  test('非字符串输入 → 空数组', () => {
    assert.deepEqual(taskExtractor(null), []);
    assert.deepEqual(taskExtractor(undefined), []);
  });

  test('单行无换行也按一行处理', () => {
    assert.deepEqual(taskExtractor('明天下午三点前把报告发我'),
      ['明天下午三点前把报告发我']);
  });
});

// ---------------------------------------------------------------------------
// 已知误检 —— 如实记录，不是待修的 bug
// ---------------------------------------------------------------------------

describe('已知误检（§5：纯规则路线的固有边界）', () => {
  // 这些断言**锁定的是当前的、不理想的**行为。它们的作用是：
  // 将来若有人改了词表让这些变成 false，本测试会红 —— 那就该同步更新
  // SUPPORTED_EXPRESSIONS.md §5 与假设 A-001，而不是悄悄改掉。
  //
  // 单字动作词（尤其是「发」「注意」）是主要来源。产品对此的应对不是更复杂的规则，
  // 而是「一键删除」这个产品定位本身。

  test('「发」会命中与交付无关的词（沙发）', () => {
    assert.equal(isTaskLine('我买了个新沙发'), true);
  });

  test('「发」会命中「头发」', () => {
    assert.equal(isTaskLine('头发有点长了'), true);
  });

  test('「注意」会命中关心语', () => {
    assert.equal(isTaskLine('注意身体'), true);
  });

  test('「确认」会命中回顾性陈述', () => {
    assert.equal(isTaskLine('我确认过了'), true);
  });

  test('已完成的任务仍会被判为任务（时态规则判不了）', () => {
    assert.equal(isTaskLine('我已经提交了'), true);
  });

  test('已发生的陈述会命中「出差」', () => {
    assert.equal(isTaskLine('他昨天出差去了'), true);
  });

  // Phase 8 新增：「交」是本轮唯一补进来的单字词，也是本轮唯一的已知误检来源。
  // 补它的理由是本批语料里它命中 9 行、**全部是真任务**（交作业 / 交材料 / 缴学费 /
  // 交班费），是本轮收益最大的一个词；代价是它同时是「交通 / 交流 / 交换」的子串。
  // 这笔账本项目的算法是：漏 9 行的代价 > 误检几行、且误检可一键删除的代价。
  test('「交」会命中「交通」', () => {
    assert.equal(isTaskLine('路上交通有点堵'), true);
  });

  test('「交」会命中「交流」', () => {
    assert.equal(isTaskLine('我们两个组交流一下'), true);
  });

  // 这条是 Phase 8 补 `越快越好` 时顺带查出来的：`马上就好` 是应答（「马上就到」），
  // 但它是「马上」的超串，而「马上」在 §4 里有 —— 于是应答被判成任务。
  // 与「沙发」「头发」同一类：单字/双字词的子串问题，靠更复杂的规则划不清，
  // 靠一键删除解决。
  test('「马上就好」是应答，但含子串「马上」 → 判为任务', () => {
    assert.equal(isTaskLine('马上就好'), true);
  });
});

// ---------------------------------------------------------------------------
// 已知漏检 —— 召回缺口，同样是固有边界
// ---------------------------------------------------------------------------

describe('已知漏检（召回缺口，如实记录）', () => {
  // 这些句子明显是任务，但当前词表判不出来。**锁定的是现状**：
  // 将来若补齐了词表让它们变成 true，本测试会红 —— 那时该同步更新
  // SUPPORTED_EXPRESSIONS.md §4/§5 与假设 A-001，而不是悄悄删掉这个测试。
  //
  // Phase 8 用真实语料统计这类句子的出现频率；频率决定要不要补词。
  // 在此之前不凭感觉扩充 ——「不得凭感觉写规则」是本项目的明文约束。

  test('「开会」被插入语打断时不命中（开个复盘会 / 开个短会）', () => {
    assert.equal(isTaskLine('下周三上午十点开个复盘会'), false);
    assert.equal(isTaskLine('明天开个短会'), false);
  });

  test('「答复」不在词表内', () => {
    assert.equal(isTaskLine('周五之前给你答复'), false);
  });

  test('口语化的交付说法不在词表内', () => {
    assert.equal(isTaskLine('把那个东西弄一下'), false);
  });

  // --- Phase 8：**刻意不补**的 7 个词（F8-9）---
  //
  // 它们在本批 10 组语料里都出现在真任务行上，也都够常见，但**代价判据不过关**：
  // 在中文里多义、且常见义项与非任务高度重合。补进去会拿误检换召回。
  // 各自的出现次数与逐词论证见 SUPPORTED_EXPRESSIONS.md §4「已知漏检」。
  //
  // 这些断言锁定的是**决定本身**：哪天有人补了这些词，这里会红，
  // 那就该回去重新论证，而不是顺手删掉断言。
  test('「带」不在词表内（带/带来/带去/带队 多义）', () => {
    assert.equal(isTaskLine('下周实验课要带护目镜'), false);
  });

  test('「看」不在词表内（看见/看看/看法 多义，且语料里已有非任务行含它）', () => {
    assert.equal(isTaskLine('那个文档你抽空看一下'), false);
  });

  test('「办」不在词表内（办法/办理/怎么办 多义）', () => {
    assert.equal(isTaskLine('这个证明要去教务处办'), false);
  });

  test('「做完」不在词表内（且已被「交」覆盖）', () => {
    assert.equal(isTaskLine('把这章练习做完'), false);
  });

  test('「提」不在词表内（提醒/提前/提供 多义，且会命中小标题）', () => {
    assert.equal(isTaskLine('📢本周活动提醒'), false);
  });

  test('「考」不在词表内（考虑/参考/思考 多义）', () => {
    assert.equal(isTaskLine('我考虑一下再说'), false);
  });

  test('「集合」不在词表内（数学名词，工科群聊里会误命中）', () => {
    assert.equal(isTaskLine('集合的运算还没复习'), false);
  });
});
