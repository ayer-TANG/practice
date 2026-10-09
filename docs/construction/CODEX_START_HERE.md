# CODEX_START_HERE

给任何接手的 AI agent（Codex CLI / Claude Code / 其他）的入口文件。

**如果你只有时间读一份文档，读这个。**

---

## 这是什么项目

**摘务**：把一段聊天记录粘进网页，自动抽出「要做什么 + 什么时候前做完」，按紧急度排好序。

关键约束：
- 纯前端、**单个 HTML 文件**、零依赖、零构建、完全离线
- 识别用**规则（正则 + 词表）**，不用大模型
- 因为规则会漏，所以产品定位是**辅助筛子**：规则负责筛，用户手动兜底

## 当前状态（一句话）

**Phase 8 进行中 —— 真实数据验收**（功能面自 Phase 7 起已完整），`node --test` → 417 passed。
`index.html` 现在可双击打开并实际使用：粘贴（粘错了点「删除上次粘贴」整段退回）→ 抽取
→ 分组结果 → 手动补漏 → 删除误判 → 复制/下载 Markdown。

**但三处未闭合**：浏览器里的**真实交互**从未验证（本机没有可交互的浏览器；
**静态渲染**已用无头 Edge 截图取证，见 `WORKFLOW.md` §5.1）；
`file://` 下剪贴板能不能用没实测；成功标准 1/3 仍未度量。
渲染、状态与导出链路另用 Node 里的 DOM 桩跑通（11 组 41 项；Phase 8 的
「删除上次粘贴」另加一次性探针 12 组 35 项），**这与真实交互不是一回事**。
手动验证清单在 `docs/construction/progress/layers/02-ui.md` 与 `03-delivery.md`，
须由用户执行。

**Phase 8 的语料目标（10 组真实聊天记录）已全部跑完**，累计暴露 15 处问题、
当场修复 7 处（含 F8-6：**已过的月日不再顺延到下一年，改为视为逾期**；
F8-9：**动作词表按频率补齐 15 词，56 → 71**）。
关键数字：清单内时间解析 ≈97%、清单外表达 ≈29%（带样本偏差警告）；
任务识别在词表补齐后 82 行命中 66 行（53.7% → 80.5%）。
**Assumption Register 的 A-001 保持「部分成立，方向偏弱」**——
本轮召回回升是**同一样本上校准出来的（in-sample）**，不能当作验证。

**下一个动作**：标准 1/3 需用户在浏览器里实测、F8-11/F8-12 的规格决策、
以及 A-001 的**样本外**复测（需要新的真实语料）。
**真实语料不得提交进仓库**。

## 必读顺序

1. `AGENTS.md` —— 指令优先级与禁令
2. `docs/construction/CODEX_MASTER_REQUIREMENTS.md` —— 施工顶层要求
3. `docs/product/PRODUCT_REQUIREMENTS.md` —— 产品真值（已冻结）
4. `docs/construction/ARCHITECTURE.md` —— 架构与边界
5. `docs/construction/LAYER_CONTRACT.md` —— 分层契约与依赖禁令
6. `docs/construction/CONSTRUCTION_PLAN.md` —— 阶段划分，找到当前阶段
7. `docs/construction/HANDOFF.md` —— 上一轮实际做到哪、下一步做什么

## 开工前必做

```bash
pwd
git branch --show-current
git status --short
git log --oneline --decorate -5
git remote -v
```

再加：

- 把本轮 start plan 追加到 `docs/construction/DEV_PROGRESS.md`
- 创建并推送 backup 分支（命名规范见 `GITHUB_ROLLBACK.md`）
- **不覆盖任何未知改动**

## 收工前必做

- 跑测试并把结果（含失败历史）记入 `LOG.md`
- 修正文档漂移
- 更新 `HANDOFF.md`
- 提交并推送
- 如实报告：Complete / Partially complete / Blocked

## 最容易犯的三个错

1. **越过当前 Phase**。`CONSTRUCTION_PLAN.md` 里每个阶段都有明确 Included / Excluded。
   不要把后面阶段的功能"顺手"实现掉。
2. **破坏领域层纯度**。领域层里出现 `document` / `window` / `fetch` / `localStorage` 就是架构漂移。
3. **把真实聊天记录写进仓库**。测试样例必须自己编造。这是隐私数据。

## 术语

| 词 | 含义 |
|---|---|
| 领域层 | 纯函数：`parse(text, now) => Task[]`。产品的心脏 |
| 抽取 | 从聊天文本里识别出任务句 |
| 补漏 | 用户在界面上手动把规则漏掉的句子加进任务列表 |
| 辅助筛子 | 本产品的自我定位：不追求全自动，追求"少漏 + 好兜底" |
