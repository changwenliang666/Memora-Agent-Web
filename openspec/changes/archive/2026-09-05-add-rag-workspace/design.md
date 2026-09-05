## Context

动机见 `proposal.md`；行为见 `specs/app-shell/spec.md`、`specs/knowledge-chat/spec.md`、`specs/knowledge-ingest/spec.md`、`specs/usage-stats/spec.md`。

现状：`App.vue` 只有 `router-view`，唯一页面是骨架 `HomeView`（计数 + 主题开关）。已有 Pinia 主题、Axios 封装、`useBreakpoint`（768 / 1200）、SCSS token 与断点 mixin。没有应用壳、业务路由或图表依赖。

约束：Vue 3 `<script setup lang="ts">`、Element Plus 优先、CRUD 走现有 Axios、实现保持简单，不为美观另引 UI 库。

## Goals / Non-Goals

**Goals:**

- 用最少模块落下壳 + 四个页面，页面之间不互相写状态。
- 流式问答与用量图作为明确的特例接进去，但不引入通用框架。
- 视觉在现有 token 上加少量表面色，侧栏、空态、卡片对齐，而不是新设计系统。

**Non-Goals:**

- 不抽通用 Chart 工厂、用量采集中间件、事件总线。
- 不为每个交互新建 composable；逻辑短则留在页面。
- 不把用量与问答/录入在浏览器里打通记账。
- 不引入 Markdown 渲染库、虚拟列表库、`vue-echarts`。

## Decisions

### 1. 单壳 + 一份导航配置

- **选择**：`App.vue` 挂 `AppLayout`。布局内：桌面/平板用 `el-aside` + `el-menu`（`router` + `collapse`），手机用顶栏汉堡 + `el-drawer` 里同一份 `el-menu`。导航数据放一个静态数组（知识库三项 + 用量），不要两套菜单。
- **原因**：`add-mobile-adapt` 已约定「结构不同、能力相同 → 拆壳、逻辑一份」。`useBreakpoint` 现成。
- **备选**：三套 layout 组件——菜单项会分叉。独立 `/m` 站——与现有规格冲突。

宽度策略：

| 档 | 壳 |
| --- | --- |
| 桌面 `>=1200` | 展开侧栏（可折叠），约 220px / 64px |
| 平板 `768–1199` | 常驻图标轨 64px |
| 手机 `<768` | 无常驻侧栏，抽屉 |

侧栏折叠只记在内存（Pinia 或 layout 本地状态），不持久化。知识库 `default-openeds` 默认展开。父级只展开，不配父路由页面。

路由：

```
/                    -> /knowledge/chat
/knowledge           -> /knowledge/chat
/knowledge/chat
/knowledge/ingest
/knowledge/records
/usage
```

`HomeView` 不再作为落地页。主题开关挪到壳顶栏，复用 `useThemeStore`。`app.ts` 的访问计数若再无引用则删除，避免死代码。

### 2. 模块按页切开，互不订阅

```
layouts/AppLayout.vue
nav 配置（可与 router 同目录）

views/knowledge/ChatView.vue
views/knowledge/IngestView.vue
views/knowledge/RecordsView.vue
views/usage/UsageView.vue

stores/chat.ts
stores/ingest.ts
stores/usage.ts

api/http.ts          已有
api/stream.ts        仅流式
api/knowledge.ts     记录列表 + upload 空位
api/usage.ts         getUsage(granularity)
```

- 问答只读 `chat` + `stream`。
- 录入/记录只读 `ingest` + `knowledge` API。
- 用量只读 `usage` API。三者不互相 `watch`。
- **备选**：一个 `workspace` 大 store——页多了会缠在一起。前端从 SSE/上传累加用量——与规格「用量不写业务事件」冲突，也更难测。

录入与记录可以共用 `ingest` store：队列是进行中的本地列表，记录是历史列表（第一期 mock）。不要再拆第三个 store。

### 3. 流式用 fetch + ReadableStream，Axios 只管 CRUD

- **选择**：新增 `api/stream.ts`：`fetch`、读取 `ReadableStream`、`AbortController` 停止。解析为文本增量后交给 `chat` store **改当前最后一条助手消息的字段**，不要每来一个 token 就 `push` 新消息。CRUD 继续 `http.ts`。
- **原因**：规格要求增量出现且可停止；Axios 不适合浏览器里读 stream。用户已指定该读法。
- **备选**：把 stream 塞进 Axios 实例——拦截器与 timeout 会干扰长连接。`EventSource`——不易 POST 问题体，也不便带同一套错误处理。

第一期流式可以打本地 mock（定时推几个 chunk）或未配置基址时的假流，页面仍能演示。真实 SSE 事件名以后端为准，解析集中在 `stream.ts` 一个函数。

