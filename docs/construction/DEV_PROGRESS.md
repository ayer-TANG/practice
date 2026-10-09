# Dev Progress

追加式记录。**不要删除历史条目。**

---

## 2026-10-09 17:40 / Phase 1 / Start Plan

### Objective

建立 AGENTS.md 与全套施工文档，修正已知文档漂移（README 自述为"练习代码仓库"），
使下一个 agent 无需聊天历史即可接手。

### Affected Layers

无。本阶段不触碰任何代码层。

### Repository State

- 分支 `main`，HEAD `b764476`，与 `origin/main` 一致（`git ls-remote` 实测）
- 工作树：无已跟踪文件被修改；唯一未跟踪内容为 `idea-to-production-vibecoding-main/`
- stash：空
- 无 `package.json`，无测试，测试基线 `Not established`

### Planned Files

```
AGENTS.md                                       新增
README.md                                       改写（修正漂移）
docs/product/PRODUCT_REQUIREMENTS.md            新增
docs/construction/CODEX_START_HERE.md           新增
docs/construction/CODEX_MASTER_REQUIREMENTS.md  新增
docs/construction/ARCHITECTURE.md               新增
docs/construction/LAYER_CONTRACT.md             新增
docs/construction/CONSTRUCTION_PLAN.md          新增
docs/construction/WORKFLOW.md                   新增
docs/construction/TOOL_POLICY.md                新增
docs/construction/GITHUB_ROLLBACK.md            新增
docs/construction/TEST_METRICS.md               新增
docs/construction/DEV_PROGRESS.md               新增（本文件）
docs/construction/LOG.md                        新增
docs/construction/HANDOFF.md                    新增
docs/construction/progress/layers/00-foundation.md           新增
docs/construction/progress/layers/01-domain.md               新增
docs/construction/progress/layers/02-ui.md                   新增
docs/construction/progress/layers/03-delivery.md             新增
docs/construction/progress/layers/04-testing-deployment.md   新增
```

### Tests

不适用（无代码）。替代验证：

- 文档间交叉引用是否指向真实存在的文件
- 文档之间是否存在相互矛盾
- `git diff --check`

### Git Baseline

`b764476`

### Backup Branch

**未创建。** 理由：Phase 1 只产出文档，且 `b764476` 已推送至 `origin/main`，
本身即为可用回滚点。backup 分支按 plan 在 Phase 2 于首行应用代码之前建立。
此偏离已在 LOG 中记录，需用户知悉。

### Rollback Plan

`git revert <Phase 1 提交>`。若整阶段作废，revert 该阶段全部提交。

### Acceptance Criteria

新 agent 只读文档即可回答：产品是什么、架构如何、当前在哪个阶段、下一步做什么。

### Explicit Exclusions

- 任何应用代码（`index.html` 等）
- 任何测试代码
- 测试载体建立
- Git backup 分支创建
- 仓库改名 / 本地目录改名
- `idea-to-production-vibecoding-main/` 的归属处置

---

## 2026-10-09 17:45 / Phase 2 / Start Plan

### Objective

在写第一行应用代码之前建立已推送的远端回滚点；处置 skill 目录归属；
统一换行符策略；执行仓库改名 `practice` → `zhaiwu`。

### Affected Layers

基础层（`progress/layers/00-foundation.md`）。无代码层受影响。

### Repository State

- 分支 `main`，HEAD `9d693c1`，与 `origin/main` 一致（`git ls-remote` 实测）
- 工作树唯一未跟踪内容：`idea-to-production-vibecoding-main/`
- 无 stash
- 测试基线 `Not established`
- `gh` CLI **不可用**（`gh: command not found`）→ 仓库改名无法由 agent 代为执行

### Planned Files

```
.gitignore                              改写：忽略 skill 目录
.gitattributes                          新增：换行符策略
AGENTS.md                               更新 Current Phase
docs/construction/DEV_PROGRESS.md       追加本条目
docs/construction/LOG.md                追加工作日志
docs/construction/HANDOFF.md            更新接力状态
docs/construction/CONSTRUCTION_PLAN.md  更新 Phase 1/2 状态
docs/construction/GITHUB_ROLLBACK.md    记录 backup 分支；更新 Rename Queue
docs/construction/progress/layers/00-foundation.md  更新
```

### Tests

无代码测试。替代验证项：

1. `git check-ignore -v` 确认 skill 目录被忽略
2. 加入 `.gitattributes` 后：无全量重规范化、无 CRLF 警告、工作树无意外改动
3. `git ls-remote --heads origin` 确认 backup 分支已推送
4. 改名后 `git ls-remote` 验证新地址可达，且 `git remote -v` 指向新地址

### Git Baseline

`9d693c1`

### Backup Branch

`backup/pre-phase2-repo-setup-20261009-1745`

已于 2026-10-09 17:45 推送至 origin 并经 `git ls-remote` 验证。
该分支是 **Phase 3–9 全程的回滚点，不得删除**。

### Rollback Plan

`git revert <Phase 2 提交>`。

仓库改名本身可逆（GitHub 允许改回原名，且旧 URL 在改名后自动重定向）。
`.gitattributes` 若造成问题，删除该文件即可恢复原行为。

### Acceptance Criteria

1. 远端存在一个可见的 backup 分支
2. skill 目录不再让工作树变脏
3. 提交时不再出现 LF/CRLF 警告
4. `origin` 指向新仓库名，且文档中所有 `practice` 引用同步更新

### Explicit Exclusions

