## Purpose

为页面提供可导入的应用级共享状态，让骨架期就能在组件之间读写同一份客户端状态。

## ADDED Requirements

### Requirement: Shared client state is available to pages

应用 MUST 提供至少一个可被页面导入的共享状态模块。页面 MUST 能读取该状态，并触发一次写入后在同一会话内看到更新后的值。

#### Scenario: Home page reads initial shared state

- **WHEN** 用户打开首页
- **THEN** 页面展示来自共享状态模块的当前值，而不是只写在组件局部变量里的文案

#### Scenario: Home page writes shared state

- **WHEN** 用户在首页触发该状态的写入操作（例如点击按钮）
- **THEN** 页面立即展示更新后的值，且该值来自共享状态模块

### Requirement: Shared state survives in-app navigation

在应用内从首页离开再返回时，共享状态 MUST 保持离开前的值，直到浏览器整页刷新。本能力不要求跨刷新持久化。

#### Scenario: Navigate away and back

- **WHEN** 用户在首页写入共享状态后访问未知路径并被带回首页
- **THEN** 首页仍展示写入后的值
