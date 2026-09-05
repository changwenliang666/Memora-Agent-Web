## ADDED Requirements

### Requirement: Header shows an account avatar

工作台顶栏右侧 MUST 展示圆形账号头像。头像中心 MUST 显示当前账号去掉首尾空白后的后 3 个字符；账号长度不足 3 时 MUST 显示全部可用字符。头像背景 MUST 使用与平台主色、侧栏藏青同一谱系的靛蓝，并在浅色与深色模式下保持可读对比。账号不可展示时，头像 MUST 仍在，中心改用占位符。登录页 MUST NOT 展示该头像。

#### Scenario: Avatar shows last three account characters

- **WHEN** 已登录用户的账号为 `alice123`
- **THEN** 顶栏头像中心显示 `123`

#### Scenario: Short account shows in full

- **WHEN** 已登录用户的账号为 `ab`
- **THEN** 顶栏头像中心显示 `ab`

#### Scenario: Undisplayable account still has an avatar

- **WHEN** 已登录但会话账号为空或仅含空白
- **THEN** 顶栏仍有头像，中心显示占位符，不出现空白圆

#### Scenario: Avatar appears on phone and desktop

- **WHEN** 已登录用户分别以手机宽度和桌面宽度打开工作台
- **THEN** 两种宽度下顶栏右侧都可见该头像，且不遮挡页面标题或主题按钮

#### Scenario: Login page has no avatar menu

- **WHEN** 用户打开登录页
- **THEN** 看不到账号头像或退出下拉菜单

## MODIFIED Requirements

### Requirement: Workspace header provides sign-out

工作台顶栏 MUST 通过账号头像下拉菜单提供退出登录。该入口 MUST 在问答、录入、入库记录和用量页都可用，桌面与手机 MUST 使用同一顶栏入口，且 MUST NOT 替代主题图标按钮。顶栏 MUST NOT 再放置独立的「退出」文字按钮。手机抽屉 MUST NOT 承担退出。

#### Scenario: Header shows sign-out on every workspace page

- **WHEN** 已登录用户打开任意工作台页面
- **THEN** 顶栏右侧可见账号头像，主题图标按钮仍然在；展开头像菜单后可见「退出登录」

#### Scenario: Sign-out from usage page

- **WHEN** 用户在用量页打开头像菜单并选择退出登录
- **THEN** 会话结束并进入登录页

#### Scenario: Phone uses the same header menu

- **WHEN** 已登录用户以手机宽度打开任意工作台页面并点击顶栏头像
- **THEN** 下拉菜单出现「退出登录」，左侧抽屉导航不出现退出项

#### Scenario: Standalone sign-out text is gone

- **WHEN** 已登录用户查看顶栏
- **THEN** 看不到独立的「退出」文字按钮
