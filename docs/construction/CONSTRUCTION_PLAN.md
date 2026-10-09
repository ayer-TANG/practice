# Construction Plan

阶段划分。**同一时间只推进一个阶段。** 每个阶段的 Excluded 列表是硬边界。

图例：✅ 完成 / ▶ 进行中 / ⬜ 未开始

> ⚠️ **编号约定**：本文件是阶段编号的唯一真值来源。它与 skill
> `idea-to-production-vibecoding` 自身的 Phase 编号**不一致**——
> 本文件的 Phase 1 是"建施工文档"，skill 的 Phase 4 也是"建施工文档"。
> 所有施工文档引用阶段时，一律使用**本文件的编号**。
>
> | 本文件 | skill | 内容 |
> |---|---|---|
> | Phase 0 | Phase 1–2 | 产品澄清与真值冻结 |
> | Phase 1 | Phase 4 | 施工文档与仓库地基 |
> | Phase 2 | Phase 5–6 | Git 安全与仓库整理 |
> | Phase 3 | Phase 7 的一部分 | 支持表达清单与 OD-001 关闭 |
> | Phase 4–9 | Phase 7–11 反复循环 | 逐个增量的实现、测试、漂移修正、提交推送 |

---

## Phase 0: 产品澄清与真值冻结 ✅

### Goal
把模糊想法变成一份可签字的产品契约，消除歧义。

### Included
- Discovery：核心对象、目标用户、第一版边界、主用户路径、成功标准
- 产品契约（含 Decision Log / Assumption Register）
- 技术形态决策（规则 vs LLM、单文件 vs 工程化）

### Excluded
- 任何应用代码
- 架构与施工文档
- 仓库改动

### Deliverables
- 已签字的产品契约（现落盘于 `docs/product/PRODUCT_REQUIREMENTS.md`）

### Tests
不适用

### Acceptance Criteria
用户明确确认产品定义，且契约中不存在未标注的假设。

### Rollback Point
`b764476`（仓库初始化提交）

---

## Phase 1: 施工文档与仓库地基 ✅

### Goal
建立 AGENTS.md 与全套施工文档，修正已知文档漂移，让下一个 agent 无需聊天历史即可接手。

### Included
- `AGENTS.md`、`README.md` 改写（修掉"练习代码仓库"漂移）
- `docs/product/PRODUCT_REQUIREMENTS.md`
- `docs/construction/` 全套文档
- `docs/construction/progress/layers/` 分层进度文件

### Excluded
- 应用代码（`index.html` 等）
- 测试代码
- Git 备份分支（属 Phase 2）
- 仓库改名（属 Phase 2）

### Deliverables
上述文档全部落盘。

### Tests
不适用（无代码）。需验证：文档间无相互矛盾、无指向不存在文件的链接。

### Acceptance Criteria
新 agent 只读文档即可回答：产品是什么、架构如何、当前在哪个阶段、下一步做什么。

### Rollback Point
`b764476`

---

## Phase 2: Git 安全与仓库整理 ✅

> 状态说明：backup 分支、skill 目录处置、换行符策略于 Phase 2 完成。
> 仓库改名当时**受阻**（本机无 `gh` CLI，需用户在网页端执行 R-1），
> **已由用户于 2026-10-09 完成**；agent 随后执行 R-2（`git remote set-url`）与
> R-3（文档引用更新）。见 `GITHUB_ROLLBACK.md` 的 Rename Queue。
>
> R-4（本地目录 `war` → `zhaiwu`）仍待 Phase 9，属物理约束，非阻塞。

### Goal
在写第一行应用代码之前，建立已推送的远端回滚点；完成仓库改名。

### Included
- 创建并推送 backup 分支（命名规范见 `GITHUB_ROLLBACK.md`）
- 记录 baseline commit
- GitHub 仓库改名 `practice` → `zhaiwu`，并 `git remote set-url`
- 决定 `idea-to-production-vibecoding-main/` 的归属（提交 / 加入 `.gitignore` / 移出仓库）
- 修正文档中因改名产生的引用

