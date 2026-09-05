import { ref } from 'vue'
import { defineStore } from 'pinia'
import { streamChat } from '@/api/stream'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  streaming: boolean
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  let abortController: AbortController | null = null

  /** 只改最后一条助手消息，避免每个 token 都 push 新气泡 */
  function appendToken(text: string) {
    const last = messages.value[messages.value.length - 1]
    if (!last || last.role !== 'assistant') {
      return
    }
    last.content += text
  }

  async function send(text: string) {
    const content = text.trim()
    if (!content || streaming.value) {
      return
    }

    messages.value.push({ id: createId(), role: 'user', content, streaming: false })
    messages.value.push({ id: createId(), role: 'assistant', content: '', streaming: true })
    streaming.value = true
    abortController = new AbortController()

    try {
      await streamChat(content, {
        onToken: appendToken,
        signal: abortController.signal,
      })
    } catch (error) {
      // 用户点停止会 abort，不算失败，已生成的文字要保留
      if (!isAbortError(error)) {
        appendToken(messages.value[messages.value.length - 1]?.content ? '' : '回答失败，请稍后重试。')
      }
    } finally {
      const last = messages.value[messages.value.length - 1]
      if (last) {
        last.streaming = false
      }
      streaming.value = false
      abortController = null
    }
  }

  function stop() {
    abortController?.abort()
  }

  return { messages, streaming, send, stop }
})

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
