## ADDED Requirements

### Requirement: Login is outside the workspace shell

登录页 MUST NOT 使用带侧栏或抽屉的工作台壳。工作台壳 MUST 只包已登录后的知识库与用量页。登录页 MUST 仍能切换浅色 / 深色模式，并与工作台使用同一套主题令牌。

#### Scenario: Login has no sidebar

- **WHEN** 用户打开登录页
- **THEN** 看不到知识库级联导航、用量入口或工作台顶栏标题

#### Scenario: Workspace shell appears after login

- **WHEN** 用户登录成功进入知识问答页
- **THEN** 左侧或抽屉可见系统导航，顶栏可见页面标题与主题入口

#### Scenario: Login can toggle theme

- **WHEN** 用户在登录页切换颜色模式
- **THEN** 登录页立即按所选模式换色，刷新后仍恢复该选择

### Requirement: Workspace header provides sign-out

工作台顶栏 MUST 提供退出入口。该入口 MUST 在问答、录入、入库记录和用量页都可用，且 MUST NOT 替代主题图标按钮。

#### Scenario: Header shows sign-out on every workspace page

- **WHEN** 已登录用户打开任意工作台页面
- **THEN** 顶栏可见退出入口，主题图标按钮仍然在

#### Scenario: Sign-out from usage page

- **WHEN** 用户在用量页选择退出
- **THEN** 会话结束并进入登录页
