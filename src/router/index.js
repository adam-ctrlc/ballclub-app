import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/components/dashboard/DashboardOverview.vue') },
        { path: 'history', name: 'history', component: () => import('@/components/dashboard/HistoryTab.vue') },
        { path: 'session', name: 'session', component: () => import('@/components/dashboard/SessionTab.vue') },
        { path: 'members', name: 'members', component: () => import('@/components/dashboard/MembersTab.vue') },
        { path: 'members/:id', name: 'member-detail', component: () => import('@/views/MemberDetailView.vue') },
        { path: 'owners', name: 'owners', component: () => import('@/components/dashboard/OwnersTab.vue') },
        { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
      ],
    },
    { path: '/join', name: 'join', component: () => import('@/views/JoinView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login' }
  }
  if (to.name === 'login' && isAuthenticated.value) {
    return { name: 'dashboard' }
  }
  return true
})

export default router
