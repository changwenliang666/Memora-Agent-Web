import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { safeRedirect } from '@/router/redirect'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      // public：守卫放行，不要求会话
      meta: { public: true, title: '登录' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/knowledge/chat',
        },
        {
          path: 'knowledge',
          redirect: '/knowledge/chat',
        },
        {
          path: 'knowledge/chat',
          name: 'knowledge-chat',
          component: () => import('@/views/knowledge/ChatView.vue'),
          meta: { title: '知识问答' },
        },
        {
          path: 'knowledge/ingest',
          name: 'knowledge-ingest',
          component: () => import('@/views/knowledge/IngestView.vue'),
          meta: { title: '知识录入' },
        },
        {
          path: 'knowledge/records',
          name: 'knowledge-records',
          component: () => import('@/views/knowledge/RecordsView.vue'),
          meta: { title: '入库记录' },
        },
        {
          path: 'usage',
          name: 'usage',
          component: () => import('@/views/usage/UsageView.vue'),
          meta: { title: '用量统计' },
        },
        {
          path: ':pathMatch(.*)*',
          redirect: '/knowledge/chat',
        },
      ],
    },
  ],
})

// Vue Router 4+ 用返回值代替 next()：true 放行，对象则重定向
router.beforeEach((to,from) => {
  const auth = useAuthStore()
  // 每次导航重读 localStorage，过期 token 会在这里被清掉
  const loggedIn = auth.refresh()

  if (to.meta.public) {
    if (loggedIn) {
      return safeRedirect(to.query.redirect) ?? '/knowledge/chat'
    }
    return true
  }

  if (!loggedIn) {
    // 记住原地址，登录成功后回到该页
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  return true
})

export default router
