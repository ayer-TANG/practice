// sorter / makeTask / parse 组装的测试。
//
// parse 是领域层唯一的对外契约（LAYER_CONTRACT.md）。本文件测的是
// 「三个互不调用的子模块被正确地串起来」——taskExtractor 判定、
// timeParser 解析时间、sorter 排序，以及 Task 形状本身。
//
// 基准时间与 time-parser.test.mjs 保持一致：2026-10-09（周五）10:00。
// 样例全部自行编造，不含任何真实聊天记录。

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { domain, toLocal } from './load-domain.mjs';

const { timeParserDetail } = domain;

// 这三个都返回 vm realm 的数组/对象，deepEqual 前要搬回本 realm（见 load-domain.mjs）。
// 包一层是为了让下面的断言读起来仍是 parse(...) / sorter(...) / makeTask(...)。
const parse = (text, now) => toLocal(domain.parse(text, now));
const sorter = (tasks) => toLocal(domain.sorter(tasks));
const makeTask = (input) => toLocal(domain.makeTask(input));

const NOW = new Date(2026, 9, 9, 10, 0, 0);   // 2026-10-09 周五 10:00

function fmt(d) {
  if (d === null || d === undefined) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
         `${p(d.getHours())}:${p(d.getMinutes())}`;
}

const brief = (tasks) => tasks.map((t) => `${t.text} → ${fmt(t.deadline)}`);

// ---------------------------------------------------------------------------
// makeTask
// ---------------------------------------------------------------------------

describe('makeTask：规范化 Task 形状', () => {
  test('缺省字段被填成安全值', () => {
    assert.deepEqual(
      makeTask({ id: 'm1', text: '写周报', source: 'manual' }),
      { id: 'm1', text: '写周报', deadline: null, fuzzy: false, source: 'manual', raw: '' }
    );
  });

  test('显式传 null 的 deadline 保持 null', () => {
    assert.equal(makeTask({ id: 'x', text: 't', source: 'rule', deadline: null }).deadline, null);
  });

  test('fuzzy 只认 true', () => {
    assert.equal(makeTask({ id: 'x', text: 't', source: 'rule', fuzzy: 'yes' }).fuzzy, false);
    assert.equal(makeTask({ id: 'x', text: 't', source: 'rule', fuzzy: true }).fuzzy, true);
  });

  test('Task 有且只有 6 个字段（ARCHITECTURE.md 数据模型）', () => {
    assert.deepEqual(
      Object.keys(makeTask({ id: 'x', text: 't', source: 'rule' })).sort(),
      ['deadline', 'fuzzy', 'id', 'raw', 'source', 'text']
    );
  });
});

// ---------------------------------------------------------------------------
// sorter
// ---------------------------------------------------------------------------

describe('sorter：按截止时间升序，无截止的垫底', () => {
  const mk = (id, deadline) => makeTask({ id, text: id, source: 'rule', deadline });

  const T1 = new Date(2026, 9, 10, 15, 0, 0);
  const T2 = new Date(2026, 9, 9, 23, 59, 0);
  const T3 = new Date(2026, 9, 20, 9, 0, 0);

  test('有截止时间的升序排在前', () => {
    const out = sorter([mk('c', T3), mk('a', T2), mk('b', T1)]);
    assert.deepEqual(out.map((t) => t.id), ['a', 'b', 'c']);
  });

  test('无截止时间的一律垫底', () => {
    const out = sorter([mk('none1', null), mk('a', T2), mk('none2', null), mk('b', T1)]);
    assert.deepEqual(out.map((t) => t.id), ['a', 'b', 'none1', 'none2']);
  });

  test('全无截止时间时保持传入顺序', () => {
    const out = sorter([mk('x', null), mk('y', null), mk('z', null)]);
    assert.deepEqual(out.map((t) => t.id), ['x', 'y', 'z']);
  });

  test('截止时间相同时保持传入顺序（稳定排序）', () => {
    const out = sorter([mk('first', T1), mk('second', new Date(T1.getTime()))]);
    assert.deepEqual(out.map((t) => t.id), ['first', 'second']);
  });

  test('不修改入参', () => {
    const input = [mk('c', T3), mk('a', T2), mk('n', null)];
    const snapshot = input.map((t) => t.id);
    const out = sorter(input);
    assert.notEqual(out, input);
    assert.deepEqual(input.map((t) => t.id), snapshot);
  });

  test('空数组与单元素', () => {
    assert.deepEqual(sorter([]), []);
    assert.deepEqual(sorter([mk('only', null)]).map((t) => t.id), ['only']);
  });
});

// ---------------------------------------------------------------------------
// parse 组装
// ---------------------------------------------------------------------------

