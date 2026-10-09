# 04 — Testing & Deployment

## 状态

测试：**已建立，315 passed / 0 failed**（Phase 5）
部署：**未开始**

## 测试

### 当前基线

`node --test` → **315 passed / 0 failed**。

已建立的部分覆盖**整个领域层**（7 个导出）。UI 层、交付层、真实数据度量仍未建立。
详见 `TEST_METRICS.md`。

> **命令写法**：`node --test tests/` **不成立**（Node 24 下位置参数被当作模块入口）。
> 用零参数的 `node --test`。Phase 1–3 文档里写的目录形式已在 Phase 4 全部改正。

### 载体

| 载体 | 说明 |
|---|---|
| `node --test` | Node 内置测试运行器，零依赖。见上方关于命令写法的说明 |
| `node:assert` | Node 内置断言库 |
| `tests/load-domain.mjs` | 测试引导：从 `index.html` 提取领域层（D-009）；导出 `toLocal()` 处理跨 realm 断言 |
| `git diff --check` | 每轮必跑，检查空白字符错误 |

不引入 Jest / Vitest / Mocha / Playwright——违反零依赖原则。
不引入 `package.json`：`node --test` 零配置可用，加了反而多一个要维护的文件。

### 永久保持 Not established 的项

- **lint**：不引入 ESLint（零依赖原则）
- **typecheck**：项目不使用 TypeScript
- **build**：项目无构建步骤，这是刻意设计而非缺失

### 覆盖分工

| 层 | 测试方式 | 现状 |
|---|---|---|
| 领域层 | 自动化单元测试（纯函数，Node 直接跑） | **已全部覆盖**（Phase 5） |
| 交付层 `renderMarkdown` | 自动化单元测试（纯函数） | 待 Phase 7 |
| UI 层 | **人工验证**，如实记录为"人工验证"而非"通过" | 待 Phase 6 |
| 复制 / 下载 | 人工验证 | 待 Phase 7 |

### 关键约束

- 时间解析测试必须显式注入 `now`，不得依赖真实当前时间
- 必须包含反向用例（「收到」不得被判为任务）
- **已知误检与已知漏检都写成断言，不写成注释**（Phase 5 确立）——
  注释不会在行为反转时报警，断言会
- **跨 realm 断言必须过 `toLocal()`**（`tests/load-domain.mjs`）。领域层跑在 `node:vm` 里，
  `deepStrictEqual` 比较原型的会失败；`instanceof` 同样失效。见 `TEST_METRICS.md`
- 样例自行编造，**禁止真实聊天记录**
- **跨 realm 陷阱**：领域层跑在 `node:vm` 里，它抛出的 `TypeError` 与测试文件的
  `TypeError` 不是同一个构造器。因此 `assert.throws(fn, TypeError)` 会失败
  （`instanceof` 跨 realm 不成立），改用匹配错误信息。领域层也**不得**用
  `x instanceof Date` 判断入参——同样跨 realm 不成立，用鸭子类型。

## 部署

### 目标形态

静态文件。无后端、无构建产物。

主要交付方式：**本地双击 `index.html`**。

可选：GitHub Pages 托管。因无构建步骤，直接托管源文件即可。

### 当前状态

未开始。计划在 Phase 9。

### 部署前检查

- [ ] 在干净的环境（无本机缓存）下双击 `index.html` 可用
- [ ] 断网状态下全部功能可用
- [ ] 无任何外部资源引用（字体、脚本、样式）
- [ ] 若启用 Pages，验证线上地址可用
- [ ] 无密钥、无隐私数据进入仓库

### 非目标

- 自定义域名
- CI/CD 流水线
- 构建产物发布

## 扩展点

- 若 UI 复杂度上升，考虑引入浏览器端 E2E（需先问用户，违反零依赖原则）
- 若将来引入构建步骤，`ARCHITECTURE.md` 的 Stack 与本文档需同步更新

## 风险

| 风险 | 说明 |
|---|---|
| 假设 A-005 未验证 | 单文件是否够用未验证。若代码量涨到必须拆分，测试载体与部署方式都要调整 |
| `file://` 与剪贴板 API | 见 `03-delivery.md`。可能是唯一一个"本地能用但托管后行为不同"的差异点 |
