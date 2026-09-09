## MODIFIED Requirements

### Requirement: Queue follows server ingest status after upload completes

直传三步（申请地址、对象存储写入、完成确认）成功后，对应队列项 MUST 使用完成确认返回的文件标识查询入库状态，直到服务端给出终态 `done` 或 `failed`，或用户离开本应用会话。查询 MUST 使用现有 Agent 文件接口，MUST NOT 把完成确认成功等同于入库完成。成功查询 MUST 把解信封后的 `data.status` 立刻写到用户仍停留在录入页时可见的队列标签与说明；当该值为 `done` 或 `failed` 时，该项 MUST 停止显示排队中、处理中或上传中，并停止继续查询该文件。入库阶段 MUST 以离散状态展示进度，MUST NOT 把直传百分比伪装成入库百分比。任一次状态查询失败 MUST 保留文件名与最近一次已知状态，MUST NOT 让录入页崩溃。

#### Scenario: Successful upload starts ingest tracking

- **WHEN** 用户添加一份合法文档且三步直传均成功，完成确认返回文件标识与 `pending`
- **THEN** 队列项进入等待入库状态，并开始按该标识查询入库进度

#### Scenario: Ingest completion is visible in the queue

- **WHEN** 用户仍停留在录入页，且该文件的状态查询成功返回信封内 `data.status` 为 `done`
- **THEN** 对应队列项的可见标签与说明变为已完成，且不再显示排队中、处理中或上传中

#### Scenario: Ingest failure is visible in the queue

- **WHEN** 用户仍停留在录入页，且该文件的状态查询成功返回信封内 `data.status` 为 `failed`
- **THEN** 对应队列项的可见标签变为失败；若响应含失败原因，队列展示该原因，且不再显示排队中、处理中或上传中

#### Scenario: Upload percent is only for the transfer step

- **WHEN** 文件正在直传到对象存储
- **THEN** 队列可以展示上传百分比；直传结束后该百分比不再作为入库进度

### Requirement: Records page lists ingest history

知识库入库记录页 MUST 列出当前登录用户已进入平台视角的文件记录（含排队中、处理中、已完成与失败），至少包含文件名、大小、状态和时间。状态展示 MUST 与服务端 `pending`、`processing`、`done`、`failed` 可区分对应，MUST NOT 把 `done` 显示成处理中。失败记录在服务端提供原因时 MUST 展示该原因。桌面与平板宽度下 MUST 以表格呈现；手机宽度下 MUST 以卡片呈现，且上述字段与分页器均可完整阅读、MUST NOT 出现横向滚动。记录 MUST 来自当前用户的文件列表接口，MUST NOT 使用内置示例数据。列表 MUST 提供分页器，按服务端 `limit` / `offset` 翻页，MUST NOT 用「加载更多」追加。筛选与排序控件不在本能力范围内；每一页按服务端返回的新到旧顺序展示。

#### Scenario: Desktop shows a records table

- **WHEN** 用户以桌面宽度打开入库记录页且存在记录
- **THEN** 表格展示文件名、大小、状态和时间，表格下方出现带页码的分页器

#### Scenario: Phone shows records without horizontal scrolling

- **WHEN** 用户以手机宽度打开入库记录页且存在记录
- **THEN** 每条记录的文件名、大小、状态和时间均可读，页面不出现横向滚动条

#### Scenario: Empty records state

- **WHEN** 用户打开入库记录页且当前用户没有任何记录
- **THEN** 页面展示空状态说明，而不是残缺表头、报错页或示例文件名

#### Scenario: Records reflect server statuses

- **WHEN** 列表中同时存在排队中、处理中、已完成和失败的文件
- **THEN** 四种状态均可被用户区分，失败项在有原因时显示失败原因

#### Scenario: Records reload on each visit

- **WHEN** 用户离开入库记录页后再进入
- **THEN** 页面重新请求当前用户的文件列表，而不是继续展示上一次会话缓存的示例或过期列表

#### Scenario: Phone records include a compact pager

- **WHEN** 用户以手机宽度打开入库记录页且记录超过一页
- **THEN** 卡片列表下方出现可点击的上一页 / 页码 / 下一页，分页器不超出视口宽度

#### Scenario: In-flight record becomes done after refresh

- **WHEN** 入库记录页当前页某条仍显示排队中或处理中，且随后一次列表请求中该条 `status` 为 `done`
- **THEN** 该条的可见状态变为已完成，且不再显示处理中或排队中
