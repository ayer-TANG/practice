# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 2 收工）

---

## Current State

**Phase 2 部分完成。尚无任何应用代码，`index.html` 不存在。**

上游环境已就绪：远端回滚点已建立、skill 目录不再污染工作树、换行符策略已统一。
**唯一未完成项是仓库改名**，它受阻于一个环境限制（本机无 `gh` CLI），需要用户操作。

下一步是 Phase 3（产出「支持表达清单」并关闭 OD-001），但**建议先让用户完成改名**——
否则后续每个阶段都要重复"文档里写的是 `practice`、实际想叫 `zhaiwu`"的不一致。

## Completed

| 项 | 位置 / 值 |
|---|---|
| **远端回滚点已建立** | `backup/pre-phase2-repo-setup-20261009-1745` → `9d693c1`（已推送并复验） |
| skill 目录不再污染工作树 | `.gitignore` 中新增 `idea-to-production-vibecoding-main/` |
| 换行符策略统一 | `.gitattributes`：`* text=auto eol=lf` |
| 产品真值冻结 | `docs/product/PRODUCT_REQUIREMENTS.md` |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| 工作流 / 工具策略 / Git 方案 / 测试基线 | `WORKFLOW.md`、`TOOL_POLICY.md`、`GITHUB_ROLLBACK.md`、`TEST_METRICS.md` |
| 分层进度文件 5 份 | `docs/construction/progress/layers/` |
| `README.md` 漂移修正 | `README.md` |

## Incomplete

| 项 | 阻塞原因 |
|---|---|
| **仓库改名 `practice` → `zhaiwu`** | 本机 `gh: command not found`。需用户在 GitHub 网页端执行 R-1 |
| 无任何应用代码 | 按计划在 Phase 4 起实现 |
| 无任何测试 | 基线 `Not established`，测试载体在 Phase 4 建立 |
| **OD-001 未关闭** | 阻塞 `index.html` 的编写。Phase 3 必须关闭 |
| 本地目录改名 `war` → `zhaiwu` | 物理约束（会话工作目录在内），推迟到 Phase 9 |

## Next Tasks

1. **用户执行 R-1**：GitHub → 仓库 Settings → Repository name → 改为 `zhaiwu`
   完成后告知 agent，agent 执行：
   - R-2：`git remote set-url origin https://github.com/ayer-TANG/zhaiwu.git`
   - R-3：更新 `GITHUB_ROLLBACK.md`、`AGENTS.md`、`PRODUCT_REQUIREMENTS.md`、
     `README.md`、`HANDOFF.md` 中的仓库 URL
   - 验证：`git ls-remote origin` 可达（改名后 GitHub 会重定向旧地址，但应确认新地址直连可用）

2. **Phase 3 — 支持表达清单与 OD-001 关闭**
   - 产出时间表达的**支持清单**与**明确不支持清单**
   - 产出动作词表初稿
   - 关闭 OD-001（单文件 vs 可测试性），**需要用户确认**
   - 在关闭 OD-001 之前，不得写 `index.html`

3. **Phase 4 — 领域层 `timeParser`**
   - 建立测试载体 `node --test tests/`
   - 时间词表数据化（不写成一堆 if）

## Required Reading

按此顺序读，不必读全部 18 份：

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
| `docs/construction/ARCHITECTURE.md` | OD-001 在里面，是当前的阻塞项 |
| `docs/construction/GITHUB_ROLLBACK.md` | Baseline、Backup Branch、Rename Queue |
| `docs/construction/progress/layers/01-domain.md` | 领域层是产品心脏，硬约束集中在此 |
| `docs/construction/WORKFLOW.md` | 开工/收工流程 + Drift Checklist |
| `.gitattributes` | 新增。改动了换行符行为，改动前请先读其注释 |

## Test Baseline

**`Not established`**

不存在测试文件、测试脚本或测试运行配置，**也没有 `package.json`。**
这不是"测试通过"，是"测试尚未建立"。详见 `TEST_METRICS.md`。

