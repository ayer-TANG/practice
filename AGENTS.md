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
**Phase 8 进行中：真实数据验收**（`node --test` → **417 passed**）。
功能面自 Phase 7 起已完整；本阶段在**用真实语料验证产品到底有没有用**。

**进度：10 组语料已全部跑完，词表补齐轮（F8-9 / F8-15）也已完成。**
累计暴露 15 处问题，其中 **7 处已修**：

- **已修**：①「日期（星期几）时刻」这种写法时刻被丢弃；②「时段词 + 冒号时刻」
  （`下午16:00`）完全不解析；③**日期段自带的约定时刻吞掉显式时间点**
  （`今晚24点截止` 算成今天 20:00、`明天早上8点` 算成 09:00）；④**带年份的
  数字日期 `YYYY-MM-DD` 整段落空**（`2026-03-20` 被读成 `2027-03-20`，静默错值）；
  ⑤**已过的月日顺延到下一年**（`F8-6`，三次复现后由用户决策：**改为视为逾期，不回卷**，
  界面加「已过期」标记）；⑥**动作词表按频率补齐 15 词**（`F8-9`，56 → 71 词）；
  ⑦**`越快越好` 补进 §1.E**（`F8-15`）。
  ①②④⑥⑦是**规格缺口**，③⑤是**规格错误**（规格自己写错了）。
  七处都已三处同步（代码 / `SUPPORTED_EXPRESSIONS.md` / 测试），§1 总数 **69 → 76**，
  §4 总数 **38 → 71**。
- **未修（按排除项记入 backlog）**：否定语境取到被否定的日期、起止窗口取到开始端、
  `24:00` 冒号写法被拒、裸「晚」不是时段词、日期段 + 无具体时刻的时段词（`周三上午`）、
  多行单条消息导致整条漏检、小标题误检、编号步骤被拆碎。
  详见 `docs/construction/DEV_PROGRESS.md` 的 Phase 8 一节。

**10 组的关键数字（`now` = 2026-01-05 口径，隔离跨年顺延）**：清单内时间解析
**≈97%（33/34）**、**清单外表达 ≈29%（14/48）**。
**必须带两条警告引用这些数字**：①分类含主观判断；②本批是显式日期的行政通知，
**对解析器太友好**，97% 不能外推到口语型聊天。清单外那 29% 才是产品真正的缺口。

**任务识别（F8-9 词表轮复测，口径已换，不可与旧数相减）**：补词前 82 行命中
**44 行（53.7%）**，补词后 **66 行（80.5%）**；新增命中的 22 行**逐行核对全部是真任务**。
按人工标注计（82 行里真任务 70、非任务 12）：**召回 ≈90%（63/70）、误检 ≈4.5%（3/66）**。
3 处误检已逐条记录：一条以「同学:」结尾的称呼语（命中「完成」，同 F8-4）、
一条向下属单位提要求的行政通知（**他人的任务**）、一条放假安排通知（命中「安排」）。
> ⚠️ 这组数字**换过口径**：早先的「召回 ≈60%」是在**第 3–10 组子集**、按另一套
> 标注基准算的。两者**不可直接相减**。而且 —— **16 行仍未命中，其中 7 行是真任务**，
> 那 7 行才是当前的召回缺口。

**Assumption Register：A-001 保持「部分成立，方向偏弱」，本轮不动。**
理由不是保守，是**本轮召回回升是在同一样本上校准出来的（in-sample）**——
15 个新词就是从这 10 组语料里长出来的。**用它来验证 A-001 等于用训练集当测试集。**
要真正更新 A-001，得用**第 11 组起的独立语料**复测，并记录召回是否回落。
**其余五条状态一律未变**（数据不足，不强行更新等于不伪造验证）。

**三处未闭合项（自 Phase 6/7 起，仍未闭合）：**
1. **浏览器中的真实行为未验证**（本机无法启动浏览器）。渲染、状态与导出链路
   用一次性 DOM 桩验证过（11 组 41 项全通过，脚本有意不进仓库），两者不是一回事。
   **Phase 8 新增的「删除上次粘贴」另加一次性探针 10 组 28 项**，做过变异检验；
   但它依赖 `paste` 之后的 `input` 事件时序，**这一点只有真实浏览器能证**。
2. **`file://` 下剪贴板能不能用，不知道。** 三级链路都实现了，但哪一级生效没实测。
3. **成功标准 1/3 仍未达成可结论的度量**——标准 2 虽已过 80% 阈值，但有上述两重警告。
   标准 1 与 3 需真实浏览器交互。

**下一步：** ①标准 1/3 需用户在浏览器里实测（清单见 `progress/layers/02-ui.md` 与
`03-delivery.md`，另需看一眼新的「已过期」徽章、走一遍「删除上次粘贴」的四条清单）；
②F8-11/F8-12 同源（都出在 §0「取最靠左」），需一次规格决策后再动；
③A-001 的样本外复测需要**新的真实语料**。
**真实语料不得提交进仓库**（见 Prohibitions）——放临时目录或直接粘贴到对话里。

**阶段范围被用户指令越过一次，是有记录的**：「删除上次粘贴」是 Phase 8 进行中
用户提出的**新功能**，而 Phase 8 的 Excluded 写着「新功能」。之所以做，是因为本文件
最上面的 Instruction Priority 第 1 条（用户最新明确指令）。**别据此认为排除项失效**——
下一次新功能仍要先问。四处已留记录：`HANDOFF.md`、`PRODUCT_REQUIREMENTS.md` 首发范围
第 7 条、`DEV_PROGRESS.md` 本轮 Start Plan、`LOG.md` 本轮条目。

**「已过期」标记只在屏幕，不进 Markdown 导出**——交付层是 `tasks` 的纯函数，没有 `now`。
要一致就得改 `renderMarkdown` 的签名（牵动 53 条测试），属 Phase 8 排除项，另开一轮。
**这个不对称是有意的，不是遗漏。**

仓库改名 `practice` → `zhaiwu` **已完成**（用户于 2026-10-09 在网页端执行 R-1，
agent 已执行 R-2 与 R-3）。仅剩 R-4（本地目录改名，待 Phase 9，属物理约束）。

**代码不得写错块。** `<script id="zhaiwu-domain">` 的纯度静态检查只扫描该块，
混入 UI 代码会让「不出现 document」「不自己读当前时间」两条检查失败；
`clipboard` / `Blob` / `createObjectURL` 不得出现在 `<script id="zhaiwu-delivery">`
块，那属于 UI 层，`delivery.test.mjs` 里有静态检查锁死。

改动作词表（`SUPPORTED_EXPRESSIONS.md` §4）时必须三处同步：代码、该文档、测试里的数量断言。
纪律是：**已知误检与已知漏检都写成断言，不写成注释**——
否则词表变化导致行为反转时，没有任何东西会提醒你。

**补词的判据是「歧义代价」，不是「出现次数」。** F8-9 词表轮把这条跑通了：
先补 15 个语义单一的词，再回头评估剩下的——`办`/`做完`/`考`/`集合` 的**边际收益直接归零**
（已被新词覆盖），`提` 的边际**全是误检**。**词表校准到此收敛**，
细节与逐词数据见 `SUPPORTED_EXPRESSIONS.md` §4「已知漏检」。

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
