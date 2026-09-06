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
  progress:number,
  updateProgress:(curProgress:number) => void
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
      const item = ref<IngestQueueItem>({
        id: createId(),
        name: file.name,
        size: file.size,
        status: 'waiting',
        message: '等待上传',
        progress:0,
        updateProgress:(curProgress:number) => {
          item.value.progress = curProgress;
        }
      })

      const extension = getFileExtension(file.name)
      if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
        item.value.status = 'failed'
        item.value.message = `不支持的类型：.${extension || 'unknown'}`
        queue.value.unshift(item.value)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        item.value.status = 'failed'
        item.value.message = '文件超过 100MB'
        queue.value.unshift(item.value)
        continue
      }

      queue.value.unshift(item.value)
      void runUpload(item.value, file)
    }
  }

  async function runUpload(item: IngestQueueItem, file: File) {
    item.status = 'processing'
    item.message = '上传中'
    item.progress = 0;

    try {
      await uploadKnowledgeFile(file,item.updateProgress)
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
