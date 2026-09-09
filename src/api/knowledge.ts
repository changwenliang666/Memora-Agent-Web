import axios from 'axios'
import { http, type NormalizedHttpError } from '@/api/http'

export const MAX_FILE_SIZE = 104_857_600
export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg'] as const
export const PAGE_SIZE = 20

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number]

export const FILE_STATUSES = ['pending', 'processing', 'done', 'failed'] as const
export type FileStatus = (typeof FILE_STATUSES)[number]
export type IngestStatus = 'waiting' | 'uploading' | FileStatus

export interface KnowledgeRecord {
  id: number
  name: string
  size: number
  status: FileStatus
  createdAt: string
  errorMessage: string
}

export interface UploadCompleteResult {
  id: number
  status: FileStatus
}

interface PresignResponse {
  upload_url: string
  object_key: string
  expires_in: number
}

interface CompleteResponse {
  id: number
  status: string
}

interface FileSummaryDto {
  id: number
  status: string
  error_message: string | null
  filename: string
  size: number
  created_at: string
}

interface FileListDto {
  items: FileSummaryDto[]
  total: number
}

export interface KnowledgeRecordPage {
  records: KnowledgeRecord[]
  total: number
}

export async function uploadKnowledgeFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadCompleteResult> {
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

  const complete = await http.post<CompleteResponse>('/files/complete', {
    object_key: data.object_key,
    ...declaration,
  })
  onProgress?.(100)

  if (complete.data?.id == null) {
    throw { message: '未获得文件标识', code: 'http' } satisfies NormalizedHttpError
  }

  return {
    id: complete.data.id,
    status: coerceFileStatus(complete.data.status),
  }
}

export async function getKnowledgeFile(
  id: number,
  options?: { skipErrorToast?: boolean },
): Promise<KnowledgeRecord> {
  const { data } = await http.get<unknown>(`/files/get-file-status/${id}`, {
    skipErrorToast: options?.skipErrorToast,
  })
  const record = mapFilePayloadToRecord(data)
  if (!record) {
    throw { message: '未获得文件状态', code: 'http' } satisfies NormalizedHttpError
  }
  return record
}

/** 从文件摘要或误收到的信封中读取记录；没有合法 status 时返回 null，避免写成 pending。 */
export function mapFilePayloadToRecord(payload: unknown): KnowledgeRecord | null {
  const row = resolveFileSummary(payload)
  if (!row || !isFileStatus(row.status)) {
    return null
  }
  return {
    id: row.id,
    name: row.filename,
    size: row.size,
    status: row.status,
    createdAt: formatCreatedAt(row.created_at),
    errorMessage: row.error_message?.trim() || '',
  }
}

export async function listKnowledgeRecords(params: {
  limit: number
  offset: number
}): Promise<KnowledgeRecordPage> {
  const { data } = await http.get<FileListDto>('/files/get-file-list', { params })
  const items = Array.isArray(data?.items) ? data.items : []
  const total = typeof data?.total === 'number' ? data.total : items.length
  return {
    records: items.map(toKnowledgeRecord),
    total,
  }
}

export function ingestStatusLabel(status: IngestStatus): string {
  if (status === 'waiting') {
    return '等待'
  }
  if (status === 'uploading') {
    return '上传中'
  }
  if (status === 'pending') {
    return '排队中'
  }
  if (status === 'processing') {
    return '处理中'
  }
  if (status === 'done') {
    return '已完成'
  }
  return '失败'
}

export function ingestStatusTagType(status: IngestStatus): 'info' | 'warning' | 'success' | 'danger' {
  if (status === 'done') {
    return 'success'
  }
  if (status === 'failed') {
    return 'danger'
  }
  if (status === 'uploading' || status === 'processing') {
    return 'warning'
  }
  return 'info'
}

export function ingestStatusMessage(status: IngestStatus, errorMessage?: string): string {
  if (status === 'waiting') {
    return '等待上传'
  }
  if (status === 'uploading') {
    return '上传中'
  }
  if (status === 'pending') {
    return '排队入库'
  }
  if (status === 'processing') {
    return '正在入库'
  }
  if (status === 'done') {
    return '已完成'
  }
  return errorMessage?.trim() || '入库失败'
}

export function isFileStatus(value: string): value is FileStatus {
  return (FILE_STATUSES as readonly string[]).includes(value)
}

export function getFileExtension(name: string): string {
  return name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : ''
}

const CONTENT_TYPES: Record<AllowedExtension, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  md: 'text/markdown',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

function isAllowedExtension(value: string): value is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(value)
}

function resolveContentType(filename: string): string {
  const extension = getFileExtension(filename)
  if (!isAllowedExtension(extension)) {
    throw { message: `不支持的类型：.${extension || 'unknown'}`, code: 'http' } satisfies NormalizedHttpError
  }
  return CONTENT_TYPES[extension]
}

function coerceFileStatus(value: string | undefined): FileStatus {
  if (value && isFileStatus(value)) {
    return value
  }
  return 'pending'
}

function resolveFileSummary(payload: unknown): FileSummaryDto | null {
  if (!isPlainObject(payload)) {
    return null
  }
  if (isFileSummary(payload)) {
    return payload
  }
  const nested = payload.data
  if (isFileSummary(nested)) {
    return nested
  }
  return null
}

function isFileSummary(value: unknown): value is FileSummaryDto {
  if (!isPlainObject(value)) {
    return false
  }
  return (
    typeof value.id === 'number'
    && typeof value.filename === 'string'
    && typeof value.size === 'number'
    && typeof value.created_at === 'string'
  )
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toKnowledgeRecord(row: FileSummaryDto): KnowledgeRecord {
  return {
    id: row.id,
    name: row.filename,
    size: row.size,
    status: coerceFileStatus(row.status),
    createdAt: formatCreatedAt(row.created_at),
    errorMessage: row.error_message?.trim() || '',
  }
}

function formatCreatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
