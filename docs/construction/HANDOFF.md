# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 7 收工）

---

## Current State

**Phase 8 进行中：真实数据验收。** 产品功能面自 Phase 7 起已完整；
现在在做的是验证它**到底有没有用**。

用浏览器打开 `index.html` 可以走完主路径：粘贴聊天记录 → 点「抽取」→
看到排好序的分组结果 → 手动补上漏掉的 → 删掉误判的 → 复制/下载成 Markdown。
`node --test` → **384 passed / 0 failed**。

**进度：10 组语料已全部拿到并跑完。** 累计暴露 15 处问题，4 处当场修复：

| # | 问题 | 组 | 处理 |
|---|---|---|---|
| F8-1 | 「日期（星期几）时刻」写法，时刻被整段丢弃 → 退回当日 23:59 | 1 | **已修**（规格缺口 → 修订 §0/§3 + `skipBetween()`） |
| F8-2 | 「时段词 + 冒号时刻」（`下午16:00`）完全不解析 | 1 | **已修**（规格缺口 → §1.B 补一行 + `clockPattern()`） |
| **F8-7** | **日期段自带的约定时刻吞掉显式时间点**：`今晚24点截止` → 今天 20:00（真实截止是次日 00:00）；`明天早上8点集合` → 09:00 | 2 | **已修**（**规格错误** → §0 新增「日期段自带的时刻是缺省值」+ 代码 + 4 条测试） |
| **F8-10** | **带年份的数字日期 `YYYY-MM-DD` 整段落空**：年份被丢，`2026-03-20` 被读成 **`2027-03-20`**（静默错值） | 3–10 | **已修**（规格缺口 → `DATE_PATTERNS` 补一条 + §1.A 补一行 + 3 条测试，§1 总数 **74 → 75**） |
| **F8-6** | **已过的月日顺延到下一年** → 一年后的截止时间。**第 3 次复现，Run B 下 40+/58 行被打中** | 1、2、3–10 | **未修：规格本身错了。** 需要一次产品决策。**已给明确推荐**（「已过则视为逾期，不顺延」），见 `DEV_PROGRESS.md` |
| F8-3 | 多行单条消息：正文与时间分行 → **整条漏检** | 1 | 未修，需更多样本判断该不该改切分单位 |
| F8-4 | 小标题（以「：」结尾的称呼语）被判成任务 | 1 | 未修，需频次数据 |
| F8-5 | 带编号步骤的通知被拆成 3 片，第 1 片漏 | 1 | 未修，同 F8-3 |
| F8-8 | 日期段 + 无具体时刻的时段词：`周三上午`／`周五晚上` → 23:59。**本批 3+ 例，已从孤例变常见** | 2、3–10 | 未修，修它需先选定「上午/下午各等于几点」，清单里没有这个约定 |
| F8-9 | **动作词表召回不足** | 2、3–10 | 未修。**10 组齐，频率数据已到手，约束解锁**（原为「拿到频率前不补词」）。候选词只记单词：**第 2 组**：`体测`／`缴`／`调课`／`交班费`；**第 3–10 组**：`考试`／`申请`／`招新`／`集合`／`体检`／`续借`／`归还`／`接龙`／`申报`／`填` |
| F8-11 | **否定语境取到被否定的日期**：`下下周一交，不是下周一` → 取到 `下周一` | 3–10 | 未修。与 F8-7 同类：§0「取最靠左」在特定语境下自相矛盾，**需规格层决策** |
| F8-12 | **起止窗口取到开始端**：`08:00-22:00` 取 `08:00`；报名「`3月5日`开始／`3月12日`结束」取 `3月5日`。产品要的是**结束**端 | 3–10 | 未修，与 F8-11 同源，2 例 |
| F8-13 | **`24:00` 冒号写法被拒** → 退到 23:59，与已修的 `今晚24点` 行为不一致 | 3–10 | 未修，差 1 分钟，严重度低，但与 F8-7 不一致是缺陷 |
| F8-14 | **裸「晚」不是时段词**：`周四晚6点半` → 23:59 | 3–10 | 未修，扩词表需频率 |
| F8-15 | **`越快越好` 不在 §1.E 紧迫词表** | 3–10 | 未修，与 F8-9 同批 |

