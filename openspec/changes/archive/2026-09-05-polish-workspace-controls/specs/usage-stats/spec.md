## ADDED Requirements

### Requirement: Granularity control matches platform chrome

用量页的小时 / 天 / 周 / 月 / 年切换 MUST 以完整分段条呈现：外层圆角容器，选中项使用平台主色或主色浅底，未选项使用弱文字色。控件 MUST NOT 呈现为无容器的裸文字加直角色块。五种粒度与切换后刷新数据的行为 MUST 保持不变。

#### Scenario: Selected granularity is a rounded segment

- **WHEN** 用户打开用量页且当前粒度为天
- **THEN** 「天」作为分段条中的选中项可见，圆角与主色与页面卡片同一套视觉语言，而不是直角浅蓝块

#### Scenario: Switching granularity still refreshes data

- **WHEN** 用户将粒度从天改为月
- **THEN** 卡片数字与三张图都变为按月默认范围聚合后的结果
