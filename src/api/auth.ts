import { http, type NormalizedHttpError } from '@/api/http'

export interface AuthSession {
  token: string
  expiresAt: number
  account: string
  nickname: string
}

/** JWT 无法读出 exp 时的回退有效期，与后端默认 7 天对齐。 */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface LoginData {
  token: string
  user_id: number
  username: string
  nickname: string
}

export async function login(account: string, password: string): Promise<AuthSession> {
  const username = account.trim()
  if (!username || !password) {
    throw credentialError()
  }

  const { data } = await http.post<LoginData>('/auth/login', { username, password })
  return sessionFromLogin(data)
}

export async function register(account: string, password: string): Promise<AuthSession> {
  const username = account.trim()
  if (!username || !password) {
    throw credentialError()
  }

  await http.post('/auth/register', { username, password })
  return login(username, password)
}

function sessionFromLogin(data: LoginData | undefined): AuthSession {
  if (!data?.token || !data.username) {
    throw {
      status: 200,
      message: '登录响应无效',
      code: 'http',
    } satisfies NormalizedHttpError
  }

  return {
    token: data.token,
    expiresAt: readJwtExpiry(data.token) ?? Date.now() + SESSION_TTL_MS,
    account: data.username,
    nickname: data.nickname,
  }
}

function readJwtExpiry(token: string): number | null {
  const payloadSegment = token.split('.')[1]
  if (!payloadSegment) {
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as { exp?: unknown }
    if (typeof payload.exp !== 'number') {
      return null
    }
    return payload.exp * 1000
  } catch {
    return null
  }
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4
  const padded = pad ? `${normalized}${'='.repeat(4 - pad)}` : normalized
  return atob(padded)
}

function credentialError(): NormalizedHttpError {
  return { status: 400, message: '请输入账号和密码', code: 'http' }
}
