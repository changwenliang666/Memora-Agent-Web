## MODIFIED Requirements

### Requirement: Environment variables for runtime config

工程 MUST 提供开发与生产环境变量示例，且 MUST 只包含一个 API 基址，指向 FastAPI 服务。应用在启动时 MUST 能读取该基址供 HTTP 客户端使用。MUST NOT 再提供独立的 Agent 基址环境变量。开发环境的默认基址 MUST 指向本机 FastAPI 默认端口。

#### Scenario: Development base URL is available

- **WHEN** 开发者使用开发环境配置启动应用
- **THEN** 应用能读取到开发环境的 API 基址，且该值可被 HTTP 客户端使用，开发默认指向本机 8000 端口

#### Scenario: Missing example does not block bootstrap

- **WHEN** 开发者克隆仓库后查看环境文件
- **THEN** 仓库提供可复制的环境示例，且示例中的密钥或真实地址不会被提交为生产秘密

#### Scenario: Agent base URL is gone

- **WHEN** 开发者查看环境示例与类型声明
- **THEN** 看不到独立的 Agent 基址变量
