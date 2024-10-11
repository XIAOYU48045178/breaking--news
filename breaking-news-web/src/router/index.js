import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登陆页面
    { path: '/login', component: () => import('@/views/login/LoginBreak.vue') },

    // 架子
    {
      path: '/',
      component: () => import('@/views/container/ContainerLeft.vue'),
      redirect: '/article/artcates',
      children: [
        {
          path: '/article/artcates',
          component: () => import('@/views/article/ArtCates.vue')
        },
        {
          path: '/article/manage',
          component: () => import('@/views/article/ArticleManage.vue')
        },
        {
          path: '/userinfo/avatar',
          component: () => import('@/views/userinfo/UserAvatar.vue')
        },
        {
          path: '/userinfo/baseinfo',
          component: () => import('@/views/userinfo/BaseInfo.vue')
        },
        {
          path: '/userinfo/repassword',
          component: () => import('@/views/userinfo/RePassword.vue')
        }
      ]
    }
  ]
})

import { useUserStore } from '@/stores'
router.beforeEach((to) => {
  // 如果没有token, 且访问的是非登录页，拦截到登录，其他情况正常放行
  const useStore = useUserStore()
  if (!useStore.token && to.path !== '/login') return '/login'
})

export default router
