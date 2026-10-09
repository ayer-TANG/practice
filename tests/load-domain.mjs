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
if (typeof domain.timeParser !== 'function') {
  throw new Error('领域层缺少 timeParser');
}
if (typeof domain.timeParserDetail !== 'function') {
  throw new Error('领域层缺少 timeParserDetail');
}

export { domain };
