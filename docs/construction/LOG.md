# Log

追加式施工日志。**不要删除历史条目，包括失败记录。**

---

## 2026-10-09 17:40 / Phase 1 / Work Log

### Plan Replay

按 `DEV_PROGRESS.md` 的 start plan 执行：建立全套施工文档 + 修正 README 漂移。
未实现任何应用代码。

### Actual Changes

**新增 17 个文件：**

| 文件 | 内容 |
|---|---|
| `AGENTS.md` | 项目身份、指令优先级、必读顺序、开工/收工规则、当前阶段、禁令 |
| `docs/product/PRODUCT_REQUIREMENTS.md` | 已签字冻结的产品真值（含 Decision Log 8 条、Assumption Register 5 条、Open Decision 1 条） |
| `docs/construction/CODEX_START_HERE.md` | 新 agent 入口 |
| `docs/construction/CODEX_MASTER_REQUIREMENTS.md` | 施工顶层要求（不可妥协项、阶段/测试/隐私/Git/文档/报告纪律） |
| `docs/construction/ARCHITECTURE.md` | 架构目标、技术栈、分层、数据流、数据模型、测试策略、扩展点、OD-001 |
| `docs/construction/LAYER_CONTRACT.md` | 分层契约与依赖禁令 |
| `docs/construction/CONSTRUCTION_PLAN.md` | Phase 0–9 阶段划分（含编号约定表） |
| `docs/construction/WORKFLOW.md` | 开工检查、回滚点、start plan、微循环、收工、Drift Checklist |
| `docs/construction/TOOL_POLICY.md` | 允许/禁止的工具与依赖 |
| `docs/construction/GITHUB_ROLLBACK.md` | Git 事实、baseline、backup 命名、禁令、Rename Queue |
| `docs/construction/TEST_METRICS.md` | 测试基线 `Not established`、计划、度量方式、失败记录规范 |
| `docs/construction/DEV_PROGRESS.md` | 本轮 start plan |
| `docs/construction/LOG.md` | 本文件 |
| `docs/construction/HANDOFF.md` | 接力状态 |
| `docs/construction/progress/layers/00-foundation.md` | 地基层进度 |
| `docs/construction/progress/layers/01-domain.md` | 领域层进度 |
| `docs/construction/progress/layers/02-ui.md` | UI 层进度 |
| `docs/construction/progress/layers/03-delivery.md` | 交付层进度 |
| `docs/construction/progress/layers/04-testing-deployment.md` | 测试与部署进度 |

**改写 1 个文件：**

- `README.md` —— 由「# practice / 练习代码仓库」改写为「摘务」产品说明，
  并**如实写明纯规则的局限**（会漏检、需手动补漏）。

### Files Changed

```
A  AGENTS.md
M  README.md
A  docs/product/PRODUCT_REQUIREMENTS.md
A  docs/construction/CODEX_START_HERE.md
A  docs/construction/CODEX_MASTER_REQUIREMENTS.md
A  docs/construction/ARCHITECTURE.md
A  docs/construction/LAYER_CONTRACT.md
A  docs/construction/CONSTRUCTION_PLAN.md
A  docs/construction/WORKFLOW.md
A  docs/construction/TOOL_POLICY.md
A  docs/construction/GITHUB_ROLLBACK.md
A  docs/construction/TEST_METRICS.md
A  docs/construction/DEV_PROGRESS.md
A  docs/construction/LOG.md
A  docs/construction/HANDOFF.md
A  docs/construction/progress/layers/00-foundation.md
A  docs/construction/progress/layers/01-domain.md
A  docs/construction/progress/layers/02-ui.md
A  docs/construction/progress/layers/03-delivery.md
A  docs/construction/progress/layers/04-testing-deployment.md
```

### Test Log

本阶段无代码，无可执行测试。测试基线保持 `Not established`。**不得记为 Passed。**

替代验证：

**Check 1 — 工作树状态**

```
$ git status --short
 M README.md
?? AGENTS.md
?? docs/
?? idea-to-production-vibecoding-main/
```

Result: Passed。改动全部在预期范围内；`idea-to-production-vibecoding-main/`
为已知第三方内容，本阶段未触碰。

**Check 2 — 空白字符错误**

```
$ git diff --check
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
```

Result: Passed（无空白字符错误）。附带发现换行符警告，见下方"发现"。

**Check 3 — 文档交叉引用完整性**

