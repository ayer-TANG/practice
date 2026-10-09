# Project Agent Instructions

## Project Identity
- Project: 摘务 (zhaiwu)
- Owner: ayer-TANG
- Brand: 摘务
- Repository: https://github.com/ayer-TANG/practice
  - 计划改名为 `zhaiwu`，见 `docs/construction/GITHUB_ROLLBACK.md` 的 Rename Queue

## Instruction Priority
1. 用户最新明确指令
2. `docs/construction/CODEX_MASTER_REQUIREMENTS.md`
3. `docs/product/PRODUCT_REQUIREMENTS.md`
4. 其他施工文档
5. 现有代码
6. agent 自己的偏好

低优先级项永远不能否决高优先级项。旧的实现不能推翻用户新的产品决定。

## Required Reading
1. `docs/construction/CODEX_START_HERE.md`
2. `docs/construction/CODEX_MASTER_REQUIREMENTS.md`
3. `docs/product/PRODUCT_REQUIREMENTS.md`
4. `docs/construction/ARCHITECTURE.md` 与 `docs/construction/LAYER_CONTRACT.md`
5. `docs/construction/HANDOFF.md`

## Start Rules
- 检查仓库与 Git 状态（命令清单见 `docs/construction/WORKFLOW.md`）
- 把本轮 start plan 追加到 `docs/construction/DEV_PROGRESS.md`
- 创建并推送 backup 分支
- 不覆盖任何未知改动

## Finish Rules
- 运行测试；失败与修复过程一并记入 `docs/construction/LOG.md`
- 修正文档漂移
- 更新 `docs/construction/HANDOFF.md`
- 提交并推送
- 如实报告状态（Complete / Partially complete / Blocked）

## Current Phase
Phase 4 完成：领域层 `timeParser` 已实现并有测试覆盖（`node --test` → **130 passed**）。
交付物 `index.html` 与测试载体 `tests/` 均已建立。**UI 层仍为空壳。**

Phase 2 仍有一项挂起：仓库改名 `practice` → `zhaiwu`（本机无 `gh` CLI，需用户在网页端执行，
见 `GITHUB_ROLLBACK.md` 的 Rename Queue）。**它不阻塞后续阶段。**

下一步：Phase 5 —— `taskExtractor` + `sorter` + `parse` 组装。
写代码前先读 `SUPPORTED_EXPRESSIONS.md`（§4 动作词表）——它是实现的规格来源，不得凭感觉写规则。

**测试命令是 `node --test`，不是 `node --test tests/`。**
后者在 Node 24 下报 `MODULE_NOT_FOUND`（位置参数被当作模块入口）。详见 `TEST_METRICS.md`。

> 阶段编号以 `docs/construction/CONSTRUCTION_PLAN.md` 为准。它与 skill
> `idea-to-production-vibecoding` 自身的 Phase 编号**不一致**，引用时不要混淆。

## Prohibitions
- 禁止 `git push --force`
- 禁止 `git reset --hard`、`git clean -fd`、`git checkout -- <file>`、`git restore <file>`
- 禁止伪造测试结果：未建立的测试一律写 `Not established`，不得写 `Passed`
- 禁止提交密钥、token、或任何私密信息
- 禁止把真实聊天记录写进仓库（测试样例必须自行编造）
- 禁止在文档中隐藏未解决的假设
