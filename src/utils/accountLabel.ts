/** 账号不可展示时头像中心用的占位符 */
export const ACCOUNT_AVATAR_FALLBACK = '···'

/** 去掉首尾空白后仍有内容才可展示；否则返回 null */
export function displayableAccount(account: string | null | undefined): string | null {
  if (typeof account !== 'string') {
    return null
  }

  const trimmed = account.trim()
  return trimmed || null
}

/** 可展示账号的后 3 位；不可展示时返回 null */
export function accountTailLabel(account: string | null | undefined): string | null {
  console.log('accountTailLabel', account)
  const displayable = displayableAccount(account)
  return displayable ? displayable.slice(-3) : null
}

/** 头像可见文字：后 3 位，或占位符 */
export function accountAvatarLabel(account: string | null | undefined): string {
  return accountTailLabel(account) ?? ACCOUNT_AVATAR_FALLBACK
}
