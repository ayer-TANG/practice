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

**Phase 5 完成 —— 领域层已全部实现**，`node --test` → 315 passed。
`parse(text, now) => Task[]` 能跑出排好序的任务列表。
但 `index.html` **仍只是骨架**——界面代码一行都没有，**产品现在还不能用**。

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
