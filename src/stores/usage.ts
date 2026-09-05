import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getUsage, type UsageBucket, type UsageGranularity } from '@/api/usage'

export const useUsageStore = defineStore('usage', () => {
  const granularity = ref<UsageGranularity>('day')
  const buckets = ref<UsageBucket[]>([])
  const previousTotal = ref(0)
  const loaded = ref(false)

  /** 问答合计 = 输入 + 输出；入库单独累计 */
  const chatTotal = computed(() =>
    buckets.value.reduce((sum, bucket) => sum + bucket.chatInput + bucket.chatOutput, 0),
  )
  const ingestTotal = computed(() => buckets.value.reduce((sum, bucket) => sum + bucket.ingest, 0))
  const total = computed(() => chatTotal.value + ingestTotal.value)
  /** 相对上一同等长度区间的变化；上期为 0 时无法算比率 */
  const deltaRatio = computed(() => {
    if (previousTotal.value === 0) {
      return null
    }
    return (total.value - previousTotal.value) / previousTotal.value
  })

  async function load(next: UsageGranularity) {
    granularity.value = next
    const result = await getUsage(next)
    buckets.value = result.buckets
    previousTotal.value = result.previousTotal
    loaded.value = true
  }

  return {
    granularity,
    buckets,
    previousTotal,
    loaded,
    chatTotal,
    ingestTotal,
    total,
    deltaRatio,
    load,
  }
})
