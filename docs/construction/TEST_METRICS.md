# Test Metrics

**当前测试基线：`368 passed / 0 failed`（`node --test`）**

领域层三个子模块（`timeParser` / `taskExtractor` / `sorter`）与组装函数 `parse`
的单元测试已全部建立并通过（315）。交付层的 `renderMarkdown` 纯函数测试已建立（53）。
UI 层的**渲染与状态**另用一次性 DOM 桩在 Node 中验证过
（**脚本有意不进仓库，不计入上表基线**）。浏览器行为与真实数据度量仍未建立
——见下方「未建立项」。

最后更新：2026-10-09（Phase 7）

---

## 现状

| 项 | 状态 |
|---|---|
| 测试框架 | `node --test`（Node 内置，零依赖） |
| 测试文件 | `tests/time-parser.test.mjs`、`tests/task-extractor.test.mjs`、`tests/parse.test.mjs`、`tests/delivery.test.mjs` |
| 测试引导（不匹配测试命名，不被采集） | `tests/load-block.mjs`、`tests/load-domain.mjs`、`tests/load-delivery.mjs` |
| 测试命令 | `node --test` |
| **通过 / 失败** | **368 / 0** |
| lint | **Not established** |
| typecheck | **Not established**（项目不使用 TypeScript） |
| build | **Not established**（项目无构建步骤——这是刻意设计，不是缺失） |
| E2E | **Not established** |

> ⚠️ **测试命令的写法（Phase 4 实测修正）**
>
> `node --test tests/` **不成立**。在 Node 24 下，传给 `--test` 的位置参数被当作
> 模块入口，`tests/` 会被当成一个模块去 `require`，报 `MODULE_NOT_FOUND`。
> 本版 Node 已不再对目录做递归发现。
>
> 可用写法（Phase 4 实测）：
>
> | 命令 | 结果 |
> |---|---|
> | `node --test` | 368 passed —— **本项目采用这个** |
> | `node --test "tests/**/*.test.mjs"` | 368 passed |
> | `node --test tests/*.test.mjs` | 368 passed |
>
> 三者 Phase 7 复测仍一致（Phase 4 建立该表时为 315）。
>
> 采用零参数的 `node --test`：它按 `**/*.test.mjs` 等模式从仓库根搜索，
> 不依赖 shell 的 glob 展开，在 cmd / PowerShell / bash 下行为一致。
> `tests/load-domain.mjs` 不匹配测试文件命名模式，实测未被采集。
>
> Phase 1–3 的文档一律写的 `node --test tests/`，已在 Phase 4 全部改正。

## 已建立的检查

| 检查 | 载体 | 建立于 | 覆盖范围 |
|---|---|---|---|
| 领域层单元测试 · 时间解析 | `tests/time-parser.test.mjs` | Phase 4 | `timeParser` —— §1 全部 69 条 + §2 全部 28 条 + 边界 |
| 领域层单元测试 · 任务识别 | `tests/task-extractor.test.mjs` | Phase 5 | `isTaskLine` / `taskExtractor` —— §4 正向 56 词、反向 21 词、整行匹配边界、已知误检与漏检 |
| 领域层单元测试 · 组装与排序 | `tests/parse.test.mjs` | Phase 5 | `makeTask` / `sorter` / `parse` 端到端 |
| 领域层纯度静态检查 | `tests/time-parser.test.mjs` 的「领域层纯度」套件 | Phase 4 | 无 DOM / 无网络 / 无存储 / 不自读系统时间。**扫的是 `index.html` 的领域层全文**，因此 Phase 5 新增代码自动被覆盖 |
| 导出契约守门 | `tests/load-domain.mjs`、`tests/load-delivery.mjs` | Phase 5 / 7 | 必需导出缺一即抛错，不让测试报出难懂的错 |
| **交付层纯函数** | `tests/delivery.test.mjs` | Phase 7 | `renderMarkdown` 的转义、分组、标记、边界、纯度（53 条） |
| **UI 渲染与状态 + 导出链路** | 一次性 DOM 桩（**不进仓库**） | Phase 6 / 7 | 渲染与状态流转、复制三级回退链路、下载调用。**不计入 368 基线** |
| 格式检查 | `git diff --check` | 每轮 | 空白字符错误 |

## 计划建立的检查

| 检查 | 载体 | 建立于 | 覆盖范围 |
|---|---|---|---|
| **UI 浏览器行为** | **人工验证，`Not established`** | Phase 6 | 本机无法启动浏览器。清单在 `progress/layers/02-ui.md`，须由用户执行并记入 `LOG.md` |
| **复制 / 下载** | **人工验证，`Not established`** | Phase 7 | Chrome / Edge 各一次。三级复制链路里**哪一级生效**只能实测 |
| 真实数据度量 | 人工统计 | Phase 8 | 成功标准 1/2/3 与假设 A-001~A-006 |

**为什么 UI 的 DOM 桩不进仓库**：它无法测试真正会出问题的地方——真实浏览器事件、
真实粘贴（含富文本残留）、CSS 布局、`file://` 下的加载行为。把它纳入基线会制造
**虚假的覆盖率安全感**，并带来长期维护成本。它是开发时的探针，不是回归资产。

**同样是桩，为什么它的结果可以报告**：因为它验证的是**渲染逻辑与状态流转**
（分组、排序、徽章、保留语义、删除），这些在桩上和真实 DOM 上行为一致；
而它验证不了的（浏览器行为）被明确列为 `Not established`，没有被冒充成通过。

