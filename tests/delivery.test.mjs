// 交付层测试：renderMarkdown(tasks) => string
//
// 它是纯函数（字符串进、字符串出），所以没有理由不测。
// 复制与下载触碰浏览器 API，只能人工验证——那部分不在这里。

import test from 'node:test';
import assert from 'node:assert/strict';

import { delivery, deliverySource } from './load-delivery.mjs';

const renderMarkdown = delivery.renderMarkdown;

/** 造一条 Task。默认是无截止时间、规则来源——需要什么就覆盖什么。 */
function task(over = {}) {
  return {
    id: 'x', text: '任务', deadline: null,
    fuzzy: false, source: 'rule', raw: '', ...over
  };
}

// ---------------------------------------------------------------------------
// 空输入
// ---------------------------------------------------------------------------

test('交付层 · 空输入', async (t) => {
  await t.test('空数组给出说明，而不是空串', () => {
    assert.equal(renderMarkdown([]), '# 摘务\n\n没有任务。\n');
  });

  await t.test('无参数也当作空', () => {
    assert.equal(renderMarkdown(), '# 摘务\n\n没有任务。\n');
  });

  await t.test('空结果不含任何分组标题——不制造空分组', () => {
    const md = renderMarkdown([]);
    assert.ok(!md.includes('## '));
  });
});

// ---------------------------------------------------------------------------
// 单条
// ---------------------------------------------------------------------------

test('交付层 · 单条', async (t) => {
  await t.test('有截止时间：时刻在前，任务文本在后', () => {
    const md = renderMarkdown([task({
      text: '把报表发我', deadline: new Date(2026, 9, 10, 15, 0)
    })]);
    assert.ok(md.includes('- [ ] 2026-10-10 15:00 · 把报表发我'));
  });

  await t.test('无截止时间：不臆造时刻', () => {
    const md = renderMarkdown([task({ text: '记得带身份证' })]);
    assert.ok(md.includes('- [ ] 记得带身份证'));
    assert.ok(!md.includes('2026'));
  });

  await t.test('单条也带条数统计', () => {
    assert.ok(renderMarkdown([task()]).includes('共 1 条任务。'));
  });
});

// ---------------------------------------------------------------------------
// 分组
// ---------------------------------------------------------------------------

test('交付层 · 分组', async (t) => {
  const mixed = [
    task({ text: '无时间的', deadline: null }),
    task({ text: '后天的', deadline: new Date(2026, 9, 11, 9, 0) }),
    task({ text: '明天的', deadline: new Date(2026, 9, 10, 15, 0) })
  ];

  await t.test('两个分组标题都出现，且带各自条数', () => {
    const md = renderMarkdown(mixed);
    assert.ok(md.includes('## 有截止时间（2）'));
    assert.ok(md.includes('## 未识别到时间（1）'));
  });

  await t.test('有截止时间的分组在前', () => {
    const md = renderMarkdown(mixed);
    assert.ok(md.indexOf('有截止时间') < md.indexOf('未识别到时间'));
  });

  await t.test('组内保持入参顺序——renderMarkdown 不排序', () => {
    // 排序是 sorter 的职责。交付层若自作主张排序，会掩盖上游的 bug。
    const md = renderMarkdown(mixed);
    assert.ok(md.indexOf('后天的') < md.indexOf('明天的'),
      '入参顺序是「后天」在前，输出就该是「后天」在前');
  });

  await t.test('全部有时：不输出「未识别到时间」空组', () => {
    const md = renderMarkdown([task({ deadline: new Date(2026, 9, 10) })]);
    assert.ok(!md.includes('未识别到时间'));
  });

  await t.test('全部无时：不输出「有截止时间」空组', () => {
    const md = renderMarkdown([task(), task()]);
    assert.ok(!md.includes('有截止时间'));
    assert.ok(md.includes('## 未识别到时间（2）'));
  });

  await t.test('deadline 为 undefined 视作无时间', () => {
    const md = renderMarkdown([task({ deadline: undefined })]);
    assert.ok(md.includes('未识别到时间'));
  });

  await t.test('分组之间是空行分隔（Markdown 块级语法要求）', () => {
    const md = renderMarkdown(mixed);
    assert.ok(md.includes('## 有截止时间（2）\n\n- [ ]'));
    assert.ok(md.includes('## 未识别到时间（1）\n\n- [ ]'));
  });
});

// ---------------------------------------------------------------------------
// 标记
// ---------------------------------------------------------------------------

test('交付层 · 标记', async (t) => {
  await t.test('fuzzy 标出「推定」——复制出去也不能丢这个诚实性标记', () => {
    const md = renderMarkdown([task({
      text: '尽快搭好', deadline: new Date(2026, 9, 9, 23, 59), fuzzy: true
    })]);
    assert.ok(md.includes('- [ ] 2026-10-09 23:59 · 尽快搭好（推定）'));
  });

  await t.test('手动补的标出「手动补的」', () => {
    const md = renderMarkdown([task({ text: '买牛奶', source: 'manual' })]);
    assert.ok(md.includes('- [ ] 买牛奶（手动补的）'));
  });

  await t.test('两者可叠加', () => {
    const md = renderMarkdown([task({
      text: '尽快回他', deadline: new Date(2026, 9, 9, 23, 59),
      fuzzy: true, source: 'manual'
    })]);
    assert.ok(md.includes('尽快回他（推定 · 手动补的）'));
  });

  await t.test('规则来源且不模糊：不加多余括号', () => {
    const md = renderMarkdown([task({ text: '干净的一条' })]);
    assert.ok(md.includes('- [ ] 干净的一条\n'));
    assert.ok(!md.includes('干净的一条（'));
  });

  await t.test('标记不是分组——来源不产生第三个 ## 标题', () => {
    const md = renderMarkdown([
      task({ text: '机器找的' }),
      task({ text: '自己补的', source: 'manual' })
    ]);
    const headings = md.split('\n').filter((l) => l.startsWith('## '));
    assert.deepEqual(headings, ['## 未识别到时间（2）']);
  });
});

