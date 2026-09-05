# usage-stats Specification

## Purpose

让用户按时间粒度查看知识库问答与向量入库两类 token 消耗，用趋势、对比和结构三种图读同一份数据，并在窄屏上完整可用。

## Requirements

### Requirement: Usage can be filtered by time granularity

用量页 MUST 提供小时、天、周、月、年五种粒度。切换粒度 MUST 更新本页汇总与图表，且 MUST 使用与该粒度匹配的默认时间范围（小时看近 24 小时，天看近 30 天，周看近 12 周，月看近 12 个月，年看近 5 年）。第一期 MUST NOT 要求用户自选任意起止日期。

#### Scenario: Default landing uses a granularity

- **WHEN** 用户打开用量页
- **THEN** 已选中一种粒度，并展示该粒度默认范围内的汇总与图

#### Scenario: Switching granularity refreshes the page data

- **WHEN** 用户将粒度从天改为月
- **THEN** 卡片数字与三张图都变为按月默认范围聚合后的结果

### Requirement: Totals split chat versus ingest

用量数据 MUST 同时包含问答消耗与向量入库消耗。页面 MUST 展示总计、问答合计、入库合计，以及相对上一同等长度区间的变化。问答合计 MUST 等于该区间问答输入与输出 token 之和；入库合计 MUST 只统计向量入库。页面 MUST NOT 把问答或录入过程中的实时事件当作本页的写入来源。

#### Scenario: Cards show both sources

- **WHEN** 用量数据加载完成且区间内两类都有消耗
- **THEN** 用户能同时看到总计、问答合计与入库合计

#### Scenario: Chat total includes input and output

- **WHEN** 某区间问答输入为 80、输出为 20、入库为 50
- **THEN** 问答合计为 100，入库合计为 50，总计为 150

#### Scenario: Missing data shows an empty state

- **WHEN** 当前粒度下没有任何用量数据
- **THEN** 页面展示空状态，不出现残缺坐标轴或脚本错误

### Requirement: Three charts share the same buckets

用量页 MUST 用折线图展示问答与入库随时间的走势，用柱状图按时间桶对比问答与入库，用饼图展示本区间问答与入库的合计占比。三张图 MUST 读取同一组分桶数据。第一期 MUST NOT 再增加输入对输出的第四张图，也 MUST NOT 按模型或费用拆分。

#### Scenario: Line chart has two series

- **WHEN** 用量数据含多个时间桶
- **THEN** 折线图同时画出问答与入库两条走势

#### Scenario: Bar chart compares the two sources per bucket

- **WHEN** 用量数据含多个时间桶
- **THEN** 每个时间桶能对比问答与入库的柱

#### Scenario: Pie chart uses range totals

- **WHEN** 当前区间问答合计与入库合计均大于零
- **THEN** 饼图按问答 vs 入库两块展示结构

#### Scenario: Charts follow the active color mode

- **WHEN** 用户切换浅色或深色模式
- **THEN** 图表坐标、文字与背景跟随当前模式，而不是固定浅色图

### Requirement: Usage layout works on a narrow viewport

在手机宽度下，粒度切换、汇总卡片与三张图 MUST 仍可完整使用，MUST NOT 出现横向滚动。图表 MUST 改为纵向排列并使用全宽。

#### Scenario: Phone stacks the usage page

- **WHEN** 用户以手机宽度打开用量页
- **THEN** 粒度控件、卡片和三张图均可在一屏宽内操作和查看，无需左右滑动

#### Scenario: Desktop keeps the two-column lower charts

- **WHEN** 用户以桌面宽度打开用量页且有数据
- **THEN** 折线作为主图通栏，柱状图与饼图出现在其后的内容区，而不是套用手机上的紧凑单列压缩字号

### Requirement: Granularity control matches platform chrome

用量页的小时 / 天 / 周 / 月 / 年切换 MUST 以完整分段条呈现：外层圆角容器，选中项使用平台主色或主色浅底，未选项使用弱文字色。控件 MUST NOT 呈现为无容器的裸文字加直角色块。五种粒度与切换后刷新数据的行为 MUST 保持不变。

#### Scenario: Selected granularity is a rounded segment

- **WHEN** 用户打开用量页且当前粒度为天
- **THEN** 「天」作为分段条中的选中项可见，圆角与主色与页面卡片同一套视觉语言，而不是直角浅蓝块

#### Scenario: Switching granularity still refreshes data

- **WHEN** 用户将粒度从天改为月
- **THEN** 卡片数字与三张图都变为按月默认范围聚合后的结果
