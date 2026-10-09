// 测试引导：从 index.html 里提取交付层并求值。
//
// 与 load-domain.mjs 同构，共用 load-block.mjs 的提取器。
// 本文件只存在于 tests/，**不随产品发布**。

import { evalBlock } from './load-block.mjs';

const { source, context } = evalBlock('zhaiwu-delivery');

/** 交付层源码原文（用于纯度静态检查） */
export const deliverySource = source;

const delivery = context.__zhaiwuDelivery;
if (!delivery) {
  throw new Error('交付层没有挂载 globalThis.__zhaiwuDelivery');
}

// 对外契约的守门人
const REQUIRED_EXPORTS = ['renderMarkdown'];
for (const name of REQUIRED_EXPORTS) {
  if (typeof delivery[name] !== 'function') {
    throw new Error(`交付层缺少导出：${name}`);
  }
}

export { delivery };