本轮实际执行的检查（Phase 2）：

| 检查 | 结果 |
|---|---|
| `git check-ignore -v` 忽略规则生效 | Passed |
| `git status` 无全量重规范化 | Passed |
| CRLF 警告消失 | Passed |
| `git ls-remote` backup 分支存在 | Passed |

Phase 2 **无失败**。Phase 1 的失败历史完整保留在 `LOG.md`，不得删除。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `9d693c1`（Phase 1 收工） |
| Phase 2 提交 | 见下方 Latest Commit |
| 远端分支 | `main`、`backup/pre-phase2-repo-setup-20261009-1745` |
| remote | `https://github.com/ayer-TANG/practice`（**待改名 `zhaiwu`**） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

**已建立并推送。**

```
backup/pre-phase2-repo-setup-20261009-1745  →  9d693c1
```

这是 **Phase 3–9 全程的回滚点，不得删除**。
它是本项目"应用代码出现之前"的唯一远端快照。

Phase 1 曾跳过此步骤（当时只产出文档，`b764476` 已推送可用作回滚点）。
该偏离已在 Phase 2 消除 —— 标准流程从此生效，每个阶段开始前都必须有远端回滚点。

## Latest Commit

| 提交 | 说明 |
|---|---|
| `b764476` | 仓库初始化 |
| `ce56c9b` | Phase 1 主体：建立产品与施工文档体系 |
| `9d693c1` | Phase 1 补记：handoff 提交号 |
| `6a977fb` | Phase 2 主体：建立远端回滚点并整理仓库环境（9 files, +375 −88） |
| 本文件所在提交 | Phase 2 补记：填入 `6a977fb` 与推送状态 |

> 说明：HANDOFF 无法记录**包含它自己**的提交号。因此每个阶段的提交号由
> 紧随其后的一个补记提交填入 —— Phase 1 是 `9d693c1`，Phase 2 是本文件所在提交。

## Push Status

**已推送。**

```
To https://github.com/ayer-TANG/practice
   9d693c1..6a977fb  main -> main
```

`origin/main` 现指向 `6a977fb`（或本文件所在的后续补记提交）。

## Working Tree

预期状态：**干净。**

Phase 2 之后，`idea-to-production-vibecoding-main/` 已被 `.gitignore` 忽略，
不再出现在 `git status` 输出中，也不再需要每次说明"这是已知未跟踪内容"。

**接手时若工作树非空，先查清原因再动手，不要覆盖。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **A-001 ~ A-005 五条假设全部未验证** | 高 | 其中 A-001（真实任务句是否含可识别词）与 A-004（用户是否接受手动补漏）直接决定产品是否成立。Phase 8 用 10 组真实记录验证 |
| **OD-001 未关闭** | 高 | 阻塞 `index.html` 编写。Phase 3 必须关闭 |
| 纯规则召回率未知 | 高 | 产品的根本风险。已在 `README.md` 与产品文档中如实声明局限 |
| **仓库改名挂起** | 中 | 文档与事实暂时保持同步（都写 `practice`），但只要改名未完成，这个不一致就一直在。建议尽快由用户执行 R-1 |
| `.gitattributes` 影响其他克隆 | 低 | 若用户在别处有克隆，`eol=lf` 可能触发重规范化。当前已知只有本机一份 |
| 文档量偏大 | 低 | 18 份文档对一个小项目偏多。缓解：`CODEX_START_HERE.md` 为唯一入口，只要求读 7 份 |
| 阶段编号易混淆 | 低 | 本项目与 skill 的 Phase 编号不同。已在 `CONSTRUCTION_PLAN.md` 顶部加对照表 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 产品是什么、架构如何、当前在哪个阶段、下一步做什么、
哪条假设未验证、哪个决策未关闭、哪一步被什么阻塞，均有明确记载。
唯一需要外部信息的是仓库改名 —— 但那一步本就只能由人执行，且原因已写明。
