## MODIFIED Requirements

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
