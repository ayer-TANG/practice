# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 1 收工）

---

## Current State

**Phase 1 已完成，尚无任何应用代码。`index.html` 不存在。**

产品「摘务」已定稿并签字冻结。施工文档体系已建立。当前处于
**从"有文档"到"写第一行代码"之间的过渡点**。

## Completed

| 项 | 位置 |
|---|---|
| 产品真值冻结（含 8 条决策、5 条假设、1 个 Open Decision） | `docs/product/PRODUCT_REQUIREMENTS.md` |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| 工作流、工具策略、Git 与回滚方案 | `WORKFLOW.md`、`TOOL_POLICY.md`、`GITHUB_ROLLBACK.md` |
| 测试基线声明（`Not established`） | `TEST_METRICS.md` |
| 各分层进度文件（5 份） | `docs/construction/progress/layers/` |
| `README.md` 漂移修正（原自述为"练习代码仓库"） | `README.md` |
| `AGENTS.md` | 仓库根 |

## Incomplete

- **没有任何应用代码**：`index.html`、领域层、UI 层、交付层全部不存在
- **没有任何测试**：无 `tests/`、无测试脚本。基线为 `Not established`
- **没有 backup 分支**：推迟到 Phase 2（见下方 Backup Branch 说明）
- **仓库未改名**：仍为 `practice`，本地目录仍为 `war`
- **`idea-to-production-vibecoding-main/` 归属未定**：仍为未跟踪
- **OD-001 未关闭**：单文件与可测试性的冲突未决，阻塞 `index.html` 的编写

## Next Tasks

按顺序，**不要跳过**：

1. **Phase 2 — Git 安全与仓库整理**
   - 建立并推送 backup 分支（首行应用代码之前必须完成）
   - GitHub 仓库改名 `practice` → `zhaiwu` + `git remote set-url`
   - 更新文档中的 `practice` 引用
   - 处置 `idea-to-production-vibecoding-main/` 归属
   - 决定换行符策略（是否引入 `.gitattributes`，见 Risks）

2. **Phase 3 — 支持表达清单与 OD-001 关闭**
   - 产出「支持表达清单」（时间表达 + 动作词表初稿），明确列出**不支持**的范围
   - 关闭 OD-001（单文件 vs 可测试性），**需要用户确认**
   - 在关闭 OD-001 之前，不得写 `index.html`

3. **Phase 4 — 领域层 `timeParser`**
   - 建立测试载体 `node --test tests/`
   - 时间词表数据化

## Required Reading

按此顺序读，不必读全部 17 份：

1. `docs/construction/CODEX_START_HERE.md` ← 入口，含必读顺序与常见错误
2. `AGENTS.md` ← 指令优先级与禁令
3. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` ← 不可妥协项
4. `docs/product/PRODUCT_REQUIREMENTS.md` ← 产品真值
5. `docs/construction/ARCHITECTURE.md` + `LAYER_CONTRACT.md`
6. `docs/construction/CONSTRUCTION_PLAN.md` ← 找到当前阶段
7. 本文件

## Important Files

| 文件 | 为什么重要 |
|---|---|
| `docs/construction/CONSTRUCTION_PLAN.md` | 阶段定义与编号约定表。**所有阶段引用以此为准** |
| `docs/construction/ARCHITECTURE.md` | OD-001 就在里面，是当前的阻塞项 |
| `docs/construction/progress/layers/01-domain.md` | 领域层是产品心脏，硬约束集中在此 |
| `docs/construction/WORKFLOW.md` | 开工/收工流程 + Drift Checklist |
| `.gitignore` | 已跟踪。当前只忽略 OS/IDE/日志类文件 |

## Test Baseline

**`Not established`**

不存在测试文件、测试脚本或测试运行配置，**也没有 `package.json`。**
这不是"测试通过"，是"测试尚未建立"。详见 `TEST_METRICS.md`。

本阶段实际执行过的检查：

| 检查 | 命令 | 结果 |
|---|---|---|
| 工作树状态 | `git status --short` | Passed |
| 空白字符 | `git diff --check` | Passed（有 LF/CRLF 警告，非错误） |
| 文档交叉引用 | 见 `LOG.md` Check 3 | **首次 Failed → 修正 → 重测 Passed** |

失败历史完整保留在 `LOG.md`，不得删除。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `b764476`（仓库初始化） |
| 与远端关系 | 提交前本地与 `origin/main` 一致（`git ls-remote` 实测） |
| remote | `https://github.com/ayer-TANG/practice` |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

**当前不存在。**

本轮未创建 backup 分支，理由：Phase 1 只产出文档，且 `b764476` 已推送至
`origin/main`，本身即为可用回滚点。backup 分支按 `CONSTRUCTION_PLAN.md`
在 **Phase 2** 于第一行应用代码之前建立。

**这是一处对 skill 标准流程的偏离，已明确记录，接手的 agent 不得视为惯例。**
Phase 2 起必须严格按 `GITHUB_ROLLBACK.md` 执行。

命名规范：

```bash
git switch -c backup/pre-<phase>-<topic>-<timestamp>
git push -u origin backup/pre-<phase>-<topic>-<timestamp>
git switch main
```

## Latest Commit

见本文件的提交历史。Phase 1 的提交信息为
`docs: 建立摘务的产品与施工文档体系`。

## Push Status

见下方 Git State 与用户收到的收工报告。

## Working Tree

预期状态：

- 已跟踪文件：`README.md` 被修改（漂移修正）
- 新增：`AGENTS.md`、`docs/`
- 未跟踪且不属本项目：`idea-to-production-vibecoding-main/`（归属待定，Phase 2 处置）

**接手时若工作树与此不符，先查清原因再动手，不要覆盖。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **A-001 ~ A-005 全部未验证** | 高 | 5 条假设无一条经真实数据检验。其中 A-001（真实任务句是否含可识别词）与 A-004（用户是否接受手动补漏）直接决定产品是否成立。缓解：Phase 8 用 10 组真实记录验证 |
| **OD-001 未关闭** | 高 | 阻塞 `index.html` 编写。Phase 3 必须关闭 |
| 纯规则召回率未知 | 高 | 产品的根本风险。已在 `README.md` 与产品文档中如实声明局限，不粉饰 |
| backup 分支缺失 | 中 | 见上方 Backup Branch。Phase 2 必须补上 |
| 换行符不一致 | 低 | `core.autocrlf=true` 且无 `.gitattributes`，`git diff --check` 持续产生 LF→CRLF 警告。是否修复需用户决定（会改变仓库文件处理行为） |
| 文档量偏大 | 低 | 17 份文档对一个小项目偏多。缓解：`CODEX_START_HERE.md` 为唯一入口，只要求读 7 份；N/A 的分层不建进度文件 |
| 阶段编号易混淆 | 低 | 本项目与 skill 的 Phase 编号不同。已在 `CONSTRUCTION_PLAN.md` 顶部加对照表 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 产品是什么、架构如何、当前在哪个阶段、下一步做什么、
哪条假设未验证、哪个决策未关闭，均可在文档中找到明确答案，无需聊天历史。
