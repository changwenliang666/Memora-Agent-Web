## Context

见 `proposal.md` 的动机。现状：前端 `ALLOWED_EXTENSIONS` 只有 `pdf` / `txt` / `md`，`resolveContentType` 把非 pdf 一律报 `text/plain`。录入页 `accept` 与文案同样只有三类。Memora-Agent `storage/validate.py` 已允许 `.pdf`、`.docx`、`.md`、`.txt`、`.png`、`.jpg`、`.jpeg`，且要求 `content_type` 与扩展名匹配。直传三步（presign → PUT → complete）不变。

未归档的 `connect-knowledge-ingest-upload` 曾把 `.docx` 定为本地拒绝；本次以后端现行白名单为准。

## Goals / Non-Goals

**Goals:**

- 前端白名单、内容类型映射、选择器与文案与 Agent 对齐。
- 非法类型与超 100MB 仍在入队时拦截，不打 presign。

**Non-Goals:**

- 不改后端、不改上传协议、不改大小上限。
- 不支持 `.markdown`、`.doc`、`.webp`。
- 不按类型改队列状态机或记录页。

## Decisions

### 1. Markdown 只认 `.md`

- **选择**：用户说的 markdown 对应 `.md`，与 Agent 白名单一致。
- **原因**：后端没有 `.markdown`；多一个后缀会在 presign 被拒。
- **备选**：同时放行 `.markdown`——要改 FastAPI，超出本仓库。

### 2. 扩展名常量仍集中在 `knowledge.ts`

- **选择**：`ALLOWED_EXTENSIONS` 改为 `pdf`、`docx`、`txt`、`md`、`png`、`jpg`、`jpeg`。store 与页面继续引用该常量；`accept` 与提示按同一列表生成或手写对齐。
- **原因**：现有入队校验已经读这个常量，不必新模块。
- **备选**：页面自己维护一份 accept——容易和校验漂移。

### 3. `content_type` 按扩展名映射，不信任 `file.type`

| 扩展名 | 申报 / PUT 的 Content-Type |
|---|---|
| `pdf` | `application/pdf` |
| `docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `txt` | `text/plain` |
| `md` | `text/markdown` |
| `png` | `image/png` |
| `jpg` / `jpeg` | `image/jpeg` |

- **选择**：`.md` 用 `text/markdown`（后端也允许 `text/plain`）。浏览器对 docx/md 的 `file.type` 经常为空或不准，仍按扩展名映射。
- **原因**：预签名把 ContentType 写进签名，申报和 PUT 必须一致，否则 R2 拒签或 Agent 返回类型不匹配。
- **备选**：沿用「非 pdf 即 text/plain」——docx/图片会 400。

未知扩展名在 store 已拦截，映射函数不必再兜底成 octet-stream。

## Risks / Trade-offs

- [选择器仍能挑到白名单外的文件] → `accept` 只是系统对话框提示；store 继续本地失败。
- [R2 桶 CORS 未含图片 Content-Type] → PUT 可能失败；队列标失败。桶策略不在本仓库。
- [未归档 change 仍写「docx 本地拒绝」] → 实现以本 change 为准；归档时以后端白名单这条为准。

## Migration Plan

无数据迁移。回滚即恢复三类扩展名与旧映射。
