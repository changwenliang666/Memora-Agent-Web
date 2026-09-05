import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

function readStoredMode(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function persistMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // 隐私模式或禁用存储时只改本会话，不打断切换
  }
}

/** Element Plus 暗色变量和项目 token 都听 html.dark */
function applyMode(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(readStoredMode())
  applyMode(mode.value)

  function setMode(next: ThemeMode) {
    mode.value = next
    applyMode(next)
    persistMode(next)
  }

  function toggle() {
    setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  return { mode, setMode, toggle }
})
