## Purpose

提供知识库问答页：以对话为唯一主界面，支持发送、换行、流式回答和进页贴底，并在消息变多时保持页面可操作。

## ADDED Requirements

### Requirement: Chat page is a single conversation surface

知识库问答页 MUST 以对话为页面主体，包含消息区和底部输入区。第一期 MUST 只维护当前这一路会话，MUST NOT 提供会话列表或三栏历史。从录入、入库记录或用量回到本页时，同一浏览会话内的消息 MUST 仍然可见。

#### Scenario: Empty conversation shows a prompt state

- **WHEN** 用户进入问答页且还没有任何消息
- **THEN** 页面展示空态（简短说明与输入区），而不是空白文档或表格

#### Scenario: Conversation fills the page after sending

- **WHEN** 用户已发送至少一条消息
- **THEN** 消息区展示对话内容，输入区固定在底部

#### Scenario: Messages persist when leaving and returning

- **WHEN** 用户在已有对话时离开问答页再回来
- **THEN** 同一浏览会话内仍能看到离开前的消息

### Requirement: Enter sends and Shift+Enter inserts a newline

在桌面宽度下，输入区 MUST 把 Enter 视为发送，把 Shift+Enter 视为换行。正在使用输入法组字时，Enter MUST NOT 发送。内容为空或仅空白时 MUST NOT 发送。流式回答进行中 MUST NOT 再次发送。窄屏 MUST 另提供可点的发送按钮，不得只依赖 Enter。

#### Scenario: Enter sends a non-empty message

- **WHEN** 用户在桌面输入非空内容并按下 Enter，且未在组字、也没有进行中的回答
- **THEN** 该内容作为用户消息发出，输入框被清空

#### Scenario: Shift+Enter inserts a newline

- **WHEN** 用户按下 Shift+Enter
- **THEN** 输入区插入换行，消息不发送

#### Scenario: IME confirm does not send

- **WHEN** 用户正在用输入法组字并按下 Enter
- **THEN** 文字上屏或由输入法处理，消息不发送

#### Scenario: Empty submit is ignored

- **WHEN** 用户在输入为空时按 Enter 或点发送
- **THEN** 不增加消息，不发起请求

#### Scenario: Phone has a visible send control

- **WHEN** 用户以手机宽度打开问答页
- **THEN** 输入区旁有可点的发送控件

### Requirement: Entering the page scrolls to the latest message

用户进入问答页且已有消息时，消息区 MUST 滚动到最底部，使最新内容可见。进入包括首次打开本页，以及从其他工作台页回到本页。

#### Scenario: First open with history pins to bottom

- **WHEN** 用户打开已有历史消息的问答页
- **THEN** 消息区停在最底部，最后一条消息可见

#### Scenario: Return visit pins to bottom

- **WHEN** 用户从其他工作台页回到仍有历史的问答页
- **THEN** 消息区再次停在最底部

### Requirement: Streaming replies stay pinned only when the user is at the bottom

助手回答 MUST 随服务器增量数据逐步出现。若用户停留在消息区底部附近，新内容到来时 MUST 继续贴底。若用户已向上翻看历史，页面 MUST NOT 强行拽回底部。进行中 MUST 提供停止生成；停止后已出现的文字 MUST 保留。

#### Scenario: Tokens append to the current assistant message

- **WHEN** 用户发出问题且服务器开始流式返回
- **THEN** 一条助手消息的内容逐步增长，而不是每来一段就新增一条气泡

#### Scenario: Follows bottom while user stays there

- **WHEN** 流式输出进行中且用户停留在底部附近
- **THEN** 最新生成的文字保持可见

#### Scenario: Does not steal scroll after user reads history

- **WHEN** 流式输出进行中且用户已向上滚动离开底部
- **THEN** 滚动位置不被自动拉回底部

#### Scenario: User can stop generation

- **WHEN** 回答正在流式输出且用户选择停止
- **THEN** 不再追加新文本，已生成内容留在该条助手消息中，输入区恢复可发送

### Requirement: Long conversations remain usable while streaming

流式更新 MUST 只影响当前正在生成的助手消息。已经完成的历史消息 MUST 保持原样可见，页面 MUST 仍可滚动。第一期 MUST NOT 依赖独立虚拟列表方案才能完成上述行为。

#### Scenario: Earlier messages do not change during streaming

- **WHEN** 历史中已有多条完成的消息且最新一条正在流式输出
- **THEN** 已完成消息的文案与顺序保持不变，用户仍能向上滚动查看它们
