<template>
  <el-dropdown
    trigger="click"
    placement="bottom-end"
    popper-class="user-menu-popper"
    @command="onCommand"
  >
    <button type="button" class="user-avatar" :aria-label="menuLabel" :title="menuLabel">
      {{ avatarText }}
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="sign-out">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { accountAvatarLabel } from '@/utils/accountLabel'

const router = useRouter()
const authStore = useAuthStore()

const avatarText = computed(() => accountAvatarLabel(authStore.session?.nickname))
const menuLabel = computed(() => authStore.displayAccount ?? '账户菜单')

function onCommand(command: string | number | object) {
  if (command !== 'sign-out') {
    return
  }

  authStore.clearSession()
  // 清完立刻离场，避免停在已无权限的工作台页
  void router.replace('/login')
}
</script>

<style lang="scss" scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: $color-avatar-bg;
  color: $color-avatar-text;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    box-shadow: 0 0 0 3px $color-accent-soft;
  }

  @include phone {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
}
</style>

<style lang="scss">
/* 下拉挂到 body，必须用弹出层 class 才能打到浅色 / 深色表面 */
.user-menu-popper.el-popper {
  background: $color-surface;
  border: 1px solid $color-border;
}

.user-menu-popper .el-dropdown-menu {
  padding: 6px;
  background: $color-surface;
}

.user-menu-popper .el-dropdown-menu__item {
  border-radius: 6px;
  color: $color-text;
}

.user-menu-popper .el-dropdown-menu__item:not(.is-disabled):hover,
.user-menu-popper .el-dropdown-menu__item:not(.is-disabled):focus {
  background: $color-accent-soft;
  color: $color-text;
}
</style>
