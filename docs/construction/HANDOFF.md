# Handoff

> **给接手的 agent**：读完本文件你应该能在不读任何聊天记录的情况下安全地继续工作。
> 如果读完之后还有疑问，说明本文件写得不够好，请补充它。

最后更新：2026-10-09（Phase 3 收工）

---

## Current State

**Phase 3 已完成，尚无任何应用代码，`index.html` 不存在。**

规格阶段结束：能力边界已冻结（`SUPPORTED_EXPRESSIONS.md`），架构中唯一的
未决项 OD-001 已关闭（D-009）。**下一步就是写第一行代码。**

Phase 2 仍有一项挂起——仓库改名，它需要用户操作，且**不阻塞任何后续阶段**。

## Completed

| 项 | 位置 / 值 |
|---|---|
| **能力边界规格** | `docs/construction/SUPPORTED_EXPRESSIONS.md` —— 支持 69 条 / 不支持 28 条 / 组合上限 / 误检风险 / 验收方式 |
| **OD-001 关闭** | D-009：真单文件 + VM 提取测试，见 `ARCHITECTURE.md` |
| 产品真值冻结 | `docs/product/PRODUCT_REQUIREMENTS.md`（决策日志 10 条、假设 5 条、无未决项） |
| 架构与分层契约 | `docs/construction/ARCHITECTURE.md`、`LAYER_CONTRACT.md` |
| 阶段划分 Phase 0–9 | `docs/construction/CONSTRUCTION_PLAN.md` |
| **远端回滚点** | `backup/pre-phase2-repo-setup-20261009-1745` → `9d693c1`（Phase 3–9 全程） |
| 工作树卫生 | `.gitignore` 忽略 skill 目录；`.gitattributes` 统一 LF |
| 其余施工文档 | `CODEX_START_HERE`、`MASTER_REQUIREMENTS`、`WORKFLOW`、`TOOL_POLICY`、`GITHUB_ROLLBACK`、`TEST_METRICS`、`DEV_PROGRESS`、`LOG` |

## Incomplete

| 项 | 阻塞原因 |
|---|---|
| **无任何应用代码** | 按计划在 Phase 4 起实现 |
| **无任何测试** | 基线 `Not established`；测试载体在 Phase 4 建立 |
| **仓库改名 `practice` → `zhaiwu`** | 本机 `gh: command not found`，需用户在 GitHub 网页端执行 R-1 |
| 本地目录改名 `war` → `zhaiwu` | 物理约束（会话工作目录在内），推迟到 Phase 9 |

## Next Tasks

**Phase 4 — 领域层 `timeParser` + 建立测试载体**

1. 建立 `tests/load-domain.mjs`（按 D-009：读 `index.html` → 提取
   `<script id="zhaiwu-domain">` 正文 → `vm.runInNewContext` 求值）
2. 建立 `index.html` 骨架，内含 `<script id="zhaiwu-domain">` 块与命名空间挂载
3. 实现 `timeParser(text, now) => Date | null`，时间词表**数据化**（不写成一堆 if）
4. 按 `SUPPORTED_EXPRESSIONS.md` 第 1 节 **69 条逐条**写用例，另加边界：
   跨月、跨年、今天已过的时间点、闰年
5. 反向用例：第 2 节的 28 条不支持表达必须返回 `null`

**执行顺序很重要**：先建测试载体与骨架，再写解析器。
不要先把解析器写完再补测试——`timeParser` 的质量完全取决于测试覆盖。

之后：Phase 5（`taskExtractor` + `sorter`）→ Phase 6（UI）→ Phase 7（交付层）。

随时可插入：用户完成仓库改名后执行 R-2（`git remote set-url`）与 R-3（文档引用更新）。

## Required Reading

按此顺序，不必读全部 19 份：

