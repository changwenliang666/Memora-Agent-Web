/** 开发时若用 Network 地址打开，localhost 指向的是手机自己，需改走当前页面源（Vite 代理到后端） */
export function resolveApiBaseURL(raw = import.meta.env.VITE_API_BASE_URL ?? ''): string {
  const configured = raw.trim()
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return configured
  }

  const host = window.location.hostname
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return window.location.origin
  }

  return configured
}

/** FastAPI 文件接口基址。与问答 Node 的 VITE_API_BASE_URL 分开，未配置时不要回落到问答服务。 */
export function resolveAgentApiBaseURL(raw = import.meta.env.VITE_AGENT_API_BASE_URL ?? ''): string {
  return raw.trim()
}
