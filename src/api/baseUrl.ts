/** 开发时若用 Network 地址打开，localhost 指向的是手机自己，需改成同一主机上的 FastAPI 端口。 */
export function resolveApiBaseURL(raw = import.meta.env.VITE_API_BASE_URL ?? ''): string {
  const configured = raw.trim()
  if (!configured || !import.meta.env.DEV || typeof window === 'undefined') {
    return configured
  }

  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return configured
  }

  try {
    const url = new URL(configured)
    url.hostname = host
    return url.origin
  } catch {
    return configured
  }
}
