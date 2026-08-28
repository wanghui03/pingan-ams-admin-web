<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">平安公寓管理系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="code">
          <el-input
            v-model="loginForm.code"
            placeholder="请输入微信授权码"
            prefix-icon="Key"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-btn">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <p>提示：开发阶段可使用任意授权码登录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  code: ''
})

const rules = {
  code: [
    { required: true, message: '请输入授权码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        userStore.setToken(res.data.token)
        userStore.setUserInfo(res.data)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  .title {
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 30px;
  }
  
  .login-form {
    .login-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
    }
  }
  
  .tips {
    margin-top: 20px;
    text-align: center;
    font-size: 12px;
    color: #909399;
  }
}
</style>