**关于 lint / typecheck**：本项目零依赖、无构建工具，因此不会引入 ESLint 或 TypeScript。
这两项将永久保持 `Not established`。这是决策的结果，不是遗漏。
若将来引入，必须先问用户。

## 成功标准与度量方式

度量必须可执行，不接受"感觉还行"。

| # | 成功标准 | 度量方式 | 何时度量 |
|---|---|---|---|
| 1 | 规则漏掉的任务能在 10 秒内手动补进列表 | 屏幕计时，从发现漏检到列表出现该任务 | Phase 8 |
| 2 | 时间解析正确率 ≥ 80% | 从真实记录中挑出所有含时间表达的任务句，逐条人工判定 `timeParser` 结果是否正确，计算 `正确数 / 总数`。**分母 = 支持表达清单内的表达**；清单外的不计入，但要单独记录数量 | Phase 8 |
| 3 | 闲话不干扰；误检可一键删除 | 统计误检条数，验证每条都能一键删除 | Phase 8 |

**关于第 2 条的诚实说明**：若把清单外的表达也计入分母，正确率必然低于 80%。
因此必须先有「支持表达清单」，度量才有意义。该清单已于 Phase 3 产出，
见 `docs/construction/SUPPORTED_EXPRESSIONS.md`。度量时必须先分类再计算，不得含糊。

### 清单的可执行性——已验证

`SUPPORTED_EXPRESSIONS.md` 第 1 节的每一条已在 Phase 4 转成测试用例。
清单自称 69 条，测试文件在 `§1 支持清单 › 清单条目总数为 69` 一条中**断言了这个数字**——
清单改了而测试没跟上，测试会失败。

**这条断言是有意加的**：成功标准 2 的分母就是这 69 条，
分母数字漂移会让度量失去意义。同理，§2 的 28 条也有对应断言。

Phase 5 沿用同一手法：§4 的动作词表断言 **38**（原表）/ **56**（含 Phase 5 新增）
/ **21**（反向词表）。这三条断言的作用不只是防漂移——它们让「词表被改了」
这件事**必然留下痕迹**，从而强制同步 `SUPPORTED_EXPRESSIONS.md` 与假设 A-001。

## 测试用例设计原则

1. **反向用例优先**。识别类功能最容易出的问题是误检（把「收到」当任务），
   所以每个正向用例都要配一个"不该命中"的用例。
2. **时间注入**。所有时间解析测试必须显式传入 `now`，不得依赖真实当前时间——
   否则测试会在跨日、跨月时随机失败。
3. **边界必测**：跨月（1月31日 + 1天）、跨年（12月31日 + 1天）、
   今天已过去的时间点（如 20:00 时说「今天中午」）、闰年。
4. **样例自行编造**。禁止使用真实聊天记录（见 `CODEX_MASTER_REQUIREMENTS.md` 隐私纪律）。
5. **跨 realm 陷阱**（Phase 4 发现，Phase 5 再次踩到）。领域层跑在 `node:vm` 里，
   它创建的 `Date` / `Array` / `Object` 属于**另一个 realm**：

   | 写法 | 结果 |
   |---|---|
   | `x instanceof Date` | **失效**——用鸭子类型 `typeof x.getTime === 'function'` |
   | `assert.throws(fn, TypeError)` | **失效**——改成匹配错误信息 `/.../` |
   | `assert.deepEqual(领域层返回的 [], [])` | **失效**——报 `Values have same structure but are not reference-equal` |

   第三条是 Phase 5 新增断言后才暴露的：`deepStrictEqual` 会比较原型，
   跨 realm 的 `Array.prototype` / `Object.prototype` 互不相等。
   解法是在 `tests/load-domain.mjs` 里导出 `toLocal()`，断言前把结构搬回测试 realm
   （`Date` 保留为本地 `Date`，不走 JSON 序列化）。**这不是实现缺陷，是固有现象。**

### 基准时间选 2026-10-09（周五）的理由

周五能把一周的边界全部压进同一天：`周X` 的顺延、`周末`、`本周内`、`下周内`、
`X个工作日` 跨周末——都能在同一个 `now` 下被检验，不必为每条规则各造一个基准。

`timeParser` 的测试全部以 `new Date(2026, 9, 9, 10, 0, 0)` 为基准。

## 失败记录规范

失败历史不得抹除。格式：

```md
### Test Attempt 1
Command:
Result: Failed
Summary:

### Fix
Files:
Reason:

### Retest
Command:
Result:
```

即使重测通过，首次失败记录也必须保留。

## 未建立项

以下必须在对应阶段建立，届时更新本文件：

- [x] 领域层测试载体（Phase 4）
- [x] `timeParser` 测试（Phase 4）
- [x] 领域层纯度静态检查（Phase 4）
- [x] `taskExtractor` / `sorter` / `parse` 测试（Phase 5）
- [x] UI 渲染与状态验证——一次性 DOM 桩，**不进仓库**（Phase 6）
- [x] `renderMarkdown` 测试（Phase 7，53 条）
- [x] UI 导出链路验证——扩展到同一份 DOM 桩（Phase 7）
- [ ] **UI 浏览器行为人工验证（Phase 6 已交付待验，`Not established`）**
- [ ] **复制 / 下载人工验证（Phase 7 已交付待验，`Not established`）**
- [ ] 真实数据度量记录（Phase 8）
