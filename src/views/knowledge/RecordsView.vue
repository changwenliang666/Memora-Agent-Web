<template>
  <div class="page">
    <section class="intro">
      <p class="kicker">入库记录</p>
      <h2>已经进入平台视角的文件</h2>
      <p class="lead">这里只看历史状态，上传请到录入页。下列为示例数据，与本次上传队列分开。</p>
    </section>

    <el-empty v-if="ingestStore.records.length === 0" description="还没有入库记录" />

    <el-table v-else-if="!isPhone" :data="ingestStore.records" class="records-table">
      <el-table-column prop="name" label="文件名" min-width="220" />
      <el-table-column label="大小" width="120">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="180" />
    </el-table>

    <ul v-else class="card-list">
      <li v-for="row in ingestStore.records" :key="row.id" class="record-card">
        <p class="file-name">{{ row.name }}</p>
        <p class="file-meta">{{ formatSize(row.size) }}</p>
        <p class="file-meta">{{ row.createdAt }}</p>
        <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useIngestStore } from '@/stores/ingest'

const ingestStore = useIngestStore()
const { isPhone } = useBreakpoint()

onMounted(() => {
  void ingestStore.loadRecords()
})

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
    return '已就绪'
  }
  if (status === 'failed') {
    return '失败'
  }
  return '处理中'
}

function statusType(status: string) {
  if (status === 'ready') {
    return 'success'
  }
  if (status === 'failed') {
    return 'danger'
  }
  return 'warning'
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px 40px;
}

.kicker,
.lead,
.file-meta {
  color: $color-muted;
}

.kicker {
  margin: 0 0 8px;
  font-size: 13px;
  letter-spacing: 0.1em;
}

h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.lead {
  margin: 0 0 24px;
  line-height: 1.6;
}

.records-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.record-card {
  padding: 14px 16px;
  border: 1px solid $color-border;
  border-radius: 12px;
  background: $color-surface;
}

.file-name {
  margin: 0 0 8px;
  font-weight: 600;
}

.file-meta {
  margin: 0 0 6px;
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
