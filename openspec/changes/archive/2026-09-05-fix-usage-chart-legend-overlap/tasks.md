## 1. Chart options

- [x] 1.1 在 `src/views/usage/usageChartOptions.ts` 抽出笛卡尔共用 legend + grid（legend `top: 0`，「问答」「入库」，`grid` 维持 `{ left: 48, right: 16, top: 40, bottom: 32 }`），`buildLineOption` 与 `buildBarOption` 都改用它；读这两处 option 确认图例在顶部且不再写 `bottom`
- [x] 1.2 保持 `buildPieOption` 的 `legend.bottom` 与系列名称不变；对照该函数确认饼图 option 未被改动

## 2. Verify

- [x] 2.1 打开用量页（桌面与手机宽度、浅色与深色各看一次）：折线与柱状的「问答」「入库」图例在顶部、不压横轴；饼图图例仍在底部不挡扇区；跑 `pnpm typecheck` 通过。仅当顶部图例被裁切时才加高 `UsageChart.vue`