> F8-1 / F8-2 / F8-10 是**规格缺口**（实现严格照规格做了），F8-6 / F8-7 是**规格错误**
> （规格自己写错了）。都不是「代码有 bug」——真实数据的价值正在于此。
> 详见 `DEV_PROGRESS.md` 的 Phase 8 一节。

**10 组的关键数字（`now` = 2026-01-05 口径，隔离跨年顺延）**：召回 **≈60%**、
误检 **≈6%**、清单内时间解析 **≈97%（33/34）**、**清单外表达 ≈29%（14/48）**。
**引用这些数字必须带两条警告**：①分类含主观判断；②本批是显式日期的行政通知，
**对解析器太友好**，97% 不能外推到口语型聊天。清单外那 29% 才是真正的缺口。

**三组的方向不同，这是有信息的**：第 1 组主导失败是「算错」、第 2 组是「漏检」、
第 3–10 组是「漏检 + 清单外占比高」。只看一个合计数就看不出来了。

**Assumption Register 已据实更新（10 组齐）：A-001 由「未验证」改为
「部分成立，方向偏弱」**——机制成立，但覆盖率不达「辅助筛子」定位所需。
**其余五条状态一律未变**（数据不足，不强行更新等于不伪造验证）。

**三处未闭合项（自 Phase 6/7 起，仍未闭合）：**

1. **浏览器里的真实行为从未验证过。** 本机无法启动浏览器。渲染、状态、
   导出链路都是用 Node 里的 DOM 桩跑通的（11 组 41 项全通过），
   而桩测不到真实浏览器事件、真实粘贴、CSS 布局、`file://` 加载行为。
   **这两件事不是一回事，不要混为一谈。**
2. **复制到剪贴板在 `file://` 下能不能用，不知道。** 三级链路
   （`navigator.clipboard` → `execCommand` → 手动提示）都实现了，
   但**哪一级会在真实浏览器里生效，没有实测**。
3. **成功标准 1/3 仍未达成可结论的度量。** 标准 2 虽已过 80% 阈值，
   但有上述两重警告，**不单独宣称达标**。

手动验证清单在 `progress/layers/02-ui.md`（浏览器行为）与
`progress/layers/03-delivery.md`（复制/下载），**须由用户执行**，结果记入 `LOG.md`。

**下一步（Phase 8 收尾）：** ①等用户对 **F8-6** 的一次确认（推荐已写在
`DEV_PROGRESS.md`）；②F8-9/F8-15 的词表补齐（频率数据已到手）；
③标准 1/3 需用户在浏览器里实测。**真实语料不得提交进仓库**——
放临时目录或直接粘贴到对话里。

**仓库改名已完成**（`practice` → `zhaiwu`）：R-1/R-2/R-3 均已执行。
只剩 R-4（本地目录改名，待 Phase 9，属物理约束）。

## Completed

| 项 | 位置 / 值 |
|---|---|
| **领域层（全部）** | `index.html` 的 `<script id="zhaiwu-domain">` 块内。7 个导出见下 |
| **`parse(text, now) => Task[]`** | 领域层唯一的对外契约，已完成 |
| **交付层** | `index.html` 的 `<script id="zhaiwu-delivery">` 块内。`renderMarkdown` 纯函数 |
| **UI 层** | `index.html` 的 `<style id="zhaiwu-style">` + `<script id="zhaiwu-ui">`。渲染、抽取、分组、手动补漏、删除、复制、下载 |
| **动作词表** | `ACTION_WORDS` 56 词 + `FILLER_WORDS` 21 词，数据化 |
| **测试载体（D-009）** | `tests/load-block.mjs` —— 通用 `node:vm` 提取器；`load-domain.mjs` / `load-delivery.mjs` 在其上各自加导出契约守门 |
| **测试用例** | 五个文件，384 个 |
| **测试基线** | `node --test` → **384 passed / 0 failed** |
| 时间表达规格 | `docs/construction/SUPPORTED_EXPRESSIONS.md`（§1 支持 75 / §2 不支持 28 / §4 动作词表） |
| 产品真值冻结 | `docs/product/PRODUCT_REQUIREMENTS.md`（决策 12 条、假设 6 条） |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| 远端回滚点 | 五个 backup 分支，见 `GITHUB_ROLLBACK.md` |
| 工作树卫生 | `.gitignore` 忽略 skill 目录；`.gitattributes` 统一 LF |
| 其余施工文档 | `CODEX_START_HERE`、`MASTER_REQUIREMENTS`、`WORKFLOW`、`TOOL_POLICY`、`GITHUB_ROLLBACK`、`TEST_METRICS`、`DEV_PROGRESS`、`LOG` |

