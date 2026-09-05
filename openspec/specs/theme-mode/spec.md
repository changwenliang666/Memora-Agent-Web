# theme-mode Specification

## Purpose

为应用提供浅色与深色两种颜色模式，用少量可扩展的主题色令牌驱动页面换色，并把用户选择持久化到本地，刷新后仍能恢复。

## Requirements

### Requirement: Application supports light and dark color modes

应用 MUST 提供浅色和深色两种颜色模式。当本地不存在已保存的模式时，应用 MUST 使用浅色模式。

#### Scenario: First visit uses light mode

- **WHEN** 用户首次打开应用且本地没有已保存的颜色模式
- **THEN** 界面以浅色模式展示

#### Scenario: User switches to dark mode

- **WHEN** 用户在首页打开颜色模式开关
- **THEN** 界面立即切换为深色模式，背景、文字和主色可见地变为深色方案

#### Scenario: User switches back to light mode

- **WHEN** 当前为深色模式且用户关闭颜色模式开关
- **THEN** 界面立即切换回浅色模式

### Requirement: Color mode persists across page refresh

用户选择的颜色模式 MUST 写入浏览器 `localStorage`。整页刷新后，应用 MUST 按本地存储恢复该模式。当存储值缺失或无法识别时，应用 MUST 回退到浅色模式。

#### Scenario: Refresh restores dark mode

- **WHEN** 用户已选择深色模式
- **AND** 用户刷新页面
- **THEN** 界面仍保持深色模式，而不是回到浅色

#### Scenario: Refresh restores light mode

- **WHEN** 用户已选择浅色模式
- **AND** 用户刷新页面
- **THEN** 界面仍保持浅色模式

#### Scenario: Invalid stored value falls back to light

- **WHEN** `localStorage` 中的颜色模式值无法识别
- **AND** 用户打开或刷新页面
- **THEN** 界面使用浅色模式

### Requirement: Theme colors are provided as a small set of tokens

应用 MUST 提供少量同名主题色令牌，至少包含背景色、文字色和主色。浅色和深色 MUST 为同一组令牌名分别赋值。消费这些令牌的页面和控件 MUST 在模式切换后立即使用新值。后续新增令牌 MUST 不必改动切换与持久化行为。

#### Scenario: Home page colors follow the active mode

- **WHEN** 用户切换颜色模式
- **THEN** 首页背景、文字以及使用主色的元素更新为当前模式对应的令牌值

#### Scenario: Library components follow the active mode

- **WHEN** 用户切换颜色模式
- **THEN** 首页上的 UI 组件库控件外观随当前模式变化，而不是固定停留在浅色样式

### Requirement: Home page exposes a color mode switch

首页 MUST 提供一个可见的开关控件。该控件 MUST 反映当前颜色模式，并允许用户在浅色和深色之间切换。

#### Scenario: Switch reflects current mode

- **WHEN** 用户打开首页
- **THEN** 页面展示颜色模式开关，且开关状态与当前模式一致

#### Scenario: Switch toggles mode

- **WHEN** 用户操作该开关
- **THEN** 颜色模式切换到相反模式，且开关状态与新模式一致