```
$ grep -rohE '`[^`]*\.md`' AGENTS.md README.md docs/ | tr -d '`' | sort -u | while read ref; do ...done
```

Result: **Failed（首次）**，见下方 Failures。

### Failures

#### Test Attempt 1 — 文档交叉引用检查

Command: 见 Check 3

Result: Failed

Summary: 检出 4 处指向不存在文件的引用：

| 缺失引用 | 出现位置 | 性质 |
|---|---|---|
| `HANDOFF.md` / `docs/construction/HANDOFF.md` | 多处 | **真问题**——该文件当时尚未创建 |
| `LOG.md` / `docs/construction/LOG.md` | 多处 | **真问题**——该文件当时尚未创建 |
| `TESTING_AND_HANDOFF.md` | `CONSTRUCTION_PLAN.md` | **真问题**——引用的是 skill 包内部的参考文件，而该包位于未跟踪目录，归属未定，随时可能被移出仓库 |

#### Fix

Files:

- `docs/construction/HANDOFF.md`（新建）
- `docs/construction/LOG.md`（本文件，新建）
- `docs/construction/CONSTRUCTION_PLAN.md`（修正引用）

Reason: 前两项是遗漏创建，补齐即可。第三项是把项目文档的依赖指向了一个
**不受本项目控制、且随时可能被移出仓库**的外部路径——这会让施工文档在
skill 包被移出后立刻失效。修正为引用本项目内已内联的清单（`WORKFLOW.md` 的 Drift Checklist）。

#### Retest

Command: 同 Check 3

Result: 见下方 Retests。

### Retests

**Check 3 重测**：补齐 HANDOFF.md、LOG.md 并修正 CONSTRUCTION_PLAN.md 的引用后重跑。
预期结果：所有引用均指向真实存在文件；仅剩 `.md` 这类非路径匹配（如"下载 `.md`"文案）为误报。

**若重测仍失败，本阶段结论必须为 Partially complete，不得报 Complete。**

### Documentation Drift

**修掉的漂移：**

1. `README.md` 自述为「练习代码仓库」，与产品实质不符 —— 已改写
2. **阶段编号混用** —— 本项目 `CONSTRUCTION_PLAN.md` 的 Phase 编号与 skill
   `idea-to-production-vibecoding` 的 Phase 编号不同。初稿中 5 份文档混用了两套编号
   （`ARCHITECTURE.md`、`LAYER_CONTRACT.md`、`PRODUCT_REQUIREMENTS.md`、
   `02-ui.md`、`AGENTS.md`），部分位置把"支持表达清单"标成 Phase 7（实为项目 Phase 3），
   部分把领域层实现标成 Phase 8（实为项目 Phase 4–5）。
   已统一为项目编号，并在 `CONSTRUCTION_PLAN.md` 顶部与 `AGENTS.md` 加上编号约定对照表。
3. `LAYER_CONTRACT.md` 拼写错误 `none-goal` → `non-goal`
4. 项目文档引用 skill 包内部文件 `TESTING_AND_HANDOFF.md` —— 已改为引用本仓库内联清单

**记录但未处理的漂移：**

5. **换行符不一致**。`core.autocrlf=true`，仓库无 `.gitattributes`。
   `git diff --check` 会持续产生 LF→CRLF 警告。属噪音，非错误。
   是否引入 `.gitattributes`（如 `* text=auto eol=lf`）需用户决定 ——
   这会改变仓库的文件处理行为，不在本阶段授权范围内。
6. `docs/construction/progress/layers/` 下只有 5 个文件，与 `ARCHITECTURE.md`
   分层表的 8 行（含 4 个 N/A 层）不一一对应。这是**刻意**的：
   N/A 层不建进度文件，避免 skill 明令禁止的"空仪式"。
   已在 `04-testing-deployment.md` 与 `00-foundation.md` 中说明。

### Git Status

- 分支 `main`，baseline `b764476`
- 已跟踪文件改动：`README.md` 1 个
- 新增未跟踪：`AGENTS.md`、`docs/`
- 未跟踪且不属本轮：`idea-to-production-vibecoding-main/`
- 本阶段提交与推送状态：见 `HANDOFF.md`

### Rollback Judgment

无需回滚。本轮全部为新增文档与一处 README 改写，未触碰任何代码。
如需回滚：`git revert <Phase 1 提交>`。

### Risks

| 风险 | 说明 |
|---|---|
| backup 分支未建 | 按 plan 推迟到 Phase 2（首行应用代码之前）。若用户认为文档也需分支保护，应立即补建 |
| 文档量已较大 | 17 份文档对一个小项目偏多。缓解：`CODEX_START_HERE.md` 作为唯一入口，只要求读 7 份 |
| OD-001 未关闭 | 阻塞 `index.html` 的编写。Phase 3 必须关闭 |
| A-001–A-005 全部未验证 | 5 条假设无一条经真实数据检验。这是当前最大的不确定性 |

### Next Step

1. Phase 2：建 backup 分支并推送；仓库改名 `practice` → `zhaiwu`；处置 skill 目录归属
2. Phase 3：产出「支持表达清单」；关闭 OD-001
3. 决定换行符策略（`gitattributes`）

---

## 2026-10-09 17:45 / Phase 2 / Work Log

### Plan Replay

按 `DEV_PROGRESS.md` 的 Phase 2 start plan 执行。四项范围：
backup 分支、skill 目录处置、换行符策略、仓库改名。

### Actual Changes

**1. 远端回滚点已建立**

```
backup/pre-phase2-repo-setup-20261009-1745  →  9d693c1
```

创建流程严格按 `GITHUB_ROLLBACK.md`：`git switch -c` → `git push -u origin` → `git switch main`。
推送成功后才继续后续步骤。已用 `git ls-remote --heads origin` 复验分支存在于远端。

**2. skill 目录归属：加入 `.gitignore`**

`.gitignore` 追加：

```
# 第三方工具：skill 包，不是产品代码，不纳入版本控制
# 保留在本地供开发使用；如需重装，从上游重新获取
idea-to-production-vibecoding-main/
```

理由：它是开发工具，不是产品交付物。把第三方代码提交进产品仓库会让
"仓库内容 = 产品 + 工具"混淆，也会让 `git log` 噪音增加。
选择忽略而非移出仓库，是因为移出会改变 skill 的可用位置，且本地保留更便于继续使用。

**3. 换行符策略：新增 `.gitattributes`**

```
* text=auto eol=lf
```

配合二进制文件声明。背景：开发机 `core.autocrlf=true` 且仓库此前无换行符约定，
导致每次提交都出现 LF→CRLF 警告（Phase 1 已验证为噪音，非错误）。
本文件明确仓库内与工作区统一使用 LF，消除该警告。

**4. 仓库改名：受阻，未执行**

本机 `gh: command not found`，无 GitHub CLI，agent 无法代为改名。
该步骤需用户在 GitHub 网页端操作（Settings → Repository name）。
已记入 `GITHUB_ROLLBACK.md` 的 Rename Queue 与 `AGENTS.md` 的 Current Phase。

**未执行且未越界**：未修改任何应用代码，未改动 `idea-to-production-vibecoding-main/` 内容，
未变更 GitHub 上除仓库名以外的任何设置。

### Files Changed

```
M  .gitignore
A  .gitattributes
M  AGENTS.md
M  docs/construction/DEV_PROGRESS.md
M  docs/construction/LOG.md
M  docs/construction/HANDOFF.md
M  docs/construction/CONSTRUCTION_PLAN.md
M  docs/construction/GITHUB_ROLLBACK.md
M  docs/construction/progress/layers/00-foundation.md
```

### Test Log

无代码，测试基线保持 `Not established`。**不得记为 Passed。**

**Check 1 — 忽略规则生效**

```
$ git check-ignore -v idea-to-production-vibecoding-main/
.gitignore:17:idea-to-production-vibecoding-main/	idea-to-production-vibecoding-main/
```

Result: Passed

**Check 2 — 换行符策略未造成意外改动**

```
$ git status --short
 M .gitignore
?? .gitattributes
```

Result: Passed。**未发生全量重规范化**——若 `eol=lf` 与已存内容冲突，
此处会列出全部 20 个文件为已修改。仅出现预期的两个文件。

**Check 3 — CRLF 警告消失**

加入 `.gitattributes` 后 `git add` 未再输出
`warning: LF will be replaced by CRLF`。

Result: Passed

**Check 4 — 远端 backup 分支存在**

```
$ git ls-remote --heads origin
9d693c1...  refs/heads/backup/pre-phase2-repo-setup-20261009-1745
9d693c1...  refs/heads/main
```

Result: Passed

### Failures

**无失败。** 本轮四项检查均一次通过。

但有一项**计划内未完成**（非失败）：仓库改名受阻于缺少 `gh` CLI。
这是环境限制，不是执行错误；已在 start plan 的 Repository State 中预先记录。

### Fixes

不适用。

### Retests

不适用。

### Documentation Drift

**修掉的漂移：**

1. `AGENTS.md` 的 Current Phase 仍写着 Phase 1 —— 已更新为 Phase 2 部分完成
2. `CONSTRUCTION_PLAN.md` Phase 2 状态仍为 ⬜ —— 已标为 ▶ 部分完成并注明受阻原因
3. `GITHUB_ROLLBACK.md` 的 Baseline 表有占位条目「（Phase 1 提交后补记）」—— 已填入 `ce56c9b`、`9d693c1`
4. `GITHUB_ROLLBACK.md` 缺少 backup 分支记录 —— 已新增 Backup Branches 小节
5. `progress/layers/00-foundation.md` 的未完成项已过时 —— 已更新

**记录但未处理的漂移：**

6. `GITHUB_ROLLBACK.md`、`AGENTS.md`、`PRODUCT_REQUIREMENTS.md` 中的仓库 URL 仍为 `practice`。
   **这是刻意的**——改名尚未实际发生，此时把文档改成 `zhaiwu` 会让文档比事实更超前。
   待改名完成后一并通过 R-2/R-3 更新。

### Git Status

- 分支 `main`，baseline `9d693c1`
- backup 分支：`backup/pre-phase2-repo-setup-20261009-1745`（已推送）
- 本阶段提交与推送状态：见 `HANDOFF.md`
- 工作树：本轮结束后除预期改动外干净；`idea-to-production-vibecoding-main/` 已不再出现在 `git status` 中

### Rollback Judgment

无需回滚。`.gitattributes` 与 `.gitignore` 均为低风险改动，且可逆。

### Risks

| 风险 | 说明 |
|---|---|
| 仓库改名长期挂起 | 改名未完成则文档与事实持续不一致（虽然已刻意保持同步）。建议尽快由用户执行 |
| `.gitattributes` 影响其他克隆 | 若用户在别处已有该仓库的克隆，`eol=lf` 可能在那些克隆上触发重规范化。当前已知只有本机一份克隆 |
| 换行符变更未在真机验证编辑器行为 | 本机编辑器（VS Code 等）对 LF 无碍，但未逐一验证 |

### Next Step

1. **用户在 GitHub 网页端执行仓库改名**（R-1）→ 然后 agent 执行 `git remote set-url`（R-2）与文档引用更新（R-3）
2. Phase 3：产出「支持表达清单」；关闭 OD-001
3. Phase 4：领域层 `timeParser` + 建立 `node --test` 测试载体

---

## 2026-10-09 18:05 / Phase 3 / Work Log

### Plan Replay

按 `DEV_PROGRESS.md` 的 Phase 3 start plan 执行。本阶段是**规格阶段**，产出能力边界清单
并关闭 OD-001。**未写任何实现代码。**

### Actual Changes

**1. 新增 `docs/construction/SUPPORTED_EXPRESSIONS.md`** —— 本阶段主交付物

内容分七节：

| 节 | 内容 |
|---|---|
| 0 | 解析语义约定：基准时间、时间粒度→具体时刻、周的定义、一句话多时间取最左 |
| 1 | **支持的时间表达**（69 条）：绝对日期、时间点、期限后缀、相对期限、紧迫词约定映射 |
| 2 | **明确不支持**（28 条）：双重相对星期、模糊区间、迟滞词、过去的表达、农历节日、月份时长、时段词单用、精确到秒 |
| 3 | 组合上限：`[日期段][时间点段][期限后缀段]` 三段各最多一个 |
| 4 | 动作词表初稿：正向 4 类、反向 23 个词 |
| 5 | **已知误检风险**：已完成/他人/条件式/否定式/反问——纯规则的固有边界，如实记录 |
| 6 | 验收方式：分母只计第 1 节 |
| 7 | 与其他文档的关系 |

**2. 关闭 OD-001 → 记为 D-009：采用「真单文件 + VM 提取测试」**

三项理由（权重序）：
1. `file://` 下的健壮性——单一 HTML 内联全部代码则**零跨文件加载**，必然可用；
   备选方案 (b) 把「双击即用」押在「浏览器允许 `file://` 页面加载同目录 classic script」
   这一**我无法在当前环境验证**的行为上
2. 保住已签字的 D-003，不改动用户两次确认过的决策
3. 被测试的代码就是从 `index.html` 提取的原文，不存在源文件与交付文件不同步的风险

具体做法（已写入 `ARCHITECTURE.md`）：领域层内联在 `<script id="zhaiwu-domain">`，
末尾挂 `globalThis.__zhaiwuDomain`；测试引导 `tests/load-domain.mjs` 提取该块正文
并在 `node:vm` 中求值。引导代码只存在于测试目录，不随产品发布。

**3. 新增 D-010：「尽快/马上/抓紧」类紧迫词约定映射为 today 23:59 并标 `fuzzy`**

`Task` 因此新增 `fuzzy: boolean` 字段。理由是 D-004 定下紧急度只有时间一维，
若把「尽快」归为「无截止时间」，它会排到列表最末——与直觉相反。
映射保留紧迫性又不发明具体时刻，且 UI 必须标注（如「尽快（按今天算）」），
不能让用户误以为那是对方说的明确时间。

**4. 同步更新 8 份文档** —— `AGENTS.md`、`ARCHITECTURE.md`、`CONSTRUCTION_PLAN.md`、
`DEV_PROGRESS.md`、`TEST_METRICS.md`、`PRODUCT_REQUIREMENTS.md`、`progress/layers/` 三份。

### Files Changed

```
A  docs/construction/SUPPORTED_EXPRESSIONS.md
M  AGENTS.md
M  docs/construction/ARCHITECTURE.md
M  docs/construction/CONSTRUCTION_PLAN.md
M  docs/construction/DEV_PROGRESS.md
M  docs/construction/TEST_METRICS.md
M  docs/construction/HANDOFF.md
M  docs/construction/LOG.md
M  docs/product/PRODUCT_REQUIREMENTS.md
M  docs/construction/progress/layers/00-foundation.md
M  docs/construction/progress/layers/01-domain.md
M  docs/construction/progress/layers/02-ui.md
```

### Test Log

无代码，测试基线保持 `Not established`。**不得记为 Passed。**

**Check 1 — 支持清单的可执行性（可转成测试用例）**

Result: Passed。第 1 节 69 条表达，每条都给出了确定的解析结果
（具体时刻或明确的计算规则如「today+7Xd 23:59」），可直接转成断言。

**Check 2 — 支持/不支持清单的互斥性**

Result: **首次 Failed → 已修正 → 重测 Passed**，见 Failures。

**Check 3 — 文档交叉引用完整性**

Result: Passed。除 `LOG.md` 中记录修复历史的那处文字外，无缺失引用。

**Check 4 — `git diff --check`**

Result: Passed，无空白字符错误，无 CRLF 警告。

### Failures

#### Test Attempt 1 — 互斥性检查

Command: 提取第 1 节与第 2 节的反引号词，求交集

Result: Failed

Summary: 检出 3 个交集词（`上午`、`下午`、`晚上`）。

**分析**：这是**检查器的误报**，不是文档矛盾——这三个词在第 1 节只出现在一句
「这类时段词**单独出现时不算时间**」的否定说明里，语义上与第 2 节一致。

**但仍决定修改文档**：该写法把"不支持的表达"混排进了"支持"一节，
一个照着清单写测试的人（或 agent）很可能误读为"支持单独的时段词"。
检查器虽然粗糙，它指出的歧义是真实的。

#### Fix

Files: `docs/construction/SUPPORTED_EXPRESSIONS.md`

Reason: 把第 1 节的否定说明改写为不出现裸时段词的形式，
明确指向第 2 节「时段词单用」，使"支持"一节只包含真正支持的表达。

#### Retest

Command: 同 Check 2

Result: Passed —— 支持 69 条、不支持 28 条、**交集 0**。

### Documentation Drift

**修掉的漂移：**

1. `ARCHITECTURE.md` 的 Open Decision 标题与「但本决策未关闭」段落 —— 已改为 D-009 决策记录
2. `ARCHITECTURE.md` 风险表中的「OD-001，Phase 3 前关闭」—— 已改为「已关闭」
3. `PRODUCT_REQUIREMENTS.md` 的 Open Decisions 表 —— OD-001 标为已关闭；核心对象表补 `fuzzy` 字段
4. `PRODUCT_REQUIREMENTS.md` 成功标准 2 —— 由"由 Phase 3 产出"改为指向具体文件
5. `AGENTS.md` Current Phase —— 由 Phase 2 更新为 Phase 3
6. `CONSTRUCTION_PLAN.md` Phase 3 状态 —— ⬜ → ✅ 并注明产出物
7. `02-ui.md` —— OD-001 风险行改为已关闭，并补充"模糊时间必须标注"这一新风险
8. `01-domain.md` —— 补上规格已冻结的说明与"实现前必读"警告
9. `00-foundation.md` —— 已完成清单补 Phase 2/3 产出

**记录但未处理的漂移：**

10. 仓库 URL 仍为 `practice`。改名（R-1）仍未执行——
    `git ls-remote https://github.com/ayer-TANG/zhaiwu.git` 返回 `Repository not found`，
    `gh` 仍不可用。文档继续与事实保持一致，未提前改成 `zhaiwu`。

### Git Status

- 分支 `main`，baseline `8eca9a5`
- 未新建 backup 分支：Phase 3 处于 `backup/pre-phase2-repo-setup-20261009-1745`
  的覆盖范围内（该分支按设计是 Phase 3–9 全程回滚点），非跳过
- 本阶段提交与推送状态：见 `HANDOFF.md`

### Rollback Judgment

无需回滚。本阶段只新增/修改文档，未触碰代码。

### Risks

| 风险 | 说明 |
|---|---|
| 清单可能过宽或过窄 | 69 条支持表达是基于我对中文聊天习惯的判断，**未经真实语料验证**。Phase 8 用真实数据核对后可能需增删。这是 A-001 的一部分 |
| 「尽快」映射是可辩论的 | D-010 把「尽快」定为今天 23:59。若用户实际期望它只是"尽快、别拖"，这个映射会误导。`fuzzy` 标记是缓解，不是解决 |
| 动作词表仅初稿 | 23 个反向词、4 类正向词，Phase 5 实现时必须扩充 |

### Next Step

1. **Phase 4**：领域层 `timeParser` + 建立 `node --test` 测试载体。
   按 `SUPPORTED_EXPRESSIONS.md` 第 1 节的 69 条逐条写用例，另加边界（跨月、跨年、
   今天已过的时间点、闰年）
2. 用户完成仓库改名（R-1），随时可插入执行 R-2/R-3
3. Phase 5：`taskExtractor` + `sorter`

---
## 2026-10-09 18:45 / Phase 4 / Work Log

### Plan Replay

本轮 start plan（追加于 `DEV_PROGRESS.md`）要求：实现 `timeParser`，建立 `node --test`
测试载体，覆盖支持清单 §1 全部 69 条 + §2 全部 28 条 + 边界。

**执行顺序按要求先建测试载体与骨架，再写解析器。** 这一条守住了：
`load-domain.mjs` 与 `index.html` 骨架先落盘，`timeParser` 随后填入。

### Actual Changes

**新建 `index.html`** —— 交付物。严格单文件，无任何 `<script src>` / `<link>` / 外部 URL。
领域层内联在 `<script id="zhaiwu-domain">` 块内，末尾挂载
`globalThis.__zhaiwuDomain = { version, timeParser, timeParserDetail }`（D-009）。
界面为空壳，只有一行说明文字。

**新建 `tests/load-domain.mjs`** —— D-009 的落地。读 `index.html` → 正则提取
`<script id="zhaiwu-domain">` 正文 → `vm.runInContext` 求值 → 取 `__zhaiwuDomain`。
同时导出 `source`（领域层源码原文），供纯度静态检查使用。

**新建 `tests/time-parser.test.mjs`** —— 130 个用例。

**领域层规则全部数据化**，四张模式表 + 通用解析函数，没有散落的 if：

| 表 | 规格 | 数量 |
|---|---|---|
| `DATE_PATTERNS` | §1.A 绝对日期 | 16 条模式 |
| `TIME_PATTERNS` | §1.B 时间点 | 7 条模式 |
| `REL_PATTERNS` | §1.D 相对期限 | 7 条模式 |
| `REJECT_PATTERNS` | **§2 不支持** | 11 条模式 |

§1.C 的期限后缀不需要模式——它们不改变解析结果，测试直接断言
`周五之前` 与 `周五` 相等。

### Files Changed

| 文件 | 动作 |
|---|---|
| `index.html` | 新建 |
| `tests/load-domain.mjs` | 新建 |
| `tests/time-parser.test.mjs` | 新建 |
| `docs/construction/TEST_METRICS.md` | 重写（基线从 Not established 变为 130 passed） |
| `docs/construction/ARCHITECTURE.md` | 目录结构、层次现状、测试策略、Deployment Shape |
| `docs/construction/SUPPORTED_EXPRESSIONS.md` | §0 补两条约定；§2、§3 补实现要点 |
| `docs/construction/CONSTRUCTION_PLAN.md` | Phase 4 转完成；测试命令改正 |
| `docs/construction/WORKFLOW.md` | 收工命令改正 |
| `docs/construction/progress/layers/01-domain.md` | 状态、实现落点、§2 实现方式 |
| `docs/construction/progress/layers/04-testing-deployment.md` | 基线、载体、跨 realm 陷阱 |
| `docs/product/PRODUCT_REQUIREMENTS.md` | D-011、D-012、假设 A-006 |
| `docs/construction/DEV_PROGRESS.md` | 完成记录 |
| `AGENTS.md` | Current Phase |
| `docs/construction/LOG.md` | 本文件 |

**未纳入版本控制的改动：** 无。

### Test Log

```
$ node --test
ℹ tests 130
ℹ suites 15
ℹ pass 130
ℹ fail 0
```

### Failures

**失败 1 —— 测试命令不成立（首次即失败）**

```
$ node --test tests/
Error: Cannot find module 'D:\xuexi\war\tests'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1517:15)
```

Phase 1–3 的全部文档都写着 `node --test tests/`（见 `CONSTRUCTION_PLAN.md`、
`WORKFLOW.md` §5、`TEST_METRICS.md`、`progress/layers/01-domain.md`、
`progress/layers/04-testing-deployment.md`）。

**原因：** Node 24 不再对传给 `--test` 的目录做递归发现；位置参数被当作**模块入口**，
于是 `tests/` 被拿去 `require`，报 `MODULE_NOT_FOUND`。

**Fix：** 改用零参数的 `node --test`。实测三种写法均通过：

| 命令 | 结果 |
|---|---|
| `node --test` | 130 passed |
| `node --test "tests/**/*.test.mjs"` | 130 passed |
| `node --test tests/*.test.mjs` | 130 passed |

选零参数形式：不依赖 shell 的 glob 展开，在 cmd / PowerShell / bash 下行为一致。
并确认 `tests/load-domain.mjs` 不匹配测试文件命名模式，实测未被采集（否则它会被当测试跑）。

**Test Attempt 1**
Command: `node --test tests/time-parser.test.mjs`
Result: **Failed**（130 中 128 passed / 2 failed）

```
✖ 空文本与非字符串 → null
✖ 未注入 now 时抛错，而不是悄悄用系统时间
```

**失败 2 —— 用例写错了（实现是对的）**

`assert.equal(parse('今天天气不错'), null)` 失败：`今天` 是 §1.A 的受支持表达，
`timeParser` 返回 `2026-10-09 23:59`。

**这是我的用例写错，不是实现有问题。** `timeParser` 只负责解析时间；
判断「今天天气不错」是不是任务，是 `taskExtractor` 的职责（Phase 5）。
时间解析正确地把 `今天` 认了出来。

**Fix：** 换成真正不含时间表达的文本（`辛苦了`、`这个方案我看过了`）。

**失败 3 —— 跨 realm 的 `instanceof` 失效**

`assert.throws(() => timeParser('明天'), TypeError)` 失败。
实现确实抛了 `TypeError`，但那是 **vm realm 的** `TypeError`，
与测试文件的 `TypeError` 不是同一个构造器，`instanceof` 跨 realm 不成立。

**Fix：** 改为匹配错误信息 `/需要注入有效的 now/`。
同时在 `progress/layers/04-testing-deployment.md` 记下这条陷阱——
领域层内部也**不得**用 `x instanceof Date` 判断入参（同样是跨 realm 问题），
已改用鸭子类型 `typeof now.getTime === 'function'`。

**Retests**
Command: `node --test`
Result: **130 passed / 0 failed**

### Documentation Drift

| # | 漂移 | 处理 |
|---|---|---|
| 1 | **`node --test tests/` 在 Node 24 下不成立**（5 处文档） | 全部改为 `node --test`，并在 `TEST_METRICS.md` 写明原因与实测结果 |
| 2 | `ARCHITECTURE.md` 写「六个 N/A 层」，实际只有 4 个（数据层/认证层/存储层/集成层） | 改为「四个」 |
| 3 | `ARCHITECTURE.md` 的 Deployment Shape 写「加其附带文件集，见 OD-001」 | OD-001 已闭为 D-009 且结论是**严格单文件**，改为「严格单文件，见 D-009」 |
| 4 | 目录结构出现 `tests/`，架构文档未记 | 在 `ARCHITECTURE.md` 新增「仓库目录结构」节 |
| 5 | 领域层状态从「不存在」变为「部分完成」 | 更新 `01-domain.md`、`ARCHITECTURE.md` 层次表 |
| 6 | `SUPPORTED_EXPRESSIONS.md` §0 说「按上下文推断 12/24 小时制」但未定义规则，无法写成测试 | 补定规则并记为新决策 **D-012**；由此产生的风险记为新假设 **A-006** |
| 7 | `SUPPORTED_EXPRESSIONS.md` §2 未说明「有些条目含受支持片段」 | 在 §2 补记「先屏蔽再解析」的做法；在 §3 补记紧邻规则 |

**未漂移的部分（刻意检查过）：**
- 领域层无 `document` / `window` / `fetch` / `localStorage` / `import` / `require` —— 有静态测试把关
- 领域层无 `new Date()` 无参调用、无 `Date.now()` —— 有静态测试把关
- `index.html` 无任何外部引用 —— 已 grep 确认
- 未实现任何未来阶段的功能（`taskExtractor` / `sorter` / `parse` / UI 一律未写）
- **无真实聊天记录进入仓库** —— 全部样例自行编造
- 无密钥

### Git Status

- 分支 `main`，baseline `3d48ebe`
- backup 分支 `backup/pre-phase4-timeparser-20261009-1844` → `3d48ebe`（已推送）
- 本阶段提交与推送状态：见 `HANDOFF.md`

### Rollback Judgment

本阶段以**新增文件**为主（`index.html`、`tests/`），撤销成本低。
若要回滚：`git revert <Phase 4 提交>`，或回到 backup 分支。
注意 `index.html` 在本阶段只是骨架 + 领域层，回滚它不会丢失任何界面代码（界面尚不存在）。

### Risks

| 风险 | 说明 |
|---|---|
| **A-006 未验证** | 裸 `X点` 的 12/24 推断是启发式。猜错比漏检更难被发现，Phase 8 必须单独统计 |
| **`X-Y` 与 `X/X` 的误检** | `3-5`、`1/2` 之类可能是分数、比例、编号而非日期。§1.A 已声明接受此代价，但真实数据里频率未知 |
| 屏蔽式 §2 实现的复杂度 | 先屏蔽再解析比正向扫描多一层。收益是 §2 真的能返回 null；代价是新增表达时要同时考虑会不会被误屏蔽 |
| 加模式时容易破坏左最优先 | `pickLeftmost` 取「最靠左，同位置取最长」。新增模式若起点更靠左，会改变既有表达的结果。改模式表后**必须全量跑测试** |

### Next Step

Phase 5 —— `taskExtractor` + `sorter` + `parse` 组装，规格来源是
`SUPPORTED_EXPRESSIONS.md` §4 的动作词表（初稿，Phase 5 实现时扩充）。
反向用例的重要性不亚于正向：识别类功能最常见的失败是**误检**。

---

## 2026-10-09 19:00 / Phase 5 / Work Log

### Plan Replay

按 `DEV_PROGRESS.md` 的 start plan 执行：实现动作词表、`isTaskLine`、`taskExtractor`、
`makeTask`、`sorter`、`parse`，并扩充测试。

**先建回滚点再动手**：`backup/pre-phase5-extractor-20261009-1900` → `45d4d2d`（已推送）。

计划外的三处，都在下面「Actual Changes」里如实记录。

### Actual Changes

**`index.html`（领域层）新增：**

| 项 | 说明 |
|---|---|
| `ACTION_WORDS` | 56 词，5 类：请求 / 提醒 / 交付推进 / 截止 / **紧迫** / **Phase5补充** |
| `FILLER_WORDS` | 21 词，反向词表 |
| `isFillerLine` | 剥掉 `\p{P}\p{S}` 与空白后，判断整行是否被反向词吃光 |
| `actionWordIn` | 命中则返回该词本身（便于调试），否则 `null` |
| `isTaskLine` | 单行判定原语 |
| `splitLines` / `taskExtractor` | 按 `/r?\n/` 切分并筛 |
| `makeTask` | 规范化 `Task`（6 字段） |
| `sorter` | 升序 + 无截止垫底；`slice()` 后排序，不改入参 |
| `assertNow` | 抽出来给 `timeParserDetail` 与 `parse` 共用（纯重构，错误信息未变） |
| `parse(text, now)` | 组装，输出 `Task[]` |

**测试新增：**

| 文件 | 内容 |
|---|---|
| `tests/task-extractor.test.mjs` | §4 反向 21 词 → 边界 → §4 正向 56 词 → 切分 → 已知误检 → 已知漏检 |
| `tests/parse.test.mjs` | `makeTask` / `sorter` / `parse` 端到端 / 输出不变式 |
| `tests/load-domain.mjs` | 加 7 项导出契约守门；加 `toLocal()`（见下） |

**三处偏离 plan，均已记录：**

1. **动作词表比 §4 初稿多 18 个词。**
   - **紧迫 6 个**（尽快/马上/抓紧/赶紧/第一时间/立刻）：**依据是 §1.E 已冻结的紧迫词清单**，
     不是新判断。写完之后跑端到端演示时发现「尽快把测试环境搭好」**整句漏掉**——
     因为「搭好」不是动作词。缺这一项，§1.E 那条「尽快 → 今天 23:59，fuzzy」的映射
     永远没有机会生效。
   - **Phase5补充 12 个**（开会/会议/汇报/参加/报名/签到/出差/报销/缴费/预约/取件/反馈）：
     **这是判断，不是数据**，已在文档里如此标注，并写明待 Phase 8 校准、「可能增也可能删」。
2. **多导出两个函数**：`isTaskLine`（`parse` 靠它保行号）与 `makeTask`
   （Phase 6 的手动补漏要用，否则 UI 得手搓 `Task` 对象，少字段会静默出错）。
3. **`SUPPORTED_EXPRESSIONS.md` 新增 §4「已知漏检」小节。** §5 原本只记误检。
   漏检同样是固有边界，不记下来 Phase 8 的 A-001 校准就没有基线。

**纪律的确立**：**已知误检与已知漏检都写成断言，不写成注释。**
注释不会在行为反转时报警；断言会。将来若词表变化让这些用例反转，测试变红，
强制同步文档与 A-001。

### Test Attempts

#### Test Attempt 1

```
Command: node --test
Result:  Failed
Summary: 2 failures（另有若干因跨 realm 报错）
```

失败分两类，**都不是实现缺陷**：

**(a) 跨 realm 的 `deepEqual` —— 11 处。**
报错信息是 `Values have same structure but are not reference-equal`，
即使打印出来的 `actual` 与 `expected` 看着一模一样。

原因：领域层跑在 `node:vm` 里，它创建的 `Array` / `Object` 拥有**另一个 realm 的原型**；
`assert.deepEqual`（strict 模式下即 `deepStrictEqual`）会比较原型，跨 realm 的原型不相等。

这与 Phase 4 那个 `x instanceof Date` 失效的问题**同源**，只是换了个面。

**(b) 我自己写错的两个测试。**
- `「他昨天出差去了」不是任务` —— 我在「无动作词」组里放了它，
  但它含「出差」，而「出差」是我本轮加进正向表的。**断言写反了。**
- `词表共 58 个词` —— `10+5+19+4+12 = 50`，58 是笔误。

#### Fix

| 文件 | 改动 |
|---|---|
| `tests/load-domain.mjs` | 新增导出 `toLocal()`：把领域层返回的结构搬回测试 realm，`Date` 保留为本地 `Date`（不走 JSON 序列化，否则会丢类型） |
| `tests/task-extractor.test.mjs` | `taskExtractor` 包一层 `toLocal` |
| `tests/parse.test.mjs` | `parse` / `sorter` / `makeTask` 各包一层 `toLocal`；断言正文因此保持原样可读 |
| `tests/task-extractor.test.mjs` | 「他昨天出差去了」移入**已知误检**组（它属于 §5 的「已完成的任务」类） |
| `tests/task-extractor.test.mjs` | 58 → 50（后又因加入「紧迫」6 词变为 56） |

#### Retest

```
Command: node --test
Result:  315 passed / 0 failed
```

#### 端到端实测（写完测试之后，不是之前）

用一段 10 条消息的编造语料跑 `parse`，验证不是纸上谈兵。**这一步暴露了「尽快」的漏检**
（见上「偏离 plan」第 1 条）——测试全绿不代表产品能用。

语料与脚本**只在内存与 `/tmp` 中**，未进入仓库。

修复后的实际输出（`now` = 2026-10-09 10:00，周五）：

```
2026-10-09 20:00             晚上八点前回复我邮件
2026-10-09 23:59             另外记得提醒我周五之前跟客户确认一下交付时间
2026-10-09 23:59  [fuzzy]    尽快把测试环境搭好
2026-10-10 15:00             小王，明天下午三点前把上周的报表发我一下
```

「收到」「哈哈哈」「辛苦了」「好的」「这个我看看」均未被判为任务。
「下周三上午十点开个复盘会」**漏检**——已记入 §4 已知漏检，未凭感觉补词。

### Verification

- 全部样例自行编造 —— **无真实聊天记录进入仓库**
- 未实现任何未来阶段的功能（UI 一律未写，`renderMarkdown` 未写）
- 领域层纯度静态检查通过（扫的是领域层全文，Phase 5 新代码**自动被覆盖**）
- 无密钥

### Git Status

- 分支 `main`，baseline `45d4d2d`
- backup 分支 `backup/pre-phase5-extractor-20261009-1900` → `45d4d2d`（已推送）
- 本阶段提交与推送状态：见 `HANDOFF.md`

### Rollback Judgment

本阶段改动集中在两处：`index.html` 的领域层追加（不动 Phase 4 的四张模式表）、
新增两个测试文件。若要回滚：`git revert <Phase 5 提交>`，或回到 backup 分支
`backup/pre-phase5-extractor-20261009-1900`。

**注意**：回滚本阶段会让 `parse` 消失，但**不会**影响 `timeParser`——
Phase 4 的四张模式表本轮一行未改，130 个旧用例全程保持通过。

### Risks

| 风险 | 说明 |
|---|---|
| **单字动作词的误检** | 「发」「注意」会命中「沙发」「头发」「注意身体」。§5 已记录，测试里有断言锁定。**这是产品定位（一键删除）存在的原因，不要试图用更复杂的规则消灭它** |
| **已知漏检无法穷举** | 「开个复盘会」「给你答复」「弄一下」都漏。Phase 8 要统计频率，频率决定要不要补词 |
| **词表是判断不是数据** | 56 个词里 12 个（Phase5补充）没有真实语料支撑。Phase 8 可能删掉其中一部分 |
| **`Task.id` 依赖行号** | 若 Phase 6 的 UI 在抽取后重新拼接文本再解析，行号会变。UI 必须在**同一次** `parse` 调用里拿 id |
| **`Task.raw` 与 `Task.text` 目前几乎相同** | 差别只有首尾空白。若不剥离发言人前缀，`raw` 的价值有限。剥离推迟到 Phase 8（拿到真实粘贴格式之后） |
| A-001 仍未验证 | 本阶段只让"验证变得可能"。真实召回率依然是未知数 |

### Next Step

Phase 6 —— UI 层。**UI 层不得内嵌任何正则或词表**（`LAYER_CONTRACT.md` 的判定标准：
看到 `/\d+月\d+日/` 即为违规）。UI 只需调用 `parse` / `makeTask` / `sorter`。

界面上必须体现的两件事：
1. `fuzzy` 标注 —— 不能让用户以为「尽快」是对方说的明确时间（诚实性要求，非装饰）
2. 「未识别到时间」独立分组 —— 分界线就是 `deadline === null`

---

## 2026-10-09 19:15 / Phase 6 / Work Log

### Plan Replay

按 `DEV_PROGRESS.md` 的 start plan 执行：写界面（样式 + 骨架 + UI 脚本）。

**先建回滚点再动手**：`backup/pre-phase6-ui-20261009-1913` → `42dc887`（已推送）。

领域层**一行未改**，`node --test` 全程保持 315 passed。

### Actual Changes

**`index.html` 新增三块：**

| 项 | 说明 |
|---|---|
| `<style id="zhaiwu-style">` | 约 110 行。`:root` 变量、系统字体栈。无外部字体、无 `@import`、无 `url()` |
| body 骨架 | `header`（标题 + 一句话说明）+ 三个 `section.panel`：粘贴区 / 结果区 / 手动补漏 |
| `<script id="zhaiwu-ui">` | 约 190 行，IIFE + `'use strict'` |

UI 脚本内部：

| 函数 | 职责 |
|---|---|
| `fmtDeadline(d)` | `Date` → `YYYY-MM-DD HH:mm`（本地时区） |
| `taskNode(t)` | 单条 `<li class="task">`：时刻 + 文本（+ 徽章）+ 删除按钮 |
| `groupNode(title, list)` | 分组容器，标题含条数 |
| `render()` | 空态分支 / 两分组分支 |
| `recompute()` | `domain.sorter(ruleTasks.concat(manualTasks))` 后重绘 |
| `runExtract()` | **UI 读 `new Date()`** → `domain.parse(text, now)` → 更新 hint |
| `removeTask(id)` | 从两个数组里同时移除后重算 |
| `addManual()` | `domain.timeParserDetail(text, new Date())` → `domain.makeTask(...)` → 推入 |

**约束落实情况（提交前逐条 grep 验证）：**

| 约束 | 验证方式 | 结果 |
|---|---|---|
| 无外部引用 | `grep -E '<(script\|link\|img)[^>]*(src\|href)='` | 无 |
| 无 `@import` / `url()` | `grep -E '@import\|url\('` | 无 |
| 无网络 / 存储 | `grep -E 'fetch(\|XMLHttpRequest\|localStorage\|sessionStorage\|document\.cookie'` | 无 |
| 无内嵌正则 | 人工通读 UI 块 | 无 |
| 无 `innerHTML` | `grep innerHTML`（唯一的命中是第 35 行的**注释**） | 无 |
| `new Date()` 只在 UI 层 | `grep 'new Date'`（2 处，均在 `zhaiwu-ui` 块内） | 符合 |

### Test Attempts

本阶段不新增 `node --test` 用例（UI 不做自动化测试是既定决策）。
但**开发时写了一次性 DOM 桩**验证渲染与状态，它报了 **9 项失败**。

这个诊断过程值得完整记录，因为它演示了一条纪律。

#### Test Attempt 1

```
Command: node <临时目录>/verify-ui.mjs
Result:  Failed —— 9 项失败
```

最强的信号是：带徽章的任务渲染成了 `2026-10-09 23:59推定删除` ——
**任务描述整个不见了**（`另外记得提醒我周五之前跟客户确认一下交付时间` 消失）。
看形状像是 `textContent` 的问题。

#### Diagnosis（先分类，再决定动不动产品代码）

**失败一：任务文本"消失" —— 桩的缺陷，不是产品缺陷。**

我的桩里 `textContent` 的 getter 写的是：

```js
if (this.children.length) return this.children.map(...).join('');  // 丢了 _text
return this._text;
```

而真实 DOM 的语义是：`textContent = x` 会把内容变成**一个文本子节点**，
随后的 `appendChild(badge)` 是**追加**在它后面。
`taskNode` 先设 `text.textContent = t.text` 再 `text.appendChild(b)`，
在真 DOM 里两者都在，在我的桩里 `_text` 被静默丢弃。

**失败二：断言「未识别到时间组 1 条」——我的测试预期错，不是代码错。**

我选的语料三句全含时间词（「明天下午三点前」「周五之前」「尽快」），
本来就**不该**有「未识别到时间」分组。代码是对的，断言是错的。

**失败三～九：都是上面两条的连锁反应**（手动条目"消失"、删除后计数不符等），
根因同一个。

**结论：9 项失败里 0 项是产品代码缺陷。**

诊断顺序是刻意选的：**先证明是桩错还是代码错，再动产品代码**。
若反过来先去"修" UI，就会把本来正确的代码改坏。

#### Fix

| 文件 | 改动 |
|---|---|
| 桩 | `textContent` getter 改为 `children.map(c => c.textContent).join('')`；setter 改为 `children = [textNode(v)]`。特判 `#TEXT` 节点返回自身 `_text` |
| 桩 | `createTextNode` 返回 `#TEXT` 节点而不是普通元素 |
| 测试语料 | 加入一条**真正无时间**的任务「记得带身份证」，让「未识别到时间」分组有内容 |
| 测试断言 | 删除按钮改为按内容定位（不再假设"第一条"是我以为的那条） |
| 测试序列 | 空状态用例改为先清掉手动条目再抽纯寒暄，使 `tasks.length` 真的为 0 |

#### Retest

```
Command: node <临时目录>/verify-ui.mjs
Result:  全部通过（9 组 30 项）
```

覆盖：初始提示、分组与条数、寒暄不入选、文本与时刻成对、时刻升序、
无截止垫底、`推定` 徽章唯一且带解释性 `title`、手动补漏、再次抽取不翻倍
且手动条目保留、删除、空状态、空输入、回车键。

**该脚本有意不进仓库**，理由是它测不到真正会出问题的地方（真实浏览器事件、
真实粘贴、CSS 布局、`file://` 加载行为），纳入基线只会制造虚假的覆盖率安全感。

### Verification

- **`node --test` → 315 passed / 0 failed**（与 Phase 5 相同，领域层未被触碰）
- 领域层纯度静态检查仍通过（UI 代码放在独立 script 块，未被扫到）
- 单文件约束保持：无外部 script/link/字体/网络请求
- 全部语料自行编造 —— **无真实聊天记录进入仓库**
- 未实现任何未来阶段的功能（无 `renderMarkdown`、无复制、无下载）
- 无密钥
- **浏览器真实行为：`Not established`** —— 本机无法启动浏览器。
  验证清单在 `progress/layers/02-ui.md`，须由用户执行并记入本文件

### Git Status

- 分支 `main`，baseline `42dc887`
- backup 分支 `backup/pre-phase6-ui-20261009-1913` → `42dc887`（已推送）
- 本阶段提交与推送状态：见 `HANDOFF.md`

### Rollback Judgment

本阶段改动**只在一处**：`index.html` 追加了样式块、body 骨架、UI 脚本块。
领域层与 `tests/` 一行未改，因此回滚本阶段**不会影响任何测试**。

若要回滚：`git revert <Phase 6 提交>`，或回到
`backup/pre-phase6-ui-20261009-1913`。

### Risks

| 风险 | 说明 |
|---|---|
| **浏览器行为未验证** | 桩测试通过不等于浏览器里能用。CSS 布局、真实粘贴（含富文本残留）、触屏点击均未验证。**这是本阶段最大的未闭合项** |
| **软耦合：文案举例了词表** | `fuzzy` 徽章的 `title` 写了「尽快 / 马上 / 抓紧」。词表若增删紧迫词，文案需同步。Phase 8 校准词表时注意 |
| **已知行为：删除后重抽会复活** | 删除某条规则条目后再次点「抽取」，该条目重新出现。这是"抽取 = 重算"语义的必然结果，已记录而非修改 |
| `Task.id` 依赖行号 | 本阶段已遵守（UI 在同一次 `parse` 调用里取用 id，不重新拼文本），风险已缓解 |
| A-001 / A-004 仍未验证 | 召回率与"用户是否愿意手动补漏"都要等 Phase 8。本阶段只让它们变得可观察 |

### Next Step

Phase 7 —— 交付层。`renderMarkdown(tasks) => string` 是**纯函数**，不得触碰 DOM；
剪贴板与下载才属于 UI 层。动手前先读 `LAYER_CONTRACT.md` 的交付层一节。
