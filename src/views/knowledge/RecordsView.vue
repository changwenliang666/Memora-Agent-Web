<template>
  <div class="page">
    <section class="intro">
      <p class="kicker">入库记录</p>
      <h2>已经进入平台视角的文件</h2>
      <p class="lead">这里查看当前账号的入库状态。上传请到录入页。</p>
    </section>

    <p v-if="ingestStore.recordsError" class="load-error">{{ ingestStore.recordsError }}</p>

    <el-empty
      v-else-if="!ingestStore.recordsLoading && ingestStore.records.length === 0"
      description="还没有入库记录"
    />

    <template v-else-if="ingestStore.records.length > 0">
      <el-table v-if="!isPhone" :data="ingestStore.records" class="records-table">
        <el-table-column prop="name" label="文件名" min-width="220" />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="160">
          <template #default="{ row }">
            <el-tag :type="ingestStatusTagType(row.status)" size="small">
              {{ ingestStatusLabel(row.status) }}
            </el-tag>
            <p v-if="row.status === 'failed' && row.errorMessage" class="file-meta">
              {{ row.errorMessage }}
            </p>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180" />
      </el-table>

      <ul v-else class="card-list">
        <li v-for="row in ingestStore.records" :key="row.id" class="record-card">
          <p class="file-name">{{ row.name }}</p>
          <p class="file-meta">{{ formatSize(row.size) }}</p>
          <p class="file-meta">{{ row.createdAt }}</p>
          <el-tag :type="ingestStatusTagType(row.status)" size="small">
            {{ ingestStatusLabel(row.status) }}
          </el-tag>
          <p v-if="row.status === 'failed' && row.errorMessage" class="file-meta error-text">
            {{ row.errorMessage }}
          </p>
        </li>
      </ul>
    </template>

    <div v-if="showPager" class="pager" :class="{ compact: isPhone }">
      <el-pagination
        :current-page="ingestStore.page"
        :page-size="ingestStore.pageSize"
        :total="ingestStore.total"
        :pager-count="isPhone ? 3 : 7"
        :small="isPhone"
        :layout="isPhone ? 'prev, pager, next' : 'total, prev, pager, next'"
        background
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { ingestStatusLabel, ingestStatusTagType } from '@/api/knowledge'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useIngestStore } from '@/stores/ingest'

const REFRESH_MS = 3000

const ingestStore = useIngestStore()
const { isPhone } = useBreakpoint()

const showPager = computed(() => !ingestStore.recordsError && ingestStore.total > 0)

let refreshTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  void ingestStore.loadRecords(1)
  startRefresh()
})

onUnmounted(() => {
  stopRefresh()
})

watch(
  () => [ingestStore.page, ingestStore.records.map((row) => row.status).join(',')] as const,
  () => {
    startRefresh()
  },
)

function onPageChange(page: number) {
  void ingestStore.loadRecords(page)
}

function hasInFlight() {
  return ingestStore.records.some((row) => row.status === 'pending' || row.status === 'processing')
}

function startRefresh() {
  stopRefresh()
  if (!hasInFlight()) {
    return
  }

  refreshTimer = setInterval(() => {
    if (!hasInFlight()) {
      stopRefresh()
      return
    }
    void ingestStore.loadRecords(ingestStore.page)
  }, REFRESH_MS)
}

function stopRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = undefined
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

.load-error {
  margin: 0 0 16px;
  color: var(--el-color-danger);
  line-height: 1.5;
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
  overflow-wrap: anywhere;
}

.file-meta {
  margin: 0 0 6px;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.error-text {
  margin-top: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: flex-end;
    row-gap: 8px;
  }

  &.compact {
    justify-content: center;

    :deep(.el-pagination) {
      justify-content: center;
      max-width: 100%;
    }
  }
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
