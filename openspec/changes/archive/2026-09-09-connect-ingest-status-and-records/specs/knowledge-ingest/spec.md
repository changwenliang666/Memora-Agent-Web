## MODIFIED Requirements

### Requirement: Ingest page accepts files into a visible queue

知识库录入页 MUST 提供文件选择区域，支持点击选择，并在指针设备上支持拖拽放入。加入的文件 MUST 出现在本页队列中，并展示可识别的状态。队列 MUST 能区分：尚未开始、正在直传、已提交等待入库、正在入库、入库完成、失败。选择或拖入 MUST 不要求此时对象存储或入库 worker 已接通。

#### Scenario: User adds files from the picker

- **WHEN** 用户在录入页选择一个或多个文件
- **THEN** 队列中出现对应文件名与状态

#### Scenario: User drops files onto the page

- **WHEN** 用户在桌面宽度把文件拖到录入区并放下
- **THEN** 这些文件进入同一队列

#### Scenario: Queue shows progress states

- **WHEN** 队列中存在文件
- **THEN** 每条至少能区分未完成、已完成或失败，用户能看出哪些还不能检索

#### Scenario: Queue distinguishes upload from ingest

- **WHEN** 一份文件已直传成功但仍在等待或执行入库
- **THEN** 队列项不得显示为已完成，且文案能与「正在直传」区分

#### Scenario: Phone queue stays readable

- **WHEN** 用户以手机宽度查看本次队列且其中有正在直传或入库的文件
- **THEN** 文件名、状态和失败原因均可完整阅读，直传百分比独占一行，页面不出现横向滚动条

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

## ADDED Requirements

### Requirement: Queue follows server ingest status after upload completes

直传三步（申请地址、对象存储写入、完成确认）成功后，对应队列项 MUST 使用完成确认返回的文件标识查询入库状态，直到服务端给出终态 `done` 或 `failed`，或用户离开本应用会话。查询 MUST 使用现有 Agent 文件接口，MUST NOT 把完成确认成功等同于入库完成。入库阶段 MUST 以离散状态展示进度，MUST NOT 把直传百分比伪装成入库百分比。任一次状态查询失败 MUST 保留文件名与最近一次已知状态，MUST NOT 让录入页崩溃。

#### Scenario: Successful upload starts ingest tracking

- **WHEN** 用户添加一份合法文档且三步直传均成功，完成确认返回文件标识与 `pending`
- **THEN** 队列项进入等待入库状态，并开始按该标识查询入库进度

#### Scenario: Ingest completion is visible in the queue

- **WHEN** 该文件的状态查询返回 `done`
- **THEN** 对应队列项标记为已完成

#### Scenario: Ingest failure is visible in the queue

- **WHEN** 该文件的状态查询返回 `failed`
- **THEN** 对应队列项标记为失败；若响应含失败原因，队列展示该原因

#### Scenario: Upload percent is only for the transfer step

- **WHEN** 文件正在直传到对象存储
- **THEN** 队列可以展示上传百分比；直传结束后该百分比不再作为入库进度

### Requirement: Records page loads the signed-in user's files

入库记录页 MUST 向 Agent 请求当前登录用户的文件摘要列表。列表项 MUST 使用摘要字段（标识、文件名、大小、状态、时间、失败原因），MUST NOT 请求或展示 markdown、纯文本或 OCR 正文。页面 MUST 使用分页器请求当前页：默认每页 20 条，翻页时用 `offset = (页码 - 1) * 每页条数` 替换当前页，MUST NOT 把后续页追加在旧页后面。本页条数等于每页条数时 MUST 允许进入下一页；本页不足时 MUST 视为最后一页。桌面分页器 MUST 展示页码；手机分页器 MUST 紧凑且不引发横向滚动。列表请求失败时 MUST 展示可读错误，MUST NOT 回退到内置示例数据。

#### Scenario: Signed-in user sees their files newest first

- **WHEN** 已登录用户打开入库记录页且服务端返回该用户的文件摘要
- **THEN** 页面按返回顺序展示这些文件，不出现其他用户的文件，也不出现示例文件名

#### Scenario: Desktop pager shows page numbers

- **WHEN** 用户以桌面宽度打开入库记录页且至少有一页记录
- **THEN** 表格下方出现带页码的分页器，当前页高亮

#### Scenario: User can turn to the next page

- **WHEN** 当前页已按每页条数填满且用户选择下一页
- **THEN** 页面用下一页的 `offset` 重新请求并替换列表，不把新旧记录叠在同一页

#### Scenario: User can return to the previous page

- **WHEN** 用户已在第 2 页或更后并选择上一页
- **THEN** 页面展示上一页记录，分页器停留在对应页码

#### Scenario: List request failure is visible

- **WHEN** 文件列表请求失败
- **THEN** 页面展示可读错误，且不插入内置示例记录
