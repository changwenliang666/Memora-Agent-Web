export type UsageGranularity = 'hour' | 'day' | 'week' | 'month' | 'year'

export interface UsageBucket {
  period: string
  chatInput: number
  chatOutput: number
  ingest: number
}

export interface UsageResponse {
  buckets: UsageBucket[]
  previousTotal: number
}

/** 每种粒度的默认回看长度：近 24 小时 / 30 天 / 12 周 / 12 月 / 5 年 */
const RANGE: Record<UsageGranularity, number> = {
  hour: 24,
  day: 30,
  week: 12,
  month: 12,
  year: 5,
}

export async function getUsage(granularity: UsageGranularity): Promise<UsageResponse> {
  const count = RANGE[granularity]
  const now = new Date()
  const buckets: UsageBucket[] = []

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const point = shiftDate(now, granularity, -offset)
    const seed = hash(`${granularity}-${periodLabel(point, granularity)}`)
    buckets.push({
      period: periodLabel(point, granularity),
      chatInput: 80 + (seed % 120),
      chatOutput: 20 + (seed % 40),
      ingest: 40 + (seed % 90),
    })
  }

  const currentTotal = buckets.reduce(
    (sum, bucket) => sum + bucket.chatInput + bucket.chatOutput + bucket.ingest,
    0,
  )

  return {
    buckets,
    previousTotal: Math.round(currentTotal * 0.86),
  }
}

function shiftDate(date: Date, granularity: UsageGranularity, amount: number): Date {
  const next = new Date(date)

  if (granularity === 'hour') {
    next.setHours(next.getHours() + amount)
  } else if (granularity === 'day') {
    next.setDate(next.getDate() + amount)
  } else if (granularity === 'week') {
    next.setDate(next.getDate() + amount * 7)
  } else if (granularity === 'month') {
    next.setMonth(next.getMonth() + amount)
  } else {
    next.setFullYear(next.getFullYear() + amount)
  }

  return next
}

function periodLabel(date: Date, granularity: UsageGranularity): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  if (granularity === 'hour') {
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`
  }
  if (granularity === 'day') {
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }
  if (granularity === 'week') {
    return `${date.getMonth() + 1}月第${Math.ceil(date.getDate() / 7)}周`
  }
  if (granularity === 'month') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
  }
  return `${date.getFullYear()}`
}

function hash(value: string): number {
  let total = 0
  for (let i = 0; i < value.length; i += 1) {
    total = (total * 31 + value.charCodeAt(i)) % 1000
  }
  return total
}
