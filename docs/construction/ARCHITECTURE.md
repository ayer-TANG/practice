# Architecture

状态：架构已定稿（2026-10-09，对应 skill 的 Phase 3）。尚无实现代码。

## Architectural Goal

在**单文件、零依赖、零构建、完全离线**的约束下，把「解析」这件事与「界面」彻底分开，
使得：

1. 解析逻辑可以被独立测试（不依赖浏览器）；
2. 将来若代码量涨到必须迁到 Vite + React，**领域层可以原样搬走**，只重写 UI 层。

这两个目标决定了本项目的分层形态。**这不是过度设计**——假设 A-005（单文件够用）尚未验证，
分成单向依赖的几段是成本极低的保险。

## Current Stack

| 项 | 值 |
|---|---|
| 语言 | 原生 JavaScript（ES2015+，浏览器与 Node 均可解析的语法） |
| 运行环境 | 浏览器（桌面，Chrome/Edge 优先） |
| 构建工具 | **无** |
| 依赖 | **无** |
| 包管理器 | **无**（不使用 npm 安装任何东西） |
| Node.js | 仅用于跑领域层测试（本机已装 v24.18.0）。**不是运行时依赖** |
| 样式 | 原生 CSS，写在 `index.html` 的 `<style>` 内 |

## Deployment Shape

```
交付物: 1 个可双击打开的 HTML 文件（严格单文件，见 D-009）
运行时: 浏览器 file:// 协议
后端:   无
网络:   无
```

托管选项（可选，非必须）：GitHub Pages。因无构建产物，直接托管源文件即可。

## Layer Overview

| 层 | 职责 | 允许依赖 | 禁止依赖 | 现状 |
|---|---|---|---|---|
| UI 层 | 粘贴区、抽取按钮、结果列表、补漏输入框、删除、复制/下载按钮的渲染与事件 | 领域层、交付层 | 解析规则（正则不得写在 UI 层） | **已完成**（Phase 6 UI + Phase 7 导出按钮） |
| 领域层（核心） | `Task` 类型；`taskExtractor` 任务句识别；`timeParser` 时间解析；`sorter` 排序与分组 | 仅 JS 内置能力 | **DOM、网络、localStorage** | **已完成**（Phase 5） |
| 交付层 | `renderMarkdown(tasks) => string`（纯函数，在 `<script id="zhaiwu-delivery">`）；复制与下载实为 UI 层职责 | 领域层的 `Task` 类型 | 被领域层反向依赖；**不得出现 clipboard / Blob / createObjectURL** | **已完成**（Phase 7；纯函数部分有测试，复制/下载待人工验证） |
| 数据层 | —— | —— | —— | **N/A**（本版无持久化） |
| 认证层 | —— | —— | —— | **N/A**（单用户无账号） |
| 存储层 | —— | —— | —— | **N/A**（无文件/对象存储需求） |
| 集成层 | —— | —— | —— | **N/A**（无网络请求、不接第三方） |
| 测试边界 | 领域层 + 交付层纯函数测试 | 领域层、交付层 | DOM | `node --test` → 377 passed（领域层 315 + 交付层 53） |

四个 N/A 层不是遗漏。按施工纪律，在需要之前不引入数据库、队列、搜索、对象存储或认证服务。

### 仓库目录结构

```
index.html                         交付物。四块内联：样式 <style id="zhaiwu-style">、
                                   领域层 <script id="zhaiwu-domain">（D-009）、
                                   交付层 <script id="zhaiwu-delivery">（Phase 7）、
                                   UI 层 <script id="zhaiwu-ui">（Phase 6）
tests/load-block.mjs               测试引导：通用提取器，读 index.html 并按 id 提取 script 块求值（不随产品发布）
tests/load-domain.mjs              在提取器之上加领域层的导出契约守门
tests/load-delivery.mjs            同上，交付层
tests/time-parser.test.mjs         timeParser 的用例
tests/task-extractor.test.mjs      任务识别的用例
tests/parse.test.mjs               makeTask / sorter / parse 的用例
tests/delivery.test.mjs            renderMarkdown 的用例
docs/product/                      产品真值
docs/construction/                 施工文档
docs/construction/progress/layers/ 分层进度
```

`tests/` 的存在不改变「交付物是单文件」这一事实——测试代码不参与交付。

## Data Flow

```
用户粘贴文本
   │
   ▼
[UI 层] 采集原始文本 + 读取浏览器当前时间
   │  parse(text, now)
   ▼
[领域层] taskExtractor → 候选任务句
         timeParser     → 每条候选的截止时间（可能为 null）
         sorter         → 按截止时间排序 + 分「有/无截止时间」两组
   │  Task[]
   ▼
[UI 层] 渲染列表
   │
   ├─ 用户手动补漏 → 构造 source='manual' 的 Task → 回到 sorter 重新排序
   ├─ 用户删除条目 → 从列表中移除
   │
   ▼
[交付层] renderMarkdown(tasks) → 复制到剪贴板 / 下载 .md
```

