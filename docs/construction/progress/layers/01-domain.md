# 01 — Domain（领域层）

产品的心脏。纯函数，无 DOM。

## 状态

**已完成**（Phase 5）。7 个导出全部实现并有测试覆盖，`node --test` → 315 passed。
本层不会再因开发而改动，除非 Phase 8 的真实数据校准要求增删动作词。

> 领域层完成不等于产品可用——界面与交付层分别在 Phase 6 / Phase 7。

> **实现前必读** `docs/construction/SUPPORTED_EXPRESSIONS.md`。
> 它是本层的规格来源：支持哪些表达、约定映射到什么时刻、组合上限是什么、
> 哪些明确不支持。**不得凭感觉写规则**——清单外的表达就是不该支持的，
> 加进去会让成功标准 2 的分母失控。

## 职责

对外只暴露一个契约：

```
parse(text, now) => Task[]
```

内部子模块，**互不调用**，由 `parse` 组合：

| 子模块 | 职责 | 不负责 |
|---|---|---|
| `isTaskLine` | 判断某一行是不是任务句（原语） | 不解析时间、不切分文本 |
| `taskExtractor` | 切分文本并挑出任务行 | 不解析时间、不给行号 |
| `timeParser` | 把时间表达转成绝对时间 | 不判断是否任务 |
| `makeTask` | 把入参规范成 `Task` 形状 | 不做任何判断 |
| `sorter` | 排序与分组 | 不改写 `Task` 内容 |

互不调用是刻意的：这样每一项都能独立测试，失败时能立刻定位是"没识别出任务"还是"识别出了但时间解析错了"。

`parse` 用 `isTaskLine` 而不用 `taskExtractor`，是为了**保住行号**——
`Task.id` 是 `'r' + 行号`，UI 删除条目时要靠它跟原文对上。

## 数据结构

```
Task {
  id:        string        // 'r' + 原始行号（rule）；manual 由 UI 生成
  text:      string        // 去首尾空白后的任务描述
  deadline:  Date | null
  fuzzy:     boolean       // deadline 来自约定映射（如「尽快」）而非字面表达。见 D-011
  source:    'rule' | 'manual'
  raw:       string        // 来源原句，用于核对。manual 任务为 ''
}
```

紧急度不是字段，由 `deadline` 派生（D-004）。权威定义在 `ARCHITECTURE.md`「数据模型」。

> `fuzzy` 在 Phase 4 就随 D-011 定下了，本文档直到 Phase 5 才发现漏写——已补。

## 当前状态

| 项 | 状态 |
|---|---|
| `Task` 类型 | **已完成**（Phase 5），`makeTask` 是唯一的构造入口 |
| `timeParser` | **已完成**（Phase 4），`node --test` 覆盖 §1 全部 74 条 + §2 全部 28 条 |
| `timeParserDetail` | **已完成**（Phase 4）—— 承载 `fuzzy`，见 D-011 |
| `isTaskLine` | **已完成**（Phase 5） |
| `taskExtractor` | **已完成**（Phase 5） |
| `sorter` | **已完成**（Phase 5） |
| `parse` 组装 | **已完成**（Phase 5） |
| 时间词表 | **已建立**（数据化的 `DATE_PATTERNS` / `TIME_PATTERNS` / `REL_PATTERNS` / `REJECT_PATTERNS`） |
| 动作词表 | **已建立**（Phase 5，数据化的 `ACTION_WORDS` 56 词 + `FILLER_WORDS` 21 词） |
| 测试 | `node --test` → **315 passed / 0 failed** |

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

Phase 5 追加了动作词表，**未改动这四张表**（预测正确）。

### Phase 5 实现落点

新增两张数据化词表与六个函数，全部在同一个 `<script id="zhaiwu-domain">` 块内：

| 项 | 对应规格 | 说明 |
|---|---|---|
| `ACTION_WORDS` | §4 正向 | 56 词，分 5 类（请求/提醒/交付推进/截止/紧迫/Phase5补充） |
| `FILLER_WORDS` | §4 反向 | 21 词，按**整行**匹配，不是子串 |

| 函数 | 说明 |
|---|---|
| `isFillerLine` | 剥掉标点空白后判断整行是否被反向词吃光 |
| `actionWordIn` | 命中则返回该词（返回词本身便于调试），否则 `null` |
| `isTaskLine` | 非空 + 非寒暄 + 命中正向词 |
| `taskExtractor` | 按 `/r?\n/` 切行后筛 |
| `makeTask` | 规范 `Task` 形状 |
| `sorter` | 升序 + 无截止垫底，`slice()` 后排序，不改入参 |

**整行匹配是反向规则的全部要点。** 用子串匹配会让「收到，明天发你」被误杀——
这类句子在真实聊天里极常见。测试里有一组专门锁定这个边界。

**`parse` 不用 `taskExtractor`**，而是直接迭代 `isTaskLine`，
这样能拿到行号写进 `Task.id`。两者行为必须一致（有测试覆盖）。

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
- `taskExtractor`：正向用例 + **反向用例**（「收到」「哈哈哈」「辛苦了」不得命中）—— **Phase 5 已完成**
- `sorter` / `parse`：排序正确性、无截止时间的分组与位置、端到端组装 —— **Phase 5 已完成**

**Phase 5 的测试组织**（顺序是有意的，先反向再正向）：

| 文件 | 内容 |
|---|---|
| `tests/task-extractor.test.mjs` | §4 反向 21 词 → 含寒暄词但仍是任务的边界 → §4 正向 56 词 → 切分 → 已知误检与已知漏检 |
| `tests/parse.test.mjs` | `makeTask` 形状 → `sorter` → `parse` 端到端 → 输出不变式 |

**已知误检与已知漏检都是断言，不是注释。** 它们锁定的是当前的、不理想的**现状**——
将来若词表变化让它们反转，测试会红，强制同步 `SUPPORTED_EXPRESSIONS.md` §4/§5 与 A-001。
若只写成注释，谁都不会注意到行为已经变了。

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
