## 1. Visual tokens

- [x] 1.1 在 `theme.scss` / `variables.scss` 增加表面色、弱文字、主色浅底等少量令牌（浅色与深色成对），侧栏与内容区能区分层次；打开全局样式确认两套变量都存在
- [x] 1.2 用项目 class 覆盖 `el-menu` / 抽屉选中态（左侧主色条 + 浅底），不改 Element Plus 源码；切换主题后菜单颜色跟随 token

## 2. App shell and routes

- [x] 2.1 新增一份导航配置（知识库：问答 / 录入 / 入库记录；一级「用量」）和路由：`/`、`/knowledge` 重定向到 `/knowledge/chat`，以及 `/knowledge/ingest`、`/knowledge/records`、`/usage`；访问根路径确认进入问答而不是 `HomeView`
- [x] 2.2 实现 `AppLayout`：桌面展开/折叠侧栏，平板默认图标轨，手机顶栏 + `el-drawer`，菜单数据只一份；知识库默认展开，点击父级只展开不跳转；折叠后仍能通过弹出子菜单进入三页
- [x] 2.3 把主题开关移到壳顶栏并复用 `useThemeStore`；各业务页不再放主题开关。删除 `HomeView` 落地角色，若 `app.ts` 计数已无引用则删除该 store；在任意子页切换主题并刷新，模式保持
- [x] 2.4 在桌面、平板、手机宽度下走完导航：三项知识库子页与用量都能到达，手机选页后抽屉关闭，拖拽窗口改宽度时 URL 与当前页不变

## 3. Knowledge chat

- [x] 3.1 新增 `stores/chat.ts`：保存当前一路消息，发送时追加用户消息和空助手消息，流式只改最后一条助手内容，提供停止与「是否进行中」；在控制台调用后确认不会每 token 新 push 一条
- [x] 3.2 新增 `api/stream.ts`：`fetch` + `ReadableStream` + `AbortController`，把增量文本回调给 store；无后端时用本地假流仍能演示。Axios `http.ts` 不承担该路径
- [x] 3.3 实现 `ChatView`：空态与对话态、底部输入、Enter 发送 / Shift+Enter 换行 / 组字中 Enter 不发、空内容不发、进行中不可再发、手机可见发送按钮、进行中可停止；用中文输入法选词确认不会误发
- [x] 3.4 进页与从其他工作台页返回时滚到消息区底部；用户在底部附近时跟随流式输出，上翻后不抢滚动；历史气泡使用 `content-visibility: auto`，不引入虚拟列表库。离开再回来同一会话消息仍在

## 4. Knowledge ingest and records

- [x] 4.1 新增 `api/knowledge.ts`：`uploadKnowledgeFile` 为可替换占位（延迟成功或可失败），以及记录列表的 mock/接口封装；页面组件内不出现 Cloudflare SDK
- [x] 4.2 新增 `stores/ingest.ts`：本地上传队列（`waiting | processing | ready | failed`）与历史记录列表分开；类型限 pdf/txt/md/docx，大小上限一个常量（约 20MB）
- [x] 4.3 实现录入页：`el-upload` 点击与拖拽入队，展示文件名与状态，文案标明演示/未接通云存储；未接真上传时页面不崩溃，失败项可见
- [x] 4.4 实现入库记录页：桌面 `el-table` 展示文件名、大小、状态、时间；手机改为卡片且无横向滚动；无数据时用空状态。录入页不以完整历史表作主内容，记录页不以大上传区作主入口

## 5. Usage stats

- [x] 5.1 添加 `echarts` 依赖，仅按需注册折线、柱状、饼图，不引入 `vue-echarts`，不在 `main.ts` 全局挂载；`pnpm` 安装成功且类型检查能解析该依赖
- [x] 5.2 新增 `api/usage.ts` 与 `stores/usage.ts`：`getUsage(granularity)` 返回 `buckets`（`period/chatInput/chatOutput/ingest`）和 `previousTotal`；五种粒度的默认区间与规格一致；问答合计 = 输入+输出，总计 = 问答+入库
- [x] 5.3 实现用量页：粒度切换刷新卡片（总计 / 问答 / 入库 / 较上期）与三张图；折线双序列、柱状按桶对比、饼图为区间问答 vs 入库；无数据时空状态。换粒度后三图数字同源
- [x] 5.4 图表读 CSS 变量配色，主题切换后坐标与背景跟随；桌面折线通栏、其下柱+饼，手机全宽竖排且无横向滚动

## 6. Verify

- [x] 6.1 运行 `pnpm typecheck` 与 `pnpm build` 均成功
- [x] 6.2 在浏览器按壳 → 问答（发送/换行/组字/贴底/停止）→ 录入/记录 → 用量（五种粒度 + 深浅色）走查一遍，确认三块业务互不改对方状态，且无设置占位菜单
