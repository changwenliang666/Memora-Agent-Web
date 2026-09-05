<template>
  <div class="page">
    <section class="intro">
      <p class="kicker">用量统计</p>
      <h2>问答与向量入库的 token 消耗</h2>
      <el-segmented v-model="granularity" class="granularity" :options="granularityOptions" />
    </section>

    <el-empty v-if="usageStore.loaded && usageStore.buckets.length === 0" description="当前区间没有用量数据" />

    <template v-else>
      <div class="cards">
        <article class="card">
          <span>总消耗</span>
          <strong>{{ formatNumber(usageStore.total) }}</strong>
        </article>
        <article class="card">
          <span>问答</span>
          <strong>{{ formatNumber(usageStore.chatTotal) }}</strong>
        </article>
        <article class="card">
          <span>入库</span>
          <strong>{{ formatNumber(usageStore.ingestTotal) }}</strong>
        </article>
        <article class="card">
          <span>较上期</span>
          <strong>{{ formatDelta(usageStore.deltaRatio) }}</strong>
        </article>
      </div>

      <section class="chart-card line-card">
        <h3>消耗趋势</h3>
        <UsageChart :option="lineOption" />
      </section>

      <div class="split">
        <section class="chart-card">
          <h3>分桶对比</h3>
          <UsageChart :option="barOption" />
        </section>
        <section class="chart-card">
          <h3>结构占比</h3>
          <UsageChart :option="pieOption" />
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { UsageGranularity } from '@/api/usage'
import { useThemeStore } from '@/stores/theme'
import { useUsageStore } from '@/stores/usage'
import UsageChart from './UsageChart.vue'
import { buildBarOption, buildLineOption, buildPieOption, readChartPalette } from './usageChartOptions'

const usageStore = useUsageStore()
const themeStore = useThemeStore()
const granularity = ref<UsageGranularity>(usageStore.granularity)
/** 图表配色从 CSS 变量读取，不在 Vue 依赖里；主题变了靠这个计数强制重算 option */
const paletteTick = ref(0)

const granularityOptions = [
  { label: '时', value: 'hour' },
  { label: '天', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
]

const lineOption = computed(() => {
  paletteTick.value
  return buildLineOption(usageStore.buckets, readChartPalette())
})

const barOption = computed(() => {
  paletteTick.value
  return buildBarOption(usageStore.buckets, readChartPalette())
})

const pieOption = computed(() => {
  paletteTick.value
  return buildPieOption(usageStore.buckets, readChartPalette())
})

onMounted(() => {
  void usageStore.load(granularity.value)
})

watch(granularity, (value) => {
  void usageStore.load(value)
})

watch(
  () => themeStore.mode,
  () => {
    paletteTick.value += 1
  },
)

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

function formatDelta(ratio: number | null) {
  if (ratio === null) {
    return '—'
  }

  const sign = ratio >= 0 ? '+' : ''
  return `${sign}${(ratio * 100).toFixed(1)}%`
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 1100px;
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
  margin: 0 0 16px;
  font-size: 24px;
}

.granularity {
  max-width: 100%;
  margin-bottom: 20px;
  padding: 4px;
  overflow-x: auto;
  border: 1px solid $color-border;
  border-radius: 12px;
  background: $color-surface;
  --el-segmented-bg-color: transparent;
  --el-segmented-color: var(--color-muted);
  --el-segmented-item-selected-color: #fff;
  --el-segmented-item-selected-bg-color: var(--color-primary);
  --el-border-radius-base: 10px;

  :deep(.el-segmented__item) {
    border-radius: 8px;
  }

  :deep(.el-segmented__item-selected) {
    border-radius: 8px;
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.card,
.chart-card {
  border: 1px solid $color-border;
  border-radius: 14px;
  background: $color-surface;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;

  span {
    color: $color-muted;
    font-size: 13px;
  }

  strong {
    font-size: 24px;
    font-weight: 650;
  }
}

.chart-card {
  padding: 16px 16px 8px;
}

h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.split {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 12px;
  margin-top: 12px;
}

@include phone {
  .page {
    padding: 20px 16px 32px;
  }

  h2 {
    font-size: 22px;
  }

  .cards,
  .split {
    grid-template-columns: 1fr;
  }
}
</style>