- 任何应用代码
- **本地目录改名**（物理约束：当前会话工作目录在该目录内，推迟到 Phase 9）
- 仓库改名之外的其他 GitHub 设置变更（可见性、描述、topics 等）
- 修改 `idea-to-production-vibecoding-main/` 的内容
- 建立 CI/CD

---

## 2026-10-09 18:05 / Phase 3 / Start Plan

### Objective

在写解析器之前定死"支持什么、不支持什么"，并关闭 OD-001。
本阶段是**规格阶段**，不写任何实现代码。

产出：

1. `docs/construction/SUPPORTED_EXPRESSIONS.md` —— 时间表达 + 动作词的
   支持清单与**明确不支持清单**，含每条表达对应的解析结果约定
2. 关闭 **OD-001**（单文件 vs 可测试性）
3. 修正因此产生的文档漂移

### Affected Layers

- 领域层（`progress/layers/01-domain.md`）—— 规格已定，实现仍不存在
- 基础层（`progress/layers/00-foundation.md`）—— 文档新增与状态更新
- UI 层（`progress/layers/02-ui.md`）—— OD-001 关闭后其结构约束确定

### Repository State

- 分支 `main`，HEAD `8eca9a5`，与 `origin/main` 一致
- 工作树干净（Phase 2 之后 skill 目录已被忽略）
- 测试基线 `Not established`
- **仓库改名仍未执行**：`git ls-remote https://github.com/ayer-TANG/zhaiwu.git`
  返回 `Repository not found`；`gh` 仍不可用。改名不阻塞本阶段
- 远端回滚点已存在

### Planned Files

```
docs/construction/SUPPORTED_EXPRESSIONS.md   新增（本阶段主交付物）
docs/construction/ARCHITECTURE.md            OD-001 关闭；Task 增加 fuzzy 字段
docs/product/PRODUCT_REQUIREMENTS.md         决策日志 D-009；Open Decisions 关闭
docs/construction/CONSTRUCTION_PLAN.md       Phase 3 状态
docs/construction/TEST_METRICS.md            引用支持清单作为验收依据
docs/construction/DEV_PROGRESS.md            追加本条目
docs/construction/LOG.md                     追加工作日志
docs/construction/HANDOFF.md                 更新接力状态
AGENTS.md                                    Current Phase
docs/construction/progress/layers/00-foundation.md、01-domain.md、02-ui.md
```

### Tests

无代码，测试基线保持 `Not established`。替代验证项：

1. 支持清单中**每一条**表达都能直接转成一条测试用例（可执行性检查）
2. 清单中不存在"既在支持列表又在不支持列表"的条目（互斥性检查）
3. 文档交叉引用完整
4. `git diff --check`

### Git Baseline

`8eca9a5`

### Backup Branch

**不新建。** Phase 3 只产出文档，且 `GITHUB_ROLLBACK.md` 已将
`backup/pre-phase2-repo-setup-20261009-1745` 指定为 **Phase 3–9 全程的回滚点**。
本阶段处于该分支的覆盖范围内，不是跳过——这是被设计覆盖的。

### Rollback Plan

`git revert <Phase 3 提交>`。

### Acceptance Criteria

1. 支持清单可逐条转成测试用例，无歧义
2. 不支持清单明确列出边界及理由，且不计入成功标准 2 的分母
3. OD-001 已关闭，决策理由与备选方案记录在案
4. 文档间无矛盾

### Explicit Exclusions

- **任何解析器实现代码**（`timeParser`、`taskExtractor`、`sorter` 一律不写）
- 任何 `index.html`
- 任何测试文件（只产出规格，不产出用例代码）
- 建立测试载体（Phase 4）
- 真实数据验证（Phase 8）
- 仓库改名（仍挂起，不属本阶段）

---
## 2026-10-09 18:45 / Phase 4 / Start Plan

### Objective

实现 `timeParser(text, now) => Date | null`，并建立 `node --test` 测试载体。
这是整个产品里最难、也最值得先做的一块。

本阶段是**第一行应用代码**。产出：

1. `index.html` 骨架，内含 `<script id="zhaiwu-domain">` 块（D-009 的结构）
2. `tests/load-domain.mjs` —— VM 提取测试载体（D-009）
3. `timeParser` 实现，时间词表**数据化**
4. 测试用例：覆盖 `SUPPORTED_EXPRESSIONS.md` §1 的全部 69 条
   + §2 的 28 条反向用例 + 边界（跨月、跨年、闰年、今天已过的时间点）

### 实现顺序（重要）

**先建测试载体与骨架，再写解析器。**
`timeParser` 的质量完全取决于测试覆盖；先把解析器写完再补测试，等于没有规格。

### Affected Layers

- 领域层 —— 本阶段主体
- 交付层 / UI 层 —— 不触碰（Phase 6/7）

### Planned File Changes

| 文件 | 动作 |
|---|---|
| `index.html` | 新建（骨架 + 内联领域层 script 块） |
| `tests/load-domain.mjs` | 新建（VM 提取引导） |
| `tests/time-parser.test.mjs` | 新建（用例） |
| `docs/construction/TEST_METRICS.md` | 更新（基线从 Not established 变为已有） |
| `docs/construction/ARCHITECTURE.md` | 更新（目录结构出现 `tests/`） |
| `docs/construction/progress/layers/01-domain.md` | 更新（`timeParser` 状态） |
| `docs/construction/progress/layers/04-testing-deployment.md` | 更新（测试载体已建立） |
| `docs/construction/CONSTRUCTION_PLAN.md` | 更新（Phase 4 状态） |
| `docs/construction/LOG.md` | 追加 |
| `docs/construction/HANDOFF.md` | 更新 |
| `AGENTS.md` | 更新（Current Phase） |

