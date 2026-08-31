<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统配置</h2>
    </div>

    <el-card>
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增配置
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="configKey" label="配置键" width="200" />
        <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入配置键" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="请输入配置描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const currentId = ref(null)

const form = reactive({
  configKey: '',
  configValue: '',
  description: ''
})

const rules = {
  configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/sys-config/list',
      method: 'get'
    })
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  Object.assign(form, { configKey: '', configValue: '', description: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(form, {
    configKey: row.configKey,
    configValue: row.configValue,
    description: row.description
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
          url: '/sys-config',
          method: 'post',
          data: form
        })
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        loadData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/sys-config/${row.id}`,
      method: 'delete'
    })
    ElMessage.success('删除成功')
    loadData()
  })
}

onMounted(() => {
  loadData()
})
</script>