**关键点**：`now` 由 UI 层采集后作为参数传入领域层。领域层不自己读时间，否则无法测试。
这也让 D-005（相对时间以运行时当前时间为基准）成为一个可注入、可测试的行为。

## Data Model

```
Task {
  id:        string        // 会话内唯一，用于删除与渲染
  text:      string        // 要做的事
  deadline:  Date | null   // 截止时间；解析不出为 null
  fuzzy:     boolean       // 截止时间来自约定映射（如"尽快"），而非字面表达
  source:    'rule' | 'manual'
  raw:       string        // 来源原句，用于核对
}
```

紧急度不是字段，由 `deadline` 派生。这是刻意的——D-004 决定了紧急度只有时间一个维度。

`fuzzy` 字段的存在理由见 `SUPPORTED_EXPRESSIONS.md` 第 1.E 节：像「尽快」这类
紧迫词被**约定映射**为 today 23:59，而不是字面时间。UI 必须据此标注，
否则用户会误以为那是对方说的明确时间。这是诚实性要求，不是装饰。

## File and Storage Flow

- **无文件存储**。不读写 localStorage、IndexedDB、Cookie。
- 唯一的"文件"动作是交付层的**下载 `.md`**：用 `Blob` + `URL.createObjectURL` 触发浏览器下载，
  属于单向输出，不构成持久化。
- 页面关闭即丢失全部数据，这是 D-001 之外的既定行为（用户明确选择不做持久化）。

## Authentication Boundary

无认证边界。无账号、无角色、无登录态、无服务端。

## Integration Boundary

无集成。**运行时零网络请求**——不得出现 `fetch`、`XMLHttpRequest`、`WebSocket`、
外部 `<script src>`、外部字体、CDN 资源。

## Testing Strategy

- 领域层是纯函数，**可在 Node 中直接测试，无需浏览器**。
- 测试载体：Node 内置 `node:test` + `node:assert`（零依赖，符合零依赖原则）。
- 运行命令：**`node --test`**（不是 `node --test tests/`——后者在 Node 24 下报
  `MODULE_NOT_FOUND`，见 `TEST_METRICS.md`）。
- 领域层代码内联在 `index.html` 中，测试用 `node:vm` 提取该块求值（D-009）。
- 必须覆盖：
  - `timeParser`：全部支持的时间表达（清单由 Phase 3 产出）—— **Phase 4 已完成**
  - `taskExtractor`：命中用例 + **不命中用例**（「收到」「哈哈哈」不得被判为任务）—— **Phase 5 已完成**
  - `sorter`：排序正确性 + 无截止时间的分组与位置 —— **Phase 5 已完成**
  - `parse`：端到端组装与输出不变式 —— **Phase 5 已完成**
- `renderMarkdown`：**端到端纯函数测试**，53 条（含转义、分组、标记、换行与边界）—— **Phase 7 已完成**
- UI 层：**渲染与状态**用一次性 DOM 桩在 Node 中跑过（脚本有意不进仓库）；
  **浏览器中的真实行为不做自动化测试，人工验证**。两者的区别必须诚实记录在 `TEST_METRICS.md`。
- 复制 / 下载：**人工验证**。它们在 UI 层，要碰 `navigator.clipboard` / `Blob` / `URL`，
  桩只能验证"调了哪个 API、失败后怎么走"，验证不了"真实浏览器里能不能用"。

### Decision D-009：OD-001 —— 单文件与可测试性的冲突（**已关闭**）

> 关闭于 2026-10-09（Phase 3），由 Claude 决策并记录，用户可推翻。
> 决策编号 D-009，见 `PRODUCT_REQUIREMENTS.md` 的 Decision Log。

**冲突**：测试需要 Node `import` 领域层代码；而 D-003 要求交付物是单个自包含 `index.html`。
若领域代码内联在 `<script>` 里，Node 无法直接引用它。

**注意**：`file://` + `<script type="module">` 会被 CORS 拦截，所以**不能**用 ES module 拆分。
classic script（`<script src="app.js">`）在 `file://` 下可以加载。