### Excluded
- 本地目录改名（物理约束：当前会话工作目录在该目录内，推迟到收尾阶段）
- 任何应用代码

### Dependencies
Phase 1 完成

### Tests
`git remote -v` 验证新地址；`git ls-remote origin` 验证可达且一致

### Acceptance Criteria
存在一个远端可见的 backup 分支；`origin` 指向新仓库名；工作树除预期外干净。

### Rollback Point
`b764476` + backup 分支

---

## Phase 3: 支持表达清单与 OD-001 关闭 ✅

> 产出：`SUPPORTED_EXPRESSIONS.md`（时间表达 + 动作词的支持/不支持清单、
> 组合上限、已知误检风险、验收方式）；OD-001 关闭为 **D-009**。
> 未写任何实现代码。

### Goal
在写解析器之前，先定死"支持什么、不支持什么"。这是成功标准 2 的验收依据。

### Included
- 产出「支持表达清单」：
  - 时间表达：今天 / 明天 / 后天 / 今晚 / 明早 / 周X / 下周X / X月X日 / X点 / X点半 / X点前 / 之前 等
  - 明确列出**不支持**的表达及原因（如「下下周三下午两点半前」「过了这阵子」）
- 关闭 **OD-001**（单文件 vs 可测试性），需用户确认
- 定义任务句的动作词表初稿
- 修正 A-002 的压测方式

### Excluded
- 解析器实现代码
- 任何 `index.html`

### Dependencies
Phase 2 完成

### Tests
不适用（本阶段只产出规格）

### Acceptance Criteria
支持清单可逐条转成测试用例；OD-001 已关闭并记录决策理由。

### Rollback Point
Phase 2 的 backup 分支

---

## Phase 4: 领域层 — timeParser ✅

> 产出：`index.html` 骨架（含 `<script id="zhaiwu-domain">` 块）、
> `tests/load-domain.mjs`（VM 提取引导，D-009）、`tests/time-parser.test.mjs`。
> `node --test` → **130 passed / 0 failed**。
> 未实现 `taskExtractor` / `sorter` / `parse`。

### Goal
实现时间表达解析，这是整个产品里最难、也最值得先做的一块。

### Included
- `timeParser(text, now) => Date | null`
- `timeParserDetail(text, now) => { date, fuzzy }`（承载 D-010 的 `fuzzy`，见 D-011）
- 时间词表数据化（不是一堆 if）
- 覆盖支持清单中全部时间表达
- 领域层测试载体建立（`node --test`）

### Excluded
- 任务句识别
- 排序
- 任何界面
- 任何非清单内的表达

### Dependencies
Phase 3（支持表达清单 + OD-001）

### Planned Deliverables
- 领域层的 `timeParser` 模块
- 测试文件，覆盖清单全部条目 + 边界（跨月、跨年、今天已过的时间点）

### Tests
`node --test` —— 全部时间表达用例通过

> 注意命令写法。`node --test tests/` 在 Node 24 下报 `MODULE_NOT_FOUND`（位置参数
> 被当作模块入口），Phase 1–3 文档里的目录形式已在 Phase 4 全部改正。见 `TEST_METRICS.md`。

### Acceptance Criteria
清单中每一条时间表达都有对应测试且通过；成功标准 2（≥80%）的度量方式已可执行。

### Rollback Point
`backup/pre-phase4-timeparser-20261009-1844` → `3d48ebe`（写第一行应用代码之前）

---

## Phase 5: 领域层 — taskExtractor + sorter ✅

> 产出：`index.html` 的领域层新增动作词表、`isTaskLine`、`taskExtractor`、
> `makeTask`、`sorter`、`parse`；新增 `tests/task-extractor.test.mjs`、
> `tests/parse.test.mjs`；`tests/load-domain.mjs` 增加导出契约守门与 `toLocal()`。
> `node --test` → **315 passed / 0 failed**（Phase 4 为 130）。
> **领域层至此完成**，下一个动代码的阶段是 Phase 6（UI）。

