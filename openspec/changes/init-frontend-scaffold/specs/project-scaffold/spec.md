## Purpose

为开发者提供可安装、启动、类型检查和构建的前端工程骨架，并约定目录、别名、环境变量、首页路由和共享状态落点。

## ADDED Requirements

### Requirement: Project can be installed and started

仓库根目录 MUST 提供前端工程清单与脚本，使开发者在安装依赖后能启动本地开发服务、执行类型检查，以及产出生产构建。

#### Scenario: Fresh install and development server

- **WHEN** 开发者在仓库根目录安装依赖并运行开发脚本
- **THEN** 本地开发服务成功启动，并可通过浏览器访问应用页面

#### Scenario: Typecheck and production build

- **WHEN** 开发者运行类型检查脚本和生产构建脚本
- **THEN** 两者均成功完成，且构建产物被写入约定的输出目录

### Requirement: Source layout and path alias

工程 MUST 提供稳定的源码目录约定，并支持用 `@/` 别名引用 `src/` 下的模块，使页面、接口、共享状态和样式有明确落点。

#### Scenario: Alias resolves from a page module

- **WHEN** 页面模块通过 `@/` 导入 `src/` 内的共享模块
- **THEN** 开发服务和生产构建都能正确解析该导入，不因相对路径层级失败

#### Scenario: Conventional directories exist

- **WHEN** 开发者查看 `src/` 目录
- **THEN** 至少能看到页面、路由、接口、共享状态、样式和静态资源的约定目录或等价入口文件

### Requirement: Environment variables for runtime config

工程 MUST 提供开发与生产环境变量示例，至少包含 API 基址；应用在启动时 MUST 能读取该基址供 HTTP 客户端使用。

#### Scenario: Development base URL is available

- **WHEN** 开发者使用开发环境配置启动应用
- **THEN** 应用能读取到开发环境的 API 基址，且该值可被 HTTP 客户端使用

#### Scenario: Missing example does not block bootstrap

- **WHEN** 开发者克隆仓库后查看环境文件
- **THEN** 仓库提供可复制的环境示例，且示例中的密钥或真实地址不会被提交为生产秘密

### Requirement: Home route is reachable

应用 MUST 在根路径提供首页，未匹配路径 MUST 回落到该首页或明确的未找到状态，避免空白页。

#### Scenario: Opening the root path

- **WHEN** 用户在开发服务中访问 `/`
- **THEN** 应用渲染首页，而不是空白文档

### Requirement: README documents bootstrap commands

根 README MUST 说明包管理器、Node 版本要求，以及安装、启动、类型检查和构建命令。

#### Scenario: New contributor follows README

- **WHEN** 新贡献者阅读根 README
- **THEN** 能独立完成依赖安装、启动开发和生产构建，而无需再翻其他文档
