## ADDED Requirements

### Requirement: Composer is tall enough for multi-line drafting

问答输入区 MUST 默认露出不少于约两行正文的高度，以便用户看清正在写的问题。输入区 MAY 随内容增高，但 MUST NOT 占满消息区。Enter 发送、Shift+Enter 换行、组字中不发送的行为 MUST 保持不变。

#### Scenario: Idle composer shows about two lines

- **WHEN** 用户打开问答页且输入区为空
- **THEN** 输入区可视高度至少能容纳约两行文字，而不是单行挤扁的细条

### Requirement: Send and stop occupy one exclusive action slot

输入区右侧 MUST 只有一个动作槽位。空闲且未在生成时 MUST 显示可点的发送控件（空内容时禁用）。流式回答进行中 MUST 隐藏发送控件，只显示停止控件。停止控件 MUST 是圆形按钮，中心为实心方块，而不是「停止」文字块。停止后输入区 MUST 恢复显示发送控件。窄屏 MUST 仍能点到发送或停止，不得只依赖键盘。

#### Scenario: Idle shows send only

- **WHEN** 用户打开问答页且没有进行中的回答
- **THEN** 输入区旁可见发送控件，且看不到停止控件

#### Scenario: Streaming hides send and shows stop

- **WHEN** 助手正在流式输出
- **THEN** 发送控件不可见，停止控件可见，且停止控件中心是方块图标

#### Scenario: Stop restores the send control

- **WHEN** 用户在生成中点击停止
- **THEN** 不再追加新文本，已生成内容保留，发送控件重新出现，停止控件消失
