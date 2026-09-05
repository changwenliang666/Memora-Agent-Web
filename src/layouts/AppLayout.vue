<template>
  <div class="app-layout">
    <aside v-if="!isPhone" class="app-aside" :class="{ collapsed: asideCollapsed }">
      <div class="brand">
        <span class="brand-mark">M</span>
        <span v-if="!asideCollapsed" class="brand-name">Memora</span>
      </div>
      <AppNav :collapse="asideCollapsed" :active="activePath" />
    </aside>

    <section class="app-main">
      <header class="app-header">
        <div class="header-left">
          <el-button v-if="isPhone" class="icon-btn" text @click="drawerOpen = true">
            <el-icon :size="20"><Menu /></el-icon>
          </el-button>
          <el-button v-else-if="isDesktop" class="icon-btn" text @click="userCollapsed = !userCollapsed">
            <el-icon :size="18">
              <Fold v-if="!userCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <!-- 浅色显示月亮（切到深色），深色显示太阳（切回浅色） -->
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

      <div class="app-content">
        <router-view />
      </div>
    </section>

    <el-drawer
      v-model="drawerOpen"
      direction="ltr"
      size="260px"
      :with-header="false"
      class="app-drawer"
      body-class="app-drawer-body"
    >
      <div class="drawer-brand">
        <span class="brand-mark">M</span>
        <span class="brand-name">Memora</span>
      </div>
      <AppNav :collapse="false" :active="activePath" @select="drawerOpen = false" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Expand, Fold, Menu, Moon, Sunny } from '@element-plus/icons-vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { pageTitles } from '@/router/nav'
import { useThemeStore } from '@/stores/theme'
import AppNav from './AppNav.vue'

const route = useRoute()
const themeStore = useThemeStore()
const { isPhone, isDesktop } = useBreakpoint()

const userCollapsed = ref(false)
const drawerOpen = ref(false)

// 平板宽度默认收成图标轨；桌面才尊重用户自己的折叠选择
const asideCollapsed = computed(() => !isDesktop.value || userCollapsed.value)
const activePath = computed(() => route.path)
const pageTitle = computed(() => pageTitles[route.path] ?? 'Memora')
const themeToggleLabel = computed(() =>
  themeStore.mode === 'light' ? '切换为深色' : '切换为浅色',
)

watch(isPhone, (phone) => {
  if (!phone) {
    drawerOpen.value = false
  }
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100%;
  background: $color-bg;
  color: $color-text;
}

.app-aside {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: $sidebar-expanded;
  background: $color-sidebar;
  color: $color-sidebar-text;
  transition: width 0.2s ease;

  &.collapsed {
    width: $sidebar-collapsed;
  }

  :deep(.app-nav) {
    flex: 1;
    overflow: auto;
  }
}

.brand,
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: $header-height;
  padding: 0 16px;
}

.brand-mark {
  display: inline-flex;
  flex-shrink: 0;
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
  color: $color-sidebar-text;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.app-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.app-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 $space-md;
  border-bottom: 1px solid $color-border;
  background: $color-surface;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.page-title {
  margin: 0;
  overflow: hidden;
  color: $color-text;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-btn {
  color: $color-text;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.drawer-brand {
  color: $color-sidebar-text;
}
</style>
