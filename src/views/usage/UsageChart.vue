<template>
  <div ref="elRef" class="usage-chart" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use, type ECharts } from 'echarts/core'
import type { EChartsOption } from 'echarts'
import { CanvasRenderer } from 'echarts/renderers'

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps<{
  option: EChartsOption
}>()

const elRef = ref<HTMLDivElement>()
let chart: ECharts | undefined
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!elRef.value) {
    return
  }

  chart = init(elRef.value)
  chart.setOption(props.option)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(elRef.value)
})

watch(
  () => props.option,
  (option) => {
    chart?.setOption(option, true)
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})
</script>

<style lang="scss" scoped>
.usage-chart {
  width: 100%;
  height: 280px;
}
</style>
