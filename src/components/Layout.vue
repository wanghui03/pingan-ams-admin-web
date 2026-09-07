<template>
    <el-container class="layout-container">
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
            <div class="logo">
                <el-icon :size="28"><House /></el-icon>
                <h2 v-show="!isCollapse">平安公寓</h2>
            </div>

            <el-menu :default-active="activeMenu" :collapse="isCollapse" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff" mode="vertical">
                <template v-for="item in menuItems" :key="item.path">
                    <!-- 有子菜单 -->
                    <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
                        <template #title>
                            <el-icon><component :is="item.icon" /></el-icon>
                            <span>{{ item.title }}</span>
                        </template>
                        <el-menu-item v-for="child in item.children" :key="child.path" :index="item.path + '/' + child.path">
                            <el-icon><component :is="child.icon" /></el-icon>
                            <span>{{ child.title }}</span>
                        </el-menu-item>
                    </el-sub-menu>

                    <!-- 无子菜单 -->
                    <el-menu-item v-else :index="item.path">
                        <el-icon><component :is="item.icon" /></el-icon>
                        <span>{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </el-menu>

            <!-- 底部用户信息 -->
            <div class="sidebar-footer">
                <div class="user-area">
                    <el-dropdown @command="handleCommand" placement="right" :disabled="isCollapse">
                        <div class="user-info">
                            <el-avatar :size="32" :icon="UserFilled" />
                            <div v-show="!isCollapse" class="user-details">
                                <span class="user-name">{{ userStore.userInfo.realName || userStore.userInfo.nickname || '管理员' }}</span>
                                <span class="user-role">{{ userTypeText }}</span>
                            </div>
                            <el-icon v-show="!isCollapse"><ArrowDown /></el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </el-aside>

        <!-- 主内容区 -->
        <el-container>
            <!-- 顶部导航栏 -->
            <el-header class="header">
                <div class="header-left">
                    <el-button text @click="toggleSidebar" class="collapse-btn">
                        <el-icon :size="20"><component :is="isCollapse ? 'Expand' : 'Fold'" /></el-icon>
                    </el-button>
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="currentRoute">{{ currentRoute.meta.title }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="header-right">
                    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
                        <el-button text @click="goToNotification">
                            <el-icon><Bell /></el-icon>
                            <span>消息</span>
                        </el-button>
                    </el-badge>
                </div>
            </el-header>

            <!-- 内容区 -->
            <el-main class="main-content">
                <router-view />
            </el-main>
        </el-container>
    </el-container>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
            <el-form-item label="旧密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="passwordDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleChangePassword" :loading="passwordSubmitLoading">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import { House, UserFilled, Bell, Expand, Fold, ArrowDown } from '@element-plus/icons-vue';
    import { getUnreadNotificationCount } from '@/api/notification';

    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();

    const isCollapse = ref(false);
    const activeMenu = computed(() => route.path);
    const currentRoute = computed(() => (route.meta.title ? route : null));

    // 未读通知数量
    const unreadCount = ref(0);
    let pollTimer = null;

    const fetchUnreadCount = async () => {
        try {
            const res = await getUnreadNotificationCount();
            unreadCount.value = Number(res.data) || 0;
        } catch (e) {
            console.error('获取未读通知失败', e);
        }
    };

    const goToNotification = () => {
        router.push('/notification');
    };

    const startPolling = () => {
        fetchUnreadCount();
        pollTimer = setInterval(fetchUnreadCount, 30000);
    };

    const stopPolling = () => {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    };

    const toggleSidebar = () => {
        isCollapse.value = !isCollapse.value;
    };

    // 用户类型文本
    const userTypeText = computed(() => {
        const typeMap = {
            0: '超级管理员',
            1: '租客',
            2: '员工',
            3: '管理员',
        };
        return typeMap[userStore.userInfo.userType] || '普通用户';
    });

    // 构建多级菜单
    const menuItems = computed(() => {
        const userType = userStore.userInfo.userType;
        const mainRoute = router.options.routes.find(r => r.path === '/');
        if (!mainRoute || !mainRoute.children) return [];

        return mainRoute.children
            .filter(child => {
                // 隐藏的路由不显示
                if (child.meta?.hidden) return false;
                const roles = child.meta?.roles;
                return !roles || roles.includes(userType);
            })
            .map(child => {
                const item = {
                    path: '/' + child.path,
                    title: child.meta?.title || child.name,
                    icon: child.meta?.icon || 'Document',
                };

                if (child.children && child.children.length > 0) {
                    item.children = child.children.map(sub => ({
                        path: sub.path,
                        title: sub.meta?.title || sub.name,
                        icon: sub.meta?.icon || 'Document',
                    }));
                }

                return item;
            });
    });

    // 修改密码相关
    const passwordDialogVisible = ref(false);
    const passwordSubmitLoading = ref(false);
    const passwordFormRef = ref(null);
    const passwordForm = reactive({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const passwordRules = {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, message: '密码长度至少 6 位', trigger: 'blur' },
        ],
        confirmPassword: [
            { required: true, message: '请再次输入新密码', trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    if (value !== passwordForm.newPassword) {
                        callback(new Error('两次输入的密码不一致'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur',
            },
        ],
    };

    const handleCommand = command => {
        if (command === 'logout') {
            ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                stopPolling();
                userStore.logout();
                router.push('/login');
                ElMessage.success('已退出登录');
            });
        } else if (command === 'changePassword') {
            showChangePassword();
        }
    };

    onMounted(() => {
        startPolling();
    });

    onUnmounted(() => {
        stopPolling();
    });

    const showChangePassword = () => {
        Object.assign(passwordForm, {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        passwordDialogVisible.value = true;
    };

    const handleChangePassword = async () => {
        if (!passwordFormRef.value) return;
        await passwordFormRef.value.validate(async valid => {
            if (valid) {
                passwordSubmitLoading.value = true;
                try {
                    const request = (await import('@/utils/request')).default;
                    await request({
                        url: '/staff/change-password',
                        method: 'post',
                        data: {
                            oldPassword: passwordForm.oldPassword,
                            newPassword: passwordForm.newPassword,
                        },
                    });
                    ElMessage.success('密码修改成功，请重新登录');
                    passwordDialogVisible.value = false;
                    userStore.logout();
                    setTimeout(() => {
                        router.push('/login');
                    }, 1500);
                } catch (e) {
                    console.error('修改密码失败', e);
                } finally {
                    passwordSubmitLoading.value = false;
                }
            }
        });
    };
</script>

<style scoped lang="scss">
    .layout-container {
        height: 100vh;
    }

    .sidebar {
        background-color: #304156;
        display: flex;
        flex-direction: column;
        transition: width 0.3s;

        .logo {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #fff;
            border-bottom: 1px solid #1f2d3d;

            h2 {
                font-size: 18px;
                font-weight: 500;
                white-space: nowrap;
            }
        }

        .el-menu {
            border-right: none;
            flex: 1;
            overflow-y: auto;
        }

        .sidebar-footer {
            border-top: 1px solid #1f2d3d;
            padding: 15px;
            background-color: #263445;

            .user-area {
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s;

                    &:hover {
                        background-color: #304156;
                    }

                    .user-details {
                        flex: 1;
                        display: flex;
                        flex-direction: column;

                        .user-name {
                            color: #fff;
                            font-size: 14px;
                            font-weight: 500;
                        }

                        .user-role {
                            color: #909399;
                            font-size: 12px;
                            margin-top: 2px;
                        }
                    }
                }
            }
        }
    }

    .header {
        background-color: #fff;
        border-bottom: 1px solid #e6e6e6;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;

        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;

            .collapse-btn {
                padding: 8px;
                border-radius: 4px;

                &:hover {
                    background-color: #f5f5f5;
                }
            }
        }

        .header-right {
            .notification-badge {
                :deep(.el-badge__content) {
                    top: -5px;
                    right: -5px;
                }
            }
        }
    }

    .main-content {
        background-color: #f0f2f5;
        padding: 20px;
        overflow-y: auto;
    }
</style>
