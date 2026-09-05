# responsive-layout Specification

## Purpose

让应用在手机、平板和桌面宽度下都能完整查看，并用统一断点约定扩展后续页面，避免窄屏样式污染宽屏布局。

## Requirements

### Requirement: Home page is usable on phone and tablet viewports

首页 MUST 在手机宽度和平板宽度下完整展示项目标识、说明、共享计数、颜色模式开关和计数按钮。文字 MUST 保持可读，控件 MUST 可点击，页面 MUST 不出现横向滚动条。

#### Scenario: Phone viewport shows the full home page

- **WHEN** 用户以手机宽度打开首页
- **THEN** 页面同时展示项目标识、说明文案、共享计数、颜色模式开关和计数按钮，且无需左右滑动即可看到上述内容

#### Scenario: Tablet viewport shows the full home page

- **WHEN** 用户以平板宽度打开首页
- **THEN** 页面同时展示与桌面相同的首页能力，且无需左右滑动即可看完主内容

#### Scenario: Home controls remain interactive on a narrow viewport

- **WHEN** 用户在手机宽度下切换颜色模式或点击计数按钮
- **THEN** 对应状态立即更新，行为与桌面宽度一致

### Requirement: Wide viewport keeps the desktop presentation

当视口处于桌面宽度时，首页 MUST 继续使用宽屏布局和间距，MUST NOT 套用为窄屏准备的压缩排版。

#### Scenario: Desktop viewport is unchanged by mobile overrides

- **WHEN** 用户以桌面宽度打开首页
- **THEN** 页面保持宽屏下的标题大小、边距和单列内容宽度，而不是手机上的紧凑排版

### Requirement: Layout follows viewport width without a separate mobile site

应用 MUST 按视口宽度适配，而不是按设备品牌或独立移动站点分流。用户从宽屏拖拽到窄屏（或反向）时，布局 MUST 在同一页面上更新，无需改地址或重新登录。

#### Scenario: Resizing from desktop to phone updates layout

- **WHEN** 用户在同一首页将会话从桌面宽度调整为手机宽度
- **THEN** 布局变为窄屏排版，URL 保持不变，已有的计数和颜色模式保持原值

#### Scenario: Resizing from phone to desktop restores wide layout

- **WHEN** 用户在同一首页将会话从手机宽度调整为桌面宽度
- **THEN** 布局恢复宽屏排版，且不出现窄屏专用的紧凑样式

### Requirement: Viewport scales to the device width

文档 MUST 按设备宽度缩放，禁止以固定桌面宽度逼用户双指缩放才能阅读首页。

#### Scenario: Device-width viewport on first load

- **WHEN** 用户在手机或平板上首次打开应用
- **THEN** 首屏按设备宽度排版，而不是缩小后的桌面整页

### Requirement: Notched devices keep content out of unsafe insets

在有安全区的设备上，首页主内容 MUST 不被刘海、底部横条等系统区域遮挡。

#### Scenario: Safe area padding on a notched phone

- **WHEN** 用户在带安全区的手机宽度下打开首页
- **THEN** 标题、开关和按钮都出现在安全区以内，仍可阅读和点击
