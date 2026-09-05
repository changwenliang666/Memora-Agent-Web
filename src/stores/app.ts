import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const visitCount = ref(0)

  function increment() {
    visitCount.value += 1
  }

  return { visitCount, increment }
})
