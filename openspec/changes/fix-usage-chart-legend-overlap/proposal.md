## Why

用量页折线图与柱状图的「问答」「入库」图例叠在横轴时间文字上，趋势和分桶对比都读不清。ECharts 6 默认把图例放在底部，现有 `grid.bottom` 只够轴标签，需要立刻把图例挪出绘图区。

## What Changes

- 折线图（消耗趋势）与柱状图（分桶对比）的「问答」「入库」图例 MUST 与横轴标签、折线 / 柱体分离，互不遮挡。
- 只改这两张笛卡尔图的图例位置与网格留白；饼图（结构占比）底部图例已不挡内容，不改语义。
- 不改系列名称、配色、粒度、数据源或图表类型。

不包含：改用量接口、汇总卡片、粒度控件、主题色、饼图布局、新增图表或依赖。

## Capabilities

### New Capabilities

- 无。本变更只修正已有用量图的图例占位。

### Modified Capabilities

- `usage-stats`: 折线与柱状图的「问答」「入库」图例不得遮挡横轴文字或系列图形。

## Impact

- 图表 option：`src/views/usage/usageChartOptions.ts` 的 `buildLineOption` / `buildBarOption`。
- 容器：`UsageChart.vue` 仅在现有高度不够图例 + 轴标签时才调整。
- 不改 API、store、路由、依赖。
