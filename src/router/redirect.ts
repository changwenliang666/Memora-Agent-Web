/** 只接受站内相对路径，避免开放重定向 */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const path = value.trim()
  // // 开头是协议相对 URL；回到 /login 会和守卫形成环
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/login')) {
    return undefined
  }

  return path
}