**`index.html` 的四个 script 块**（顺序即依赖顺序，不可调换）：

| 块 id | 层 | 说明 |
|---|---|---|
| `zhaiwu-style` | — | 全部 CSS |
| `zhaiwu-domain` | 领域层 | **纯度静态检查只扫描这一块**，不得混入 UI/交付代码 |
| `zhaiwu-delivery` | 交付层 | `renderMarkdown`，纯函数，挂 `globalThis.__zhaiwuDelivery` |
| `zhaiwu-ui` | UI 层 | DOM 操作、事件、复制、下载 |

> **为什么交付层要单独成块而不是并入 UI 层**：交付层的 `renderMarkdown` 是纯函数，
> 必须能被 `node --test` 提取测试；UI 层的代码碰 `document`/`navigator`，提不出来。
> 混在一块就测不了。

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

**交付层的 1 个导出**（`globalThis.__zhaiwuDelivery`）：

| 导出 | 职责 |
|---|---|
| `renderMarkdown(tasks)` | → Markdown 字符串。分组二分（有/无截止时间），`fuzzy` 与 `source` 是行内标记，行内元字符转义 |

**`Task` 的 6 个字段**（`renderMarkdown` 依赖它，Phase 8 统计也依赖它）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 规则条目 `'r'+行号`；手动条目 `'m'+序号`。**不保证唯一跨来源**，但前缀不同不冲突 |
| `text` | `string` | 去首尾空白的原文 |
| `deadline` | `Date \| null` | `null` 表示没识别到时间——**UI 与 Markdown 的分组界线都是它** |
| `fuzzy` | `boolean` | `true` 表示时间是推定（紧迫词 → 当天 23:59），**必须显式标注** |
| `source` | `'rule' \| 'manual'` | 来源 |
| `raw` | `string` | 原始行（未去空白）。手动条目为 `''` |

## Incomplete

| 项 | 阻塞原因 |
|---|---|
| **浏览器行为验证** | 本机无法启动浏览器。清单待用户执行，见 `progress/layers/02-ui.md` |
| **复制 / 下载实测** | 同上。见 `progress/layers/03-delivery.md`。三级链路里哪一级生效是未知数 |
| **真实数据验收（A-001~A-006）** | 语料已齐（10 组），**A-001 已更新**；其余五条数据不足，未强行更新。见 Phase 8 |
| **成功标准 1/3 的度量** | **需用户在浏览器里实测**（本机无法启动浏览器），清单见 `progress/layers/02-ui.md`、`03-delivery.md` |
| **F8-6 产品决策** | **等用户一次确认**。推荐已写在 `DEV_PROGRESS.md`（「已过则视为逾期，不顺延」） |
| **动作词表的校准** | **频率数据已到手，约束解锁**。候选词见 HANDOFF 上方 F8-9 行；改词表须三处同步 |
| **发言人前缀剥离** | 推迟。10 组语料里发言人前缀形态已见到，但改动切分单位影响面大，需单独一轮 |
| 本地目录改名 `war` → `zhaiwu`（R-4） | 物理约束（会话工作目录在内），推迟到 Phase 9 |

