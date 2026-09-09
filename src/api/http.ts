import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { resolveApiBaseURL } from '@/api/baseUrl'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean
  }
}

export type HttpErrorCode = 'http' | 'timeout' | 'network' | 'config'

export interface NormalizedHttpError {
  status?: number
  message: string
  code: HttpErrorCode
  bizCode?: number
}

export class HttpConfigError extends Error {
  readonly code = 'config' as const

  constructor(message = '未配置 API 基址') {
    super(message)
    this.name = 'HttpConfigError'
  }
}

const SUCCESS_CODE = 0

interface Envelope {
  code: number
  message: string
  data?: unknown
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function toNormalizedHttpError(error: unknown): NormalizedHttpError {
  if (error instanceof HttpConfigError) {
    return { message: error.message, code: 'config' }
  }

  if (isNormalizedHttpError(error)) {
    return error
  }

  if (axios.isAxiosError(error)) {
    return fromAxiosError(error)
  }

  return {
    message: error instanceof Error ? error.message : '未知错误',
    code: 'network',
  }
}

function isNormalizedHttpError(error: unknown): error is NormalizedHttpError {
  if (axios.isAxiosError(error) || typeof error !== 'object' || error === null) {
    return false
  }

  const code = (error as NormalizedHttpError).code
  return (
    (code === 'http' || code === 'timeout' || code === 'network' || code === 'config')
    && typeof (error as NormalizedHttpError).message === 'string'
  )
}

function isEnvelope(data: unknown): data is Envelope {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Envelope).code === 'number' &&
    typeof (data as Envelope).message === 'string'
  )
}

type ErrorBody = {
  code?: number
  message?: string
  detail?: unknown
}

function readErrorMessage(data: ErrorBody | undefined, fallback: string): string {
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message
  }

  const fromDetail = readDetailMessage(data?.detail)
  if (fromDetail) {
    return fromDetail
  }

  return fallback
}

function readDetailMessage(detail: unknown): string | undefined {
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    if (typeof first === 'string' && first.trim()) {
      return first
    }
    if (first && typeof first === 'object') {
      const nested = (first as { msg?: string; message?: string }).msg
        ?? (first as { msg?: string; message?: string }).message
      if (typeof nested === 'string' && nested.trim()) {
        return nested
      }
    }
  }

  return undefined
}

function fromAxiosError(error: AxiosError<ErrorBody>): NormalizedHttpError {
  if (error.response) {
    const data = error.response.data
    return {
      status: error.response.status,
      message: readErrorMessage(
        data,
        error.response.statusText || error.message,
      ),
      code: 'http',
      bizCode: typeof data?.code === 'number' ? data.code : undefined,
    }
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { message: '请求超时', code: 'timeout' }
  }

  return { message: error.message || '网络异常', code: 'network' }
}

function toastError(error: NormalizedHttpError) {
  ElMessage.error(error.message)
}

function shouldSkipErrorToast(config?: { skipErrorToast?: boolean } | null): boolean {
  return Boolean(config?.skipErrorToast)
}

function businessError(envelope: Envelope, status?: number): NormalizedHttpError {
  return {
    status,
    message: envelope.message.trim() || '请求失败',
    code: 'http',
    bizCode: envelope.code,
  }
}

const http: AxiosInstance = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const url = config.url ?? ''
  const baseURL = (config.baseURL ?? http.defaults.baseURL ?? '').trim()

  // 相对路径必须有 VITE_API_BASE_URL，避免静默打到当前前端源
  if (!isAbsoluteUrl(url) && !baseURL) {
    throw new HttpConfigError()
  }

  attachAuthHeader(config)
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (!isEnvelope(body)) {
      return response
    }

    if (body.code === SUCCESS_CODE) {
      response.data = body.data
      return response
    }

    const error = businessError(body, response.status)
    if (!shouldSkipErrorToast(response.config)) {
      toastError(error)
    }
    return Promise.reject(error)
  },
  (error: unknown) => {
    // 只清会话，跳转交给路由守卫，避免和进行中的导航抢状态
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore().clearSession()
    }
    const normalized = toNormalizedHttpError(error)
    const skipToast = axios.isAxiosError(error) && shouldSkipErrorToast(error.config)
    if (!skipToast) {
      toastError(normalized)
    }
    return Promise.reject(normalized)
  },
)

/** 有未过期会话才带 Bearer；过期或未登录不伪造认证头 */
function attachAuthHeader(config: InternalAxiosRequestConfig) {
  const auth = useAuthStore()
  if (!auth.refresh() || !auth.session) {
    if (config.headers) {
      delete config.headers.Authorization
    }
    return
  }

  config.headers.Authorization = `Bearer ${auth.session.token}`
}

export { http, shouldSkipErrorToast }
