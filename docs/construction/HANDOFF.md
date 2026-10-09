# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 6 收工）

---

## Current State

**Phase 6 完成。产品现在可用了。**

用浏览器打开 `index.html` 就能走完主路径：粘贴聊天记录 → 点「抽取」→
看到排好序的分组结果 → 手动补上漏掉的 → 删掉误判的。
领域层未改动，`node --test` → **315 passed / 0 failed**。

**但这个"可用"有一个明确的空洞：浏览器里的真实行为从未被验证过。**
本机无法启动浏览器。渲染与状态是用 Node 里的 DOM 桩跑通的（9 组 30 项全通过），
而桩测不到真实浏览器事件、真实粘贴、CSS 布局、`file://` 加载行为。
**这两件事不是一回事，不要混为一谈。**

下面 `progress/layers/02-ui.md` 有一份手动验证清单，**须由用户执行**。

下一步是 Phase 7（交付层）。

**仓库改名已完成**（`practice` → `zhaiwu`）：R-1/R-2/R-3 均已执行。
只剩 R-4（本地目录改名，待 Phase 9，属物理约束）。

## Completed

| 项 | 位置 / 值 |
|---|---|
| **领域层（全部）** | `index.html` 的 `<script id="zhaiwu-domain">` 块内。7 个导出见下 |
| **`parse(text, now) => Task[]`** | 领域层唯一的对外契约，已完成 |
| **UI 层** | `index.html` 的 `<style id="zhaiwu-style">` + `<script id="zhaiwu-ui">`。渲染、抽取、分组、手动补漏、删除 |
| **动作词表** | `ACTION_WORDS` 56 词 + `FILLER_WORDS` 21 词，数据化 |
| **测试载体（D-009）** | `tests/load-domain.mjs` —— `node:vm` 提取领域层，含导出契约守门与 `toLocal()` |
| **测试用例** | 三个文件，315 个 |
| **测试基线** | `node --test` → **315 passed / 0 failed** |
| 时间表达规格 | `docs/construction/SUPPORTED_EXPRESSIONS.md`（§1 支持 69 / §2 不支持 28 / §4 动作词表） |
| 产品真值冻结 | `docs/product/PRODUCT_REQUIREMENTS.md`（决策 12 条、假设 6 条） |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| 远端回滚点 | 四个 backup 分支，见 `GITHUB_ROLLBACK.md` |
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

**`Task` 的 6 个字段**（Phase 7 的 `renderMarkdown` 会用到）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 规则条目 `'r'+行号`；手动条目 `'m'+序号`。**不保证唯一跨来源**，但前缀不同不冲突 |
| `text` | `string` | 去首尾空白的原文 |
| `deadline` | `Date \| null` | `null` 表示没识别到时间——**UI 的分组界线就是它** |
| `fuzzy` | `boolean` | `true` 表示时间是推定（紧迫词 → 当天 23:59），**必须显式标注** |
| `source` | `'rule' \| 'manual'` | 来源 |
| `raw` | `string` | 原始行（未去空白）。手动条目为 `''` |

## Incomplete

| 项 | 阻塞原因 |
|---|---|
| **浏览器行为验证** | 本机无法启动浏览器。清单待用户执行，见 `progress/layers/02-ui.md` |
| 复制 / 下载 `.md` | 按计划在 Phase 7。UI 里那条提示"用下面的输入框手动补一条"已给出路，但结果出不去 |
| 真实数据验收（A-001~A-006） | 按计划在 Phase 8 |
| **动作词表的校准** | 56 词里 12 个是判断而非数据，待 Phase 8 用真实语料增减 |
| **发言人前缀剥离** | 推迟到 Phase 8。粘贴格式随客户端而异，无真实数据时猜格式等于凭感觉写规则 |
| 本地目录改名 `war` → `zhaiwu`（R-4） | 物理约束（会话工作目录在内），推迟到 Phase 9 |

## Next Tasks

**Phase 7 — 交付层**

1. **`renderMarkdown(tasks) => string`（纯函数）** —— 不得触碰 DOM，
   不得读 `document` / `window`。放哪儿要看它是否属于"领域层纯度检查"的范围：
   若放 `zhaiwu-domain` 块内，它必须同样纯净；否则放独立的第三个 script 块。
2. 复制到剪贴板（`navigator.clipboard`，**注意 `file://` 下的可用性**）
3. 下载 `.md`（`Blob` + `URL.createObjectURL`）
4. 两者都是 UI 层的活儿，不是交付层的纯函数部分

**排除项**：持久化（永不）、任务编辑（只增删不改）。

**写之前先读 `LAYER_CONTRACT.md` 的交付层一节**——纯函数与副作用的分界线在那里。

**`file://` 的坑**：`navigator.clipboard` 在 `file://` 下**可能不可用**（取决于浏览器
是否把 `file://` 视为安全上下文）。若不可用必须给出回退路径（例如让用户手动选中复制），
**不得静默失败**。这一点在 Phase 7 必须实测并如实记录。

