# GitHub Rollback

版本控制与回滚策略。

---

## 仓库事实

| 项 | 值 |
|---|---|
| remote `origin` | `https://github.com/ayer-TANG/zhaiwu`（2026-10-09 由 `practice` 改名而来） |
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
| 2026-10-09 | `e6599cd` | Phase 5 主体：实现 `taskExtractor` / `sorter` / `parse`，**领域层完成** |
| 2026-10-09 | `42dc887` | Phase 5 收工（含仓库改名 R-2/R-3 的文档收尾） |

## Backup Branches

| 分支 | 指向 | 推送时间 | 用途 |
|---|---|---|---|
| `backup/pre-phase2-repo-setup-20261009-1745` | `9d693c1` | 2026-10-09 17:45 | **Phase 3–9 全程回滚点**，文档体系完成、尚无代码的状态 |
| `backup/pre-phase4-timeparser-20261009-1844` | `3d48ebe` | 2026-10-09 18:44 | **写第一行应用代码之前**的最后状态 |
| `backup/pre-phase5-extractor-20261009-1900` | `45d4d2d` | 2026-10-09 19:00 | **领域层完成一半**：有 `timeParser`，无任务识别 |
| `backup/pre-phase6-ui-20261009-1913` | `42dc887` | 2026-10-09 19:13 | **写第一行界面代码之前**：领域层完整，界面一行都没有 |
| `backup/pre-phase7-delivery-20261009-2010` | `787a6e7` | 2026-10-09 20:10 | **交付层一行代码都没有之前**：结果出不去网页时的状态 |
| `backup/pre-phase8-realdata-20261009-1947` | `dda1ae9` | 2026-10-09 19:47 | **真实数据验收开始之前**：功能已完整、未用真实语料验证 |
| `backup/pre-phase8-g02-20261009-2105` | `b83b614` | 2026-10-09 21:05 | **F8-7 修复之前**：第 1 组已记录、`今晚`「明早」仍会吞掉显式时间点 |
| `backup/pre-phase8-g03-10-20261009-2012` | `c131006` | 2026-10-09 20:12 | **F8-10 修复之前**：带年份的数字日期仍会被丢弃年份、静默跳到下一年 |
| `backup/pre-phase8-g06-20261009-2015` | `83ba9ed` | 2026-10-09 20:15 | **F8-6 修复之前**：已过的月日仍会被静默改成明年 |
| `backup/pre-phase8-g0915-20261009-2023` | `f564fb3` | 2026-10-09 20:23 | **F8-9 词表补齐之前**：动作词表仍是 56 词，`越快越好` 仍不被识别为紧迫 |
| `backup/pre-phase8-undo-paste-20261009-2105` | `26bde23` | 2026-10-09 21:19 | **粘贴区「删除上次粘贴」之前**：粘错了只能手工清空 |
| `backup/pre-phase8-btn-visible-20261009-2145` | `645e128` | 2026-10-09 21:45 | **禁用态可见性修复之前**：按钮在 DOM 里、逻辑也对，但 `opacity: .45` 让它**看不见** |

已通过 `git ls-remote --heads origin` 确认十二个分支均存在于远端。

**都不得删除。** 十二个是不同性质的还原点，不是重复：
`pre-phase2` 是本项目"应用代码出现之前"的唯一远端快照；
`pre-phase4` 是"仓库里还没有任何应用代码"时的最后一个快照；
`pre-phase5` 是"领域层只有时间解析"时的快照；
`pre-phase6` 是"领域层完整但产品完全不可用"时的快照——
**产品从"能跑的库"变成"能用的工具"的那条分界线**；
`pre-phase7` 是"界面能用但结果出不去"时的快照——**产品从"能用"变成"可交付"的那条分界线**；
`pre-phase8-realdata` 是"功能齐了但没用真实数据验过"时的快照——
**产品从"可交付"走向"确证有用"的起点**；
`pre-phase8-g02` 是"F8-7 修复之前"的快照——**时间解析开始被真实语料纠正之前**；
`pre-phase8-g06` 是"F8-6 修复之前"的快照——**月日回卷这个静默错值被消除之前**；
`pre-phase8-g0915` 是"F8-9 词表补齐之前"的快照——**动作词表还是「拍脑袋 56 词」时的状态**（此后每个词都有语料频次支撑）；
`pre-phase8-undo-paste` 是"用户直令的新功能落地之前"的快照——**功能面被阶段范围之外的一次指令改动之前的最后一个状态**；
`pre-phase8-btn-visible` 是"禁用态可见性修复之前"的快照——**「代码全绿但用户看不见」这个状态本身值得留档**：它是一次用户反馈的起点，也是「桩测试全过 ≠ 能用」的实物证据。

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
| R-1 | GitHub 仓库改名 `practice` → `zhaiwu` | 用户（网页端） | ✅ **2026-10-09** | 本机 `gh: command not found`，agent 无法代执行。GitHub 自动重定向旧地址 |
| R-2 | `git remote set-url origin https://github.com/ayer-TANG/zhaiwu.git` | agent | ✅ **2026-10-09** | 已用 `git fetch` + `git rev-list --left-right --count` 验证同步 |
| R-3 | 更新文档中所有 `practice` 引用 | agent | ✅ **2026-10-09** | 当前事实性引用已改；历史日志（`LOG.md`、`DEV_PROGRESS.md` 的完成记录）按「不删除历史条目」原则保留原文 |
| R-4 | 本地目录改名 `war` → `zhaiwu` | 用户 | **待 Phase 9** | **物理约束**：当前会话工作目录在该目录内，中途改名会让会话失效。收尾时由用户执行或用户批准后执行 |

**R-1 的完成是被 agent 发现的，不是被通知的**：Phase 5 推送时远端回显了
`remote: https://github.com/ayer-TANG/zhaiwu.git`。随后用 `git ls-remote` 对新旧两个
地址各取一次 refs——两者的提交哈希完全一致，且新地址上有刚推送的提交——
只可能是「同一仓库 + 旧地址重定向」。**确认后才动的文档。**

**现在只剩 R-4。**

## 改名后的历史说明

本文件、`LOG.md`、`DEV_PROGRESS.md` 中仍会出现 `practice` 字样，分两种情况：

| 情况 | 处理 |
|---|---|
| 描述**当时**发生了什么（日志、决策记录、阶段完成记录） | **保留原文**。历史不得改写 |
| 描述**当前**仓库地址 | 已全部改为 `zhaiwu` |

看到 `practice` 时先判断它属于哪一类，不要一律替换。

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
