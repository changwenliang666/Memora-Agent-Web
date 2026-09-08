## Why

录入页仍只允许 `pdf` / `txt` / `md`，选择 `docx` 或图片会在本地直接失败。Memora-Agent 上传白名单已经包含 `.pdf`、`.docx`、`.txt`、`.md`、`.png`、`.jpg`、`.jpeg`，前端需要与之对齐，用户才能把这些文件送进知识库。

## What Changes

- 录入白名单扩展为 `.pdf`、`.docx`、`.txt`、`.md`、`.png`、`.jpg`、`.jpeg`（Markdown 对应 `.md`）。
- 按扩展名申报与后端一致的 `content_type`，直传 R2 时 `Content-Type` 与申报相同。
- 录入页提示、文件选择器 `accept` 与 README 同步为上述类型；大小上限仍为 100MB。
- 不在白名单内的类型（例如 `.exe`、`.doc`、`.webp`）仍本地拒绝，不发起预签名。

不包含：改 Memora-Agent、放宽 `.markdown` / `.doc` / `.webp`、改大小上限、改上传三步协议、入库记录真实接口。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `knowledge-ingest`: 录入允许的文件类型与 Agent 白名单对齐，覆盖文档、Markdown 与常见图片。

## Impact

- API：`src/api/knowledge.ts` 的扩展名常量与 `content_type` 映射。
- 状态与页面：`src/stores/ingest.ts` 沿用同一常量；`src/views/knowledge/IngestView.vue` 更新 `accept` 与文案。
- 文档：`README.md` 录入说明与现行限制对齐。
- 依赖：不新增 npm 包，不改 FastAPI。
