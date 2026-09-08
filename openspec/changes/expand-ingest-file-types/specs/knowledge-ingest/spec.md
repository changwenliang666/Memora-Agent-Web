## ADDED Requirements

### Requirement: Ingest accepts Agent-supported file types and size

录入页 MUST 接受扩展名为 `.pdf`、`.docx`、`.txt`、`.md`、`.png`、`.jpg`、`.jpeg` 的文件，且单个文件大小 MUST 不超过 104857600 字节（100MB）。Markdown 文件 MUST 以 `.md` 扩展名识别。类型或大小不合规的文件 MUST 进入队列并直接标记为失败，MUST NOT 向 Agent 服务申请上传地址。合规文件 MUST 按扩展名申报与 Agent 一致的内容类型后再走上传。

#### Scenario: Word document is accepted

- **WHEN** 用户选择一份不超过 100MB 的 `.docx` 文件
- **THEN** 该文件进入上传流程，而不是在本地因类型被标为失败

#### Scenario: Image files are accepted

- **WHEN** 用户选择一份不超过 100MB 的 `.png`、`.jpg` 或 `.jpeg` 文件
- **THEN** 该文件进入上传流程，而不是在本地因类型被标为失败

#### Scenario: Markdown file uses md extension

- **WHEN** 用户选择一份不超过 100MB 的 `.md` 文件
- **THEN** 该文件进入上传流程

#### Scenario: Disallowed extension is rejected locally

- **WHEN** 用户选择一份 `.exe` 或其他未列出的扩展名文件
- **THEN** 队列出现该文件名，状态为失败，且不发起预签名请求

#### Scenario: Oversized file is rejected locally

- **WHEN** 用户选择一份超过 100MB 的 `.pdf`
- **THEN** 队列出现该文件名，状态为失败，且不发起预签名请求
