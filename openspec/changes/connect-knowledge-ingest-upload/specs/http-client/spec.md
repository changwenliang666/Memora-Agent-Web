## ADDED Requirements

### Requirement: Agent file requests use a separate base URL

发往 Agent 文件接口的请求 MUST 使用独立的 Agent 基址环境变量，MUST NOT 复用问答服务的默认 API 基址。该基址未配置时，文件请求 MUST 明确失败，而不是改打到问答服务。

#### Scenario: File request uses the agent base URL

- **WHEN** 已配置 Agent 基址且业务模块请求相对路径 `/files/presign`
- **THEN** 实际请求 URL 以 Agent 基址为前缀，而不是问答服务基址

#### Scenario: Agent base URL is missing

- **WHEN** 未配置 Agent 基址且业务模块发起文件接口请求
- **THEN** 客户端拒绝发出该请求，并返回可识别的配置错误

## MODIFIED Requirements

### Requirement: Normalized request and response errors

共享客户端 MUST 规范化网络失败、超时和 HTTP 错误状态，使调用方能读取稳定的错误信息字段，而不必解析底层实现细节。当响应体同时或单独提供 `detail` 与 `message` 时，可读消息 MUST 优先使用 `detail`，以便调用方看到 FastAPI 返回的原因。

#### Scenario: Server returns an error status

- **WHEN** 后端返回 4xx 或 5xx 响应
- **THEN** 调用方收到包含状态码和可读消息的规范化错误，而不是未处理的原始异常

#### Scenario: Network or timeout failure

- **WHEN** 请求因网络不可达或超时失败
- **THEN** 调用方收到规范化错误，消息区分超时与网络失败

#### Scenario: FastAPI error body uses detail

- **WHEN** 后端返回 4xx 且响应体只有 `detail` 字段
- **THEN** 规范化错误的可读消息包含该 `detail` 文本
