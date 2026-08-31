<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>平安公寓</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.userInfo.userType === 0"
          index="/tenant"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span>租户管理</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.userInfo.userType === 2 || userStore.userInfo.userType === 3"
          index="/staff"
        >
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/building">
          <el-icon><OfficeBuilding /></el-icon>
          <span>楼栋管理</span>
        </el-menu-item>
        <el-menu-item index="/room">
          <el-icon><House /></el-icon>
          <span>房间管理</span>
        </el-menu-item>
        <el-menu-item index="/contract">
          <el-icon><Document /></el-icon>
          <span>合同管理</span>
        </el-menu-item>
        <el-menu-item index="/bill">
          <el-icon><Money /></el-icon>
          <span>账单管理</span>
        </el-menu-item>
        <el-menu-item index="/workorder">
          <el-icon><Tickets /></el-icon>
          <span>工单管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>租客管理</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.userInfo.userType === 0 || userStore.userInfo.userType === 3"
          index="/config"
        >
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.userInfo.userType === 0 || userStore.userInfo.userType === 3"
          index="/log"
        >
          <el-icon><Document /></el-icon>
          <span>操作日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <span>欢迎使用平安公寓管理系统</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span>{{ userStore.userInfo.realName || userStore.userInfo.nickname || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordSubmitLoading = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
    })
  } else if (command === 'changePassword') {
    showChangePassword()
  }
}

const showChangePassword = () => {
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordDialogVisible.value = true
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordSubmitLoading.value = true
      try {
        await request({
          url: '/staff/change-password',
          method: 'post',
          data: {
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
          }
        })
        ElMessage.success('密码修改成功，请重新登录')
        passwordDialogVisible.value = false
        // 退出登录
        userStore.logout()
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } finally {
        passwordSubmitLoading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-bottom: 1px solid #1f2d3d;
    
    h2 {
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .el-menu {
    border-right: none;
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
    font-size: 14px;
    color: #606266;
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
