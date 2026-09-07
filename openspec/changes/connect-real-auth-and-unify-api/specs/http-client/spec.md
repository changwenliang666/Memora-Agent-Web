## ADDED Requirements

### Requirement: Envelope responses are unwrapped

当成功响应体包含 `code`、`message` 与 `data`，且 `code` 表示成功时，调用方 MUST 收到内层 `data`，而不是整封信封。不含该信封形状的成功响应 MUST 原样交给调用方。

#### Scenario: Successful envelope yields inner data

- **WHEN** 后端返回 HTTP 成功且 `code` 为成功码、`data` 为业务对象
- **THEN** 调用方读到的响应体是该业务对象，而不是带 `code` 的信封

#### Scenario: Non-envelope success is unchanged

- **WHEN** 后端返回 HTTP 成功且响应体没有信封字段
- **THEN** 调用方读到的仍是该原始 JSON 对象

### Requirement: Failed requests show an error toast

共享客户端在业务失败（信封 `code` 非成功）、HTTP 4xx/5xx、网络失败或超时 MUST 用可读消息展示错误 toast。成功响应 MUST NOT 展示 toast。

#### Scenario: Business failure is toasted

- **WHEN** 后端返回 HTTP 成功但信封 `code` 表示失败
- **THEN** 出现错误 toast，文案为信封中的 `message`，调用方收到规范化错误

#### Scenario: HTTP error is toasted

- **WHEN** 后端返回 4xx 或 5xx
- **THEN** 出现错误 toast，文案为可读失败原因

#### Scenario: Success is silent

- **WHEN** 请求成功完成
- **THEN** 不出现成功 toast

## MODIFIED Requirements

### Requirement: Normalized request and response errors

共享客户端 MUST 规范化网络失败、超时、HTTP 错误状态，以及 HTTP 成功但信封 `code` 非成功的业务失败，使调用方能读取稳定的错误信息字段，而不必解析底层实现细节。当响应体提供 `message` 或 `detail` 时，可读消息 MUST 使用这些字段。

#### Scenario: Server returns an error status

- **WHEN** 后端返回 4xx 或 5xx 响应
- **THEN** 调用方收到包含状态码和可读消息的规范化错误，而不是未处理的原始异常

#### Scenario: Network or timeout failure

- **WHEN** 请求因网络不可达或超时失败
- **THEN** 调用方收到规范化错误，消息区分超时与网络失败

#### Scenario: Envelope business failure is an error

- **WHEN** 后端返回 HTTP 成功且信封 `code` 表示失败
- **THEN** 调用方收到包含该 `code` 与 `message` 的规范化错误，而不是成功结果

#### Scenario: FastAPI error body uses detail

- **WHEN** 后端返回 4xx 且响应体只有 `detail` 字段
- **THEN** 规范化错误的可读消息包含该 `detail` 文本
