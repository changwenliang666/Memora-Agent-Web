import type { Component } from 'vue'
import { ChatDotRound, DataAnalysis, FolderOpened, Tickets, UploadFilled } from '@element-plus/icons-vue'

export interface NavLeaf {
  index: string
  title: string
  icon: Component
}

export interface NavGroup {
  index: string
  title: string
  icon: Component
  children: NavLeaf[]
}

export type NavEntry = NavGroup | NavLeaf

export function isNavGroup(item: NavEntry): item is NavGroup {
  return 'children' in item
}

export const navItems: NavEntry[] = [
  {
    index: 'knowledge',
    title: '知识库',
    icon: FolderOpened,
    children: [
      { index: '/knowledge/chat', title: '问答', icon: ChatDotRound },
      { index: '/knowledge/ingest', title: '录入', icon: UploadFilled },
      { index: '/knowledge/records', title: '入库记录', icon: Tickets },
    ],
  },
  {
    index: '/usage',
    title: '用量',
    icon: DataAnalysis,
  },
]

export const pageTitles: Record<string, string> = {
  '/knowledge/chat': '知识问答',
  '/knowledge/ingest': '知识录入',
  '/knowledge/records': '入库记录',
  '/usage': '用量统计',
}
