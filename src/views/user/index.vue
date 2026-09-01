<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索姓名/手机号/账号"
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="登录账号" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="userTypeDesc" label="角色" width="100" />
        <el-table-column label="系统角色" width="200">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role.id" size="small" style="margin-right: 5px;">
              {{ role.roleName }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #999;">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="statusDesc" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'user:edit'" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="'user:role'" size="small" type="primary" @click="handleAssignRole(row)">分配角色</el-button>
            <el-button
              v-permission="'user:status'"
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色弹窗 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-form label-width="100px">
        <el-form-item label="用户姓名">
          <span>{{ currentUser.realName }}</span>
        </el-form-item>
        <el-form-item label="登录账号">
          <span>{{ currentUser.username }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedRoleIds" multiple placeholder="请选择角色" style="width: 100%;">
            <el-option
              v-for="role in allRoles"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
              :disabled="role.status === 0"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignRole" :loading="roleSubmitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getAllRoles, getUserRoles, assignUserRoles } from '@/api/role'
import { phoneRule } from '@/utils/validators'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({ keyword: '' })

const dialogVisible = ref(false)
const formRef = ref(null)
const editId = ref(null)

const form = reactive({
  realName: '',
  phone: ''
})

const rules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [phoneRule]
}

// 角色分配相关
const roleDialogVisible = ref(false)
const currentUser = ref({})
const selectedRoleIds = ref([])
const allRoles = ref([])
const roleSubmitLoading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/user/list',
      method: 'get',
      params: {
        page: page.value,
        size: size.value,
        keyword: searchForm.keyword
      }
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  loadData()
}

const handleEdit = (row) => {
  editId.value = row.id
  Object.assign(form, {
    realName: row.realName,
    phone: row.phone
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await request({
          url: `/user/${editId.value}`,
          method: 'put',
          data: form
        })
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleToggleStatus = (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/user/${row.id}/status`,
      method: 'put',
      params: { status: row.status === 1 ? 0 : 1 }
    })
    ElMessage.success(`${action}成功`)
    loadData()
  })
}

// 加载所有角色
const loadAllRoles = async () => {
  try {
    const res = await getAllRoles()
    allRoles.value = res.data
  } catch (error) {
    console.error('加载角色列表失败', error)
  }
}

// 打开角色分配对话框
const handleAssignRole = async (row) => {
  currentUser.value = row
  await loadAllRoles()
  
  // 获取当前用户的角色
  try {
    const res = await getUserRoles(row.id)
    selectedRoleIds.value = res.data.map(role => role.id)
  } catch (error) {
    selectedRoleIds.value = []
  }
  
  roleDialogVisible.value = true
}

// 提交角色分配
const submitAssignRole = async () => {
  roleSubmitLoading.value = true
  try {
    await assignUserRoles(currentUser.value.id, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    loadData()
  } finally {
    roleSubmitLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
