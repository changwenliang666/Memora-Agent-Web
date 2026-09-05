import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthSession } from '@/api/auth'
import { displayableAccount } from '@/utils/accountLabel'

const STORAGE_KEY = 'memora.auth'

/** 读本地会话；缺字段或已过期时立刻清掉，避免脏数据继续放行 */
function readStored(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (
      typeof parsed.token !== 'string' ||
      !parsed.token ||
      typeof parsed.expiresAt !== 'number' ||
      typeof parsed.account !== 'string'
    ) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    if (parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      token: parsed.token,
      expiresAt: parsed.expiresAt,
      account: parsed.account,
    }
  } catch {
    return null
  }
}

function persist(session: AuthSession | null) {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // 隐私模式只保留本会话内存态
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(readStored())

  const isAuthenticated = computed(
    () => Boolean(session.value && session.value.expiresAt > Date.now()),
  )

  /** 供顶栏头像使用；空白或缺失时为 null */
  const displayAccount = computed(() => displayableAccount(session.value?.account))

  /** 与磁盘对齐后再判断是否仍有效，供守卫和请求拦截器使用 */
  function refresh() {
    session.value = readStored()
    return isAuthenticated.value
  }

  function setSession(next: AuthSession) {
    session.value = next
    persist(next)
  }

  function clearSession() {
    session.value = null
    persist(null)
  }

  return { session, isAuthenticated, displayAccount, refresh, setSession, clearSession }
})
