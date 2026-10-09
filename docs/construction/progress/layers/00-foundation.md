# 00 — Foundation

项目地基：文档体系、仓库约定、Git 流程。不含应用代码。

## 状态

**已完成**（Phase 1 建立，Phase 2–3 增补；2026-10-09）

## 职责

- 维护 `AGENTS.md` 与全套施工文档的准确性
- 维护 Git 流程与回滚策略
- 保证文档之间不矛盾、不指向不存在的文件
- 保证新 agent 能独立接手

## 已完成

- 产品真值落盘：`docs/product/PRODUCT_REQUIREMENTS.md`（已签字冻结）
- 施工顶层要求：`docs/construction/CODEX_MASTER_REQUIREMENTS.md`
- 架构与分层契约：`ARCHITECTURE.md`、`LAYER_CONTRACT.md`
- 阶段划分：`CONSTRUCTION_PLAN.md`
- 工作流与工具策略：`WORKFLOW.md`、`TOOL_POLICY.md`
- Git 与回滚：`GITHUB_ROLLBACK.md`
- 测试基线：`TEST_METRICS.md`
- 进度与接力：`DEV_PROGRESS.md`、`LOG.md`、`HANDOFF.md`
- `README.md` 修正漂移（原自述为"练习代码仓库"）
- **远端回滚点**：`backup/pre-phase2-repo-setup-20261009-1745` → `9d693c1`（Phase 3–9 全程）
- `.gitignore` 忽略 `idea-to-production-vibecoding-main/`；`.gitattributes` 统一换行符为 LF
- **能力边界规格**：`SUPPORTED_EXPRESSIONS.md`（支持/不支持清单、组合上限、误检风险、验收方式）

## 未完成

- **仓库改名 `practice` → `zhaiwu`** —— 受阻于本机无 `gh` CLI，需用户在网页端执行
- 本地目录改名（Phase 9，物理约束）

## 依赖

无。本层是其余各层的前提。

## 测试

不适用。替代验证：文档交叉引用完整性、`git diff --check`。

## 扩展点

- 若引入多 agent 协作，在 `AGENTS.md` 中补充分工约定
- 若阶段数量变化，同步 `CONSTRUCTION_PLAN.md` 与 `HANDOFF.md`

## 风险

| 风险 | 说明 |
|---|---|
| 文档漂移 | 文档多、更新点分散。缓解：`WORKFLOW.md` 的「文档更新对照表」+ 收工必跑 Drift Checklist |
| Phase 编号歧义 | skill 的 Phase 编号与本项目 `CONSTRUCTION_PLAN.md` 的 Phase 编号不同。已在 `CONSTRUCTION_PLAN.md` 顶部声明以项目编号为准 |