之后：Phase 8（真实数据验收）→ Phase 9（部署收尾）。

## Required Reading

按此顺序，不必读全部 20 份：

1. `docs/construction/CODEX_START_HERE.md` ← 入口，含必读顺序与常见错误
2. `AGENTS.md` ← 指令优先级与禁令
3. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` ← 不可妥协项
4. `docs/product/PRODUCT_REQUIREMENTS.md` ← 产品真值
5. `docs/construction/LAYER_CONTRACT.md` ← **写交付层前必读**
6. `docs/construction/ARCHITECTURE.md` ← 数据流、数据模型
7. `docs/construction/SUPPORTED_EXPRESSIONS.md` ← 改识别规则前必读（§4）
8. `docs/construction/CONSTRUCTION_PLAN.md` ← 找到当前阶段
9. 本文件

**动手前，额外读 `index.html` 里领域层与 UI 层两块代码本身**——它们是当前的
实现真值，比任何文档都准确。看清单里有什么可用，比看文档描述的接口更快。

## Important Files

| 文件 | 为什么重要 |
|---|---|
| **`index.html`** | 交付物，也是唯一的产品代码。现有三块：`zhaiwu-style` / `zhaiwu-domain` / `zhaiwu-ui` |
| **`tests/load-domain.mjs`** | 测试怎么跑起来的。改 `index.html` 结构时**别破坏 `<script id="zhaiwu-domain">` 标记**，正则靠它提取 |
| `tests/time-parser.test.mjs` | 130 个时间解析用例（含纯度静态检查）。**改模式表后必须全量跑** |
| `tests/task-extractor.test.mjs` | 任务识别用例，含已知误检与已知漏检的断言 |
| `tests/parse.test.mjs` | 组装与排序用例 |
| `docs/construction/SUPPORTED_EXPRESSIONS.md` | 识别规则的规格来源（§4 动作词表、§4 已知漏检、§5 已知误检） |
| `docs/construction/TEST_METRICS.md` | 测试命令写法、跨 realm 陷阱、分母口径、未建立项 |
| `docs/construction/progress/layers/01-domain.md` | 领域层硬约束与 Phase 4/5 实现落点 |
| `docs/construction/progress/layers/02-ui.md` | UI 层实现决策 + **待用户执行的手动验证清单** |
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

**仍未建立**：
- **UI 浏览器行为**（本机无法启动浏览器，`Not established`）
- UI 渲染与状态虽被一次性 DOM 桩验证过，但**桩不进仓库、不计入 315**——
  它测不到真正会出问题的地方，纳入基线会制造虚假的覆盖率安全感
- 交付层（Phase 7）、真实数据度量（Phase 8）

lint / typecheck / build 永久保持 `Not established`（零依赖、无构建，是决策不是缺失）。

> ⚠️ **测试命令是 `node --test`，不是 `node --test tests/`。**
> 后者在 Node 24 下报 `MODULE_NOT_FOUND`——位置参数被当作模块入口，不再做目录发现。
> Phase 1–3 的文档全部写错了这一点，已在 Phase 4 改正。见 `TEST_METRICS.md`。

> ⚠️ **跨 realm 陷阱**——领域层跑在 `node:vm` 里，有三种写法会失效：
> `x instanceof Date`、`assert.throws(fn, TypeError)`、
> `assert.deepEqual(领域层返回的 [], [])`。
> 第三条用 `tests/load-domain.mjs` 的 `toLocal()` 解决。
> 领域层代码本身不要用 `instanceof`，用鸭子类型。

> ⚠️ **不要把 UI 代码写进 `<script id="zhaiwu-domain">` 块。**
> 领域层纯度静态检查只扫描该块的正文，混入 UI 代码会让
> 「不出现 `document`」「不自己读当前时间」两条检查失败。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `42dc887`（Phase 5 收工） |
| Phase 6 提交 | `5fe892f`（主体） |
| 远端分支 | `main`、`backup/pre-phase2-repo-setup-20261009-1745`、`backup/pre-phase4-timeparser-20261009-1844`、`backup/pre-phase5-extractor-20261009-1900`、`backup/pre-phase6-ui-20261009-1913` |
| remote | `https://github.com/ayer-TANG/zhaiwu`（2026-10-09 由 `practice` 改名，见 R-2） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

| 分支 | 指向 | 覆盖 |
|---|---|---|
| `backup/pre-phase2-repo-setup-20261009-1745` | `9d693c1` | 文档体系完成、尚无代码 |
| `backup/pre-phase4-timeparser-20261009-1844` | `3d48ebe` | **写第一行应用代码之前** |
| `backup/pre-phase5-extractor-20261009-1900` | `45d4d2d` | **领域层只有时间解析**时 |
| `backup/pre-phase6-ui-20261009-1913` | `42dc887` | **写第一行界面代码之前**——产品完全不可用时的最后状态 |

**四个都不得删除。** 它们是不同性质的还原点，不是重复。

## Latest Commit