## Next Tasks

**Phase 8 收尾 — 剩余三个动作**

1. **F8-6 的产品确认**（唯一需要用户决策的一项）。推荐：
   §1.A 改为「无年份的月日，若已过则视为**已逾期**，不顺延到下一年」。
   确认后 agent 改三处（`SUPPORTED_EXPRESSIONS.md` §1.A / 代码 / 测试）。
2. **词表补齐**（F8-9 / F8-15）：按 10 组语料里的频率排序，补入 §4 动作词表与
   §1.E 紧迫词表。**三处同步**：代码、`SUPPORTED_EXPRESSIONS.md`、测试里的数量断言。
3. **标准 1 / 3 的浏览器实测**——**须由用户执行**：
   - 标准 1：漏掉的任务能否在 10 秒内手动补上
   - 标准 3：误检能否一键删除、结果是否满意
   - 顺带验证 `file://` 下剪贴板走的是三级链路里的哪一级

**排除项**：新功能、未在成功标准内的体验问题（记入 backlog 而非直接做）。

**Phase 8 之后**：Phase 9（部署收尾 + R-4 目录改名）。

## Required Reading

按此顺序，不必读全部 20 份：

1. `docs/construction/CODEX_START_HERE.md` ← 入口，含必读顺序与常见错误
2. `AGENTS.md` ← 指令优先级与禁令
3. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` ← 不可妥协项
4. `docs/product/PRODUCT_REQUIREMENTS.md` ← 产品真值，**Phase 8 的验收依据**
5. `docs/construction/LAYER_CONTRACT.md` ← 分层边界
6. `docs/construction/ARCHITECTURE.md` ← 数据流、数据模型
7. `docs/construction/SUPPORTED_EXPRESSIONS.md` ← **改识别规则前必读**（§4）
8. `docs/construction/CONSTRUCTION_PLAN.md` ← 找到当前阶段（Phase 8）
9. 本文件

**动手前，额外读 `index.html` 里三块代码本身**——它们是当前的实现真值，
比任何文档都准确。看清单里有什么可用，比看文档描述的接口更快。

## Important Files

| 文件 | 为什么重要 |
|---|---|
| **`index.html`** | 交付物，也是唯一的产品代码。现有四块：`zhaiwu-style` / `zhaiwu-domain` / `zhaiwu-delivery` / `zhaiwu-ui` |
| **`tests/load-block.mjs`** | D-009 的通用提取器。改 `index.html` 结构时**别破坏 `<script id="...">` 标记**，正则靠它提取 |
| `tests/load-domain.mjs` / `load-delivery.mjs` | 在提取器之上加各自的导出契约守门 |
| `tests/time-parser.test.mjs` | 146 个时间解析用例（含纯度静态检查）。**改模式表后必须全量跑** |
| `tests/task-extractor.test.mjs` | 任务识别用例，含已知误检与已知漏检的断言 |
| `tests/parse.test.mjs` | 组装与排序用例 |
| `tests/delivery.test.mjs` | `renderMarkdown` 用例，含「复制/下载不属于本层」的静态检查 |
| `docs/construction/SUPPORTED_EXPRESSIONS.md` | 识别规则的规格来源（§4 动作词表、§4 已知漏检、§5 已知误检） |
| `docs/construction/TEST_METRICS.md` | 测试命令写法、跨 realm 陷阱、分母口径、未建立项 |
| `docs/construction/progress/layers/01-domain.md` | 领域层硬约束与 Phase 4/5 实现落点 |
| `docs/construction/progress/layers/02-ui.md` | UI 层实现决策 + **待用户执行的手动验证清单** |
| `docs/construction/progress/layers/03-delivery.md` | 交付层实现决策 + **复制/下载的未闭合项** |
| `docs/construction/WORKFLOW.md` | 开工/收工流程 + Drift Checklist |

## Test Baseline

**`node --test` → 384 passed / 0 failed**

| 文件 | 覆盖 | 数量 |
|---|---|---|
| `tests/time-parser.test.mjs` | `SUPPORTED_EXPRESSIONS.md` §1 全部 75 条 + §2 全部 28 条 + 组合上限 + 边界 + 缺省时刻 | 146 |
| `tests/task-extractor.test.mjs` | §4 反向 21 词、正向 56 词、整行匹配边界、切分、已知误检、已知漏检 | 160 |
| `tests/parse.test.mjs` | `makeTask` / `sorter` / `parse` 端到端 / 输出不变式 | 25 |
| `tests/delivery.test.mjs` | `renderMarkdown` 六组：空输入 / 单条 / 分组 / 标记 / 转义 / 输出形状 / 纯度 | 53 |
| 领域层纯度（静态检查） | 无 DOM / 无网络 / 无存储 / 不自读系统时间 | 8 |

**数量断言是防漂移的机制**：75、28、38、56、21、53 这几个数字都在测试里被断言。
改了清单、词表或 renderer 而没同步测试，测试会红。

**仍未建立**：
- **UI 浏览器行为**与**剪贴板 / 下载**（本机无法启动浏览器，`Not established`）
- UI 与导出链路虽被一次性 DOM 桩验证过（11 组 41 项），
  但**桩不进仓库、不计入 384**——它测不到真正会出问题的地方，
  纳入基线会制造虚假的覆盖率安全感
- 真实数据度量（Phase 8）

lint / typecheck / build 永久保持 `Not established`（零依赖、无构建，是决策不是缺失）。

> ⚠️ **测试命令是 `node --test`，不是 `node --test tests/`。**
> 后者在 Node 24 下报 `MODULE_NOT_FOUND`——位置参数被当作模块入口，不再做目录发现。
> Phase 1–3 的文档全部写错了这一点，已在 Phase 4 改正。见 `TEST_METRICS.md`。
> Phase 8 复测过三种等价的写法：`node --test`、
> `node --test "tests/**/*.test.mjs"`、`node --test tests/*.test.mjs`，
> 均为 384 passed。

> ⚠️ **跨 realm 陷阱**——领域层与交付层都跑在 `node:vm` 里，有三种写法会失效：
> `x instanceof Date`、`assert.throws(fn, TypeError)`、
> `assert.deepEqual(领域层返回的 [], [])`。
> 第三条用 `tests/load-block.mjs` 的 `toLocal()` 解决。
> 领域层与交付层的代码本身不要用 `instanceof`，用鸭子类型。

> ⚠️ **不要把 UI 代码写进 `<script id="zhaiwu-domain">` 块。**
> 领域层纯度静态检查只扫描该块的正文，混入 UI 代码会让
> 「不出现 `document`」「不自己读当前时间」两条检查失败。
> 同理，**`clipboard` / `Blob` / `createObjectURL` 不得出现在 `zhaiwu-delivery` 块**——
> 那三个属于 UI 层，`delivery.test.mjs` 里有静态检查锁死这一条。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `dda1ae9`（Phase 7 收工） |
| Phase 8 提交 | `8f58ec2`（第 1 组结果 + 两处规格缺口修复）、`9a3e99b`（第 2 组结果 + F8-7 规格错误修复） |
| 远端分支 | `main` + 七个 backup 分支（见下） |
| remote | `https://github.com/ayer-TANG/zhaiwu`（2026-10-09 由 `practice` 改名，见 R-2） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

| 分支 | 指向 | 覆盖 |
|---|---|---|
| `backup/pre-phase2-repo-setup-20261009-1745` | `9d693c1` | 文档体系完成、尚无代码 |
| `backup/pre-phase4-timeparser-20261009-1844` | `3d48ebe` | **写第一行应用代码之前** |
| `backup/pre-phase5-extractor-20261009-1900` | `45d4d2d` | **领域层只有时间解析**时 |
| `backup/pre-phase6-ui-20261009-1913` | `42dc887` | **写第一行界面代码之前**——产品完全不可用时的最后状态 |
| `backup/pre-phase7-delivery-20261009-2010` | `787a6e7` | **交付层一行代码都没有之前**——结果出不去网页时的状态 |
| `backup/pre-phase8-realdata-20261009-1947` | `dda1ae9` | **真实数据验收开始之前**——功能已完整、但未用真实语料验证时的状态 |
| `backup/pre-phase8-g02-20261009-2105` | `b83b614` | **F8-7 修复之前**——第 1 组已记录、`今晚`「明早」仍会吞掉显式时间点时的状态 |
| `backup/pre-phase8-g03-10-20261009-2012` | `c131006` | **F8-10 修复之前**——带年份的数字日期仍会被丢弃年份、静默跳下一年的时间点 |

**八个都不得删除。** 它们是不同性质的还原点，不是重复。

## Latest Commit

| 提交 | 说明 |
|---|---|
| `e6599cd` | Phase 5 主体：实现 taskExtractor / sorter / parse，领域层完成 |
| `42dc887` | Phase 5 补记：提交号与推送状态；仓库改名收尾（R-2 / R-3） |
| `5fe892f` | Phase 6 主体：实现 UI 层（样式 + 骨架 + `zhaiwu-ui` 脚本） |
| `787a6e7` | Phase 6 补记：提交号与推送状态 |
| `646a5c6` | Phase 7 主体：实现交付层（`renderMarkdown` + 复制/下载按钮 + 三级复制链路）；测试载体重构为通用提取器 |
| `dda1ae9` | Phase 7 补记：提交号与推送状态 |
| `8f58ec2` | **Phase 8 第 1 组**：真实语料暴露的两处规格缺口修复（括号插入语、时段词+冒号时刻），377 passed |
| `b83b614` | Phase 8 第 1 组补记：提交号与备份分支 |
| `9a3e99b` | **Phase 8 第 2 组**：F8-7 规格错误修复（日期段自带的约定时刻吞掉显式时间点），381 passed |

> 说明：HANDOFF 无法记录**包含它自己**的提交号。因此每个阶段的提交号由紧随其后的
> 一个补记提交填入 —— Phase 1 是 `9d693c1`，Phase 2 是 `8eca9a5`，
> Phase 3 是 `3d48ebe`，Phase 4 是 `45d4d2d`，Phase 5 是 `e6599cd`，
> Phase 6 是 `787a6e7`，Phase 7 是 `dda1ae9`，Phase 8 见本表的下一行与紧随其后的补记提交。

## Push Status

**已推送。**

```
To https://github.com/ayer-TANG/zhaiwu.git
   b83b614..9a3e99b  main -> main
```

| 阶段 | 推送状态 |
|---|---|
| Phase 5 | ✅ 已推送（`45d4d2d..e6599cd` 之前的那次 `e6599cd`） |
| Phase 6 | ✅ 已推送（`42dc887..5fe892f`），**改名后第一次推送**，远端回显已是新地址 `zhaiwu` |
| Phase 7 | ✅ 已推送（`787a6e7..646a5c6`） |
| Phase 8 第 1 组 | ✅ 已推送（`dda1ae9..b83b614`） |
| Phase 8 第 2 组 | ✅ 已推送（`b83b614..9a3e99b`）；备份分支 `backup/pre-phase8-g02-20261009-2105` 已推送 |

## Working Tree

预期状态：**干净。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **浏览器行为从未验证** | **高** | 本机无法启动浏览器。桩测试通过 ≠ 浏览器里能用。CSS 布局、真实粘贴（含富文本残留）、触屏点击均未验证。手动清单在 `progress/layers/02-ui.md` |
| **`file://` 下剪贴板可用性未知** | **高** | 三级链路（`clipboard API` → `execCommand` → 手动提示）都写了，但**哪一级生效没实测**。若前两级双双失效，用户会看到"请手动选中"——功能可用但体验降级。这是 Phase 7 最大的未闭合项 |
| **A-001 ~ A-006 六条假设全部未验证** | 高 | A-001（真实任务句是否含可识别词）与 A-004（是否接受手动补漏）决定产品成立与否。**Phase 8 用真实记录验证，这是下一步的主要工作** |
| **规则召回率未知** | 高 | 产品的根本风险。已知漏检已记入 `SUPPORTED_EXPRESSIONS.md` §4 |
| **成功标准 1/2/3 从未度量** | 高 | 产品"有没有用"完全未知。Phase 8 的核心任务 |
| **下载未实测** | 中 | `createObjectURL` 在 `file://` 下通常可用，但未验证。文件名含中文，个别浏览器/系统可能有编码问题 |
| **单字动作词的误检** | 中 | 「发」「注意」会命中「沙发」「头发」「注意身体」。**这是产品定位（一键删除）存在的原因，不要试图用更复杂的规则消灭它**。测试里有断言锁定现状 |
| **动作词表 12 个词是判断不是数据** | 中 | `Phase5补充` 那一类。Phase 8 可能删掉其中一部分 |
| **转义只覆盖行内元字符** | 中 | 行首敏感的 `#`、`-`、`>` 没转义。当前输出形态下任务文本永远不在行首（前面有 `- [ ] `），所以安全；**但若将来改输出格式，这个前提就失效了**。测试里有断言锁定当前前提 |
| **`fmtDeadline` 两处重复** | 中 | UI 层与交付层各一份，**有意为之**，但确实是两处需要同步的地方 |
| **`fuzzy` 文案与词表软耦合** | 中 | UI 里 `fuzzy` 徽章的 `title` 举例了「尽快 / 马上 / 抓紧」。词表若增删紧迫词，文案需同步 |
| **A-006：裸 `X点` 的 12/24 推断是启发式** | 中 | 「三点」可能是 03:00 也可能是 15:00。**猜错比漏检更难被发现**。Phase 8 必须单独统计 |
| **`execCommand` 已废弃** | 中 | 它是第二级回退。浏览器最终会移除它——但在那之前，它是 `file://` 下唯一的备选。移除时需重新评估三级链路 |
| **已知行为：删除后重抽会复活** | 低 | 删掉某条规则条目后再点「抽取」，它重新出现。这是"抽取 = 重算"语义的必然结果，已记录而非修改 |
| `X-Y` 与 `X/X` 可能误检 | 中 | `3-5`、`1/2` 可能是分数、比例、编号。§1.A 已声明接受此代价 |
| **改模式表/词表会改变既有结果** | 中 | 改完**必须全量跑 `node --test`**。数量断言（74/28/38/56/21/53）会拦住漏改的文档 |
| **领域层纯度易被破坏** | 中 | 8 条静态测试把关。**不要把代码写进 `<script id="zhaiwu-domain">` 块**。同理交付层有「不得出现 clipboard/Blob/createObjectURL」的静态检查 |
| **UI 层内嵌规则** | 中 | UI 一旦出现正则或词表就是架构漂移。判定标准见 `LAYER_CONTRACT.md` |
| **`Task.raw` 与 `Task.text` 目前几乎相同** | 低 | 差别只有首尾空白。不剥离发言人前缀，`raw` 的价值有限。推迟到 Phase 8 |
| **R-4 本地目录未改名** | 低 | 仓库已是 `zhaiwu`，本地目录仍是 `war`。物理约束，Phase 9 处理 |
| `.gitattributes` 影响其他克隆 | 低 | 若用户在别处有克隆，`eol=lf` 可能触发重规范化。当前已知只有本机一份 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 下一步做什么（Phase 8 真实数据验收，**且必须先向用户要材料**）、
要什么材料（10 组真实记录 + 人工标注，**不得提交进仓库**）、
成功标准怎么度量、`Task` 的 6 个字段、改词表要三处同步、
测试怎么跑（`node --test`，**不是**目录形式）、跨 realm 的三种失效写法、
四块 script 的边界与各自的静态检查、
以及**浏览器行为、剪贴板、真实数据三处都是未闭合项而非已完成项**——均有明确记载。

唯一需要外部动作的是浏览器手动验证、Phase 8 的语料、Phase 9 的目录改名，均已写明执行路径。
