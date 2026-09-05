## Context

见 proposal.md 的动机。折线 / 柱状 option 在 `usageChartOptions.ts`，容器高度 280px 在 `UsageChart.vue`。两张笛卡尔图当前写了 `grid.top: 40`、`grid.bottom: 32`，图例未指定 `top` / `bottom`。ECharts 6 默认 `legend.bottom: tokens.size.m`，图例落在底部，与横轴抢 32px。饼图已显式 `legend.bottom: 0` 且无横轴，不挡内容。

## Goals / Non-Goals

**Goals:**

- 折线、柱状的「问答」「入库」图例占用已预留的顶部空白，不再压住横轴。
- 两张图共用同一套笛卡尔图例 / 网格，避免只改一张。

**Non-Goals:**

- 不改饼图 option、用量数据流、容器默认高度（除非走查发现顶部图例被裁切）。
- 不换图表库，不新增依赖或测试框架。

## Decisions

### 1. 笛卡尔图例显式放顶部

- **选择**：`buildLineOption` / `buildBarOption` 的 legend 增加 `top: 0`（可保留 `left` 默认居中），`grid` 维持 `{ left: 48, right: 16, top: 40, bottom: 32 }`。
- **原因**：顶部 40px 本来就是给图例留的；ECharts 6 改默认底部后才叠轴。改一行位置，不缩绘图区、不加高卡片。
- **备选**：跟着默认留在底部，把 `grid.bottom` 加到约 56–72 并下调 `grid.top`。能对齐饼图「底图例」，但 280px 里绘图区更矮，还要重算两侧边距。

### 2. 与 `axis()` 一样抽一层笛卡尔共用配置

- **选择**：在 `usageChartOptions.ts` 里抽小函数（或常量）返回笛卡尔 legend + grid，折线 / 柱状共用。
- **原因**：两处配置已经复制粘贴；只改一处容易漏。项目已有 `axis()` 这种抽法。
- **备选**：两处各写 `top: 0`。也能修，但后续再调留白会再分叉。

### 3. 饼图与容器高度先不动

- **选择**：`buildPieOption` 与 `.usage-chart { height: 280px }` 保持原样；实现后在桌面和手机宽度走查，只有顶部图例被裁切时才加高。
- **原因**：现有 `grid.top: 40` 已够一行图例；先改高度会动所有三张图的卡片节奏。

## Risks / Trade-offs

- [顶部图例与卡片标题 `h3` 视觉更近] → 可接受；标题在图表容器外，走查时确认不贴死即可。
- [小时粒度横轴文字更长，底部 32px 仍可能互相挤] → 本轮只修图例叠轴；轴标签过密不在范围。
- [ECharts 后续再改默认位置] → 笛卡尔图例位置写死，不再依赖库默认。

## Migration Plan

纯前端 option 调整，无数据迁移。回滚即还原 `usageChartOptions.ts`（若动了高度再还原 `UsageChart.vue`）。
