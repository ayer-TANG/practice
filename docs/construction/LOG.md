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
