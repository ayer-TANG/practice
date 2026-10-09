# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 4 收工）

---

## Current State

**Phase 4 完成。领域层 `timeParser` 已实现，`node --test` → 130 passed / 0 failed。**

交付物 `index.html` 已存在，但**只是骨架**：里面是领域层与一行占位文字，
界面、交互、复制下载一概没有。**现在还不能用。**

`taskExtractor`、`sorter`、`parse` 组装尚未实现——没有它们就无法从聊天记录里
摘出任务。下一步是 Phase 5。

Phase 2 仍有一项挂起——仓库改名，它需要用户操作，且**不阻塞任何后续阶段**。

## Completed

| 项 | 位置 / 值 |
|---|---|
| **`timeParser` + `timeParserDetail`** | `index.html` 的 `<script id="zhaiwu-domain">` 块内 |
| **测试载体（D-009）** | `tests/load-domain.mjs` —— 用 `node:vm` 从 `index.html` 提取领域层 |
| **测试用例** | `tests/time-parser.test.mjs` —— 130 个，覆盖 §1 全部 69 条 + §2 全部 28 条 + 边界 |
| **测试基线** | `node --test` → **130 passed / 0 failed** |
| 能力边界规格 | `docs/construction/SUPPORTED_EXPRESSIONS.md`（69 / 28 条目，测试里有断言） |
| 产品真值冻结 | `docs/product/PRODUCT_REQUIREMENTS.md`（决策 12 条、假设 6 条） |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| 远端回滚点（Phase 3–9） | `backup/pre-phase2-repo-setup-20261009-1745` → `9d693c1` |
| 工作树卫生 | `.gitignore` 忽略 skill 目录；`.gitattributes` 统一 LF |
| 其余施工文档 | `CODEX_START_HERE`、`MASTER_REQUIREMENTS`、`WORKFLOW`、`TOOL_POLICY`、`GITHUB_ROLLBACK`、`TEST_METRICS`、`DEV_PROGRESS`、`LOG` |

## Incomplete

| 项 | 阻塞原因 |
|---|---|
| **`taskExtractor`** | 按计划在 Phase 5 |
| **`sorter`** | 按计划在 Phase 5 |
| **`parse(text, now) => Task[]` 组装** | 按计划在 Phase 5 |
| **`Task` 数据结构** | 按计划在 Phase 5 |
| **界面与交互** | 按计划在 Phase 6。`index.html` 现在只有一行占位文字 |
| 复制 / 下载 `.md` | 按计划在 Phase 7 |
| 真实数据验收 | 按计划在 Phase 8 |
| **仓库改名 `practice` → `zhaiwu`** | 本机 `gh: command not found`，需用户在 GitHub 网页端执行 R-1 |
| 本地目录改名 `war` → `zhaiwu` | 物理约束（会话工作目录在内），推迟到 Phase 9 |

## Next Tasks

**Phase 5 — 领域层 `taskExtractor` + `sorter` + `parse`**

1. 实现 `taskExtractor(text) => 候选任务句[]`，动作词表**数据化**
   （初稿在 `SUPPORTED_EXPRESSIONS.md` §4，Phase 5 实现时扩充）
2. 实现 `sorter(tasks) => Task[]`：按截止时间升序，无截止时间的独立分组置于末尾
3. 实现 `Task` 结构与 `parse(text, now) => Task[]` 组装
4. **反向用例必须写**：「收到」「好的」「哈哈哈」「辛苦了」「在吗」不得被判为任务
5. 扩充 `tests/`，命令仍是 `node --test`

**`fuzzy` 怎么接（Phase 4 已铺好路）**：用 `timeParserDetail(text, now).fuzzy`
写进 `Task.fuzzy`，**不要**用 `timeParser`——它只返回 `Date | null`。见 D-011。

**执行顺序**：先写反向用例（误检是识别类功能最常见的失败），再写正向。

之后：Phase 6（UI）→ Phase 7（交付层）→ Phase 8（真实数据验收）。

随时可插入：用户完成仓库改名后执行 R-2（`git remote set-url`）与 R-3（文档引用更新）。

## Required Reading

按此顺序，不必读全部 20 份：

