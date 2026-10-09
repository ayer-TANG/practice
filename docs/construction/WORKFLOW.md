# Workflow

每个施工轮次的固定流程。不得跳步。

---

## 1. 开工前检查

```bash
pwd
ls -la
find . -maxdepth 3 -type f -not -path './.git/*' | sort
git rev-parse --is-inside-work-tree
git branch --show-current
git status --short
git remote -v
git config --get user.name
git config --get user.email
git rev-parse HEAD
git log --oneline --decorate -5
git stash list
git ls-remote --heads origin
```

判断：

- 这是不是预期的仓库
- 有没有用户已存在的改动
- 有没有上一轮 agent 留下的未提交工作
- 本地与远端历史是否一致
- 当前 baseline commit 是哪个

**发现来源不明的改动时停下来问，不要删除、覆盖、stash、stage 或 commit 它。**

## 2. 建立回滚点

```bash
git checkout -b backup/pre-<phase>-<topic>-<timestamp>
git push -u origin backup/pre-<phase>-<topic>-<timestamp>
git checkout main
```

本地分支不是远端备份。backup 分支必须推送到 origin。

## 3. 写 start plan

追加到 `docs/construction/DEV_PROGRESS.md`，包含：

- 当前阶段 / objective
- 受影响的分层
- 计划改动的文件
- 计划运行的测试
- 分支 / baseline commit / backup 分支
- 回滚方案
- 验收标准
- **明确排除项**

## 4. 小步开发微循环

```
做一处连贯的改动
  → 跑最近的相关检查
  → 记录结果
  → 稳定才继续
```

对应本项目的具体做法：

| 改动 | 最近的检查 |
|---|---|
| 加/改一条时间词表条目 | 跑该表达对应的测试 |
| 加/改动作词 | 跑正向 + 反向用例 |
| 改 `sorter` | 跑排序与分组测试 |
| 改 `index.html` 结构 | 无头 Edge 截图 + `--dump-dom`（见 §5.1）；交互路径仍需用户手动走 |
| 改 CSS / 配色 | **无头 Edge 截图 + `getComputedStyle`**——「看着像没渲染」和「真的没渲染」只有量了才分得清 |
| 改任何文档 | 检查文档间引用是否仍成立 |

不要把整个阶段做完才发现基础失败。

## 5. 阶段收工

```bash
node --test          # 领域层测试（Phase 4 起可用）
git diff --check
```

> `node --test tests/` **不成立**——Node 24 下位置参数被当作模块入口，报 `MODULE_NOT_FOUND`。
> 用零参数的 `node --test`。见 `TEST_METRICS.md`。

**只要本轮碰过真实语料，就必须跑一次语料泄漏检查**（Phase 8 词表轮补进流程）：

```
把语料与仓库全文都切成 n=8 的 n-gram，取交集。任何交集都逐条判断。
```

理由：人写文档时会**顺手把刚看过的句子抄进去**——Phase 8 词表轮就发生过，
文档与测试里各有一批语料原句，是靠这个检查才发现的。

| 命中类型 | 处理 |
|---|---|
| **聊天内容**（正文、称呼语、小标题、任务句、通知原句） | **必须清掉**，换成自行编造的同形句 |
| **纯时间 / 日期表达**（`2026-03-20 23:59`、`10月11日（本周日）下午16：00`） | **保留**。本项目的规格文档就是时间表达的清单，列样例是它的职责；这类字符串不含任何私人内容 |
| 学号 / 姓名 / 课程名 / 群名等专名 | **必须清掉**，一律换成编造值 |

**测试样例必须自己编造**，并且要**换掉关键词**，不只是换个标点——
只把活动的主办方名词换掉、却把活动的性质词与星期时段原样留着，**仍然撞车**。
一句话：**换名词不算换句子。**

**写文档时同样适用，包括解释这条规则的文字本身。**
「把踩过的坑写下来」很容易变成**把那段语料再抄一遍**——
本轮就发现上一轮就是在这里又留了一次（引用原句来讲「不要引用原句」）。
描述形状，不要复制字符串。

**只要本轮碰过 `index.html` 的样式或 UI 代码，就必须跑一次无头浏览器取证**（见下节）。

然后按顺序：