### Repository State

- 分支 `main`，HEAD `3d48ebe`，与 `origin/main` 一致
- 工作树干净
- 测试基线 `Not established`（本阶段结束后应变为已建立）

### Backup Branch

`backup/pre-phase4-timeparser-20261009-1844` → `3d48ebe`（已推送）

### Rollback Plan

`git revert <Phase 4 提交>`，或回退到 backup 分支。
本阶段新增文件为主，撤销成本低。

### Acceptance Criteria

1. `node --test tests/` 可运行，全部用例通过
2. `SUPPORTED_EXPRESSIONS.md` §1 的 69 条**每一条**都有对应测试
3. §2 的 28 条反向用例全部返回 `null`
4. 领域层无 `document` / `window` / `fetch` / `localStorage`（静态检查）
5. 领域层不自己读当前时间——只接受注入的 `now`（静态检查）
6. `index.html` 仍为单文件，且可在浏览器双击打开（Phase 6 完整验证，
   本阶段只验证不引入跨文件依赖）

### Explicit Exclusions

- **`taskExtractor` 与 `sorter`**（Phase 5）
- **`parse` 组装**（Phase 5 —— 本阶段只交付 `timeParser`）
- 任何界面与交互（Phase 6）
- 复制 / 下载（Phase 7）
- 任何 `SUPPORTED_EXPRESSIONS.md` §2 列出的表达
- 任何第三方依赖、`package.json`、构建步骤
- 真实聊天记录（测试样例必须自行编造）

### Phase 4 / Completion（2026-10-09）

**状态：Complete**

| 交付物 | 结果 |
|---|---|
| `index.html` | 已建立。严格单文件，无外部引用；领域层内联于 `<script id="zhaiwu-domain">` |
| `tests/load-domain.mjs` | 已建立。按 D-009 用 `node:vm` 提取领域层 |
| `tests/time-parser.test.mjs` | 已建立。130 个用例 |
| `timeParser(text, now)` | 已实现，时间词表数据化为四张模式表 |
| `timeParserDetail(text, now)` | 已实现，承载 `fuzzy`（D-011） |

**测试结果：** `node --test` → **130 passed / 0 failed**

**偏离计划之处（均已记录）：**

1. **测试命令改了。** 计划写的 `node --test tests/` 在 Node 24 下不成立
   （位置参数被当作模块入口，报 `MODULE_NOT_FOUND`）。改用零参数的 `node --test`。
   Phase 1–3 文档里的目录形式已全部改正。
2. **多了一个导出 `timeParserDetail`。** `timeParser(text, now) => Date | null` 契约不变，
   但 D-010 的 `fuzzy` 需要传出去。记为新决策 **D-011**。
3. **`SUPPORTED_EXPRESSIONS.md` 补了三处。** §0 补定裸 `X点` 的 12/24 推断规则（D-012）、
   补定附带时间点的判定；§2 与 §3 补记「先屏蔽再解析」的实现要点与紧邻规则。
   均为原文档未写明的推论，不是清单条目增减——**69 / 28 的条目数未变**，
   测试里有对这两个数字的断言。

**未做（按排除项）：** `taskExtractor`、`sorter`、`parse` 组装、任何界面。

---

## Phase 5 / Start Plan（2026-10-09）

**起点：** `main` @ `45d4d2d`，工作树干净，`node --test` → 130 passed / 0 failed。
**远端回滚点：** `backup/pre-phase5-extractor-20261009-1900` → `45d4d2d`（已推送）。

### 本轮目标

让领域层具备**端到端**能力：从一段聊天文本得到排好序的 `Task[]`。

### Included

1. `taskExtractor(text) => 候选任务句[]`，动作词表**数据化**
   （规格来源：`SUPPORTED_EXPRESSIONS.md` §4）
2. `isTaskLine(line) => boolean` —— 单行判定原语，供 `parse` 保留行号用
3. `sorter(tasks) => Task[]`：按 deadline 升序，无 deadline 的置于末尾（稳定排序）
4. `Task` 结构 + `makeTask(input)` 规范化工厂
5. `parse(text, now) => Task[]` 组装：拆分 → 判定 → 解析时间 → 构造 → 排序
6. 测试：**先写反向用例，再写正向**（误检是识别类功能最常见的失败）

### Explicit Exclusions

- 任何界面、交互、渲染（Phase 6）
- 复制 / 下载 / `renderMarkdown`（Phase 7）
- 任何持久化（产品 non-goal，永不实现）
- LLM 解析器（`parse` 契约不变即可替换，但不是本轮）
- 真实聊天记录（测试样例必须自行编造）

### 计划中的设计取舍（写代码前先定，避免边写边改）

