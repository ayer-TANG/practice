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
