# Test Metrics

**当前测试基线：`130 passed / 0 failed`（`node --test`）**

领域层 `timeParser` 的单元测试已于 Phase 4 建立并全部通过。
UI 层、交付层、真实数据度量仍未建立——见下方「未建立项」。

最后更新：2026-10-09（Phase 4）

---

## 现状

| 项 | 状态 |
|---|---|
| 测试框架 | `node --test`（Node 内置，零依赖） |
| 测试文件 | `tests/time-parser.test.mjs`、`tests/load-domain.mjs` |
| 测试命令 | `node --test` |
| **通过 / 失败** | **130 / 0** |
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
> | `node --test` | 130 passed —— **本项目采用这个** |
> | `node --test "tests/**/*.test.mjs"` | 130 passed |
> | `node --test tests/*.test.mjs` | 130 passed |
>
> 采用零参数的 `node --test`：它按 `**/*.test.mjs` 等模式从仓库根搜索，
> 不依赖 shell 的 glob 展开，在 cmd / PowerShell / bash 下行为一致。
> `tests/load-domain.mjs` 不匹配测试文件命名模式，实测未被采集。
>
> Phase 1–3 的文档一律写的 `node --test tests/`，已在 Phase 4 全部改正。

## 已建立的检查

| 检查 | 载体 | 建立于 | 覆盖范围 |
|---|---|---|---|
| 领域层单元测试 | `node --test` | Phase 4 | `timeParser` —— §1 全部 69 条 + §2 全部 28 条 + 边界 |
| 领域层纯度静态检查 | `tests/time-parser.test.mjs` 的「领域层纯度」套件 | Phase 4 | 无 DOM / 无网络 / 无存储 / 不自读系统时间 |
| 格式检查 | `git diff --check` | 每轮 | 空白字符错误 |

## 计划建立的检查

| 检查 | 载体 | 建立于 | 覆盖范围 |
|---|---|---|---|
| 领域层单元测试 | 同上 | Phase 5 | `taskExtractor` 正/反用例；`sorter` 排序与分组 |
| 交付层单元测试 | 同上 | Phase 7 | `renderMarkdown` 纯函数输出 |
| UI 主路径 | **人工验证** | Phase 6 | 本版不做自动化，如实记录 |
| 复制/下载 | **人工验证** | Phase 7 | Chrome / Edge 各一次 |

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

## 测试用例设计原则

1. **反向用例优先**。识别类功能最容易出的问题是误检（把「收到」当任务），
   所以每个正向用例都要配一个"不该命中"的用例。
2. **时间注入**。所有时间解析测试必须显式传入 `now`，不得依赖真实当前时间——
   否则测试会在跨日、跨月时随机失败。
3. **边界必测**：跨月（1月31日 + 1天）、跨年（12月31日 + 1天）、
   今天已过去的时间点（如 20:00 时说「今天中午」）、闰年。
4. **样例自行编造**。禁止使用真实聊天记录（见 `CODEX_MASTER_REQUIREMENTS.md` 隐私纪律）。

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
- [ ] `taskExtractor` / `sorter` 测试（Phase 5）
- [ ] `renderMarkdown` 测试（Phase 7）
- [ ] UI 主路径人工验证（Phase 6）
- [ ] 真实数据度量记录（Phase 8）
