import type { EChartsOption } from 'echarts'
import type { UsageBucket } from '@/api/usage'

export interface ChartPalette {
  text: string
  border: string
  surface: string
  chat: string
  ingest: string
  muted: string
}

/** 从图根节点读主题 token，保证图表和页面深浅色一致 */
export function readChartPalette(): ChartPalette {
  const styles = getComputedStyle(document.documentElement)
  const value = (name: string) => styles.getPropertyValue(name).trim()

  return {
    text: value('--color-text'),
    border: value('--color-border'),
    surface: value('--color-surface'),
    chat: value('--color-primary'),
    ingest: value('--color-chart-ingest'),
    muted: value('--color-muted'),
  }
}

function toSeries(buckets: UsageBucket[]) {
  return {
    periods: buckets.map((bucket) => bucket.period),
    chat: buckets.map((bucket) => bucket.chatInput + bucket.chatOutput),
    ingest: buckets.map((bucket) => bucket.ingest),
  }
}

function axis(palette: ChartPalette) {
  return {
    axisLabel: { color: palette.muted },
    axisLine: { lineStyle: { color: palette.border } },
    splitLine: { lineStyle: { color: palette.border, opacity: 0.5 } },
  }
}

export function buildLineOption(buckets: UsageBucket[], palette: ChartPalette): EChartsOption {
  const series = toSeries(buckets)

  return {
    backgroundColor: 'transparent',
    color: [palette.chat, palette.ingest],
    tooltip: { trigger: 'axis' },
    legend: { data: ['问答', '入库'], textStyle: { color: palette.text } },
    grid: { left: 48, right: 16, top: 40, bottom: 32 },
    xAxis: { type: 'category', data: series.periods, ...axis(palette) },
    yAxis: { type: 'value', ...axis(palette) },
    series: [
      { name: '问答', type: 'line', smooth: true, data: series.chat },
      { name: '入库', type: 'line', smooth: true, data: series.ingest },
    ],
  }
}

export function buildBarOption(buckets: UsageBucket[], palette: ChartPalette): EChartsOption {
  const series = toSeries(buckets)

  return {
    backgroundColor: 'transparent',
    color: [palette.chat, palette.ingest],
    tooltip: { trigger: 'axis' },
    legend: { data: ['问答', '入库'], textStyle: { color: palette.text } },
    grid: { left: 48, right: 16, top: 40, bottom: 32 },
    xAxis: { type: 'category', data: series.periods, ...axis(palette) },
    yAxis: { type: 'value', ...axis(palette) },
    series: [
      { name: '问答', type: 'bar', data: series.chat },
      { name: '入库', type: 'bar', data: series.ingest },
    ],
  }
}

export function buildPieOption(buckets: UsageBucket[], palette: ChartPalette): EChartsOption {
  const chat = buckets.reduce((sum, bucket) => sum + bucket.chatInput + bucket.chatOutput, 0)
  const ingest = buckets.reduce((sum, bucket) => sum + bucket.ingest, 0)

  return {
    backgroundColor: 'transparent',
    color: [palette.chat, palette.ingest],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: palette.text } },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        label: { color: palette.text },
        data: [
          { name: '问答', value: chat },
          { name: '入库', value: ingest },
        ],
      },
    ],
  }
}