1. 停掉本会话启动的长驻进程
2. 记录测试与重测结果到 `LOG.md`（含失败历史，不得抹除）
3. 修正文档漂移（对照 Drift Checklist）
4. **跑语料泄漏检查**（若本轮碰过真实语料）
5. **跑无头浏览器取证**（若本轮碰过样式或 UI）
6. 更新 `DEV_PROGRESS.md`
7. 更新对应分层进度文件
8. 更新 `HANDOFF.md`
9. 检查 diff
10. 提交
11. 推送
12. 记录最终 commit 与推送状态
13. 如实报告状态

## 5.1 无头浏览器取证

**本机没有图形界面可用的浏览器，但装了 Microsoft Edge，可以用无头模式取证。**
Phase 8 才发现这一点——在那之前文档里一直写着「本机无法启动浏览器」，
这个说法**过强**，害得几轮工作都停在桩测试上。

```bash
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

# ① 截图：看得到就是看得到，看不到就是看不到
"$EDGE" --headless --disable-gpu \
  --screenshot="C:\path\out.png" --window-size=1000,900 \
  "file:///D:/xuexi/war/index.html"

# ② DOM 转储：确认元素在不在、脚本跑没跑
"$EDGE" --headless --disable-gpu --dump-dom "file:///D:/xuexi/war/index.html"

# ③ 计算样式：光看截图分不清「浅灰」和「没渲染」，得量
#    复制一份 index.html，在 </body> 前注入脚本打印 getComputedStyle，
#    再对这个副本截图。用 /tmp 下的临时文件，不要改仓库里的原件。
```

**它能证明什么**（本轮实际用到的）：CSS 是否生效、元素**是否可见**、
布局与配色、`<script>` 是否执行、DOM 状态是否被更新。

**它不能证明什么**——别把这两类混为一谈：

| 能 | 不能 |
|---|---|
| 静态渲染、配色、布局 | 真实用户交互（真人 `Ctrl+V`、真实点击） |
| JS 执行与 DOM 状态 | 真实粘贴带来的**富文本残留** |
| 脚本**合成**的事件被监听器收到 | 剪贴板 API 的读写权限（`file://` 下尤其） |
| 导出/下载**链接的生成** | 真实的下载对话框与落盘 |

所以「浏览器行为未验证」这句话要拆开说：**渲染层面已可取证，
交互层面仍须用户手动走**。引用这条时不要把两者合并——合并会**低估**渲染，
也会**高估**交互。

> 注入脚本时注意：heredoc 会把 `\n` 变成真换行，字符串里请用
> `String.fromCharCode(10)`，否则脚本语法错误、整段静默不跑。



## 6. 报告格式

```text
## Status
Complete / Partially complete / Blocked

## Environment and Git
仓库 / 分支 / baseline / backup 分支 / 最终 commit / 推送状态 / 工作树

## Completed
## Changed files
## Tests
命令 / 失败 / 修复 / 最终结果

## Documentation Drift
## Not completed
## Next step
## Risks
```

---

## 文档更新对照表

改了什么，就必须同步更新什么：

| 改动 | 必须同步更新的文档 |
|---|---|
| 产品行为 | `PRODUCT_REQUIREMENTS.md` |
| 目录结构 / 新增文件 | `ARCHITECTURE.md` |
| 层间依赖 | `LAYER_CONTRACT.md` |
| 阶段范围 | `CONSTRUCTION_PLAN.md` |
| 测试脚本或覆盖范围 | `TEST_METRICS.md` |
| 仓库名 / remote / 分支策略 | `AGENTS.md`、`GITHUB_ROLLBACK.md` |
| 发现新假设或推翻旧假设 | `PRODUCT_REQUIREMENTS.md` 的 Assumption Register |

## Drift Checklist（收工必跑）

- 产品行为与需求一致
- 新出现的目录已记入架构文档
- 依赖没有违反分层契约（尤其：领域层无 DOM）
- 脚本与测试文档描述一致
- 当前工作与当前阶段一致
- 负责人、品牌、仓库、remote 信息是最新的
- 没有偷偷实现未来阶段的功能
- 没有提交密钥
- **没有真实聊天记录进入仓库**

## Handoff 质量测试

问自己：

> 一个全新的 agent，只读仓库不读聊天记录，能安全地继续下一个任务吗？

答不上来，就说明 handoff 没写完。