### Goal
完成领域层的另一半：识别任务句、排序分组，并接上 `parse` 契约。

### Included
- `taskExtractor(text) => 候选任务句[]`，动作词表数据化
- `sorter(tasks) => Task[]`：按截止时间排序 + 「有/无截止时间」分组
- `parse(text, now) => Task[]` 组装
- 反向用例：「收到」「哈哈哈」「辛苦了」不得被判为任务

### Excluded
- 任何界面
- LLM 解析器
- 持久化

### Dependencies
Phase 4

### Tests
`node --test` —— 含正向与反向用例

### Acceptance Criteria
领域层全部测试通过；领域层无 DOM 引用（可静态检查）；A-001 可用真实数据开始验证。

### 完成情况（2026-10-09）

**状态：Complete。315 passed / 0 failed。**

| 交付物 | 结果 |
|---|---|
| 动作词表 | 数据化，56 词（§4 原表 38 + 紧迫 6 + 补充 12）+ 反向 21 词，数量有断言 |
| `isTaskLine` / `taskExtractor` | 已实现。反向词按**整行**匹配，不是子串 |
| `makeTask` | 已实现，规范化 `Task` 形状（`ARCHITECTURE.md` 数据模型） |
| `sorter` | 已实现。升序 + 无截止垫底，不改入参，稳定排序 |
| `parse(text, now) => Task[]` | 已实现，领域层唯一的对外契约 |

**偏离计划之处（均已记录）：**

1. **动作词表比 §4 初稿多了 18 个词**：紧迫 6（直接取自 §1.E 已冻结的紧迫词清单）
   + 判断性 12（标注为「待 Phase 8 校准」）。§4 原文已注明"实现时会扩充"。
2. **多导出两个函数**：`isTaskLine`（原语，`parse` 保行号用）与 `makeTask`
   （让 UI 手动补漏时不必手搓 `Task`）。
3. **`SUPPORTED_EXPRESSIONS.md` 新增 §4「已知漏检」小节**。§5 原本只记误检，
   漏检同样需要如实记录，否则 Phase 8 的 A-001 校准没有基线。
4. **`load-domain.mjs` 增加了导出契约守门与 `toLocal()`**——后者是跨 realm
   断言陷阱的解法，见 `TEST_METRICS.md`。

**未做（按排除项）：** 任何界面、LLM 解析器、持久化。

### Rollback Point
`backup/pre-phase5-extractor-20261009-1900` → `45d4d2d`
（Phase 4 收工、尚未有任何任务识别代码的状态）

---

## Phase 6: UI 层 ✅

> 产出：`index.html` 新增 `<style id="zhaiwu-style">`、页面骨架（粘贴区 /
> 结果列表 / 手动补漏三个面板）、`<script id="zhaiwu-ui">`（约 190 行）。
> 领域层未改动，`node --test` 仍为 **315 passed / 0 failed**。
> 渲染与状态用一次性 DOM 桩验证（9 组 30 项全通过，脚本有意不进仓库）；
> **浏览器中的真实行为未验证**，见 `progress/layers/02-ui.md` 的手动清单。
> 下一个动代码的阶段是 Phase 7（交付层）。

### Goal
交付一个可双击打开、可实际使用的界面。

### Included
- 粘贴区（≤10 条）
- 抽取按钮
- 结果列表：任务、截止时间、来源标记
- 「未识别到时间」独立分组
- **手动补漏输入框**（成功标准 1）
- 误检条目删除（成功标准 3）

### Excluded
- 交付层的复制/下载（下一阶段）
- 持久化、提醒、任何网络请求
- 移动端专门适配
- 任务编辑（仅删除与新增）

### Dependencies
Phase 5

### Tests
渲染与状态：一次性 DOM 桩（不进仓库）。
浏览器真实行为：**人工验证**，清单见 `progress/layers/02-ui.md`，结果记入 `LOG.md`。

### Acceptance Criteria
能用一段真实风格的聊天记录走完主路径；手动补漏在 10 秒内完成；误检可删除。
**验收状态：桩层面已通过；浏览器层面 `Not established`**（本机无法启动浏览器）。

