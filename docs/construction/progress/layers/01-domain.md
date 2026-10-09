# 01 — Domain（领域层）

产品的心脏。纯函数，无 DOM。

## 状态

**部分实现。** `timeParser` 已于 Phase 4 完成并有测试覆盖（130 passed）。
`taskExtractor`、`sorter`、`parse` 组装尚未实现，计划在 Phase 5。

> **实现前必读** `docs/construction/SUPPORTED_EXPRESSIONS.md`。
> 它是本层的规格来源：支持哪些表达、约定映射到什么时刻、组合上限是什么、
> 哪些明确不支持。**不得凭感觉写规则**——清单外的表达就是不该支持的，
> 加进去会让成功标准 2 的分母失控。

## 职责

对外只暴露一个契约：

```
parse(text, now) => Task[]
```

内部三个子模块，**互不调用**，由 `parse` 组合：

| 子模块 | 职责 | 不负责 |
|---|---|---|
| `taskExtractor` | 判断某行是不是任务句 | 不解析时间 |
| `timeParser` | 把时间表达转成绝对时间 | 不判断是否任务 |
| `sorter` | 排序与分组 | 不改写 `Task` 内容 |

互不调用是刻意的：这样每一项都能独立测试，失败时能立刻定位是"没识别出任务"还是"识别出了但时间解析错了"。

## 数据结构

```
Task {
  id:        string
  text:      string
  deadline:  Date | null
  source:    'rule' | 'manual'
  raw:       string
}
```

紧急度不是字段，由 `deadline` 派生（D-004）。

## 当前状态

| 项 | 状态 |
|---|---|
| `Task` 类型 | 不存在（Phase 5） |
| `timeParser` | **已完成**（Phase 4），`node --test` 覆盖 §1 全部 69 条 + §2 全部 28 条 |
| `timeParserDetail` | **已完成**（Phase 4）—— 承载 `fuzzy`，见 D-011 |
| `taskExtractor` | 不存在（Phase 5） |
| `sorter` | 不存在（Phase 5） |
| `parse` 组装 | 不存在（Phase 5） |
| 时间词表 | **已建立**（数据化的 `DATE_PATTERNS` / `TIME_PATTERNS` / `REL_PATTERNS` / `REJECT_PATTERNS`） |
| 动作词表 | 不存在（Phase 5） |
| 测试 | `node --test` → **130 passed / 0 failed** |

### Phase 4 实现落点

全部代码在 `index.html` 的 `<script id="zhaiwu-domain">` 块内（D-009），
末尾挂载 `globalThis.__zhaiwuDomain = { version, timeParser, timeParserDetail }`。

规则是**数据化**的——四张模式表 + 通用解析函数，不是散落的 if：

| 表 | 对应规格 | 说明 |
|---|---|---|
| `DATE_PATTERNS` | §1.A | 绝对日期与星期；产出「完整时间」或「只到日」 |
| `TIME_PATTERNS` | §1.B | 时间点；带时段词的直接定 12/24，裸 `X点` 标 `infer12` |
| `REL_PATTERNS` | §1.D | 相对期限 |
| `REJECT_PATTERNS` | **§2** | 先屏蔽再解析——见下 |

Phase 5 只需追加 `ACTION_PATTERNS` 并补上 `parse` 与 `sorter`，不必改动这四张表。

### §2 的实现方式：先屏蔽，再解析

§2 是不支持清单，但其中若干条**含有受支持的片段**——
「上周三」包含「周三」，「下下周三」包含「周三」，「3点5分8秒」包含「3点5分」。
若直接按 §1 的模式扫描，它们会被误解析成时间，违反「§2 必须返回 null」。

做法：先用 `REJECT_PATTERNS` 把命中区域**替换为空格**，再在屏蔽后的文本上扫描。
另有一条**紧邻规则**：若选定候选正好紧贴在被屏蔽区域之后，说明它是被否决表达的一部分
（如「下下周三**下午三点**」），整体返回 `null`。

这条规则是 Phase 4 实现时发现的、`SUPPORTED_EXPRESSIONS.md` 未写明的推论，
已补记到该文档 §3。

## 硬约束

1. **不得出现** `document`、`window`、`fetch`、`localStorage`
2. **不得自己读当前时间**——`now` 由调用方注入。这既是可测试性要求，也避免跨日测试随机失败
3. **规则必须数据化**——时间词表、动作词表做成数据表 + 解析函数，禁止写成一堆散落的 if
4. 必须能在 Node 中直接运行并通过全部测试

## 依赖

- 允许：仅 JS 内置能力
- 禁止：DOM、网络、存储、UI 概念、任何第三方库（含日期库——`dayjs`/`date-fns` 一律不许）

## 测试

载体：`node --test`（Node 内置，零依赖）。
**注意不是 `node --test tests/`** —— 那种写法在 Node 24 下报 `MODULE_NOT_FOUND`，见 `TEST_METRICS.md`。

必须覆盖：

- `timeParser`：支持表达清单全部条目 + 边界（跨月、跨年、今天已过的时间点、闰年）—— **Phase 4 已完成**
- `taskExtractor`：正向用例 + **反向用例**（「收到」「哈哈哈」「辛苦了」不得命中）
- `sorter`：排序正确性 + 无截止时间的分组与位置

样例必须自行编造。**禁止使用真实聊天记录。**

## 扩展点

- **换 LLM**：`parse` 契约不变，内部实现整体替换。这是本层唯一必须现在预留的抽象
- **加重要性维度**：`Task` 加字段，`sorter` 加排序键
- **超过 10 条消息**：本层无需改动，瓶颈在 UI 层渲染

## 风险

| 风险 | 说明 |
|---|---|
| 假设 A-001 未验证 | 真实聊天里的任务句是否大多含可识别动作词/时间词，尚未用真实数据验证。若否，召回率低于预期 |
| 中文时间表达组合爆炸 | 「下下周三下午两点半前」这类复合表达。缓解：Phase 3 产出「支持表达清单」，明确划出边界 |
| 规则库膨胀 | 缓解：数据化词表；子模块拆分 |
