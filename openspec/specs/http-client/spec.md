# http-client Specification

## Purpose

提供可复用的前端 HTTP 客户端，统一基址、超时和错误形状，让业务模块不必各自配置请求。

## Requirements

### Requirement: Shared HTTP client with environment base URL

应用 MUST 提供一个可被业务模块导入的共享 HTTP 客户端。该客户端 MUST 使用环境变量中的 API 基址作为默认前缀，并对未配置基址给出明确失败，而不是静默请求错误主机。

#### Scenario: Request uses configured base URL

- **WHEN** 业务模块通过共享客户端请求相对路径 `/health`
- **THEN** 实际请求 URL 以当前环境的 API 基址为前缀

#### Scenario: Base URL is missing

- **WHEN** 当前环境未配置 API 基址且业务模块发起请求
- **THEN** 客户端拒绝发出该请求，并返回可识别的配置错误，而不是发往未知主机

### Requirement: Normalized request and response errors

共享客户端 MUST 规范化网络失败、超时和 HTTP 错误状态，使调用方能读取稳定的错误信息字段，而不必解析底层实现细节。

#### Scenario: Server returns an error status

- **WHEN** 后端返回 4xx 或 5xx 响应
- **THEN** 调用方收到包含状态码和可读消息的规范化错误，而不是未处理的原始异常

#### Scenario: Network or timeout failure

- **WHEN** 请求因网络不可达或超时失败
- **THEN** 调用方收到规范化错误，消息区分超时与网络失败

### Requirement: JSON requests are the default

共享客户端 MUST 默认以 JSON 发送和解析请求体，除非调用方显式指定其他内容类型。

#### Scenario: Posting a JSON body

- **WHEN** 业务模块用共享客户端 POST 一个普通对象
- **THEN** 请求以 JSON 发出，成功响应中的 JSON 体被解析为对象交给调用方

### Requirement: Authenticated requests carry the session token

共享客户端在存在有效会话时 MUST 为后续请求附带认证信息，使业务模块不必各自读取 token。没有有效会话时 MUST NOT 伪造认证头。

#### Scenario: Request includes the stored token

- **WHEN** 本地存在未过期会话且业务模块通过共享客户端发起请求
- **THEN** 请求带上该会话的认证信息

#### Scenario: Request without a session has no auth header

- **WHEN** 本地没有有效会话且业务模块发起请求
- **THEN** 请求不携带认证头

### Requirement: Unauthorized responses clear the session

共享客户端收到 401 响应时 MUST 清除本地会话，使后续访问工作台被当作未登录处理。

#### Scenario: 401 drops the stored session

- **WHEN** 共享客户端收到 401 响应且本地仍有会话
- **THEN** 该会话被清除
