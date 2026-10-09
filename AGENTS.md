# Project Agent Instructions

## Project Identity
- Project: 摘务 (zhaiwu)
- Owner: ayer-TANG
- Brand: 摘务
- Repository: https://github.com/ayer-TANG/zhaiwu
  - 已于 2026-10-09 由 `practice` 改名而来，`origin` 已同步。见 `docs/construction/GITHUB_ROLLBACK.md` 的 Rename Queue
- Local directory: `D:\xuexi\war`（**计划改为** `D:\xuexi\zhaiwu`，R-4，待 Phase 9）

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
Phase 5 完成：**领域层已完成**（`node --test` → **315 passed**）。
`parse(text, now) => Task[]` 已可用，端到端能跑出排好序的任务列表。
**但产品仍不可用**——`index.html` 里没有一行界面代码，只有领域层和一行占位文字。

仓库改名 `practice` → `zhaiwu` **已完成**（用户于 2026-10-09 在网页端执行 R-1，
agent 已执行 R-2 与 R-3）。仅剩 R-4（本地目录改名，待 Phase 9，属物理约束）。

下一步：Phase 6（UI 层）——粘贴区、抽取按钮、结果列表、手动补漏、误检删除。
动手前先读 `LAYER_CONTRACT.md` 的 UI 层一节：**UI 层不得内嵌任何正则或词表**，
识别规则只允许存在于领域层。

改动作词表（`SUPPORTED_EXPRESSIONS.md` §4）时必须三处同步：代码、该文档、测试里的数量断言。
本轮确立的纪律是：**已知误检与已知漏检都写成断言，不写成注释**——
否则词表变化导致行为反转时，没有任何东西会提醒你。

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
