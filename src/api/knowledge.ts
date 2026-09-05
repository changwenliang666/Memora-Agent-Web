export const MAX_FILE_SIZE = 20 * 1024 * 1024
export const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md', 'docx'] as const

export type IngestStatus = 'waiting' | 'processing' | 'ready' | 'failed'
export type RecordStatus = 'processing' | 'ready' | 'failed'

export interface KnowledgeRecord {
  id: string
  name: string
  size: number
  status: RecordStatus
  createdAt: string
}

export async function uploadKnowledgeFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  onProgress?.(15)
  await delay(400)
  onProgress?.(70)
  await delay(400)
  onProgress?.(100)

  if (file.name.toLowerCase().includes('fail')) {
    throw new Error('演示失败：文件名包含 fail')
  }
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

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