1. `docs/construction/CODEX_START_HERE.md` ← 入口，含必读顺序与常见错误
2. `AGENTS.md` ← 指令优先级与禁令
3. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` ← 不可妥协项
4. `docs/product/PRODUCT_REQUIREMENTS.md` ← 产品真值
5. `docs/construction/SUPPORTED_EXPRESSIONS.md` ← **写解析器前必读**
6. `docs/construction/ARCHITECTURE.md` + `LAYER_CONTRACT.md`
7. `docs/construction/CONSTRUCTION_PLAN.md` ← 找到当前阶段
8. 本文件

**动手改领域层之前，额外读 `index.html` 里那段代码本身**——它是当前的实现真值，
比任何文档都准确。

## Important Files

| 文件 | 为什么重要 |
|---|---|
| **`index.html`** | 交付物，也是唯一的产品代码。领域层全部在里面 |
| **`tests/load-domain.mjs`** | 测试怎么跑起来的。改 `index.html` 结构时别破坏它依赖的 `<script id="zhaiwu-domain">` 标记 |
| `tests/time-parser.test.mjs` | 130 个用例。**改模式表后必须全量跑** |
| `docs/construction/SUPPORTED_EXPRESSIONS.md` | Phase 5 的规格来源（§4 动作词表） |
| `docs/construction/TEST_METRICS.md` | 测试命令的写法、分母口径、未建立项 |
| `docs/construction/CONSTRUCTION_PLAN.md` | 阶段定义与编号约定表 |
| `docs/construction/progress/layers/01-domain.md` | 领域层硬约束与已实现落点 |
| `docs/construction/WORKFLOW.md` | 开工/收工流程 + Drift Checklist |

## Test Baseline

**`node --test` → 130 passed / 0 failed**

| 覆盖 | 数量 |
|---|---|
| `SUPPORTED_EXPRESSIONS.md` §1 支持清单 | 69（含对总数 69 的断言） |
| §2 不支持清单 | 28（含对总数 28 的断言） |
| §3 组合上限 | 若干 |
| 边界：跨月 / 跨年 / 闰年 / 已过时间点 / 周边界 / 工作日 | 若干 |
| 领域层纯度（静态检查） | 8 |

**仍未建立**：UI 层（人工验证，Phase 6）、交付层（Phase 7）、真实数据度量（Phase 8）。
lint / typecheck / build 永久保持 `Not established`（零依赖、无构建，是决策不是缺失）。

> ⚠️ **测试命令是 `node --test`，不是 `node --test tests/`。**
> 后者在 Node 24 下报 `MODULE_NOT_FOUND`——位置参数被当作模块入口，不再做目录发现。
> Phase 1–3 的文档全部写错了这一点，已在 Phase 4 改正。见 `TEST_METRICS.md`。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `3d48ebe`（Phase 3 收工） |
| Phase 4 提交 | 见下方 Latest Commit |
| 远端分支 | `main`、`backup/pre-phase2-repo-setup-20261009-1745`、`backup/pre-phase4-timeparser-20261009-1844` |
| remote | `https://github.com/ayer-TANG/practice`（**待改名 `zhaiwu`**） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

| 分支 | 指向 | 覆盖 |
|---|---|---|
| `backup/pre-phase2-repo-setup-20261009-1745` | `9d693c1` | Phase 3–9 全程 |
| `backup/pre-phase4-timeparser-20261009-1844` | `3d48ebe` | **写第一行代码前**的最后状态 |

**两个都不得删除。** Phase 4 分支的价值在于：它是「仓库里还没有任何应用代码」时的快照。

## Latest Commit

| 提交 | 说明 |
|---|---|
| `6a977fb` | Phase 2 主体：建立远端回滚点并整理仓库环境 |
| `8eca9a5` | Phase 2 补记：handoff 提交号与推送状态 |
| `47b50fb` | Phase 3 主体：冻结解析器能力边界（含 SUPPORTED_EXPRESSIONS.md） |
| `3d48ebe` | Phase 3 补记：handoff 提交号与推送状态 |
| Phase 4 提交 | 见 `git log --oneline -3`；本文件所在提交即 Phase 4 收工提交 |

> 说明：HANDOFF 无法记录**包含它自己**的提交号。因此每个阶段的提交号由紧随其后的
> 一个补记提交填入 —— Phase 1 是 `9d693c1`，Phase 2 是 `8eca9a5`，Phase 3 是 `3d48ebe`。

## Push Status

**已推送。**

```
To https://github.com/ayer-TANG/practice
   3d48ebe..<Phase 4 提交>  main -> main
```

## Working Tree

预期状态：**干净。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **A-001 ~ A-006 六条假设全部未验证** | 高 | A-001（真实任务句是否含可识别词）与 A-004（是否接受手动补漏）决定产品成立与否。Phase 8 用真实记录验证 |
| **规则召回率未知** | 高 | 产品的根本风险。已在 `README.md`、`SUPPORTED_EXPRESSIONS.md` §5 如实声明 |
| **A-006：裸 `X点` 的 12/24 推断是启发式** | 中 | 「三点」可能是 03:00 也可能是 15:00。**猜错比漏检更难被发现**——列表上看不出哪里不对。Phase 8 必须单独统计 |
| `X-Y` 与 `X/X` 可能误检 | 中 | `3-5`、`1/2` 可能是分数、比例、编号。§1.A 已声明接受此代价，真实频率未知 |
| **改模式表会改变既有结果** | 中 | `pickLeftmost` 取「最靠左，同位置取最长」。新增模式若起点更靠左会改变旧表达的结果。**改完必须全量跑 `node --test`** |
| **领域层纯度易被破坏** | 中 | 已有 8 条静态测试把关（无 DOM / 无网络 / 无 `new Date()` / 无 `Date.now()`）。写新代码时别把 `now` 换回系统时间 |
| **跨 realm 陷阱** | 中 | 领域层跑在 `node:vm` 里，`instanceof` 对测试 realm 的对象不成立。**不要用 `x instanceof Date`**，用鸭子类型 |
| **仓库改名挂起** | 中 | 文档与事实一致（都写 `practice`），但"想改未改"一直挂着。不阻塞开发 |
| UI 一行都没写 | 低 | 这是计划内的，不是意外。Phase 6 |
| `.gitattributes` 影响其他克隆 | 低 | 若用户在别处有克隆，`eol=lf` 可能触发重规范化。当前已知只有本机一份 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 下一步写什么（`taskExtractor` + `sorter` + `parse`）、
按哪份规格写（`SUPPORTED_EXPRESSIONS.md` §4）、`fuzzy` 从哪里来（D-011）、
测试怎么跑（`node --test`，**不是**目录形式）、
最容易踩的三个坑（模式表改动影响既有结果、跨 realm 的 `instanceof`、
领域层读系统时间）均有明确记载。

唯一需要外部动作的是仓库改名，已写明原因与执行路径。
