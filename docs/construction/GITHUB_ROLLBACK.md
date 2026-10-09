# GitHub Rollback

版本控制与回滚策略。

---

## 仓库事实

| 项 | 值 |
|---|---|
| remote `origin` | `https://github.com/ayer-TANG/practice`（**计划改为** `https://github.com/ayer-TANG/zhaiwu`） |
| 默认分支 | `main` |
| 远程类型 | HTTPS（非 SSH，无密钥读取需求） |
| 本地目录 | `D:\xuexi\war`（**计划改为** `D:\xuexi\zhaiwu`） |
| Git 身份 | `ayer-TANG <2057075942@qq.com>` |

## Baseline

| 记录时间 | Commit | 说明 |
|---|---|---|
| 2026-10-09 | `b764476` | 仓库初始化。Phase 0 的回滚点 |
| 2026-10-09 | `ce56c9b` | Phase 1 主体：建立产品与施工文档体系（20 files） |
| 2026-10-09 | `9d693c1` | Phase 1 补记：handoff 的提交号与推送状态 |
| 2026-10-09 | `6a977fb` | Phase 2 主体：建立远端回滚点并整理仓库环境 |
| 2026-10-09 | `8eca9a5` | Phase 2 补记：handoff 的提交号与推送状态 |
| 2026-10-09 | `47b50fb` | Phase 3 主体：冻结解析器能力边界（新增 `SUPPORTED_EXPRESSIONS.md`） |
| 2026-10-09 | `3d48ebe` | Phase 3 补记：handoff 的提交号与推送状态 |
| 2026-10-09 | `14afad0` | Phase 4 主体：实现 `timeParser` 并建立测试载体（第一行应用代码） |
| 2026-10-09 | `45d4d2d` | Phase 4 补记：handoff 的提交号与推送状态 |

## Backup Branches

| 分支 | 指向 | 推送时间 | 用途 |
|---|---|---|---|
| `backup/pre-phase2-repo-setup-20261009-1745` | `9d693c1` | 2026-10-09 17:45 | **Phase 3–9 全程回滚点**，文档体系完成、尚无代码的状态 |
| `backup/pre-phase4-timeparser-20261009-1844` | `3d48ebe` | 2026-10-09 18:44 | **写第一行应用代码之前**的最后状态 |
| `backup/pre-phase5-extractor-20261009-1900` | `45d4d2d` | 2026-10-09 19:00 | **领域层完成一半**：有 `timeParser`，无任务识别 |

已通过 `git ls-remote --heads origin` 确认分支存在于远端。

**都不得删除。** 三者是不同性质的还原点，不是重复：
`pre-phase2` 是本项目"应用代码出现之前"的唯一远端快照；
`pre-phase4` 是"仓库里还没有任何应用代码"时的最后一个快照；
`pre-phase5` 是"领域层只有时间解析"时的快照。

---

## 开工前必做

```bash
pwd
git rev-parse --is-inside-work-tree
git branch --show-current
git status --short
git rev-parse HEAD
git remote -v
git config --get user.name
git config --get user.email
git stash list
git ls-remote --heads origin
```

## 建立远端回滚点

每个阶段开始前：

```bash
git switch -c backup/pre-<phase>-<topic>-<timestamp>
git push -u origin backup/pre-<phase>-<topic>-<timestamp>
git switch main
```

**远端备份没成功就不要继续。**

命名示例：

```
backup/pre-phase4-timeparser-20261009-1740
backup/pre-phase6-ui-20261010-0930
```

**`backup/pre-phase2-repo-setup-20261009-1745` 是 Phase 3–9 全程的回滚点，不得删除。**

本地分支不是远端备份。

---

## 禁止操作（未经用户明确批准不得执行）

```bash
git reset --hard
git clean -fd
git clean -fx
git push --force
git push -f
git checkout -- <file>
git restore <file>
```

## 首选恢复方式

```bash
git revert <bad-commit>
```

批量回滚一个区间：

```bash
git revert <oldest-bad-commit>^..<newest-bad-commit>
```

理由：`revert` 生成新提交，保留完整历史；`reset --hard` 会抹掉证据。

## 未知改动的处理

`git status --short` 出现来源不明的改动时：

- 先识别文件内容
- 不覆盖
- 不自动 stage
- 未经批准不 stash
- 不把它们裹进本阶段的提交
- 绕开它们；若无法绕开则停下来问用户

`idea-to-production-vibecoding-main/` 已于 Phase 2 加入 `.gitignore`，
不再出现在 `git status` 中。若接手时它仍显示为未跟踪，说明 `.gitignore` 被改动过，需查清原因。

---

## Rename Queue

因 D-008（产品名同时用作仓库名与目录名），以下改名待办：

| # | 操作 | 执行者 | 状态 | 备注 |
|---|---|---|---|---|
| R-1 | GitHub 仓库改名 `practice` → `zhaiwu` | **用户（网页端）** | **待执行** | 本机 `gh: command not found`，agent 无法代执行。路径：仓库 Settings → Repository name。GitHub 会自动重定向旧地址 |
| R-2 | `git remote set-url origin https://github.com/ayer-TANG/zhaiwu.git` | agent | 待 R-1 | 紧随 R-1 |
| R-3 | 更新文档中所有 `practice` 引用 | agent | 待 R-1 | `AGENTS.md`、`GITHUB_ROLLBACK.md`、`PRODUCT_REQUIREMENTS.md`、`README.md`、`HANDOFF.md` |
| R-4 | 本地目录改名 `war` → `zhaiwu` | 用户 | 待 Phase 9 | **物理约束**：当前会话工作目录在该目录内，中途改名会让会话失效。收尾时由用户执行或用户批准后执行 |

**R-1 是当前唯一的挂起项。** 在它完成之前，本文件与 `AGENTS.md` 中的仓库 URL
刻意保持为 `practice`——文档必须与事实一致，不能比事实更超前。

---

## 提交规范

提交信息用中文描述做了什么、为什么。收工时禁止使用 `git add .`，
必须显式列出文件：

```bash
git add docs/construction/ARCHITECTURE.md docs/construction/LAYER_CONTRACT.md
```

提交前检查：

```bash
git status --short
git diff --check
git diff --stat
git diff
```

## SSH 安全

本项目使用 HTTPS remote，无需 SSH 密钥。

**不得读取**任何私钥文件（`~/.ssh/id_rsa`、`~/.ssh/id_ed25519` 等），
**不得**把密钥复制进仓库。

---

## 回滚判断表

| 情况 | 做法 |
|---|---|
| 单个提交引入 bug | `git revert <commit>` |
| 整个阶段作废 | `git revert` 该阶段全部提交（区间 revert） |
| 工作树混乱但未提交 | **停下来问用户**，不要 `reset --hard` |
| 远端被污染 | **停下来问用户**，不要 `push --force` |
| 误删文件且已提交 | `git revert` 或从 backup 分支取回 |