| 方案 | 交付物 | 测试方式 | 代价 |
|---|---|---|---|
| **(a) 真单文件 + VM 提取测试**（推荐） | 严格 1 个 `index.html` | Node 读 `index.html`，用 `node:vm` 提取内联 `<script>` 内容并求值，断言领域层命名空间 | 测试引导代码约 15–20 行，稍 hacky；但永不随产品发布 |
| (b) `index.html` + `app.js`（classic script） | 2 个文件 | Node 直接 `require`/读 `app.js` | 破除"物理单文件"，需修改已签字决策 D-003 |

**决策：采用 (a) 真单文件 + VM 提取测试。**

理由（按权重排序）：

1. **`file://` 下的健壮性。**「双击即用」是产品的硬要求（D-003）。
   单一 HTML 文件内联全部代码，运行时**零跨文件加载**，在 `file://` 下不遇到任何
   加载策略限制。方案 (b) 依赖浏览器允许 `file://` 页面加载同目录 classic script ——
   这一点各浏览器版本行为不一，**我无法在当前环境验证**。
   把产品可用性押在一个未验证的浏览器行为上，不如选一个必然可行的方案。
2. **保住已签字的 D-003。** 用户两次明确选择「单个自包含 `index.html`」。
   方案 (b) 需要修改已签字决策，而收益只是「测试代码好看一点」。
3. **被测试的代码就是交付的代码。** 方案 (a) 中测试的，是从 `index.html` 里提取出的
   那段**原文**，不存在「源文件已改、交付文件忘了同步」的风险。

**具体做法：**

- 领域层代码内联在 `index.html` 中一个带稳定标记的 `<script id="zhaiwu-domain">` 块内
- **UI 层与交付层必须各放在独立的 `<script id="zhaiwu-ui">` /
  `<script id="zhaiwu-delivery">` 块内**（Phase 6 / 7 起）。
  领域层纯度静态检查只扫描 `zhaiwu-domain` 块的正文，混入 UI 或交付层代码会让
  「不出现 `document`」「不自己读当前时间」两条检查失败。
  交付层有自己独立的块，也是为了让它的纯度检查（无 clipboard / Blob /
  createObjectURL）能精确扫描它自己
- 每个块末尾把命名空间挂到 `globalThis`，使宿主能取到：
  `globalThis.__zhaiwuDomain = { version, timeParser, timeParserDetail, isTaskLine, taskExtractor, makeTask, sorter, parse }`
  （Phase 5 现状）与 `globalThis.__zhaiwuDelivery = { version, renderMarkdown }`（Phase 7）。
  在浏览器里这只是一个无害的全局变量
- 测试引导 `tests/load-block.mjs`（Phase 7 抽出）：读 `index.html` → 按 id 正则提取
  `<script id="...">` 正文 → `vm.runInContext` 求值 → 返回 source 与 context。
  `load-domain.mjs` / `load-delivery.mjs` 在其之上各自加导出契约守门
  （必需导出缺一即抛错）
- 引导代码约 40 行，**只存在于 `tests/`，不随产品发布**

**被否决的备选：**

| 备选 | 否决理由 |
|---|---|
| (b) `index.html` + `app.js`（classic script） | 测试更"标准"，但把「双击即用」押在未验证的 `file://` 跨文件加载行为上，且需修改 D-003 |
| 浏览器内自测页（`?test=1`） | 保住单文件，但测试无法在命令行运行，需人工开浏览器看结果 |
| 引入构建步骤（拆分源文件再打包进 HTML） | 直接违反零构建原则 |

**推翻成本：** 若将来要改回 (b)，需把内联 script 移到独立文件、改写 `<script>` 标签、
重写测试引导。约半小时工作量，属可逆。

## Future Extension Points

| 扩展点 | 预留方式 |
|---|---|
| 用 LLM 提升召回 | 领域层只依赖 `parse(text, now) => Task[]` 契约，LLM 解析器插在同一位置 |
| 持久化 | localStorage 插在领域层之外，领域层不感知 |
| 任务重要性维度 | `Task` 增加字段，`sorter` 增加排序键 |
| 导出到第三方待办 | 交付层新增 renderer / adapter |
| 支持超过 10 条消息 | UI 层结果列表虚拟化 |
| 迁移到 Vite + React | 只重写 UI 层；领域层与交付层可原样搬走 |

## Architectural Risks

| 风险 | 缓解 |
|---|---|
| 规则库膨胀，单文件难维护 | 规则数据化（时间词表、动作词表做成数据表 + 解析函数），不写成一堆 if |
| 中文相对时间表达组合爆炸（「下下周三下午两点半前」） | Phase 3 必须产出「支持表达清单」，明确列出支持与不支持的范围 |
| 纯规则召回不可预期 | A-001 / A-004，无法靠设计消除，只能靠真实数据验证 |
| 单文件与可测试性冲突 | **已关闭** —— D-009，采用真单文件 + VM 提取测试 |
