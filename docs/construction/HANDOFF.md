# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 5 收工）

---

## Current State

**Phase 5 完成。领域层已全部实现，`node --test` → 315 passed / 0 failed。**

`parse(text, now) => Task[]` 现在能用了：给它一段聊天文本和一个 `now`，
它返回按紧急度排好序的 `Task[]`（有截止时间的升序在前，无截止时间的垫底）。

交付物 `index.html` 仍是**骨架**：里面只有领域层和一行占位文字。
**界面一行都没有。打开它什么也做不了。产品现在还不能用。**

下一步是 Phase 6（UI 层）。

Phase 2 仍有一项挂起——仓库改名，它需要用户操作，且**不阻塞任何后续阶段**。

## Completed

| 项 | 位置 / 值 |
|---|---|
| **领域层（全部）** | `index.html` 的 `<script id="zhaiwu-domain">` 块内。7 个导出见下 |
| **`parse(text, now) => Task[]`** | 领域层唯一的对外契约，已完成 |
| **动作词表** | `ACTION_WORDS` 56 词 + `FILLER_WORDS` 21 词，数据化 |
| **测试载体（D-009）** | `tests/load-domain.mjs` —— `node:vm` 提取领域层，含导出契约守门与 `toLocal()` |
| **测试用例** | 三个文件，315 个 |
| **测试基线** | `node --test` → **315 passed / 0 failed** |
| 时间表达规格 | `docs/construction/SUPPORTED_EXPRESSIONS.md`（§1 支持 69 / §2 不支持 28 / §4 动作词表） |
| 产品真值冻结 | `docs/product/PRODUCT_REQUIREMENTS.md`（决策 12 条、假设 6 条） |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| 远端回滚点 | 三个 backup 分支，见 `GITHUB_ROLLBACK.md` |
| 工作树卫生 | `.gitignore` 忽略 skill 目录；`.gitattributes` 统一 LF |
| 其余施工文档 | `CODEX_START_HERE`、`MASTER_REQUIREMENTS`、`WORKFLOW`、`TOOL_POLICY`、`GITHUB_ROLLBACK`、`TEST_METRICS`、`DEV_PROGRESS`、`LOG` |

**领域层的 7 个导出**（`globalThis.__zhaiwuDomain`）：

| 导出 | 职责 |
|---|---|
| `timeParser(text, now)` | 时间表达 → `Date \| null`。只回答"这是哪个绝对时间" |
| `timeParserDetail(text, now)` | → `{ date, fuzzy }`。**`fuzzy` 只能从这里拿**（D-011） |
| `isTaskLine(line)` | 单行判定原语 |
| `taskExtractor(text)` | → 候选任务句 `string[]` |
| `makeTask(input)` | 规范化 `Task` 形状（UI 手动补漏要用） |
| `sorter(tasks)` | 排序，不改入参 |
| `parse(text, now)` | 组装 → `Task[]` |

## Incomplete

| 项 | 阻塞原因 |
|---|---|
| **界面与交互** | 按计划在 Phase 6。`index.html` 现在只有一行占位文字 |
| 复制 / 下载 `.md` | 按计划在 Phase 7 |
| 真实数据验收（A-001~A-006） | 按计划在 Phase 8 |
| **动作词表的校准** | 56 词里 12 个是判断而非数据，待 Phase 8 用真实语料增减 |
| **发言人前缀剥离** | 推迟到 Phase 8。粘贴格式随客户端而异，无真实数据时猜格式等于凭感觉写规则 |
| **仓库改名 `practice` → `zhaiwu`** | 本机 `gh: command not found`，需用户在 GitHub 网页端执行 R-1 |
| 本地目录改名 `war` → `zhaiwu` | 物理约束（会话工作目录在内），推迟到 Phase 9 |

## Next Tasks

**Phase 6 — UI 层**

1. 粘贴区（≤10 条）
2. 抽取按钮 → 调 `parse(text, new Date())`
3. 结果列表：任务、截止时间、来源标记
4. **「未识别到时间」独立分组**——分界线就是 `deadline === null`，一次 `filter` 即可
5. **手动补漏输入框**（成功标准 1）→ 用 `makeTask` 构造 `source: 'manual'` 的 Task，再调 `sorter`
6. **误检条目删除**（成功标准 3）
7. **`fuzzy` 必须标注**（如「尽快（按今天算）」）——见下面「两条硬要求」

**排除项**：复制/下载（Phase 7）、持久化（永不）、任务编辑（只增删不改）。

**两条硬要求：**

- **UI 层不得内嵌任何正则或词表。** `LAYER_CONTRACT.md` 的判定标准：
  UI 代码里看到 `/\d+月\d+日/` 这类模式即为**架构漂移**。UI 只准调 `parse` / `makeTask` / `sorter`。