| 取舍 | 决定 | 理由 |
|---|---|---|
| 行拆分口径 | 按 `/r?\n/` 拆行，一行 = 一条消息 | 粘贴的纯文本以换行分隔；无换行则无法可靠切分 |
| 反向词匹配范围 | **整行**匹配，不是子串 | 「收到，明天发你」含「收到」但是任务。子串匹配会把它误杀 |
| `text` 与 `raw` 的区别 | `text` = 去首尾空白的行；`raw` = 原始行。rule 任务二者仅差空白 | 二者为 UI 的两个用途（任务描述 / 核对原文）；本阶段不剥离发言人前缀 |
| 发言人前缀剥离 | **本轮不做** | 粘贴格式随客户端而异，无真实数据（A-001）时凭空猜格式属于「凭感觉写规则」。记入 Phase 8 校准项 |
| `id` 生成 | 确定性：`'r' + 行号` | 领域层须纯净可测，不能用 `Math.random()` |
| 领域层新增导出 | `isTaskLine`、`taskExtractor`、`sorter`、`makeTask`、`parse` | `makeTask` 让 UI 不必手搓 `Task` 形状（Phase 6 手动补漏要用） |

### 完成判据

- `node --test` 全绿，且新用例覆盖 §4 正向全部类别 + 反向全部 21 词
- 领域层纯度静态检查仍通过（新代码不得引入 DOM / `new Date()` / `Date.now()`）
- A-001 具备开始验证的条件（`parse` 可对真实文本跑出结果）

### Phase 5 / Completion（2026-10-09）

**状态：Complete。`node --test` → 315 passed / 0 failed（Phase 4 为 130）。**

| 交付物 | 结果 |
|---|---|
| 动作词表 | 数据化：`ACTION_WORDS` 56 词 + `FILLER_WORDS` 21 词，数量有断言 |
| `isTaskLine` / `taskExtractor` | 已实现。反向词按**整行**匹配，不是子串 |
| `makeTask` / `sorter` | 已实现。`sorter` 不改入参，稳定排序，无截止垫底 |
| `parse(text, now) => Task[]` | 已实现——**领域层唯一的对外契约，至此完成** |
| 端到端实测 | 用 10 条编造语料验证过，不是纸上谈兵（输出见 `LOG.md`） |

**偏离计划之处（均已记录，详见 `LOG.md`）：**

1. **动作词表比 §4 初稿多 18 词**：紧迫 6（取自 §1.E 已冻结清单）+ 判断性 12（待 Phase 8 校准）。
   起因是端到端实测发现「尽快把测试环境搭好」被整句漏掉。
2. **多导出两个函数**：`isTaskLine`、`makeTask`。
3. **`SUPPORTED_EXPRESSIONS.md` 新增 §4「已知漏检」**——原本只记误检。
4. **`load-domain.mjs` 新增 `toLocal()`**：跨 realm 的 `deepEqual` 陷阱（与 Phase 4 的
   `instanceof` 陷阱同源）。

**两次失败记录（如实保留在 `LOG.md`）：** 跨 realm 的 `deepEqual` 报错 11 处、
我自己写错的两个测试（断言方向写反、词表总数笔误）。**均非实现缺陷。**

**未做（按排除项）：** 任何界面、LLM 解析器、持久化。

**下一阶段：Phase 6（UI 层）。**

---

## Phase 6 / Start Plan（2026-10-09）

**起点：** `main` @ `42dc887`，工作树干净，`node --test` → 315 passed / 0 failed。
**远端回滚点：** `backup/pre-phase6-ui-20261009-1913` → `42dc887`（已推送）。

### 本轮目标

交付一个**可双击打开、可实际使用**的界面。产品从"有个能跑的领域层"
变成"有个能用一下的工具"。

### Included

1. 粘贴区（`<textarea>`）+ 抽取按钮
2. 结果列表：任务原文、截止时间、来源标记
3. **「未识别到时间」独立分组**——分界线就是 `deadline === null`，一次 `filter` 即可
4. **手动补漏输入框**（成功标准 1）→ `timeParserDetail` + `makeTask`，再走 `sorter`
5. **误检条目删除**（成功标准 3）
6. **`fuzzy` 必须显式标注**——用户不能以为「尽快」是对方说的明确时间
7. 样式（`<style id="zhaiwu-style">`，系统字体栈，无外部字体）

### Explicit Exclusions

- 复制 / 下载 / `renderMarkdown`（Phase 7）
- 任何持久化（产品 non-goal，永不实现）
- 任务编辑（只增删不改）
- 移动端专门适配（非目标）
- ES module 拆分（`file://` 下被 CORS 拦截，见 D-009）

### 计划中的设计取舍（写代码前先定）

| 取舍 | 决定 | 理由 |
|---|---|---|
| UI 代码放哪 | **独立的 `<script id="zhaiwu-ui">` 块** | 领域层纯度静态检查只扫 `zhaiwu-domain`；混进去会让检查失败 |
| DOM 构造方式 | **全程 `textContent`，不用 `innerHTML`** | 粘贴的聊天记录是用户数据，`innerHTML` 会把记录里的标签当 HTML 执行 |
| `now` 从哪来 | UI 调 `new Date()` 注入 `parse` | 领域层绝不自己读时间，否则无法测试 |
| 手动条目与抽取的关系 | **手动条目跨抽取保留**（`ruleTasks` 替换，`manualTasks` 累加） | 静默丢弃用户自己输入的内容属不良行为 |
| `Task.id` 的使用 | **同一次 `parse` 调用里直接取用，不重新生成** | id 是 `'r'+行号`，重新拼文本再解析会让行号漂移，删除操作对不上原文 |
| 空结果的表现 | 给出路，不留白 | 规则一定会漏。空列表不解释，用户会以为坏了 |

### 完成判据

