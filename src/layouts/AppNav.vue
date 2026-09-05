<template>
  <el-menu
    class="app-nav"
    :router="true"
    :collapse="collapse"
    :default-openeds="defaultOpened"
    :default-active="active"
    @select="onSelect"
  >
    <template v-for="item in navItems" :key="item.index">
      <el-sub-menu v-if="isNavGroup(item)" :index="item.index">
        <template #title>
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
          <el-icon><component :is="child.icon" /></el-icon>
          <span>{{ child.title }}</span>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="item.index">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { isNavGroup, navItems } from '@/router/nav'

defineProps<{
  collapse: boolean
  active: string
}>()

const emit = defineEmits<{
  select: [index: string]
}>()

/** 进应用时展开「知识库」，让问答 / 录入 / 记录三项直接可见 */
const defaultOpened = ['knowledge']

function onSelect(index: string) {
  emit('select', index)
}
</script>
