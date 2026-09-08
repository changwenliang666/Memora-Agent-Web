<template>
  <div class="page">
    <section class="intro">
      <p class="kicker">知识库录入</p>
      <h2>把文件送入知识库</h2>
      <p class="lead">
        选择或拖入文档，上传成功后服务端开始处理，完成后会在飞书群里通知。支持 pdf / docx / txt / md / png / jpg / jpeg，单个不超过 100MB。
      </p>
    </section>

    <el-upload
      class="dropzone"
      drag
      multiple
      :auto-upload="false"
      :show-file-list="false"
      accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
      @change="onChange"
    >
      <div class="drop-inner">
        <p class="drop-title">拖拽文件到这里，或点击选择</p>
        <p class="drop-hint">支持 pdf / docx / txt / md / png / jpg / jpeg，单个不超过 100MB</p>
      </div>
    </el-upload>

    <section class="queue">
      <h3>本次队列</h3>
      <el-empty v-if="ingestStore.queue.length === 0" description="还没有文件，先选一份文档试试" />
      <ul v-else class="queue-list">
        <li v-for="item in ingestStore.queue" :key="item.id" class="queue-item">
          <div>
            <p class="file-name">{{ item.name }}</p>
            <p class="file-meta">{{ formatSize(item.size) }} · {{ item.message }}</p>
          </div>
          <el-tag :type="statusType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { useIngestStore } from '@/stores/ingest'

const ingestStore = useIngestStore()

function onChange(file: UploadFile) {
  if (file.raw) {
    ingestStore.enqueue([file.raw])
  }
}

function formatSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function statusLabel(status: string) {
  if (status === 'ready') {
    return '入库中'
  }
  if (status === 'failed') {
    return '失败' 
  }
  if (status === 'processing') {
    return '处理中'
  }
  return '等待'
}

function statusType(status: string) {
  if (status === 'ready') {
    return 'success'
  }
  if (status === 'failed') {
    return 'danger'
  }
  if (status === 'processing') {
    return 'warning'
  }
  return 'info'
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 24px 40px;
}

.kicker {
  margin: 0 0 8px;
  color: $color-muted;
  font-size: 13px;
  letter-spacing: 0.1em;
}

h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.lead,
.file-meta,
.drop-hint {
  color: $color-muted;
}

.lead {
  margin: 0 0 24px;
  line-height: 1.6;
}

.dropzone {
  width: 100%;

  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    padding: 36px 20px;
    border: 1px dashed $color-border;
    border-radius: 16px;
    background: $color-surface;
  }
}

.drop-title {
  margin: 0 0 8px;
  color: $color-text;
  font-size: 16px;
  font-weight: 600;
}

.drop-hint {
  margin: 0;
}

.queue {
  margin-top: 28px;
}

h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid $color-border;
  border-radius: 12px;
  background: $color-surface;
}

.file-name {
  margin: 0 0 4px;
  font-weight: 600;
}

.file-meta {
  margin: 0;
  font-size: 13px;
}

@include phone {
  .page {
    padding: 20px 16px 32px;
  }

  h2 {
    font-size: 22px;
  }
}
</style>
