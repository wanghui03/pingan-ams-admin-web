<template>
  <div class="page-container">
    <div class="page-header">
      <h2>租户管理</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索租户名称/联系人/电话"
            clearable
            @keyup.enter="loadData"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="14" style="text-align: right;">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增租户
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="租户名称" min-width="150" />
        <el-table-column prop="typeDesc" label="租户类型" width="100" />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="roomCount" label="房间数" width="90" align="center" />
        <el-table-column prop="occupancyRate" label="入住率" width="90" align="center" />
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
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm title="确定删除该租户吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑租户' : '新增租户'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择租户类型" style="width: 100%;">
            <el-option label="企业" :value="1" />
            <el-option label="个人" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入地址" />
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
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({ keyword: '' })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editId = ref(null)

const form = reactive({
  name: '',
  type: 1,
  contactPerson: '',
  contactPhone: '',
  email: '',
  address: ''
})

const rules = {
  name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择租户类型', trigger: 'change' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/platform/tenant/list',
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

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, {
    name: '',
    type: 1,
    contactPerson: '',
    contactPhone: '',
    email: '',
    address: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    email: row.email,
    address: row.address
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await request({
            url: `/platform/tenant/${editId.value}`,
            method: 'put',
            data: form
          })
          ElMessage.success('更新成功')
        } else {
          await request({
            url: '/platform/tenant',
            method: 'post',
            data: form
          })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = async (id) => {
  await request({
    url: `/platform/tenant/${id}`,
    method: 'delete'
  })
  ElMessage.success('删除成功')
  loadData()
}

const handleToggleStatus = (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该租户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/platform/tenant/${row.id}/status`,
      method: 'put',
      params: { status: row.status === 1 ? 0 : 1 }
    })
    ElMessage.success(`${action}成功`)
    loadData()
  })
}

onMounted(() => {
  loadData()
})
</script>
