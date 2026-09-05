## ADDED Requirements

### Requirement: Session includes an account label for display

登录或注册成功后的会话 MUST 包含用户所用账号，供工作台生成身份标识。账号缺失、或去掉首尾空白后为空时，MUST 视为不可展示。

#### Scenario: Successful auth stores the account

- **WHEN** 用户以账号 `alice123` 登录或注册成功
- **THEN** 会话中可读取到账号 `alice123`

#### Scenario: Blank account is not displayable

- **WHEN** 会话缺少账号或账号仅含空白
- **THEN** 该账号不可作为身份标识展示
