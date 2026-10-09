// 测试引导：从 index.html 里提取领域层并求值。
//
// 这是 D-009 的落地做法。领域层内联在 index.html 的
// <script id="zhaiwu-domain"> 块里，交付物因此是严格的单文件。
// 提取与求值的公共实现在 load-block.mjs，交付层用同一套。
//
// 本文件只存在于 tests/，**不随产品发布**。

import { evalBlock, toLocal } from './load-block.mjs';

const { source, context } = evalBlock('zhaiwu-domain');

/** 领域层源码原文（用于纯度静态检查） */
export { source };

const domain = context.__zhaiwuDomain;
if (!domain) {
  throw new Error('领域层没有挂载 globalThis.__zhaiwuDomain');
}

// 对外契约的守门人：缺了谁就在这里炸，而不是等某个测试报出难懂的错
const REQUIRED_EXPORTS = [
  'timeParser', 'timeParserDetail',
  'isTaskLine', 'taskExtractor', 'makeTask', 'sorter', 'parse'
];
for (const name of REQUIRED_EXPORTS) {
  if (typeof domain[name] !== 'function') {
    throw new Error(`领域层缺少导出：${name}`);
  }
}

// toLocal 原本定义在本文件，Phase 7 抽到 load-block.mjs 供交付层共用。
// 重新导出是为了让既有的三个测试文件一行都不用改。
export { toLocal };

export { domain };
