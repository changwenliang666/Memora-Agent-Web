# knowledge-ingest Specification

## Purpose

覆盖知识库文件进入平台的两条界面：录入页负责选择、排队，并把允许的文档直传到对象存储；入库记录页负责查看历史状态。

## Requirements

### Requirement: Ingest page accepts files into a visible queue

知识库录入页 MUST 提供文件选择区域，支持点击选择，并在指针设备上支持拖拽放入。加入的文件 MUST 出现在本页队列中，并展示可识别的状态（至少包括等待、上传或处理中、已就绪、失败）。选择或拖入 MUST 不要求此时已接通真实云存储。

#### Scenario: User adds files from the picker

- **WHEN** 用户在录入页选择一个或多个文件
- **THEN** 队列中出现对应文件名与状态

#### Scenario: User drops files onto the page

- **WHEN** 用户在桌面宽度把文件拖到录入区并放下
- **THEN** 这些文件进入同一队列

#### Scenario: Queue shows progress states

- **WHEN** 队列中存在文件
- **THEN** 每条至少能区分未完成、已就绪或失败，用户能看出哪些还不能检索

### Requirement: Upload transfer is a replaceable step

将文件传到远端的步骤 MUST 独立于选文件和排队，以便后续替换为实现（例如 Cloudflare）。本阶段该步骤可以是占位实现：文件仍 MUST 能进入队列并变更状态，MUST NOT 把云存储 SDK 写进页面组件。

#### Scenario: Files can be queued without a live cloud provider

- **WHEN** 远端上传尚未接通且用户添加文件
- **THEN** 录入页不崩溃，队列仍展示这些文件及其状态

#### Scenario: Failed transfer is visible

- **WHEN** 上传或处理步骤失败
- **THEN** 对应队列项标记为失败，并保留文件名

### Requirement: Records page lists ingest history

知识库入库记录页 MUST 列出已进入平台视角的文件记录，至少包含文件名、大小、状态和时间。桌面宽度下 MUST 以表格呈现；手机宽度下 MUST 以不出现横向滚动的方式完整阅读上述字段（例如卡片）。记录数据可以来自接口或本阶段的示例数据，但切换粒度以外的筛选不在本能力范围内。

#### Scenario: Desktop shows a records table

- **WHEN** 用户以桌面宽度打开入库记录页且存在记录
- **THEN** 表格展示文件名、大小、状态和时间

#### Scenario: Phone shows records without horizontal scrolling

- **WHEN** 用户以手机宽度打开入库记录页且存在记录
- **THEN** 每条记录的文件名、大小、状态和时间均可读，页面不出现横向滚动条

#### Scenario: Empty records state

- **WHEN** 用户打开入库记录页且没有任何记录
- **THEN** 页面展示空状态说明，而不是残缺表头或报错页

### Requirement: Ingest and records stay on separate routes

录入与入库记录 MUST 是知识库下两个独立子页。录入页 MUST NOT 用完整历史表代替队列；记录页 MUST NOT 承担选择上传文件的主入口。

#### Scenario: Ingest page does not replace the records page

- **WHEN** 用户在录入页查看队列
- **THEN** 该页不展示完整入库历史表作为主内容

#### Scenario: Records page does not host the drop zone as its primary action

- **WHEN** 用户打开入库记录页
- **THEN** 主内容是记录列表或空状态，而不是大块上传区
