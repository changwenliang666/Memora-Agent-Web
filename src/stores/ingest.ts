import { ref } from 'vue'
import { defineStore } from 'pinia'
import { toNormalizedHttpError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import {
  ALLOWED_EXTENSIONS,
  getFileExtension,
  getKnowledgeFile,
  ingestStatusMessage,
  isFileStatus,
  listKnowledgeRecords,
  MAX_FILE_SIZE,
  PAGE_SIZE,
  uploadKnowledgeFile,
  type IngestStatus,
  type KnowledgeRecord,
} from '@/api/knowledge'

const POLL_INTERVAL_MS = 2000

export interface IngestQueueItem {
  id: string
  fileId?: number
  name: string
  size: number
  status: IngestStatus
  message: string
  progress: number
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useIngestStore = defineStore('ingest', () => {
  const queue = ref<IngestQueueItem[]>([])
  const records = ref<KnowledgeRecord[]>([])
  const recordsError = ref('')
  const recordsLoading = ref(false)
  const page = ref(1)
  const pageSize = PAGE_SIZE
  const total = ref(0)

  const pollTimers = new Map<number, ReturnType<typeof setInterval>>()

  function enqueue(files: File[]) {
    for (const file of files) {
      const item: IngestQueueItem = {
        id: createId(),
        name: file.name,
        size: file.size,
        status: 'waiting',
        message: ingestStatusMessage('waiting'),
        progress: 0,
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
      void runUpload(item.id, file)
    }
  }

  function findQueueItem(localId: string, fileId?: number) {
    return queue.value.find(
      (row) => row.id === localId || (fileId != null && row.fileId === fileId),
    )
  }

  function patchQueueItem(
    localId: string,
    patch: Partial<Omit<IngestQueueItem, 'id' | 'name' | 'size'>>,
    fileId?: number,
  ) {
    const item = findQueueItem(localId, fileId)
    if (!item) {
      return
    }
    if (patch.fileId !== undefined) {
      item.fileId = patch.fileId
    }
    if (patch.status !== undefined) {
      item.status = patch.status
    }
    if (patch.message !== undefined) {
      item.message = patch.message
    }
    if (patch.progress !== undefined) {
      item.progress = patch.progress
    }
  }

  async function runUpload(localId: string, file: File) {
    patchQueueItem(localId, {
      status: 'uploading',
      message: ingestStatusMessage('uploading'),
      progress: 0,
    })

    try {
      const result = await uploadKnowledgeFile(file, (percent) => {
        patchQueueItem(localId, { progress: percent })
      })
      patchQueueItem(localId, { fileId: result.id, progress: 100 })
      applyServerStatus(localId, result.status)
      if (result.status !== 'done' && result.status !== 'failed') {
        startPolling(localId, result.id)
      }
    } catch (error) {
      patchQueueItem(localId, {
        status: 'failed',
        message: toNormalizedHttpError(error).message,
      })
    }
  }

  function applyServerStatus(
    localId: string,
    status: IngestStatus,
    errorMessage?: string,
    fileId?: number,
  ) {
    const next = isFileStatus(status) ? status : 'pending'
    patchQueueItem(
      localId,
      {
        status: next,
        message: ingestStatusMessage(next, errorMessage),
      },
      fileId,
    )
  }

  function startPolling(localId: string, fileId: number) {
    stopPolling(fileId)

    const tick = async () => {
      if (!useAuthStore().isAuthenticated) {
        stopTracking()
        return
      }

      try {
        const record = await getKnowledgeFile(fileId, { skipErrorToast: true })
        applyServerStatus(localId, record.status, record.errorMessage, fileId)
        if (record.status === 'done' || record.status === 'failed') {
          stopPolling(fileId)
        }
      } catch {
        // 保留最近一次状态与文件名，这一拍跳过
      }
    }

    void tick()
    pollTimers.set(fileId, setInterval(() => void tick(), POLL_INTERVAL_MS))
  }

  function stopPolling(fileId: number) {
    const timer = pollTimers.get(fileId)
    if (timer) {
      clearInterval(timer)
    }
    pollTimers.delete(fileId)
  }

  function stopTracking() {
    for (const fileId of [...pollTimers.keys()]) {
      stopPolling(fileId)
    }
  }

  async function loadRecords(nextPage = 1) {
    recordsError.value = ''
    recordsLoading.value = true
    const targetPage = Math.max(1, nextPage)

    try {
      const offset = (targetPage - 1) * pageSize
      const pageData = await listKnowledgeRecords({ limit: pageSize, offset })
      records.value = pageData.records
      page.value = targetPage
      total.value = pageData.total
    } catch (error) {
      recordsError.value = toNormalizedHttpError(error).message
      records.value = []
      total.value = 0
    } finally {
      recordsLoading.value = false
    }
  }

  return {
    queue,
    records,
    recordsError,
    recordsLoading,
    page,
    pageSize,
    total,
    enqueue,
    loadRecords,
    stopTracking,
  }
})
