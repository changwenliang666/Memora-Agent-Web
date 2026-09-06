import { ref } from 'vue'
import { defineStore } from 'pinia'
import { toNormalizedHttpError } from '@/api/http'
import {
  ALLOWED_EXTENSIONS,
  getFileExtension,
  listKnowledgeRecords,
  MAX_FILE_SIZE,
  uploadKnowledgeFile,
  type IngestStatus,
  type KnowledgeRecord,
} from '@/api/knowledge'

export interface IngestQueueItem {
  id: string
  name: string
  size: number
  status: IngestStatus
  message: string
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useIngestStore = defineStore('ingest', () => {
  const queue = ref<IngestQueueItem[]>([])
  const records = ref<KnowledgeRecord[]>([])
  const recordsLoaded = ref(false)

  function enqueue(files: File[]) {
    for (const file of files) {
      const item: IngestQueueItem = {
        id: createId(),
        name: file.name,
        size: file.size,
        status: 'waiting',
        message: '等待上传',
      }

      const extension = getFileExtension(file.name)
      if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
        item.status = 'failed'
        item.message = `不支持的类型：.${extension || 'unknown'}`
        queue.value.unshift(item)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        item.status = 'failed'
        item.message = '文件超过 100MB'
        queue.value.unshift(item)
        continue
      }

      queue.value.unshift(item)
      void runUpload(item, file)
    }
  }

  async function runUpload(item: IngestQueueItem, file: File) {
    item.status = 'processing'
    item.message = '上传中'

    try {
      await uploadKnowledgeFile(file)
      item.status = 'ready'
      item.message = '已上传'
    } catch (error) {
      item.status = 'failed'
      item.message = toNormalizedHttpError(error).message
    }
  }

  async function loadRecords() {
    // 历史记录与本次上传队列分开；同一会话只拉一次示例数据
    if (recordsLoaded.value) {
      return
    }

    records.value = await listKnowledgeRecords()
    recordsLoaded.value = true
  }

  return { queue, records, enqueue, loadRecords }
})
