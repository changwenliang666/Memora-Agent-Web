import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/knowledge/chat',
    },
    {
      path: '/knowledge',
      redirect: '/knowledge/chat',
    },
    {
      path: '/knowledge/chat',
      name: 'knowledge-chat',
      component: () => import('@/views/knowledge/ChatView.vue'),
      meta: { title: '知识问答' },
    },
    {
      path: '/knowledge/ingest',
      name: 'knowledge-ingest',
      component: () => import('@/views/knowledge/IngestView.vue'),
      meta: { title: '知识录入' },
    },
    {
      path: '/knowledge/records',
      name: 'knowledge-records',
      component: () => import('@/views/knowledge/RecordsView.vue'),
      meta: { title: '入库记录' },
    },
    {
      path: '/usage',
      name: 'usage',
      component: () => import('@/views/usage/UsageView.vue'),
      meta: { title: '用量统计' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/knowledge/chat',
    },
  ],
})

export default router