- **`fuzzy` 必须显式标注。** 用户不能以为「尽快」是对方说的明确时间。
  这是诚实性要求，不是可选装饰（`SUPPORTED_EXPRESSIONS.md` §1.E）。

**`Task.id` 要注意**：它是 `'r' + 原始行号`。UI 必须在**同一次** `parse` 调用里拿 id——
若中途重新拼接文本再解析，行号会变，删除操作就跟原文对不上了。

之后：Phase 7（交付层）→ Phase 8（真实数据验收）→ Phase 9（部署收尾）。

随时可插入：用户完成仓库改名后执行 R-2（`git remote set-url`）与 R-3（文档引用更新）。

## Required Reading

按此顺序，不必读全部 20 份：

1. `docs/construction/CODEX_START_HERE.md` ← 入口，含必读顺序与常见错误
2. `AGENTS.md` ← 指令优先级与禁令
3. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` ← 不可妥协项
4. `docs/product/PRODUCT_REQUIREMENTS.md` ← 产品真值
5. `docs/construction/LAYER_CONTRACT.md` ← **写 UI 前必读**，UI 层的禁令在这里
6. `docs/construction/ARCHITECTURE.md` ← 数据流、数据模型
7. `docs/construction/SUPPORTED_EXPRESSIONS.md` ← 改识别规则前必读（§4）
8. `docs/construction/CONSTRUCTION_PLAN.md` ← 找到当前阶段
9. 本文件

**动手写 UI 之前，额外读 `index.html` 里的领域层代码本身**——它是当前的实现真值，
比任何文档都准确。看清单里有什么可用，比看文档描述的接口更快。

## Important Files

| 文件 | 为什么重要 |
|---|---|
| **`index.html`** | 交付物，也是唯一的产品代码。领域层全部在里面，Phase 6 要在同一个文件里加 UI |
| **`tests/load-domain.mjs`** | 测试怎么跑起来的。改 `index.html` 结构时**别破坏 `<script id="zhaiwu-domain">` 标记**，正则靠它提取 |
| `tests/time-parser.test.mjs` | 130 个时间解析用例（含纯度静态检查）。**改模式表后必须全量跑** |
| `tests/task-extractor.test.mjs` | 任务识别用例，含已知误检与已知漏检的断言 |
| `tests/parse.test.mjs` | 组装与排序用例 |
| `docs/construction/SUPPORTED_EXPRESSIONS.md` | 识别规则的规格来源（§4 动作词表、§4 已知漏检、§5 已知误检） |
| `docs/construction/TEST_METRICS.md` | 测试命令写法、跨 realm 陷阱、分母口径、未建立项 |
| `docs/construction/progress/layers/01-domain.md` | 领域层硬约束与 Phase 4/5 实现落点 |
| `docs/construction/WORKFLOW.md` | 开工/收工流程 + Drift Checklist |

## Test Baseline

**`node --test` → 315 passed / 0 failed**

| 文件 | 覆盖 | 数量级 |
|---|---|---|
| `tests/time-parser.test.mjs` | `SUPPORTED_EXPRESSIONS.md` §1 全部 69 条 + §2 全部 28 条 + 组合上限 + 边界 | 130 |
| `tests/task-extractor.test.mjs` | §4 反向 21 词、正向 56 词、整行匹配边界、切分、已知误检、已知漏检 | 约 130 |
| `tests/parse.test.mjs` | `makeTask` / `sorter` / `parse` 端到端 / 输出不变式 | 约 55 |
| 领域层纯度（静态检查） | 无 DOM / 无网络 / 无存储 / 不自读系统时间 | 8 |

**数量断言是防漂移的机制**：69、28、38、56、21 这几个数字都在测试里被断言。
改了清单或词表而没同步测试，测试会红。

**仍未建立**：UI 层（人工验证，Phase 6）、交付层（Phase 7）、真实数据度量（Phase 8）。
lint / typecheck / build 永久保持 `Not established`（零依赖、无构建，是决策不是缺失）。

> ⚠️ **测试命令是 `node --test`，不是 `node --test tests/`。**
> 后者在 Node 24 下报 `MODULE_NOT_FOUND`——位置参数被当作模块入口，不再做目录发现。
> Phase 1–3 的文档全部写错了这一点，已在 Phase 4 改正。见 `TEST_METRICS.md`。

> ⚠️ **跨 realm 陷阱**——领域层跑在 `node:vm` 里，有三种写法会失效：
> `x instanceof Date`、`assert.throws(fn, TypeError)`、
> `assert.deepEqual(领域层返回的 [], [])`。
> 第三条用 `tests/load-domain.mjs` 的 `toLocal()` 解决。
> 领域层代码本身不要用 `instanceof`，用鸭子类型。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `45d4d2d`（Phase 4 收工） |
| Phase 5 提交 | 见下方 Latest Commit |
| 远端分支 | `main`、`backup/pre-phase2-repo-setup-20261009-1745`、`backup/pre-phase4-timeparser-20261009-1844`、`backup/pre-phase5-extractor-20261009-1900` |
| remote | `https://github.com/ayer-TANG/practice`（**待改名 `zhaiwu`**） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