问答页自己处理：Enter / Shift+Enter / `isComposing`、发送按钮、进页与 `onActivated` 贴底、距底部阈值内才跟随滚动。不抽 `useChatHotkeys`，除非页面明显过长。

长列表：历史气泡加 `content-visibility: auto`；不引入虚拟列表。流式中的那一条保持在文档流里。

消息只存在 Pinia，刷新丢失。不需要 `keep-alive`：store 已能满足「离开再回来还在」。

### 4. 上传是函数空位，不是页面里的 SDK

- **选择**：`api/knowledge.ts` 导出 `uploadKnowledgeFile(file, onProgress)`。本阶段实现为可失败的占位（例如短延迟后标就绪，或明确抛错以便队列出现失败态）。`el-upload` 只负责选文件/拖拽，真正发送走该函数。
- **原因**：规格要求云存储可替换，且不进页面组件。
- **备选**：页面里直接 `el-upload` action 指向 CF——以后难换。先接真 CF——超出本变更。

队列状态机保持扁平：`waiting | processing | ready | failed`。不做多阶段可视化流水线。

记录页：桌面 `el-table`，手机同一数据改卡片（`useBreakpoint().isPhone`），逻辑仍在 store。空状态用 Element Plus 空态即可。

允许的文件类型本阶段按常见文档收：`pdf`、`txt`、`md`、`docx`。超限或类型不对时队列直接 `failed` 并提示，具体大小上限实现时用一个常量（建议 20MB），不做成配置中心。

### 5. 用量一份 buckets，三张图是纯函数

数据形状一次定全：

```
UsageBucket {
  period: string
  chatInput: number
  chatOutput: number
  ingest: number
}
```

页面派生：`chat = chatInput + chatOutput`，`total = chat + ingest`。`getUsage(granularity)` 返回 `{ buckets, previousTotal }`。卡片上的「较上期」用 `previousTotal`。

- **选择**：加 `echarts`，按需注册折线、柱、饼。`UsageView` 里三个容器；一个薄组件负责 `init` / `setOption` / `dispose` / 主题变化，option 由同目录两三个纯函数从 `buckets` 算出来。
- **原因**：Element Plus 无图；用户指定 ECharts。三图一份数据，换粒度只重新请求。
- **备选**：`vue-echarts`——多一层封装，收益小。全量 `import * as echarts`——包体会涨。自绘 SVG——达不到三种图的常规交互。

主题：读现有 CSS 变量（背景、文字、主色、边框）填进 option，`theme` store 变化时 `setOption`。不要第二套写死的图表色板文件。

粒度控件：桌面 `el-radio-group` 或 `el-segmented`（若当前 Element Plus 版本有），手机可同一控件允许横滑，不必换成 `el-select`，除非挤不下。

默认区间写在 `api/usage.ts` 的 mock 生成里，与规格表一致。第一期不做日期选择器。

### 6. 视觉：加 token，不换皮

在 `theme.scss` 增加少量令牌，例如表面色、弱文字、主色浅底。侧栏比内容略深；当前子项左侧 2px 主色条 + 浅底。问答空态居中、输入条限宽；录入大拖拽区；用量上卡片下图。深浅两套都要覆盖菜单、抽屉、输入条和图表。

不引入粒子、网格背景、第二套字体。组件继续 Element Plus，用项目 class 覆盖，避免 `!important`。

## Risks / Trade-offs

- [流式 mock 与真 SSE 形状不一致] → 解析只留在 `stream.ts`；页面只收「追加文本 / 结束 / 错误」。
- [ECharts 包体] → 按需注册三种图；用量页再加载即可，不必全局挂到 `main.ts`。
- [占位上传看起来像已入库] → 队列状态文案写清「演示 / 未接通云存储」，记录页 mock 与队列分开，避免用户以为文件已进真实知识库。
- [平板图标轨信息弱] → 折叠菜单用 Element Plus 自带弹出子菜单，hover 能看到问答/录入/记录。
- [content-visibility 在极老浏览器无效] → 降级为普通文档流，行为仍正确，只是长列表更重；第一期可接受。

## Migration Plan

- 加壳与新路由后，根路径改为进入问答；去掉骨架首页的业务入口。
- 主题开关仅出现在顶栏；`theme` store 与 `localStorage` 键不变。
- 新增 `echarts` 依赖；其余沿用现有栈。
- 回滚：恢复 `HomeView` 为 `/`、删除新增 layout/views/stores/api、移除 `echarts`。主题能力不受损。

## Open Questions

- 真后端的 SSE 字段名与用量接口路径——不改变本变更的页面划分和 mock 形状，联调时只改两个 api 文件。
