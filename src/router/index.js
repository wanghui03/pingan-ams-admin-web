import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录' },
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
                meta: { title: '首页', icon: 'HomeFilled', roles: [0, 1, 2, 3] },
            },
            {
                path: 'property',
                name: 'Property',
                redirect: '/property/rooms',
                meta: { title: '房源管理', icon: 'House', roles: [0, 1, 2, 3] },
                children: [
                    {
                        path: 'rooms',
                        name: 'PropertyRooms',
                        component: () => import('@/views/property/index.vue'),
                        meta: { title: '房源列表', icon: 'List' },
                    },
                    {
                        path: 'meter-reading',
                        name: 'PropertyMeterReading',
                        // component: () => import('@/views/property/MeterReadingTab.vue'),
                        component: () => import('@/views/meterReading/index.vue'),
                        meta: { title: '抄表管理', icon: 'Odometer' },
                    },
                    {
                        path: 'bill',
                        name: 'PropertyBill',
                        component: () => import('@/views/bill/index.vue'),
                        meta: { title: '账单管理', icon: 'Money' },
                    },
                ],
            },
            {
                path: 'workorder',
                name: 'WorkOrder',
                component: () => import('@/views/workorder/index.vue'),
                meta: { title: '工单管理', icon: 'Tools', roles: [0, 1, 2, 3] },
            },
            {
                path: 'tenant-user',
                name: 'TenantUser',
                component: () => import('@/views/tenant-user/index.vue'),
                meta: { title: '租客管理', icon: 'User', roles: [0, 1, 2, 3] },
            },
            {
                path: 'notification',
                name: 'Notification',
                component: () => import('@/views/notification/index.vue'),
                meta: { title: '消息通知', hidden: true, roles: [0, 1, 2, 3] },
            },
            {
                path: 'contract',
                name: 'Contract',
                redirect: '/contract/list',
                meta: { title: '合同管理', icon: 'Document', roles: [0, 1, 2, 3] },
                children: [
                    {
                        path: 'list',
                        name: 'ContractList',
                        component: () => import('@/views/contract/index.vue'),
                        meta: { title: '合同列表', icon: 'List' },
                    },
                    {
                        path: 'change',
                        name: 'ContractChange',
                        component: () => import('@/views/contract/ChangeTab.vue'),
                        meta: { title: '合同变更', icon: 'Edit' },
                    },
                ],
            },
            {
                path: 'system',
                name: 'System',
                redirect: '/system/config',
                meta: { title: '系统管理', icon: 'Setting', roles: [0] },
                children: [
                    {
                        path: 'config',
                        name: 'SystemConfig',
                        component: () => import('@/views/system/index.vue'),
                        meta: { title: '系统配置', icon: 'Tools' },
                    },
                    {
                        path: 'role',
                        name: 'SystemRole',
                        component: () => import('@/views/role/index.vue'),
                        meta: { title: '角色权限', icon: 'UserFilled' },
                    },
                ],
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    if (to.path === '/login') {
        next();
    } else {
        if (!userStore.token) {
            next('/login');
        } else {
            // 检查角色权限
            const roles = to.meta.roles;
            if (roles && !roles.includes(userStore.userInfo.userType)) {
                next('/dashboard');
            } else {
                next();
            }
        }
    }
});

export default router;
