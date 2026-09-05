<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <main class="home">
    <h1>Memora Agent</h1>
    <p class="lead">Vue 3 前端工程骨架已就绪。</p>
    <p class="count">共享计数：{{ appStore.visitCount }}</p>
    <el-button type="primary" @click="appStore.increment">增加计数</el-button>
  </main>
</template>

<style lang="scss" scoped>
.home {
  max-width: 640px;
  margin: 0 auto;
  padding: calc($space-md * 2);
}

h1 {
  color: $color-primary;
  font-size: $font-size-title;
}

.lead,
.count {
  color: $color-text;
}
</style>