// ---------------------------------------------------------------------------
// 转义：任务文本来自用户粘贴的聊天记录
// ---------------------------------------------------------------------------

test('交付层 · 转义', async (t) => {
  const cases = [
    ['*', '星号'],
    ['_', '下划线'],
    ['`', '反引号'],
    ['[', '左方括号'],
    [']', '右方括号'],
    ['\\', '反斜杠']
  ];

  for (const [ch, name] of cases) {
    await t.test(`${name}被转义`, () => {
      const md = renderMarkdown([task({ text: `前缀${ch}后缀` })]);
      assert.ok(md.includes(`前缀\\${ch}后缀`), `实际输出：${md}`);
    });
  }

  await t.test('含 [ 的任务被转义——未闭合的括号会吞掉后续文本', () => {
    const md = renderMarkdown([task({ text: '看这个 [链接 没闭合' })]);
    assert.ok(md.includes('\\[链接'), `实际输出：${md}`);
  });

  await t.test('行中无害的 # 和 - 不转义——保持原文可读', () => {
    const md = renderMarkdown([task({ text: '第#3条 - 收尾' })]);
    assert.ok(md.includes('第#3条 - 收尾'));
    assert.ok(!md.includes('\\#'));
  });

  await t.test('中文标点与普通字符原样保留', () => {
    const md = renderMarkdown([task({ text: '周五之前给客户回个电话（重要）！' })]);
    assert.ok(md.includes('周五之前给客户回个电话（重要）！'));
  });

  await t.test('换行被压成空格——否则一个列表项会被截成两行', () => {
    const md = renderMarkdown([task({ text: '前半段\n后半段' })]);
    assert.ok(md.includes('前半段 后半段'), `实际输出：${md}`);
    const items = md.split('\n').filter((l) => l.startsWith('- [ ]'));
    assert.equal(items.length, 1, '换行没处理的话这里会变成 2 —— 第二行不再是列表项');
  });

  await t.test('CRLF 同样被压成空格', () => {
    const md = renderMarkdown([task({ text: '前半段\r\n后半段' })]);
    assert.ok(md.includes('前半段 后半段'));
  });

  await t.test('| 不转义——输出里没有表格，管道符没有语义', () => {
    const md = renderMarkdown([task({ text: 'A | B' })]);
    assert.ok(md.includes('A | B'));
  });

  await t.test('text 为 undefined 时不输出 "undefined"', () => {
    const md = renderMarkdown([task({ text: undefined })]);
    assert.ok(!md.includes('undefined'));
  });
});

// ---------------------------------------------------------------------------
// 输出形状
// ---------------------------------------------------------------------------

test('交付层 · 输出形状', async (t) => {
  await t.test('以 # 摘务 开头', () => {
    assert.ok(renderMarkdown([task()]).startsWith('# 摘务\n'));
  });

  await t.test('以换行结尾（文件惯例）', () => {
    assert.ok(renderMarkdown([task()]).endsWith('\n'));
    assert.ok(renderMarkdown([]).endsWith('\n'));
  });

  await t.test('没有多余空行', () => {
    const md = renderMarkdown([task({ deadline: new Date(2026, 9, 10) })]);
    assert.ok(!md.includes('\n\n\n'));
  });

  await t.test('每一项都是一个复选框行', () => {
    const md = renderMarkdown([
      task({ text: 'a' }), task({ text: 'b', deadline: new Date(2026, 9, 10) })
    ]);
    const items = md.split('\n').filter((l) => l.startsWith('- [ ]'));
    assert.equal(items.length, 2);
  });

  await t.test('不改动入参', () => {
    const tasks = [task({ text: '别动我', deadline: new Date(2026, 9, 10) })];
    const snapshot = JSON.stringify(tasks, (k, v) => (k === 'deadline' ? String(v) : v));
    renderMarkdown(tasks);
    assert.equal(JSON.stringify(tasks, (k, v) => (k === 'deadline' ? String(v) : v)), snapshot);
  });

  await t.test('重复调用结果一致', () => {
    const tasks = [task({ text: '稳定', deadline: new Date(2026, 9, 10) })];
    assert.equal(renderMarkdown(tasks), renderMarkdown(tasks));
  });
});

// ---------------------------------------------------------------------------
// 纯度
// ---------------------------------------------------------------------------

test('交付层 · 纯度（静态检查）', async (t) => {
  const forbidden = [
    ['document', /\bdocument\b/],
    ['window', /\bwindow\b/],
    ['fetch', /\bfetch\s*\(/],
    ['localStorage', /\blocalStorage\b/],
    ['XMLHttpRequest', /\bXMLHttpRequest\b/],
    ['import / require', /\b(import|require)\s*[\('"]/],
    ['new Date()', /new Date\(\s*\)/],
    ['Date.now()', /Date\.now\s*\(/]
  ];

  for (const [name, re] of forbidden) {
    await t.test(`不出现 ${name}`, () => {
      assert.ok(!re.test(deliverySource), `交付层源码里出现了 ${name}`);
    });
  }

  await t.test('复制与下载不在本层——它们要碰浏览器 API', () => {
    assert.ok(!/\bclipboard\b/i.test(deliverySource));
    assert.ok(!/\bBlob\b/.test(deliverySource));
    assert.ok(!/createObjectURL/.test(deliverySource));
  });
});