### Rollback Point
`backup/pre-phase6-ui-20261009-1913` → `42dc887`（写第一行 UI 代码之前）

---

## Phase 7: 交付层 — 复制 / 下载 .md ✅

> 产出：`index.html` 新增 `<script id="zhaiwu-delivery">` 块（`renderMarkdown` 纯函数），
> UI 层加复制/下载按钮与三级复制链路；`tests/` 新增 `load-block.mjs`（公共提取器）、
> `load-delivery.mjs`、`delivery.test.mjs`，并重构 `load-domain.mjs` 复用提取器
> （对外导出不变，既有测试一行未改）。
> `node --test` → **368 passed / 0 failed**（Phase 6 为 315）。
> 渲染与导出链路用一次性 DOM 桩验证（11 组 41 项）；
> **浏览器中的剪贴板与下载行为未验证**，仍为 `Not established`。

### Goal
让结果能离开网页。

### Included
- `renderMarkdown(tasks) => string`（纯函数）
- 复制到剪贴板
- 下载 `.md`

### Excluded
- 推送到第三方待办工具
- 其他导出格式（CSV/JSON/ICS）

### Dependencies
Phase 6

### Tests
`renderMarkdown` 的纯函数测试（53 条）；复制/下载**人工验证**

### Acceptance Criteria
生成的 Markdown 可读、包含截止时间与分组；复制与下载在 Chrome/Edge 均可用。
**验收状态：Markdown 生成已由测试覆盖；剪贴板与下载 `Not established`**——
本机无法启动浏览器。三级复制链路（API → `execCommand` → 手动提示）已实现，
但**哪一级会在真实浏览器里生效仍未验证**。

### Rollback Point
`backup/pre-phase7-delivery-20261009-2010` → `787a6e7`（写第一行交付层代码之前）

---

## Phase 8: 真实数据验收与漂移修正 🟡 进行中

> **进度：10 组真实语料里已完成 2 组。** 两组共暴露 9 处问题，3 处当场修复
> （F8-1 / F8-2 规格缺口，F8-7 规格错误），6 处记入 backlog。
> 成功标准 1/2/3 与 Assumption Register **在样本足够前不作结论**。
> 详见 `DEV_PROGRESS.md` 的 Phase 8 一节。

### Goal
用真实数据验证产品是否真的有用，并修正文档与实现的所有偏差。

### Included
- 用 10 组真实聊天记录验证 A-001、A-002、A-003、A-004，更新 Assumption Register
- 度量成功标准 1、2、3，如实记录（含未达标项）
- 漂移检查（按 `WORKFLOW.md` 的 Drift Checklist）
- 修正所有漂移
- 评估 A-005（代码量是否已不适合单文件）

### Excluded
- 新功能
- 修复未在成功标准内的体验问题（记入 backlog 而非直接做）

### Dependencies
Phase 7

### Tests
全部既有测试 + 真实数据人工核对

### Acceptance Criteria
三个成功标准的结果被如实记录；Assumption Register 状态更新；无未修正漂移。

### Rollback Point
Phase 2 的 backup 分支

---

## Phase 9: 部署与收尾 ⬜

### Goal
交付到位并留下干净的接力状态。

### Included
- 本地目录改名 `war` → `zhaiwu`（需用户执行或确认时机）
- 可选：GitHub Pages 托管
- 更新 `HANDOFF.md` 为终态
- 最终提交与推送

### Excluded
- 新功能
- 自定义域名、CI/CD（非目标）

### Dependencies
Phase 8

### Tests
在任何机器上双击 `index.html` 可用；若启用 Pages，验证线上地址可用

### Acceptance Criteria
产品可交付；仓库状态干净；handoff 可让新 agent 独立接手。

### Rollback Point
Phase 2 的 backup 分支

---

## 阶段依赖图

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
        ↑                    │
        └── backup 分支 ─────┘  (全程回滚点)
```

Phase 2 的 backup 分支是 Phase 3–9 全程的回滚点，不得删除。
