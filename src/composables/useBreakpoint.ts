import { computed, onMounted, onUnmounted, ref } from 'vue'

/** 与样式断点一致：<768 手机，768–1199 平板，>=1200 桌面 */
const BP_MD = 768
const BP_LG = 1200

function readFlags() {
  const isPhone = window.matchMedia(`(max-width: ${BP_MD - 1}px)`).matches
  const isDesktop = window.matchMedia(`(min-width: ${BP_LG}px)`).matches
  return {
    isPhone,
    isDesktop,
    isTablet: !isPhone && !isDesktop,
    isMobile: !isDesktop,
  }
}

export function useBreakpoint() {
  const flags = ref(readFlags())

  let phoneQuery: MediaQueryList | undefined
  let desktopQuery: MediaQueryList | undefined

  function sync() {
    flags.value = readFlags()
  }

  onMounted(() => {
    phoneQuery = window.matchMedia(`(max-width: ${BP_MD - 1}px)`)
    desktopQuery = window.matchMedia(`(min-width: ${BP_LG}px)`)
    phoneQuery.addEventListener('change', sync)
    desktopQuery.addEventListener('change', sync)
    sync()
  })

  onUnmounted(() => {
    phoneQuery?.removeEventListener('change', sync)
    desktopQuery?.removeEventListener('change', sync)
  })

  return {
    isPhone: computed(() => flags.value.isPhone),
    isTablet: computed(() => flags.value.isTablet),
    isDesktop: computed(() => flags.value.isDesktop),
    isMobile: computed(() => flags.value.isMobile),
  }
}