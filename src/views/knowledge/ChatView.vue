<template>
  <div class="chat-page">
    <div ref="scrollerRef" class="message-pane" @scroll="onScroll">
      <div v-if="chatStore.messages.length === 0" class="empty-state">
        <p class="empty-kicker">知识库问答</p>
        <h2>问一问你的知识库</h2>
        <p class="empty-lead">基于已入库的文档作答。当前为演示流式输出，稍后可接真实检索服务。</p>
      </div>

      <div v-else class="thread">
        <article
          v-for="message in chatStore.messages"
          :key="message.id"
          class="bubble"
          :class="[message.role, { streaming: message.streaming }]"
        >
          <span class="role">{{ message.role === 'user' ? '你' : '助手' }}</span>
          <p class="body">{{ message.content || (message.streaming ? '正在生成…' : '') }}</p>
        </article>
      </div>
    </div>

    <div class="composer-wrap">
      <div class="composer">
        <textarea
          v-model="draft"
          class="composer-input"
          rows="2"
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          :disabled="chatStore.streaming"
          @keydown="onKeydown"
        />
        <!-- 生成中只留停止圆钮；空闲才显示发送，两者不同时出现 -->
        <el-button
          v-if="chatStore.streaming"
          class="composer-action composer-stop"
          circle
          aria-label="停止"
          @click="chatStore.stop"
        >
          <span class="stop-icon" />
        </el-button>
        <el-button
          v-else
          type="primary"
          class="composer-action"
          circle
          :disabled="!canSend"
          aria-label="发送"
          @click="submit"
        >
          <el-icon :size="16"><Top /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Top } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'

/** 距底部小于该值时，流式输出继续贴底；用户上翻后不再强拉回去 */
const BOTTOM_GAP = 48
const chatStore = useChatStore()
const draft = ref('')
const scrollerRef = ref<HTMLElement>()
const pinToBottom = ref(true)

const canSend = computed(() => draft.value.trim().length > 0 && !chatStore.streaming)

function onKeydown(event: KeyboardEvent) {
  // 中文输入法组字时 Enter 只是上屏。部分浏览器此时 isComposing 仍为 false，但 keyCode 会是 229。
  if (event.isComposing || event.keyCode === 229) {
    return
  }

  // Enter 发送，Shift+Enter 换行（不拦截，交给 textarea 默认行为）
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}

function submit() {
  if (!canSend.value) {
    return
  }

  const text = draft.value
  draft.value = ''
  pinToBottom.value = true
  void chatStore.send(text)
}

function onScroll() {
  const el = scrollerRef.value
  if (!el) {
    return
  }

  pinToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_GAP
}

function scrollToBottom() {
  const el = scrollerRef.value
  if (!el) {
    return
  }

  el.scrollTop = el.scrollHeight
}

onMounted(() => {
  pinToBottom.value = true
  void nextTick(scrollToBottom)
})

// 只跟最后一条内容走，避免整表重绘；用户已离开底部时不抢滚动
watch(
  () => chatStore.messages.at(-1)?.content,
  () => {
    if (pinToBottom.value) {
      requestAnimationFrame(scrollToBottom)
    }
  },
)
</script>

<style lang="scss" scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    radial-gradient(circle at top, $color-accent-soft, transparent 42%),
    $color-bg;
}

.message-pane {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 32px 24px 12px;
}

.empty-state {
  max-width: 560px;
  margin: 12vh auto 0;
  text-align: center;
}

.empty-kicker,
.empty-lead,
.role {
  color: $color-muted;
}

.empty-kicker {
  margin: 0 0 8px;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.empty-state h2 {
  margin: 0 0 12px;
  color: $color-text;
  font-size: 28px;
  font-weight: 650;
}

.empty-lead {
  margin: 0;
  line-height: 1.6;
}

.thread {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
}

.bubble {
  max-width: 86%;
  padding: 12px 16px;
  border: 1px solid $color-border;
  border-radius: 14px;
  background: $color-surface;

  // 历史气泡跳过离屏渲染；流式那条不能开，否则高度估算会抖
  &:not(.streaming) {
    content-visibility: auto;
    contain-intrinsic-size: 72px;
  }
}

.bubble.user {
  align-self: flex-end;
  border-color: transparent;
  background: $color-accent-soft;
}

.bubble.assistant {
  align-self: flex-start;
}

.role {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
}

.body {
  margin: 0;
  color: $color-text;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.composer-wrap {
  flex-shrink: 0;
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
}

.composer {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 760px;
  margin: 0 auto;
  padding: 14px 14px 14px 16px;
  border: 1px solid $color-border;
  border-radius: 16px;
  background: $color-surface;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.composer-input {
  flex: 1;
  min-height: 3em;
  max-height: 192px;
  padding: 6px 4px;
  resize: none;
  border: 0;
  outline: none;
  background: transparent;
  color: $color-text;
  font: inherit;
  line-height: 1.5;
}

.composer-action {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
}

.composer-stop {
  background: $color-text;
  border-color: $color-text;
  color: $color-surface;

  &:hover,
  &:focus {
    background: $color-text;
    border-color: $color-text;
    color: $color-surface;
  }
}

.stop-icon {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: $color-surface;
}

@include phone {
  .message-pane {
    padding: 20px 16px 8px;
  }

  .empty-state h2 {
    font-size: 22px;
  }

  .bubble {
    max-width: 100%;
  }
}
</style>
