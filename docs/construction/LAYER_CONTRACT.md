# Layer Contract

分层契约。任何代码若违反本文件的依赖规则，即视为架构漂移，必须在收工前修正。

---

## 依赖方向（单向，不可逆）

```
UI 层 ──→ 领域层 ──→ (无外部依赖)
  │
  └───→ 交付层 ──→ 领域层的 Task 类型
```

允许的调用：UI → 领域、UI → 交付、交付 → Task 类型。
**禁止**：领域 → UI、领域 → 交付、交付 → UI、任何反向或环形依赖。

---

## UI 层

| 项 | 内容 |
|---|---|
| 职责 | 渲染粘贴区、抽取按钮、结果列表、补漏输入框、删除操作、复制/下载按钮；采集原始文本；读取并传递 `now` |
| 允许依赖 | 领域层（`parse`、`sorter`、`makeTask`）、交付层（`renderMarkdown`、`copyToClipboard`、`downloadMarkdown`） |
| 禁止依赖 | **不得内嵌解析规则**——正则表达式与词表只允许存在于领域层 |
| 现状 | **已完成**（Phase 6）；复制/下载按钮待 Phase 7。代码在 `<script id="zhaiwu-ui">` 块内 |
| 扩展点 | 迁移到 React 时只重写本层；领域层与交付层原样保留 |

**判定标准**：若在 UI 层代码里能看到 `/\d+月\d+日/` 这类模式，即为违规。

**代码放置**：UI 层必须是**独立的 `<script id="zhaiwu-ui">` 块**，
不得写进 `<script id="zhaiwu-domain">`——领域层纯度静态检查只扫描后者，
混入 UI 代码会让「不出现 `document`」「不自读系统时间」两条检查失败。

## 领域层（核心）

| 项 | 内容 |
|---|---|
| 职责 | 定义 `Task`；`taskExtractor` 识别候选任务句；`timeParser` 解析时间表达；`sorter` 排序与分组；对外只暴露 `parse(text, now) => Task[]` |
| 允许依赖 | 仅 JavaScript 内置能力 |
| 禁止依赖 | **`document`、`window`、`fetch`、`localStorage`、任何 DOM API、任何 UI 概念、任何网络调用** |
| 现状 | **已完成**（Phase 5）。导出 `timeParser` / `timeParserDetail` / `isTaskLine` / `taskExtractor` / `makeTask` / `sorter` / `parse`，7 项均有测试覆盖 |
| 扩展点 | `parse` 契约不变的前提下，内部实现可整体替换为 LLM 解析器 |

**判定标准**：本层必须能在 Node 中直接运行并通过全部测试。做不到即违规。

**子模块边界**：

- `taskExtractor`：只负责"这一段里哪些行是任务"，不负责解析时间。
  其原语是 `isTaskLine(line) => boolean`。`parse` 用原语而不用 `taskExtractor`，
  是为了保住**行号**——`Task.id` 是 `'r' + 行号`，UI 删除时要靠它跟原文对上
- `timeParser`：只负责"这个时间表达对应哪个绝对时间"，不判断是否任务
- `sorter`：只负责排序与分组，不改写 `Task` 内容
- `makeTask`：只负责把入参规范成 `Task` 形状，不做任何判断。
  导出它是为了让 UI 层做手动补漏时不必手搓对象（少字段会静默出错）

四者互不调用，由 `parse` 组合。这样每一项都能独立测试。

## 交付层

| 项 | 内容 |
|---|---|
| 职责 | `renderMarkdown(tasks) => string`；复制到剪贴板；下载 `.md` |
| 允许依赖 | 领域层的 `Task` 类型（只读使用） |
| 禁止依赖 | **不得被领域层依赖**；不得修改 `Task` |
| 现状 | **已完成**（Phase 7）。`renderMarkdown` 在 `<script id="zhaiwu-delivery">` 块内；复制/下载在 UI 层 |
| 扩展点 | 新增导出格式只需新增 renderer，不动领域层 |

**判定标准**：`renderMarkdown` 应当是纯函数（字符串进、字符串出），只有"复制/下载"这两个动作触碰浏览器 API。

**分工在实现时的落点**：

| 部分 | 在哪 | 为什么 |
|---|---|---|
| `renderMarkdown` | `<script id="zhaiwu-delivery">` | 纯函数，可被 `node --test` 提取测试 |
| 复制 / 下载 | `<script id="zhaiwu-ui">` | 要碰 `navigator.clipboard` / `Blob` / `URL`，只能人工验证 |

交付层块有一条静态检查：**不得出现 `clipboard`、`Blob`、`createObjectURL`**。
这三个一出现就说明职责越界了。

## 数据层 / 认证层 / 存储层 / 集成层

**本版不存在，且不得被引入。**

| 层 | 不存在的理由 | 何时才需要 |
|---|---|---|
| 数据层 | 用户明确选择不做持久化（non-goal） | 若 v2 要保留历史，插 localStorage——但必须在领域层之外 |
| 认证层 | 单用户、无账号、无共享 | 若 v2 要做多设备同步 |
| 存储层 | 无文件/对象存储需求 | 不会需要 |
| 集成层 | 运行时零网络请求 | 若 v2 要推送到第三方待办 |

> 引入以上任何一层的代码，都属于越界。发现有人（包括 AI）在实现它们，停下来问用户。

## 测试边界

| 项 | 内容 |
|---|---|
| 职责 | 覆盖领域层三个子模块的纯函数行为，含正向与反向用例 |
| 允许依赖 | 领域层（按 D-009：`node:vm` 从 `index.html` 提取代码块求值） |
| 禁止依赖 | DOM；不得测试 UI 渲染（本版人工验证） |
| 现状 | **已建立 —— 368 passed / 0 failed**（领域层 315 + 交付层 53） |
| 扩展点 | 若 UI 层复杂度上升，再考虑引入浏览器端 E2E |

**测试载体**：Node 内置 `node:test` + `node:assert`，命令行 **`node --test`**。

> 不是 `node --test tests/`——Node 24 下位置参数被当作模块入口，报 `MODULE_NOT_FOUND`。
> 详见 `TEST_METRICS.md`。

不引入任何测试框架依赖。

---

## 层状态总览

| 层 | 状态 | 计划在哪个阶段实现 |
|---|---|---|
| 领域层 | **已完成**（Phase 5） | — |
| UI 层 | **已完成**（Phase 6 UI + Phase 7 导出按钮）；浏览器行为待人工验证 | — |
| 交付层 | **已完成**（Phase 7）；`renderMarkdown` 有测试，复制/下载待人工验证 | — |
| 测试边界 | **已建立**（368 passed：领域层 315 + 交付层 53） | 每阶段同步扩充，不等实现完再补 |
| 其余四层 | N/A | 不会实现 |
