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
**Phase 8 进行中：真实数据验收**（`node --test` → **377 passed**）。
功能面自 Phase 7 起已完整；本阶段在**用真实语料验证产品到底有没有用**。

**进度：10 组语料里已完成 1 组。** 本组暴露 6 处问题，其中 2 处当场修复：

- **已修（都是规格缺口，不是实现偏差）**：①「日期（星期几）时刻」这种写法时刻被丢弃；
  ②「时段词 + 冒号时刻」（`下午16:00`）完全不解析。两处都已三处同步
  （代码 / `SUPPORTED_EXPRESSIONS.md` / 测试），§1 总数 69 → 74。
- **未修（按排除项记入 backlog）**：多行单条消息导致整条漏检、小标题误检、
  编号步骤被拆碎、**已过的月日顺延到下一年**（这一条是**规格本身错了**，不是代码）。
  详见 `docs/construction/DEV_PROGRESS.md` 的 Phase 8 一节。

**Assumption Register 未更新**——1 组样本不足以改变任何一条的状态，
强行更新等于伪造验证。**A-001 的初步信号偏弱。**

**三处未闭合项（自 Phase 6/7 起，仍未闭合）：**
1. **浏览器中的真实行为未验证**（本机无法启动浏览器）。渲染、状态与导出链路
   用一次性 DOM 桩验证过（11 组 41 项全通过，脚本有意不进仓库），两者不是一回事。
2. **`file://` 下剪贴板能不能用，不知道。** 三级链路都实现了，但哪一级生效没实测。
3. **成功标准 1/2/3 仍未达成可结论的度量**——需要真实浏览器交互与更多语料。

**下一步：需要用户再提供 9 组真实语料**，方可完成 Phase 8 的度量。
在此之前 agent 无法独自推进。**真实语料不得提交进仓库**（见 Prohibitions）——
放临时目录或直接粘贴到对话里。

仓库改名 `practice` → `zhaiwu` **已完成**（用户于 2026-10-09 在网页端执行 R-1，
agent 已执行 R-2 与 R-3）。仅剩 R-4（本地目录改名，待 Phase 9，属物理约束）。

**代码不得写错块。** `<script id="zhaiwu-domain">` 的纯度静态检查只扫描该块，
混入 UI 代码会让「不出现 document」「不自己读当前时间」两条检查失败；
`clipboard` / `Blob` / `createObjectURL` 不得出现在 `<script id="zhaiwu-delivery">`
块，那属于 UI 层，`delivery.test.mjs` 里有静态检查锁死。

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