- 能用一段编造的真实风格语料走完主路径：粘贴 → 抽取 → 分组 → 补漏 → 删除
- 领域层未被改动、`node --test` 仍 315 全绿、纯度检查仍通过
- 单文件约束保持（无外部 `script`/`link`/字体/网络请求）
- **浏览器行为无法在本机验证——必须如实标注为 `Not established`，不得含糊**

### Phase 6 / Completion（2026-10-09）

**状态：Complete（界面代码）；浏览器行为 `Not established`。**

**`node --test` → 315 passed / 0 failed，与 Phase 5 相同——领域层一行未动。**

| 交付物 | 结果 |
|---|---|
| `<style id="zhaiwu-style">` | 已建立。`:root` 变量、系统字体栈、无外部字体、无 `@import` |
| 页面骨架 | `header` + 三个 `section.panel`：粘贴区 / 结果区 / 手动补漏 |
| `<script id="zhaiwu-ui">` | 约 190 行。`runExtract` / `render` / `taskNode` / `groupNode` / `removeTask` / `addManual` |
| 两分组渲染 | 「有截止时间（N）」+「未识别到时间（N）」，分界为 `deadline === null` |
| `fuzzy` 标注 | 徽章「推定」+ 解释性 `title`，且只出现在 `fuzzy` 条目上 |
| 手动补漏 | 跨抽取保留，带「手动补的」徽章，`source: 'manual'` |
| 误检删除 | 每条一个删除按钮，同时从 `ruleTasks` / `manualTasks` 中移除 |

**验证情况（必须区分开说）：**

| 层面 | 状态 |
|---|---|
| 渲染与状态 | **已用一次性 DOM 桩验证**，9 组 30 项全通过（脚本**有意不进仓库**） |
| 浏览器真实行为 | **`Not established`** —— 本机无法启动浏览器。清单在 `progress/layers/02-ui.md`，须由用户执行 |
| 领域层 | **315 passed / 0 failed**，未受影响 |
| 单文件约束 | 已验证：无外部 `<script src>` / `<link href>` / `@import` / `url()` / `fetch` / 存储 API |

**为什么桩不进仓库**：它测不到真正会出问题的地方（真实浏览器事件、真实粘贴、
CSS 布局、`file://` 加载行为），纳入基线会制造**虚假的覆盖率安全感**。
它是开发时的探针，不是回归资产。

**调试过程中出现 9 项桩失败，全部归因于桩本身或我的测试预期，无一是产品缺陷：**

1. 任务文本在 `textContent` 里"消失"——我的桩在元素有子节点时丢弃了自身文本，
   真实 DOM 会保留（`textContent = x` 变成一个文本子节点，`appendChild` 追加其后）。
2. 断言「未识别到时间组 1 条」——**我的语料设计错**：三句都含时间词，
   本来就不该有该分组。换成含一条真正无时间任务的语料后通过。

诊断顺序是刻意选的：**先证明是桩错还是代码错，再动产品代码**。
若反过来先"修" UI，就会把正确的代码改坏。

**偏离计划之处：**

1. 正文编号从 ①③ 改为 ①②（原方案结果面板没有序号，导致跳号）。
2. 未做移动端适配（本就在排除项内，此处仅确认未越界）。

**已知行为（非缺陷）：** 删除某条规则条目后再次点「抽取」，该条目会重新出现——
抽取的语义是"按这份文本重算规则部分"，不是增量状态。

**软耦合（Phase 8 注意）：** `fuzzy` 徽章的 `title` 文案举例了「尽快 / 马上 / 抓紧」。
这是给用户看的说明，不参与判定；但词表若增删紧迫词，文案需同步。

**未做（按排除项）：** 复制 / 下载、持久化、任务编辑、移动端适配。

**下一阶段：Phase 7（交付层）。**

---

## Phase 7 / Start Plan（2026-10-09）

**起点：** `main` @ `787a6e7`，工作树干净，`node --test` → 315 passed / 0 failed。
**远端回滚点：** `backup/pre-phase7-delivery-20261009-2010` → `787a6e7`（已推送）。

### 本轮目标

让结果能离开网页。走完主用户旅程的第 6 步——否则用户辛苦筛出来的列表
只存在于浏览器里，关掉就没了。

### Included

1. `renderMarkdown(tasks) => string` —— **纯函数**，字符串进、字符串出
2. 复制到剪贴板
3. 下载 `.md`
4. `renderMarkdown` 的单元测试（它是纯函数，没有理由不测）

### Explicit Exclusions

- 推送到第三方待办工具（需要账号授权 + 网络请求，与离线形态冲突）
- 其他导出格式（CSV / JSON / ICS）
- 任何持久化

### 计划中的设计取舍

| 取舍 | 决定 | 理由 |
|---|---|---|
| `renderMarkdown` 放在哪个 script 块 | **新建 `<script id="zhaiwu-delivery">`** | `LAYER_CONTRACT.md` 把交付层列为独立一层。塞进领域层块会让"领域层"的语义变模糊，且 `ARCHITECTURE.md` 的层表已明确分开 |
| Markdown 里的分组 | **沿用二元分组**（有截止时间 / 未识别到时间） | 产品需求写明"唯一的分组规则：有截止时间 / 未识别到时间，二分"。来源（rule/manual）是**行内标记**，不是第三个分组 |
| Markdown 元字符 | **转义** | 任务文本来自用户粘贴的聊天记录。一条含 `[` 的任务会把后续内容全变成链接，直接破坏可读性——而"可读"是验收标准 |
| 列表语法 | `- [ ]` | 粘进编辑器或待办工具即点即用 |
| 空列表 | 返回一句说明，**不返回空串** | 复制出一片空白比复制出一句"没有任务"更让人困惑 |
| 剪贴板 | `navigator.clipboard` **+ `execCommand` 回退 + 手动复制提示** | `file://` 下 clipboard API 的可用性不确定（本机无法实测）。**不得静默失败** |
| 按钮状态 | 无任务时禁用 | 空列表没有可复制的东西 |