| 提交 | 说明 |
|---|---|
| `14afad0` | Phase 4 主体：实现 timeParser 并建立测试载体（第一行应用代码） |
| `45d4d2d` | Phase 4 补记：handoff 提交号与推送状态 |
| `e6599cd` | Phase 5 主体：实现 taskExtractor / sorter / parse，领域层完成 |
| `42dc887` | Phase 5 补记：提交号与推送状态；仓库改名收尾（R-2 / R-3） |
| `5fe892f` | **Phase 6 主体**：实现 UI 层（样式 + 骨架 + `zhaiwu-ui` 脚本） |

> 说明：HANDOFF 无法记录**包含它自己**的提交号。因此每个阶段的提交号由紧随其后的
> 一个补记提交填入 —— Phase 1 是 `9d693c1`，Phase 2 是 `8eca9a5`，
> Phase 3 是 `3d48ebe`，Phase 4 是 `45d4d2d`，Phase 5 是 `e6599cd`，
> Phase 6 是 `5fe892f`。

## Push Status

**已推送。**

```
To https://github.com/ayer-TANG/zhaiwu.git
   42dc887..5fe892f  main -> main
```

> 这是**改名后第一次**推送，远端回显的已是新地址 `zhaiwu`——
> 与 Phase 5 那次（回显旧地址 `practice`，从而暴露改名已完成）形成对照。
> R-2 至此可以认为彻底生效。

## Working Tree

预期状态：**干净。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **浏览器行为从未验证** | **高** | 本机无法启动浏览器。桩测试通过 ≠ 浏览器里能用。CSS 布局、真实粘贴（含富文本残留）、触屏点击均未验证。手动清单在 `progress/layers/02-ui.md` |
| **A-001 ~ A-006 六条假设全部未验证** | 高 | A-001（真实任务句是否含可识别词）与 A-004（是否接受手动补漏）决定产品成立与否。Phase 8 用真实记录验证 |
| **规则召回率未知** | 高 | 产品的根本风险。已知漏检已记入 `SUPPORTED_EXPRESSIONS.md` §4 |
| **单字动作词的误检** | 中 | 「发」「注意」会命中「沙发」「头发」「注意身体」。**这是产品定位（一键删除）存在的原因，不要试图用更复杂的规则消灭它**。测试里有断言锁定现状 |
| **动作词表 12 个词是判断不是数据** | 中 | `Phase5补充` 那一类。Phase 8 可能删掉其中一部分 |
| **`fuzzy` 文案与词表软耦合** | 中 | UI 里 `fuzzy` 徽章的 `title` 举例了「尽快 / 马上 / 抓紧」。词表若增删紧迫词，文案需同步 |
| **A-006：裸 `X点` 的 12/24 推断是启发式** | 中 | 「三点」可能是 03:00 也可能是 15:00。**猜错比漏检更难被发现**。Phase 8 必须单独统计 |
| **`file://` 下剪贴板可能不可用** | 中 | Phase 7 的新风险。`navigator.clipboard` 在 `file://` 下可能不被视为安全上下文。必须实测并给出回退路径，不得静默失败 |
| **已知行为：删除后重抽会复活** | 低 | 删掉某条规则条目后再点「抽取」，它重新出现。这是"抽取 = 重算"语义的必然结果，已记录而非修改 |
| `X-Y` 与 `X/X` 可能误检 | 中 | `3-5`、`1/2` 可能是分数、比例、编号。§1.A 已声明接受此代价 |
| **改模式表/词表会改变既有结果** | 中 | 改完**必须全量跑 `node --test`**。数量断言（69/28/38/56/21）会拦住漏改的文档 |
| **领域层纯度易被破坏** | 中 | 8 条静态测试把关。**写 UI 或交付层时特别注意：不要把代码写进 `<script id="zhaiwu-domain">` 块** |
| **UI 层内嵌规则** | 中 | UI 一旦出现正则或词表就是架构漂移。判定标准见 `LAYER_CONTRACT.md` |
| **`Task.raw` 与 `Task.text` 目前几乎相同** | 低 | 差别只有首尾空白。不剥离发言人前缀，`raw` 的价值有限。推迟到 Phase 8 |
| **R-4 本地目录未改名** | 低 | 仓库已是 `zhaiwu`，本地目录仍是 `war`。物理约束，Phase 9 处理 |
| `.gitattributes` 影响其他克隆 | 低 | 若用户在别处有克隆，`eol=lf` 可能触发重规范化。当前已知只有本机一份 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 下一步写什么（Phase 7 交付层）、遵守哪条禁令（`renderMarkdown` 是纯函数、
剪贴板属 UI 层）、`Task` 的 6 个字段、`file://` 下剪贴板的坑、
测试怎么跑（`node --test`，**不是**目录形式）、跨 realm 的三种失效写法、
不要把代码写进领域层 script 块、以及**浏览器行为是未闭合项而非已完成项**——
均有明确记载。

唯一需要外部动作的是浏览器手动验证与 Phase 9 的目录改名，均已写明执行路径。
