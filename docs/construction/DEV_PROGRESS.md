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
