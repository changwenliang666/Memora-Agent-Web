# app-shell Specification

## Purpose

为 RAG 工作台提供统一的应用壳：左侧系统导航、右侧功能区、顶栏主题入口，并在窄屏用同一套导航数据改为抽屉，而不是独立移动站。

## Requirements

### Requirement: Desktop shell uses collapsible sidebar and content pane

在桌面宽度下，应用 MUST 以左侧导航、右侧功能页的两栏壳展示。导航 MUST 可以在展开（图标加文案）与折叠（仅图标）之间切换，折叠后功能页仍完整可用。

#### Scenario: Desktop shows sidebar and page

- **WHEN** 用户以桌面宽度打开应用
- **THEN** 左侧可见系统导航，右侧展示当前路由对应的功能页

#### Scenario: User collapses the sidebar

- **WHEN** 用户在桌面宽度下折叠侧栏
- **THEN** 侧栏收为仅图标，右侧功能页仍可操作，当前页不丢失

#### Scenario: User expands the sidebar

- **WHEN** 侧栏处于折叠且用户展开它
- **THEN** 侧栏恢复图标加文案，当前路由保持不变

### Requirement: Knowledge is a cascaded first-level menu

导航 MUST 将「知识库」作为一级项，并包含三个子项：问答、录入、入库记录。点击「知识库」本身 MUST 只展开或收起子项，MUST NOT 进入单独的知识库总览页。知识库在进入应用时 MUST 默认展开，以便三项直接可见。

#### Scenario: Knowledge submenu is expanded on first visit

- **WHEN** 用户打开应用并看到侧栏或抽屉导航
- **THEN** 「知识库」处于展开，问答、录入、入库记录三项可见

#### Scenario: Parent item does not navigate

- **WHEN** 用户点击「知识库」一级项
- **THEN** 子菜单展开或收起，地址栏不进入知识库总览页

#### Scenario: Child items navigate to their pages

- **WHEN** 用户点击问答、录入或入库记录
- **THEN** 右侧切换到对应功能页，该子项呈选中态

### Requirement: Usage is a second top-level destination

导航 MUST 在知识库之外提供一级「用量」入口，进入用量统计页。第一期 MUST NOT 再放置禁用的设置占位项。

#### Scenario: Usage sits beside knowledge

- **WHEN** 用户查看系统导航
- **THEN** 可见与「知识库」平级的「用量」项

#### Scenario: Usage opens the stats page

- **WHEN** 用户点击「用量」
- **THEN** 右侧展示用量统计页

### Requirement: Default routes land on knowledge chat

访问应用根路径或知识库父路径时，应用 MUST 进入知识库问答页，而不是骨架首页。

#### Scenario: Root redirects to chat

- **WHEN** 用户打开应用根路径
- **THEN** 展示知识库问答页

#### Scenario: Knowledge parent path redirects to chat

- **WHEN** 用户打开知识库父路径
- **THEN** 展示知识库问答页，导航选中「问答」

### Requirement: Phone and tablet use a drawer instead of a persistent sidebar

在手机宽度下，应用 MUST NOT 常驻展开侧栏。用户 MUST 能从顶栏打开与桌面同一套导航数据的抽屉，选择页面后抽屉关闭。从桌面宽度拖到手机宽度（或反向）时，布局 MUST 在同一地址上更新。平板宽度下侧栏 MUST 默认折叠为图标轨，或使用与手机相同的抽屉，不得挡住功能页主体。

#### Scenario: Phone opens navigation from the header

- **WHEN** 用户以手机宽度打开应用并点开导航入口
- **THEN** 抽屉展示知识库级联与用量，与桌面导航项一致

#### Scenario: Choosing a page closes the phone drawer

- **WHEN** 用户在手机抽屉中选择一个可导航项
- **THEN** 进入对应页且抽屉关闭

#### Scenario: Resizing updates chrome without changing the URL

- **WHEN** 用户将同一会话从桌面宽度改为手机宽度
- **THEN** 壳变为窄屏导航，当前页与已有业务状态保持，地址不变

### Requirement: Theme switch lives in the shell header

壳顶栏 MUST 提供颜色模式入口。该入口 MUST 是图标按钮：浅色模式显示月亮（表示可切到深色），深色模式显示太阳（表示可切到浅色）。MUST NOT 再使用两侧标注「浅色」「深色」的表单开关作为顶栏入口。该入口 MUST 反映当前模式，并允许用户切换。各功能页 MUST NOT 再各自放置一套主题开关作为唯一入口。

#### Scenario: Header switch reflects current mode

- **WHEN** 用户打开任意工作台页面
- **THEN** 顶栏可见主题图标按钮，图标与当前浅色或深色模式一致

#### Scenario: Header switch toggles mode on every page

- **WHEN** 用户在问答、录入、入库记录或用量页点击顶栏主题图标
- **THEN** 界面立即切换到相反颜色模式，刷新后仍恢复该选择

#### Scenario: Header does not show dual theme labels

- **WHEN** 用户查看顶栏
- **THEN** 看不到「浅色」与「深色」并排文案
