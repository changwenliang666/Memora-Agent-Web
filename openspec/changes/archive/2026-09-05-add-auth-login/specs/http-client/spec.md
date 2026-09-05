## ADDED Requirements

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