### 完成判据

- `node --test` 全绿，`renderMarkdown` 有正向与边界用例
- 领域层与 UI 层行为不受影响（315 基线不得倒退）
- 单文件约束保持（无外部引用）
- **复制/下载在浏览器中的真实行为如实标注**（预计仍为 `Not established`）

### Phase 7 / Completion（2026-10-09）

**状态：Complete（代码）；浏览器行为 `Not established`。**

**`node --test` → 368 passed / 0 failed**（Phase 6 为 315，新增 53 条交付层用例）。

| 交付物 | 结果 |
|---|---|
| `<script id="zhaiwu-delivery">` | 新块。`renderMarkdown(tasks) => string` 纯函数，挂 `globalThis.__zhaiwuDelivery` |
| 复制按钮 | 三级链路：`navigator.clipboard` → `execCommand` 回退 → 明说「请手动选中」 |
| 下载按钮 | `Blob` + `createObjectURL` + `<a download>`，1 秒后 `revokeObjectURL` |
| 按钮状态 | 无任务时禁用；交付层缺失时禁用并置 `title` 说明 |
| `tests/load-block.mjs` | 新增：D-009 的公共提取器（`extractBlock` / `evalBlock` / `toLocal`） |
| `tests/load-domain.mjs` | 重构为使用公共提取器，**对外导出不变**，既有三个测试文件一行未改 |
| `tests/load-delivery.mjs` | 新增：提取交付层 |
| `tests/delivery.test.mjs` | 新增：53 条用例 |

**实际 Markdown 输出（用编造语料跑出来的原文，非示意图）：**

```markdown
# 摘务

共 4 条任务。

## 有截止时间（3）

- [ ] 2026-10-09 23:59 · 另外记得提醒我周五之前跟客户确认一下交付时间
- [ ] 2026-10-09 23:59 · 尽快把测试环境搭好（推定）
- [ ] 2026-10-10 15:00 · 小王，明天下午三点前把上周的报表发我一下

## 未识别到时间（1）

- [ ] 记得带身份证
```

来源与 `fuzzy` 都是行内后缀括号，不是分组——产品需求规定分组只能是二分。
两者可叠加：`（推定 · 手动补的）`。

**偏离计划之处（如实记录）：**

1. **计划里提到的"末尾生成说明行"最终没加。** 理由：标题已表明来源；
   契约是 `renderMarkdown(tasks) => string`，没有 `now` 参数，写不出时间；
   一行静态文字只是噪音。
2. **`fmtDeadline` 在 UI 层与交付层各有一份。** 这是**有意的重复**，不是疏漏——
   两处的展示需求可能分化（界面要短、Markdown 要完整），共用会让两层耦合在
   一个最容易变的细节上。各 5 行，不值得抽。代码里有注释说明。
3. **计划外新增 `tests/load-block.mjs`。** 提取逻辑原本只在 `load-domain.mjs` 里，
   交付层要复用时抽了出来。`load-domain.mjs` 的对外导出保持不变，
   三个既有测试文件因此一行都没动。

**调试过程中的失败（1 项，**非实现缺陷**）：**

`delivery.test.mjs` 里我写了一个自相矛盾的用例——同一个断言组里既要求输出含裸 `[`，
又要求它不含 `\[`。实现是对的（它确实转义了），是我的断言写反了。
改为只断言转义后的形态后通过。**如实记入 `LOG.md`。**

**未做（按排除项）：** 第三方推送、其他导出格式（CSV / JSON / ICS）、持久化。

**下一阶段：Phase 8（真实数据验收）。**

---

## Phase 8 / Start Plan（2026-10-09）

**起点：** `main` @ `dda1ae9`，工作树干净，`node --test` → 368 passed / 0 failed。
**远端回滚点：** `backup/pre-phase8-realdata-20261009-1947` → `dda1ae9`（已推送）。

### 本轮目标

用真实聊天记录验证产品**到底有没有用**，并修正由此暴露的实现与规格偏差。

### Included

1. 用真实语料验证 A-001、A-002、A-003、A-004，更新 Assumption Register
2. 度量成功标准 1、2、3，如实记录（含未达标项）
3. 漂移检查与修正
4. 评估 A-005（代码量是否已不适合单文件）

### Explicit Exclusions

- 新功能
- 修复未在成功标准内的体验问题（**记入 backlog，不直接做**）
- **不得凭感觉改动作词表**：只有真实语料里出现足够频率才动（§4 明文约束）

### 语料处置（重要）

真实聊天记录**不落进仓库**（`AGENTS.md` 禁令）。原始语料放在
仓库之外的临时目录，逐组读入分析。写进仓库的只有**统计结果与结论**；
若需要示例，一律自行编造结构相同但内容无关的句子。

### 完成判据

- 三个成功标准有真实数字，或明确标注样本量不足
- Assumption Register 状态更新
- 无未修正漂移

### Phase 8 / 第 1 组结果（2026-10-09，进行中）

**样本：1 组**（一段真实群通知，多个通知被粘贴成一块）。
**结论：样本量远不足以度量成功标准，但已暴露 6 处具体问题，其中 2 处当场修复。**

