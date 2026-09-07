<template>
  <div class="login-page">
    <header class="login-bar">
      <div class="brand">
        <span class="brand-mark">M</span>
        <span class="brand-name">Memora</span>
      </div>
      <el-button
        class="icon-btn"
        text
        :aria-label="themeToggleLabel"
        :title="themeToggleLabel"
        @click="themeStore.toggle()"
      >
        <el-icon :size="18">
          <Moon v-if="themeStore.mode === 'light'" />
          <Sunny v-else />
        </el-icon>
      </el-button>
    </header>

    <main class="login-main">
      <section class="login-card">
        <p class="kicker">{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</p>
        <h1>{{ mode === 'login' ? '登录工作台' : '注册后开始使用' }}</h1>
        <p class="lead">
          {{ mode === 'login' ? '使用账号和密码进入知识库。' : '先设定账号和密码，随后即可登录。' }}
        </p>

        <el-segmented v-model="mode" class="mode-switch" :options="modeOptions" />

        <el-form
          ref="formRef"
          class="login-form"
          :model="form"
          :rules="rules"
          size="large"
          @submit.prevent="submit"
        >
          <el-form-item prop="account">
            <el-input
              v-model="form.account"
              placeholder="账号"
              autocomplete="username"
              :disabled="submitting"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="密码"
              :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
              :disabled="submitting"
            />
          </el-form-item>
          <el-form-item v-if="mode === 'register'" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="确认密码"
              autocomplete="new-password"
              :disabled="submitting"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              class="submit-btn"
              type="primary"
              native-type="submit"
              :loading="submitting"
            >
              {{ mode === 'login' ? '登录' : '注册并进入' }}
            </el-button>
          </el-form-item>
        </el-form>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { login, register } from '@/api/auth'
import { safeRedirect } from '@/router/redirect'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

type AuthMode = 'login' | 'register'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const mode = ref<AuthMode>('login')

const form = reactive({
  account: '',
  password: '',
  confirmPassword: '',
})

const modeOptions = [
  { label: '登录', value: 'login' },
  { label: '注册', value: 'register' },
]

const themeToggleLabel = computed(() =>
  themeStore.mode === 'light' ? '切换为深色' : '切换为浅色',
)

const rules = computed<FormRules>(() => ({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  // 确认密码只做前端校验，不传给注册接口
  confirmPassword:
    mode.value === 'register'
      ? [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            validator: (_rule, value: string, callback) => {
              if (value !== form.password) {
                callback(new Error('两次输入的密码不一致'))
                return
              }
              callback()
            },
            trigger: 'blur',
          },
        ]
      : [],
}))

watch(mode, () => {
  form.confirmPassword = ''
  formRef.value?.clearValidate()
})

async function submit() {
  if (submitting.value) {
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  submitting.value = true
  try {
    const session =
      mode.value === 'login'
        ? await login(form.account, form.password)
        : await register(form.account, form.password)

    authStore.setSession(session)
    // redirect 只信站内相对路径，缺省进问答
    await router.replace(safeRedirect(route.query.redirect) ?? '/knowledge/chat')
  } catch {
    // 错误 toast 由 HTTP 拦截器统一处理
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
  background: $color-bg;
  color: $color-text;

  &::before {
    position: absolute;
    top: -160px;
    left: 50%;
    width: 520px;
    height: 320px;
    background: radial-gradient(circle, $color-accent-soft 0%, transparent 70%);
    transform: translateX(-50%);
    content: '';
    pointer-events: none;
  }
}

.login-bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: $color-primary;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.icon-btn {
  color: $color-text;
}

.login-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 48px;
}

.login-card {
  width: min(420px, 100%);
  padding: 32px 28px 24px;
  border: 1px solid $color-border;
  border-radius: 18px;
  background: $color-surface;
  box-shadow: 0 16px 40px color-mix(in srgb, $color-text 8%, transparent);
}

.kicker {
  margin: 0 0 8px;
  color: $color-muted;
  font-size: 13px;
  letter-spacing: 0.1em;
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 650;
}

.lead {
  margin: 0 0 20px;
  color: $color-muted;
  font-size: 14px;
  line-height: 1.6;
}

.mode-switch {
  width: 100%;
  margin-bottom: 20px;
  padding: 4px;
  border: 1px solid $color-border;
  border-radius: 12px;
  background: $color-bg;
  --el-segmented-bg-color: transparent;
  --el-segmented-color: var(--color-muted);
  --el-segmented-item-selected-color: #fff;
  --el-segmented-item-selected-bg-color: var(--color-primary);
  --el-border-radius-base: 10px;

  :deep(.el-segmented__item),
  :deep(.el-segmented__item-selected) {
    border-radius: 8px;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--color-border) inset;
  }

  :deep(.el-form-item:last-child) {
    margin-bottom: 0;
  }
}

.submit-btn {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
}

@include phone {
  .login-bar {
    padding: 0 16px;
  }

  .login-card {
    padding: 28px 20px 20px;
  }

  h1 {
    font-size: 22px;
  }
}
</style>
