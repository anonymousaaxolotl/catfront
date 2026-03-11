// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/default.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/index.vue'),
        },
        {
          path: 'cat',
          name: 'cat',
          component: () => import('@/pages/cat.vue'),
          meta: { login: true },
        },
        {
          path: 'shop',
          name: 'shop',
          component: () => import('@/pages/shop.vue'),
        },
        {
          path: 'adopt',
          name: 'adopt',
          component: () => import('@/pages/adopt.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/profile.vue'),
          meta: {
            title: '個人檔案',
            login: true,
          },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/admin.vue'),
      meta: { admin: true },
      children: [
        {
          path: '',
          name: 'admin-home',
          component: () => import('@/pages/admin/index.vue'),
        },
        {
          path: 'cat',
          name: 'admin-cat',
          component: () => import('@/pages/admin/cat.vue'),
        },
        {
          path: 'product',
          name: 'admin-product',
          component: () => import('@/pages/admin/product.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/users.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const user = useUserStore() // 呼叫妳的 Pinia 大腦

  // 1. 如果去的是「管理員專區」但妳不是管理員
  if (to.meta.admin && user.role !== 'admin') {
    window.alert('只有超級管理員貓咪才能進來喔！')
    return next('/') // 踢回首頁
  }

  // 2. 如果去的是「登入專區」但妳沒登入
  if (to.meta.login && !user.token) {
    window.alert('請先登入才能看小貓喔～')
    return next('/') // 踢回首頁（或跳出登入框）
  }

  // 3. 通過檢查，放行！
  next()
})

export default router