#### 已修复（2 处，都是「规格缺口」而非实现偏差）

| # | 问题 | 性质 | 处理 |
|---|---|---|---|
| F8-1 | 「日期 + （星期几）+ 时刻」这种写法，时刻被整段丢弃，退回当日 23:59 | **规格缺口**：§3 只允许空白与 `，,、` 作填充物；§0 又承诺「给了时间点就用该时间点」，两条自相矛盾 | 修订 §0 与 §3，允许跳过**一个完整闭合的括号插入语**；实现加 `skipBetween()` |
| F8-2 | 「时段词 + 冒号时刻」（`下午16:00`）完全不解析 | **规格缺口**：§1.B 分别列了「`下午X点`」（必须带「点」）与无前缀的「`X:XX`」，没写两者的交集 | §1.B 补一行，计入总数（**69 → 74**）；实现加 `clockPattern()` |

> F8-1 与 F8-2 都属于同一类：**实现严格照规格做了，是规格没想到真实语料的样子**。
> 这不是「代码有 bug」，而是「规格缺口被真实数据照出来了」——
> 两者的修法不同，记录时必须分清。

#### 未修复（4 处，按排除项记入 backlog，不直接动）

| # | 问题 | 为什么不直接修 |
|---|---|---|
| F8-3 | **多行单条消息**：一条通知的正文与时间分在不同行，正文行无动作词 → **整条漏掉**。本组里时间最明确的那条任务就是这样漏的 | 这是「按行切分」这一根本设计的边界，改它等于改切分单位。**需要更多样本才能判断该不该动** |
| F8-4 | **小标题误检**：以「：」结尾的称呼语（如「未完成××的同学:」）被判成任务 | 需要频次数据才能决定是否加规则；单例不足以支撑 |
| F8-5 | **碎片化**：一条带编号步骤的通知被拆成 3 片，其中编号 1 那一片漏了 | 同 F8-3，与切分单位有关 |
| F8-6 | **已过的月日顺延到下一年**：§1.A 规定「该日已过则顺延到下一年」。真实语料里出现已过日期时，产品给出**一年后**的截止时间 | **这条是规格本身的问题，不是实现的问题**。实现严格照 §1.A 做了。但「截止时间」场景下顺延一年明显不合理。需要一次产品决策，不是改代码 |

> F8-6 值得单独强调：它是本组最有价值的发现。
> **实现是对的，规格是错的**——这类问题只有真实数据能照出来。

#### 成功标准度量（第 1 组，样本量不足，仅作记录）

| 标准 | 本组结果 | 说明 |
|---|---|---|
| 1（手动补漏 ≤10 秒） | **无法度量** | 需要真实浏览器交互，本机无法执行 |
| 2（时间解析 ≥80%） | **n=3，不作结论**。修复前 3 条里 1 条错；修复后按 §6 字面规则 3 条全对 | 但其中 1 条（F8-6）是「合规却无意义」，说明**规格需要改** |
| 3（误检可一键删除） | **本组 7 条抽出里 1 条误检**（F8-4） | 单例，不足以度量 |

**Assumption Register 本期不更新**——1 组样本不足以改变任何一条的状态，
强行更新等于伪造验证。**A-001 的初步信号偏弱**（时间最明确的那条任务被漏），
但需更多样本才能定论。

**下一步：需要用户再提供 9 组真实语料**，方可完成 Phase 8 的度量。

> ↑ 这条写于第 1 组结束时，已被下一节取代（第 2 组已完成，剩 8 组）。保留原文以存记录。

### Phase 8 / 第 2 组结果（2026-10-09，进行中）

**样本：1 组**（9 条消息，每条一行 —— 比第 1 组更接近微信多选复制的格式）。
**结论：主导失败模式是「漏检」而不是「算错」，与第 1 组方向相反。
时间解析修掉 1 类规格错误，抽取召回**没有**动（纪律所限，见 F8-9）。**

#### 时间解析（本组的实质产出）

**9 行里抽出 5 行，漏 4 行。但把「漏检」与「算错」分开看：8 行含时间表达的候选行里，
清单内 6 条、清单外 2 条。**

| 标准 2 的分母分类 | 条数 | 正确 | 说明 |
|---|---|---|---|
| 清单内表达 | 6 | **5** | 修复前只有 3 条正确（50%） |
| 清单外表达（单独记录，不入分母） | 2 | — | `明天下课前`（后缀不受支持）、`后天上午`（见 F8-8） |

> ⚠️ **修后 5/6 = 83% 是同一样本内的数字，不是独立证据。**
> 这一类的修复**正是被本样本照出来的**，在同一样本上复测等于自证。
> 真正独立的检验是后面 8 组。测试基线（381 passed）能防回归，防不了「样本单一」。

#### 已修复（1 类，**规格错误**——注意与第 1 组的「规格缺口」不同）

| # | 问题 | 性质 | 处理 |
|---|---|---|---|
| F8-7 | **日期段自带的约定时刻吞掉显式时间点**。`今晚`「明早」「明晚」被实现成 `absolute`，自带时刻把后面**显式写出**的时间点整个丢弃：`今晚24点截止` → 今天 20:00（真实截止其实是次日 00:00）；`明天早上8点集合` → 09:00 | **规格错误**：§0 的「时间粒度表」已写明「给了时间点 → 该时间点」，却被 §0 后半的「取最靠左」在左端自带时刻时推翻。**两条 §0 互相矛盾** | 修 §0（新增「日期段自带的时刻是缺省值」一节）+ §1.A 备注 + 代码 + 4 条测试 |

