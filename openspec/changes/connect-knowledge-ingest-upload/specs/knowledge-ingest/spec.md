## MODIFIED Requirements

### Requirement: Upload transfer is a replaceable step

将文件传到远端的步骤 MUST 独立于选文件和排队，MUST NOT 把云存储 SDK 写进页面组件。该步骤 MUST 按顺序完成：向 Agent 服务申请预签名上传地址、把文件字节直接放到该地址、再向 Agent 服务提交完成确认。任一步失败时，对应队列项 MUST 标记为失败并保留文件名。

#### Scenario: Successful transfer reaches ready

- **WHEN** 用户添加一份合法文档且三步上传均成功
- **THEN** 对应队列项标记为已就绪，且文件字节不经过页面里的云存储 SDK

#### Scenario: Files can be queued without a live cloud provider

- **WHEN** 远端上传尚未接通且用户添加文件
- **THEN** 录入页不崩溃，队列仍展示这些文件及其状态

#### Scenario: Failed transfer is visible

- **WHEN** 申请地址、直传或完成确认任一步失败
- **THEN** 对应队列项标记为失败，并保留文件名

#### Scenario: Missing agent base URL fails visibly

- **WHEN** 未配置 Agent 服务基址且用户添加一份合法文档
- **THEN** 录入页不崩溃，对应队列项标记为失败

## ADDED Requirements

### Requirement: Ingest accepts only declared document types and size

录入页 MUST 只接受扩展名为 `.pdf`、`.txt`、`.md` 的文件，且单个文件大小 MUST 不超过 104857600 字节（100MB）。类型或大小不合规的文件 MUST 进入队列并直接标记为失败，MUST NOT 向 Agent 服务申请上传地址。

#### Scenario: Disallowed extension is rejected locally

- **WHEN** 用户选择一份 `.docx` 文件
- **THEN** 队列出现该文件名，状态为失败，且不发起预签名请求

#### Scenario: Oversized file is rejected locally

- **WHEN** 用户选择一份超过 100MB 的 `.pdf`
- **THEN** 队列出现该文件名，状态为失败，且不发起预签名请求
