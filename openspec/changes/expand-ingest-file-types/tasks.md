## 1. Allowlist and content types

- [x] 1.1 将 `src/api/knowledge.ts` 的 `ALLOWED_EXTENSIONS` 改为 `pdf` / `docx` / `txt` / `md` / `png` / `jpg` / `jpeg`；`resolveContentType` 按 design 表格映射，`.md` 用 `text/markdown`；确认非 pdf 不再一律变成 `text/plain`
- [x] 1.2 确认 `src/stores/ingest.ts` 仍用该常量做入队拦截：`.docx` / `.png` 不再因类型失败；`.exe` 或超 100MB 仍本地失败且不打 presign

## 2. Ingest page and docs

- [x] 2.1 更新 `IngestView.vue` 的 `accept`、导语文案与拖拽提示，列出 pdf / docx / txt / md / png / jpg / jpeg，大小仍为 100MB
- [x] 2.2 更新 `README.md` 录入说明，去掉过时的 20MB 与不全的类型列表

## 3. Verify

- [x] 3.1 运行 `pnpm typecheck` 通过，且未新增 npm 依赖
- [x] 3.2 浏览器走查录入页：docx / png / jpg / jpeg / md 能入队走上传；exe 本地失败；选择器能看到新类型
