// 测试引导：从 index.html 里提取领域层并求值。
//
// 这是 D-009 的落地做法。领域层内联在 index.html 的
// <script id="zhaiwu-domain"> 块里，交付物因此是严格的单文件；
// Node 侧则用 node:vm 把该块正文取出来跑测试。
//
// 本文件只存在于 tests/，**不随产品发布**。
// 被测试的就是 index.html 里的那段原文，不存在「源码改了、交付文件忘了同步」的风险。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML_PATH = join(ROOT, 'index.html');

const html = readFileSync(HTML_PATH, 'utf8');

const matched = html.match(/<script id="zhaiwu-domain">([\s\S]*?)<\/script>/);
if (!matched) {
  throw new Error('index.html 中找不到 <script id="zhaiwu-domain"> 块');
}

/** 领域层源码原文（用于纯度静态检查） */
export const source = matched[1];

const context = vm.createContext({});
vm.runInContext(source, context, { filename: 'zhaiwu-domain.js' });

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

/**
 * 把领域层返回的结构搬回测试所在的 realm。
 *
 * 领域层跑在 node:vm 里，它创建的 Array / Object 拥有**另一个 realm 的原型**。
 * `assert.deepEqual`（strict 模式下即 deepStrictEqual）会比较原型，
 * 于是 `deepEqual(领域层返回的 [], [])` 会以
 * 「Values have same structure but are not reference-equal」失败。
 *
 * 这不是实现缺陷，是跨 realm 的固有现象 —— 与 `x instanceof Date` 失效同源。
 * 断言前用本函数把结构搬回来；Date 保留为本地 Date，不走 JSON 序列化。
 */
export function toLocal(v) {
  if (Array.isArray(v)) return Array.from(v, toLocal);
  if (v !== null && typeof v === 'object') {
    if (typeof v.getTime === 'function') return new Date(v.getTime());
    const out = {};
    for (const k of Object.keys(v)) out[k] = toLocal(v[k]);
    return out;
  }
  return v;
}

export { domain };
