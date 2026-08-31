import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'tenant',
        name: 'Tenant',
        component: () => import('@/views/tenant/index.vue'),
        meta: { title: '租户管理', roles: [0] } // 仅超级管理员可见
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/staff/index.vue'),
        meta: { title: '员工管理', roles: [2, 3] } // 员工和管理员可见
      },
      {
        path: 'building',
        name: 'Building',
        component: () => import('@/views/building/index.vue'),
        meta: { title: '楼栋管理' }
      },
      {
        path: 'room',
        name: 'Room',
        component: () => import('@/views/room/index.vue'),
        meta: { title: '房间管理' }
      },
      {
        path: 'contract',
        name: 'Contract',
        component: () => import('@/views/contract/index.vue'),
        meta: { title: '合同管理' }
      },
      {
        path: 'bill',
        name: 'Bill',
        component: () => import('@/views/bill/index.vue'),
        meta: { title: '账单管理' }
      },
      {
        path: 'workorder',
        name: 'WorkOrder',
        component: () => import('@/views/workorder/index.vue'),
        meta: { title: '工单管理' }
      },
      {
        path: 'user',
        name: 'TenantUser',
        component: () => import('@/views/tenant-user/index.vue'),
        meta: { title: '租客管理', roles: [2, 3] }
      },
      {
        path: 'config',
        name: 'Config',
        component: () => import('@/views/config/index.vue'),
        meta: { title: '系统配置', roles: [0, 3] }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '操作日志', roles: [0, 3] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.path === '/login') {
    next()
  } else {
    if (!userStore.token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
