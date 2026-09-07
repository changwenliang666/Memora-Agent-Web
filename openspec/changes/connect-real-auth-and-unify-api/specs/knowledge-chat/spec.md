## ADDED Requirements

### Requirement: Chat does not call the Node demo gateway

问答 MUST NOT 请求独立 Node 问答网关。未接通 FastAPI 问答流时，应用 MUST 使用前端演示流完成发送、停止与贴底，使页面仍可验收。

#### Scenario: Sending without a live chat API still streams

- **WHEN** 用户发出非空问题且 FastAPI 问答流尚未接通
- **THEN** 助手消息以演示流逐步出现，不请求 Node 问答服务

#### Scenario: Stop still works on the demo stream

- **WHEN** 演示流输出进行中且用户选择停止
- **THEN** 不再追加新文本，已生成内容留在该条助手消息中
