import axios from 'axios'
import { http, type NormalizedHttpError } from '@/api/http'

export const MAX_FILE_SIZE = 104_857_600
export const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md'] as const

export type IngestStatus = 'waiting' | 'processing' | 'ready' | 'failed'
export type RecordStatus = 'processing' | 'ready' | 'failed'

export interface KnowledgeRecord {
  id: string
  name: string
  size: number
  status: RecordStatus
  createdAt: string
}

interface PresignResponse {
  upload_url: string
  object_key: string
  expires_in: number
}

export async function uploadKnowledgeFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const contentType = resolveContentType(file.name)
  const declaration = {
    filename: file.name,
    content_type: contentType,
    size: file.size,
  }

  const { data } = await http.post<PresignResponse>('/files/presign', declaration)
  if (!data?.upload_url) {
    throw { message: '未获得上传地址', code: 'http' } satisfies NormalizedHttpError
  }
  onProgress?.(10)

  await axios.put(data.upload_url, file, {
    headers: { 'Content-Type': contentType },
    timeout: 0,
    onUploadProgress(event) {
      if (!event.total) {
        return
      }
      onProgress?.(10 + Math.round((event.loaded / event.total) * 80))
    },
  })

  await http.post('/files/complete', {
    object_key: data.object_key,
    ...declaration,
  })
  onProgress?.(100)
}

export async function listKnowledgeRecords(): Promise<KnowledgeRecord[]> {
  return [
    {
      id: 'rec-1',
      name: '产品手册.pdf',
      size: 1_248_512,
      status: 'ready',
      createdAt: '2026-09-01 10:20',
    },
    {
      id: 'rec-2',
      name: '接口约定.md',
      size: 18_432,
      status: 'ready',
      createdAt: '2026-09-03 16:08',
    },
    {
      id: 'rec-3',
      name: '会议纪要.docx',
      size: 86_016,
      status: 'processing',
      createdAt: '2026-09-05 09:41',
    },
  ]
}

export function getFileExtension(name: string): string {
  return name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : ''
}

function resolveContentType(filename: string): string {
  return getFileExtension(filename) === 'pdf' ? 'application/pdf' : 'text/plain'
}