**用真实语料衡量这一处的后果**（`now` = 10-09 21:30）：

| 行 | 修复前 | 修复后 |
|---|---|---|
| 行 8 `活动报名今晚24点截止` | 10-09 **20:00** —— 比真实截止早 4 小时，**且已经过去**，列表上排第 1 显示为逾期 | 10-10 **00:00**，排第 2 |

**这是本组最有价值的发现，因为它错在「排序」上**——产品卖的就是排序。
第 1 组的 F8-6 是「合规但无意义」，本组是「合规但会误导」。

> **三个巧合一直掩盖着它**，三个都是「约定时刻恰好等于显式时刻」，
> 所以既有的 377 条断言全是绿的：`明天早上九点`（9:00 == 九点）、
> `今晚8点`（约定 20:00 == 8 点读作 20:00）、`下午16:00`（与 F8-2 同一个陷阱）。
> 新测试因此刻意使用**约定时刻与显式时刻不一致**的例子。
> 这与 F8-2 是同一类教训：**「碰巧对」的样例不能用来证明机制正确。**

#### 未修复（3 处，记入 backlog）

| # | 问题 | 为什么不直接修 |
|---|---|---|
| F8-6（**第二次复现**） | 本组有一行写「`3月15日前`」，`now` 在 10 月 → 解析成 **2027-03-15**。§1.A 规定「该日已过则顺延到下一年」，实现严格照做 | 同第 1 组结论：**规格本身错了**，需一次产品决策。这是第二次出现，不再是孤例——**建议尽快决策** |
| F8-8 | **日期段 + 无具体时刻的时段词**：`后天上午` → 当天 23:59。§0 只写「时段词**单用**不构成时间」，没写「日期段 + 时段词」这种半组合。§1.A 给 `明早` 定了约定 09:00，却没给 `明天上午` 定——同类表达不一致 | 修它必须**先选定「上午/下午」各等于几点**。清单里没有这个约定，凭空定值属于「凭感觉写规则」。**需要产品决策 + 频次数据** |
| F8-9 | **动作词表召回不足**：4 行漏检中 **3 行含受支持的时间词、只是不含动作词**（`体测`／`缴`／`调(课)`／`交班费` 均不在 §4 表内）。其中一行含受支持的时间点（`下周三下午2点`），时间解析**完全正确**，却因无动作词被整行丢弃 | **AGENTS.md 明文约束**：「在 Phase 8 拿到真实语料的频率之前不补词——『不得凭感觉写规则』」。1 组样本给不出频率。**候选词与出处已记，待 10 组齐再按频率定夺** |

**F8-9 附带一个值得决策的发现**：假设 **A-001 的原文是「含可识别的动作词**或**时间词」**，
但 Phase 5 的实现只认动作词。若按 A-001 字面（「或」）实现，本组召回 5/9 → 8/9；
代价是**任何含日期的行都会被收进来**（`明天我休息` 也会命中），误检会显著上升。
这是**召回 vs 精度的产品取舍**，不是 bug。需频率数据，本组不动。

#### 成功标准度量（第 2 组，样本量仍不足）

| 标准 | 本组结果 | 说明 |
|---|---|---|
| 1（手动补漏 ≤10 秒） | **无法度量** | 仍需真实浏览器交互 |
| 2（时间解析 ≥80%） | **清单内 6 条，对 5 条（83%）**；清单外 2 条单列 | **同一样本内的数字，不作结论**（见上方警告）。分母分类方法按 §6 执行 |
| 3（误检可一键删除） | **硬误检 0 条**。有一行抽出的文本里混着参与名单，但该行**确实是任务**，属噪声不属误检 | 单组不足以度量；「一键删除」需浏览器实测 |

**Assumption Register 本期仍不更新**——2 组样本依旧不足以改变任何一条状态。
但 **A-001 拿到了比第 1 组更强的信号**：本组 4/9 漏检，方向与第 1 组一致（都是偏弱），
**两条独立样本同向**，比单条更有分量。仍待 8 组。

#### 语料安全（本组执行时发现的一次违规，已修）

本组第一次落盘时，我把语料的**原句**写进了仓库文档（如原样的「××报名今晚24点截止」
「明天早上8点××」等），违反了 `AGENTS.md` 的「禁止把真实聊天记录写进仓库」。
**当场全部改写为自行编造的等价样例**（如 `活动报名今晚24点截止`、`明天早上8点集合`）。

纪律明确如下，第 1 组用的是同一套（当时把误检样例掩码成「未完成××的同学:」）：

| 可以进仓库 | 不可以进仓库 |
|---|---|
| **通用时间表达**（`今晚24点`、`明天早上8点`、`后天上午`）——它们就是 §1 词表本身 | **原句照抄**自己的消息 |
| **抽象描述**（「一行含受支持的时间点、但无动作词」） | **人名与参与名单** |
| **候选动作词**——**只记单词、不连句子**。它们与 §4 现有的 56 个词同性质，是 §4 校准的交付物 | **具体标识**：房间号、网址、机构名 |
| | 能把内容定位到**具体个人或班级**的组合 |

原始语料全程留在仓库外的临时目录；每次提交前用
`git diff | grep -n "<语料关键词>"` 核对无泄漏。

**下一步：需要用户再提供 8 组真实语料**（10 组里已完成 2 组）。
