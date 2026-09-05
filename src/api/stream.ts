export interface StreamHandlers {
  onToken: (text: string) => void
  signal?: AbortSignal
}

/** 有网关则走真实 SSE；失败或未配置时回落到前端演示流，方便验收发送 / 停止 */
export async function streamChat(prompt: string, handlers: StreamHandlers): Promise<void> {
  const baseURL = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

  if (baseURL) {
    try {
      const response = await fetch(`${baseURL.replace(/\/$/, '')}/knowledge/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: handlers.signal,
      })

      if (response.ok && response.body) {
        await readSseStream(response.body, handlers)
        return
      }
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }
    }
  }

  await readSseStream(createMockStream(prompt, handlers.signal), handlers)
}

async function readSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      // SSE 事件以空行分隔；最后一段可能不完整，留到下次再拼
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() ?? ''

      for (const chunk of chunks) {
        const line = chunk.split('\n').find((item) => item.startsWith('data:'))
        if (!line) {
          continue
        }

        const data = line.slice(5).trim()
        if (data === '[DONE]') {
          return
        }

        const token = parseToken(data)
        if (token) {
          handlers.onToken(token)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function parseToken(data: string): string {
  try {
    const parsed = JSON.parse(data) as { delta?: string; text?: string; content?: string }
    return parsed.delta ?? parsed.text ?? parsed.content ?? ''
  } catch {
    return data
  }
}

function createMockStream(prompt: string, signal?: AbortSignal): ReadableStream<Uint8Array> {
  const preview = prompt.length > 24 ? `${prompt.slice(0, 24)}…` : prompt
  const text = `这是对「${preview}」的演示回答。当前未接通问答服务，前端用 fetch 可读流逐字输出，便于验收发送、停止和贴底滚动。`

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      for (const char of text) {
        if (signal?.aborted) {
          controller.close()
          return
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: char })}\n\n`))
        await wait(24, signal)
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    if (signal?.aborted) {
      onAbort()
      return
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
