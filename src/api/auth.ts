import type { NormalizedHttpError } from '@/api/http'

export interface AuthSession {
  token: string
  expiresAt: number
  account: string
}

/** 占位会话有效期。接真实接口后改用后端返回的过期时间。 */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** 占位登录。真实后端就绪后改为 POST /auth/login。 */
export async function login(account: string, password: string): Promise<AuthSession> {
  return issueSession(account, password)
}

/** 占位注册。真实后端就绪后改为 POST /auth/register。 */
export async function register(account: string, password: string): Promise<AuthSession> {
  return issueSession(account, password)
}

async function issueSession(account: string, password: string): Promise<AuthSession> {
  const name = account.trim()
  if (!name || !password) {
    throw credentialError()
  }

  // 模拟网络耗时，真实接口替换后删掉
  await delay(320)

  return {
    token: `demo.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`,
    expiresAt: Date.now() + SESSION_TTL_MS,
    account: name,
  }
}

function credentialError(): NormalizedHttpError {
  return { status: 400, message: '请输入账号和密码', code: 'http' }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