1. `docs/construction/CODEX_START_HERE.md` ← 入口，含必读顺序与常见错误
2. `AGENTS.md` ← 指令优先级与禁令
3. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` ← 不可妥协项
4. `docs/product/PRODUCT_REQUIREMENTS.md` ← 产品真值
5. `docs/construction/SUPPORTED_EXPRESSIONS.md` ← **写解析器前必读**
6. `docs/construction/ARCHITECTURE.md` + `LAYER_CONTRACT.md`
7. `docs/construction/CONSTRUCTION_PLAN.md` ← 找到当前阶段
8. 本文件

## Important Files

| 文件 | 为什么重要 |
|---|---|
| `docs/construction/SUPPORTED_EXPRESSIONS.md` | **下一阶段实现的规格来源**。清单外的表达就是不该支持的 |
| `docs/construction/CONSTRUCTION_PLAN.md` | 阶段定义与编号约定表。**所有阶段引用以此为准** |
| `docs/construction/ARCHITECTURE.md` | D-009 的完整设计（VM 提取测试怎么做） |
| `docs/construction/progress/layers/01-domain.md` | 领域层硬约束集中在此 |
| `docs/construction/WORKFLOW.md` | 开工/收工流程 + Drift Checklist |
| `.gitattributes` | 改动了换行符行为，改动前先读其注释 |

## Test Baseline

**`Not established`**

不存在测试文件、测试脚本或测试运行配置，**也没有 `package.json`。**
这不是"测试通过"，是"测试尚未建立"。详见 `TEST_METRICS.md`。

Phase 3 执行的检查：

| 检查 | 结果 |
|---|---|
| 支持清单可执行性（69 条可否转成测试） | Passed |
| 支持/不支持互斥性 | **首次 Failed → 修正 → 重测 Passed**（69 / 28 / 交集 0） |
| 文档交叉引用完整性 | Passed |
| `git diff --check` | Passed |

失败历史完整保留在 `LOG.md`，不得删除。

## Git State

| 项 | 值 |
|---|---|
| 分支 | `main` |
| Baseline commit | `8eca9a5`（Phase 2 收工） |
| Phase 3 提交 | `47b50fb`（已推送） |
| 远端分支 | `main`、`backup/pre-phase2-repo-setup-20261009-1745` |
| remote | `https://github.com/ayer-TANG/practice`（**待改名 `zhaiwu`**） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Backup Branch

**`backup/pre-phase2-repo-setup-20261009-1745` → `9d693c1`，已推送。**

`GITHUB_ROLLBACK.md` 指定它为 **Phase 3–9 全程的回滚点**，因此 Phase 3 未新建分支
（处于覆盖范围内，非跳过）。**不得删除。**

**Phase 4 起需要新建 backup 分支**——它要写第一行代码了。命名：

```bash
git switch -c backup/pre-phase4-timeparser-<timestamp>
git push -u origin backup/pre-phase4-timeparser-<timestamp>
git switch main
```

## Latest Commit

| 提交 | 说明 |
|---|---|
| `b764476` | 仓库初始化 |
| `ce56c9b` | Phase 1 主体：建立产品与施工文档体系 |
| `9d693c1` | Phase 1 补记：handoff 提交号 |
| `6a977fb` | Phase 2 主体：建立远端回滚点并整理仓库环境 |
| `8eca9a5` | Phase 2 补记：handoff 提交号与推送状态 |
| `47b50fb` | Phase 3 主体：冻结解析器能力边界（含 SUPPORTED_EXPRESSIONS.md） |

> 说明：HANDOFF 无法记录**包含它自己**的提交号。因此每个阶段的提交号由紧随其后的
> 一个补记提交填入 —— Phase 1 是 `9d693c1`，Phase 2 是 `8eca9a5`，Phase 3 同理。

## Push Status

**已推送。**

```
To https://github.com/ayer-TANG/practice
   8eca9a5..47b50fb  main -> main
```

## Working Tree

预期状态：**干净。**

## Risks

| 风险 | 严重度 | 说明与缓解 |
|---|---|---|
| **A-001 ~ A-005 五条假设全部未验证** | 高 | 其中 A-001（真实任务句是否含可识别词）与 A-004（是否接受手动补漏）直接决定产品成立与否。Phase 8 用真实记录验证 |
| **支持清单未经真实语料检验** | 高 | 69 条支持表达基于判断而非数据。可能过宽（写了很多没人用的表达）或过窄（漏了常用的）。Phase 8 核对 |
| 纯规则召回率未知 | 高 | 产品的根本风险。已在 `README.md`、`SUPPORTED_EXPRESSIONS.md` 第 5 节如实声明 |
| 「尽快」映射是可辩论的 | 中 | D-010 把「尽快」定为今天 23:59。`fuzzy` 标记是缓解，不是解决。若用户期望不同，改 D-010 即可 |
| **仓库改名挂起** | 中 | 文档与事实目前一致（都写 `practice`），但"想改未改"的状态一直挂着。不阻塞开发 |
| 领域层纯度易被破坏 | 中 | 写 `timeParser` 时最容易顺手用 `new Date()` 读当前时间。**必须只接受注入的 `now`**，否则测试会在跨日时随机失败 |
| `.gitattributes` 影响其他克隆 | 低 | 若用户在别处有克隆，`eol=lf` 可能触发重规范化。当前已知只有本机一份 |

## Handoff Quality Test

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

自评：**能。** 下一步写什么、按哪份规格写、测试载体怎么建（D-009 给了完整做法）、
哪些表达该支持、哪些该返回 `null`、最容易踩哪个坑（领域层读系统时间），
均有明确记载。唯一需要外部动作的是仓库改名，已写明原因与执行路径。
