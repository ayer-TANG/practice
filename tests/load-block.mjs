// 从 index.html 里按 id 提取内联 <script> 块并求值。
//
// 这是 D-009 的公共实现：交付物必须是严格的单文件，所以产品代码全部内联；
// Node 侧用 node:vm 把指定块取出来跑测试。被测试的就是 index.html 里的那段原文，
// 不存在「源码改了、交付文件忘了同步」的风险。
//
// 本文件只存在于 tests/，**不随产品发布**。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const HTML_PATH = join(ROOT, 'index.html');
const html = readFileSync(HTML_PATH, 'utf8');

/**
 * 取出指定 id 的 script 块正文（非贪婪，遇到第一个 </script> 即止）。
 * 找不到就抛错——静默返回空串会让后续断言报出难懂的失败。
 */
export function extractBlock(id) {
  const matched = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`));
  if (!matched) {
    throw new Error(`index.html 中找不到 <script id="${id}"> 块`);
  }
  return matched[1];
}

/** 提取 + 求值。返回源码原文（静态检查用）与该块的执行上下文。 */
export function evalBlock(id, globals = {}) {
  const source = extractBlock(id);
  const context = vm.createContext({ ...globals });
  vm.runInContext(source, context, { filename: `${id}.js` });
  return { source, context };
}

/**
 * 把 node:vm 里创建的结构搬回测试所在的 realm。
 *
 * 领域层/交付层跑在 vm 里，它们创建的 Array / Object 拥有**另一个 realm 的原型**。
 * `assert.deepEqual`（strict 模式下即 deepStrictEqual）会比较原型，
 * 于是 `deepEqual(返回值, [])` 会以
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
