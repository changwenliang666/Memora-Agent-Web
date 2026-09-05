## Why

工作台三处控件仍是 Element Plus 默认皮：问答输入过矮、发送与停止并排且主色是浅蓝块，用量粒度是直角分段，顶栏主题是「浅色 / 深色」表单开关。它们和平台自己的深蓝主色、圆角卡片不一致，需要在不改业务语义的前提下把外观对齐。

## What Changes

- 把 Element Plus 主色接到项目 `--color-primary`，浅色 / 深色各跟一套。
- 问答输入区加高到约两行起；发送与停止共用同一圆钮槽位：空闲显示上箭头发送，生成中只显示中间方块的停止钮，二者不同时出现。
- 用量页时间粒度做成圆角分段条，选中态用平台主色，手机仍可在一屏宽内操作。
- 顶栏主题入口改为太阳 / 月亮图标按钮，去掉两侧「浅色 / 深色」文案，仍走现有 theme store。

不包含：改发送快捷键或流式协议、改用量接口与五种粒度语义、改主题持久化键、换 UI 库、知识库菜单或路由调整。

## Capabilities

### New Capabilities

- 无。本变更只收紧已有工作台控件的外观与互斥展示。

### Modified Capabilities

- `knowledge-chat`: 输入区更高；发送与停止改为同一位置的圆钮，生成中只显示停止。
- `usage-stats`: 粒度切换必须是与平台圆角 / 主色对齐的分段控件，而不是未换皮的默认块。
- `app-shell`: 顶栏主题入口改为图标按钮，不再使用双边文案的表单开关。

## Impact

- 样式：`theme.scss` 增加 `--el-color-primary` 映射。
- 页面：`ChatView.vue`、`UsageView.vue`、`AppLayout.vue`。
- 状态与接口：复用 `chat` / `usage` / `theme` store，不改 API、路由、依赖。
