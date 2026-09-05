## ADDED Requirements

### Requirement: Cartesian chart legends stay clear of axes

用量页折线图与柱状图的「问答」「入库」图例 MUST 画在绘图区外，MUST NOT 遮挡横轴时间文字、纵轴刻度或系列图形。饼图底部图例行为保持不变。系列名称 MUST 仍为「问答」与「入库」。

#### Scenario: Line chart legend does not cover time labels

- **WHEN** 用量页有数据并展示消耗趋势折线图
- **THEN** 「问答」「入库」图例与横轴时间文字互不重叠，折线完整可见

#### Scenario: Bar chart legend does not cover time labels

- **WHEN** 用量页有数据并展示分桶对比柱状图
- **THEN** 「问答」「入库」图例与横轴时间文字互不重叠，柱体完整可见

#### Scenario: Pie chart legend stays below the donut

- **WHEN** 用量页有数据并展示结构占比饼图
- **THEN** 「问答」「入库」图例仍在饼图下方，不挡扇区