describe('parse：端到端', () => {
  test('多行文本 → 按紧急度排好的 Task[]', () => {
    const text = [
      '收到',
      '明天下午三点前把报告发我',
      '哈哈哈',
      '周五之前发我初稿',
      '记得带身份证',
      '好的'
    ].join('\n');

    const tasks = parse(text, NOW);

    assert.deepEqual(brief(tasks), [
      '周五之前发我初稿 → 2026-10-09 23:59',
      '明天下午三点前把报告发我 → 2026-10-10 15:00',
      '记得带身份证 → null'
    ]);
  });

  test('无截止时间的任务排在最后，不参与时间排序', () => {
    const text = '记得带身份证\n明天发我\n提醒我交房租';
    const tasks = parse(text, NOW);

    assert.equal(tasks.length, 3);
    assert.equal(fmt(tasks[2].deadline), null);
    assert.equal(tasks[2].text, '提醒我交房租');
  });

  test('fuzzy 从 timeParserDetail 透传（D-011）—— 不能用 timeParser', () => {
    const tasks = parse('尽快回复我', NOW);

    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].fuzzy, true);
    assert.equal(fmt(tasks[0].deadline), '2026-10-09 23:59');

    // 与实现真值对照：同一个输入，detail 的 fuzzy 必须一致
    assert.equal(timeParserDetail('尽快回复我', NOW).fuzzy, true);
  });

  test('非 fuzzy 的任务 fuzzy 为 false', () => {
    assert.equal(parse('明天发我', NOW)[0].fuzzy, false);
  });

  test('id 是「r + 原始行号」，跳过寒暄行也不挤号', () => {
    const text = ['收到', '好的', '明天发我', '辛苦了', '周五之前提交'].join('\n');
    const tasks = parse(text, NOW);

    // 任务落在第 2、4 行（0 起算），id 必须反映这一点，
    // 否则 UI 删除时无法与原文对上
    assert.deepEqual(tasks.map((t) => t.id).sort(), ['r2', 'r4']);
  });

  test('source 一律是 rule', () => {
    const tasks = parse('明天发我\n周五之前提交', NOW);
    assert.ok(tasks.every((t) => t.source === 'rule'));
  });

  test('raw 保留原文（含首尾空白），text 是去空白后的描述', () => {
    const tasks = parse('   明天发我   ', NOW);
    assert.equal(tasks[0].raw, '   明天发我   ');
    assert.equal(tasks[0].text, '明天发我');
  });

  test('空文本 / 纯寒暄 → 空数组', () => {
    assert.deepEqual(parse('', NOW), []);
    assert.deepEqual(parse('收到\n好的\n哈哈哈', NOW), []);
    assert.deepEqual(parse(null, NOW), []);
  });

  test('容忍 CRLF', () => {
    const tasks = parse('收到\r\n明天发我\r\n', NOW);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].text, '明天发我');
  });

  test('时间来自注入的 now，不是系统时间', () => {
    const text = '明天下午三点前发我';

    const a = parse(text, new Date(2026, 9, 9, 10, 0, 0));
    const b = parse(text, new Date(2026, 11, 24, 10, 0, 0));

    assert.equal(fmt(a[0].deadline), '2026-10-10 15:00');
    assert.equal(fmt(b[0].deadline), '2026-12-25 15:00');
  });

  test('now 无效时抛错，且不静默用系统时间兜底', () => {
    const BAD = [null, undefined, new Date(NaN), 0, 'now', {}];
    for (const bad of BAD) {
      assert.throws(() => parse('明天发我', bad), /需要注入有效的 now/);
    }
  });

  test('无候选任务时也必须校验 now（保持契约一致）', () => {
    assert.throws(() => parse('收到\n好的', null), /需要注入有效的 now/);
  });
});

// ---------------------------------------------------------------------------
// 端到端一致性：parse 的输出结构
// ---------------------------------------------------------------------------

describe('parse 输出的每个元素都是合法 Task', () => {
  test('字段齐全、类型正确', () => {
    const tasks = parse('明天下午三点前把报告发我\n尽快回复\n记得带身份证', NOW);
    assert.equal(tasks.length, 3);

    for (const t of tasks) {
      assert.equal(typeof t.id, 'string');
      assert.equal(typeof t.text, 'string');
      assert.equal(typeof t.fuzzy, 'boolean');
      assert.equal(t.source, 'rule');
      assert.equal(typeof t.raw, 'string');
      assert.ok(t.deadline === null || typeof t.deadline.getTime === 'function');
    }
  });

  test('id 不重复', () => {
    const tasks = parse('明天发我\n周五之前提交\n记得带身份证\n尽快回复', NOW);
    const ids = tasks.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('输出的顺序满足「有截止在前、升序」这一不变式', () => {
    const tasks = parse([
      '记得带身份证',
      '下周内提交报告',
      '明天下午三点前发我',
      '尽快回复我',
      '提醒我交房租',
      '周五之前发我初稿'
    ].join('\n'), NOW);

    const timed = tasks.filter((t) => t.deadline !== null);
    assert.equal(timed.length, 4);

    // 升序
    for (let i = 1; i < timed.length; i++) {
      assert.ok(timed[i - 1].deadline.getTime() <= timed[i].deadline.getTime());
    }
    // 无截止的一律在尾部
    assert.deepEqual(tasks.slice(timed.length).map((t) => t.deadline), [null, null]);
  });
});