| 分支 | 指向 | 覆盖 |
|---|---|---|
| `backup/pre-phase2-repo-setup-20261009-1745` | `9d693c1` | 文档体系完成、尚无代码 |
| `backup/pre-phase4-timeparser-20261009-1844` | `3d48ebe` | **写第一行应用代码之前** |
| `backup/pre-phase5-extractor-20261009-1900` | `45d4d2d` | **领域层只有时间解析**时 |

**三个都不得删除。** 它们是不同性质的还原点，不是重复。

## Latest Commit

| 提交 | 说明 |
|---|---|
| `14afad0` | Phase 4 主体：实现 timeParser 并建立测试载体（第一行应用代码） |
| `45d4d2d` | Phase 4 补记：handoff 提交号与推送状态 |
| `<Phase 5 主体>` | Phase 5 主体：实现 taskExtractor / sorter / parse（见 `LOG.md`） |

> 说明：HANDOFF 无法记录**包含它自己**的提交号。因此每个阶段的提交号由紧随其后的
> 一个补记提交填入 —— Phase 1 是 `9d693c1`，Phase 2 是 `8eca9a5`，
> Phase 3 是 `3d48ebe`，Phase 4 是 `45d4d2d`。

## Push Status

**已推送。** 具体输出见紧随本提交之后的补记提交。

## Working Tree

预期状态：**干净。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **A-001 ~ A-006 六条假设全部未验证** | 高 | A-001（真实任务句是否含可识别词）与 A-004（是否接受手动补漏）决定产品成立与否。Phase 8 用真实记录验证 |
| **规则召回率未知** | 高 | 产品的根本风险。已知漏检已记入 `SUPPORTED_EXPRESSIONS.md` §4 |
| **单字动作词的误检** | 中 | 「发」「注意」会命中「沙发」「头发」「注意身体」。**这是产品定位（一键删除）存在的原因，不要试图用更复杂的规则消灭它**。测试里有断言锁定现状 |
| **动作词表 12 个词是判断不是数据** | 中 | `Phase5补充` 那一类。Phase 8 可能删掉其中一部分 |
| **A-006：裸 `X点` 的 12/24 推断是启发式** | 中 | 「三点」可能是 03:00 也可能是 15:00。**猜错比漏检更难被发现**。Phase 8 必须单独统计 |
| **`Task.id` 依赖行号** | 中 | Phase 6 的 UI 必须在**同一次** `parse` 调用里取 id，不要重新拼文本再解析 |
| `X-Y` 与 `X/X` 可能误检 | 中 | `3-5`、`1/2` 可能是分数、比例、编号。§1.A 已声明接受此代价 |
| **改模式表/词表会改变既有结果** | 中 | 改完**必须全量跑 `node --test`**。数量断言（69/28/38/56/21）会拦住漏改的文档 |
| **领域层纯度易被破坏** | 中 | 8 条静态测试把关（无 DOM / 无网络 / 无 `new Date()` / 无 `Date.now()`）。**Phase 6 写 UI 时特别注意：UI 代码不要写进 `<script id="zhaiwu-domain">` 块内**，否则纯度检查会失败 |
| **UI 层内嵌规则** | 中 | UI 一旦出现正则或词表就是架构漂移。判定标准见 `LAYER_CONTRACT.md` |
| **仓库改名挂起** | 中 | 文档与事实一致（都写 `practice`），但"想改未改"一直挂着。不阻塞开发 |
| `Task.raw` 与 `Task.text` 目前几乎相同 | 低 | 差别只有首尾空白。不剥离发言人前缀，`raw` 的价值有限。推迟到 Phase 8 |
| `.gitattributes` 影响其他克隆 | 低 | 若用户在别处有克隆，`eol=lf` 可能触发重规范化。当前已知只有本机一份 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 下一步写什么（Phase 6 UI）、遵守哪条禁令（UI 层不得内嵌规则）、
两个容易漏的产品要求（`fuzzy` 标注、未识别时间分组）、
`Task.id` 的行号陷阱、测试怎么跑（`node --test`，**不是**目录形式）、
跨 realm 的三种失效写法、以及**不要把 UI 代码写进领域层 script 块**——
均有明确记载。

唯一需要外部动作的是仓库改名，已写明原因与执行路径。
