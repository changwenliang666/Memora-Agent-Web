import axios, { type AxiosError, type AxiosInstance } from 'axios'

export type HttpErrorCode = 'http' | 'timeout' | 'network' | 'config'

export interface NormalizedHttpError {
  status?: number
  message: string
  code: HttpErrorCode
}

export class HttpConfigError extends Error {
  readonly code = 'config' as const

  constructor(message = 'VITE_API_BASE_URL is not configured') {
    super(message)
    this.name = 'HttpConfigError'
  }
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
    message: error instanceof Error ? error.message : 'Unknown error',
    code: 'network',
  }
}

function isNormalizedHttpError(error: unknown): error is NormalizedHttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    (error as NormalizedHttpError).code !== undefined
  )
}

function fromAxiosError(error: AxiosError<{ message?: string }>): NormalizedHttpError {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.response.statusText || error.message,
      code: 'http',
    }
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { message: 'Request timed out', code: 'timeout' }
  }

  return { message: error.message || 'Network error', code: 'network' }
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const url = config.url ?? ''
  const baseURL = (config.baseURL ?? http.defaults.baseURL ?? '').trim()

  if (!isAbsoluteUrl(url) && !baseURL) {
    throw new HttpConfigError()
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toNormalizedHttpError(error)),
)

export { http }
