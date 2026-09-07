<template>
  <div class="page-container">
    <div class="page-header">
      <h2>证件管理</h2>
      <el-button type="primary" @click="handleAdd">新增证件</el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.ownerType" placeholder="所有者类型" clearable @change="handleSearch">
            <el-option label="租户" :value="1" />
            <el-option label="员工" :value="2" />
            <el-option label="租客" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.certType" placeholder="证件类型" clearable @change="handleSearch">
            <el-option label="营业执照" :value="1" />
            <el-option label="身份证" :value="2" />
            <el-option label="护照" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="14" style="text-align: right;">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="ownerTypeDesc" label="所有者类型" width="100" />
        <el-table-column prop="ownerId" label="所有者 ID" width="100" />
        <el-table-column prop="certTypeDesc" label="证件类型" width="100" />
        <el-table-column prop="certName" label="证件名称" width="150" />
        <el-table-column prop="certNo" label="证件编号" width="180" />
        <el-table-column prop="certFile" label="附件标识" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑证件' : '新增证件'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="所有者类型" prop="ownerType">
          <el-select v-model="form.ownerType" placeholder="请选择所有者类型" style="width: 100%" @change="handleOwnerTypeChange">
            <el-option label="租户" :value="1" />
            <el-option label="员工" :value="2" />
            <el-option label="租客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="所有者 ID" prop="ownerId">
          <el-input-number v-model="form.ownerId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="证件类型" prop="certType">
          <el-select v-model="form.certType" placeholder="请选择证件类型" style="width: 100%">
            <el-option label="营业执照" :value="1" />
            <el-option label="身份证" :value="2" />
            <el-option label="护照" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="证件名称" prop="certName">
          <el-input v-model="form.certName" placeholder="请输入证件名称" />
        </el-form-item>
        <el-form-item label="证件编号" prop="certNo">
          <el-input v-model="form.certNo" placeholder="请输入证件编号" />
        </el-form-item>
        <el-form-item label="附件标识">
          <el-input v-model="form.certFile" placeholder="请输入文件 ID 或 URL" />
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
import { getCertificateList, saveOrUpdateCertificate, deleteCertificate } from '@/api/certificate'

// 搜索表单
const searchForm = reactive({
  ownerType: null,
  certType: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const form = reactive({
  id: null,
  ownerType: null,
  ownerId: null,
  certType: null,
  certName: '',
  certNo: '',
  certFile: ''
})

const rules = {
  ownerType: [{ required: true, message: '请选择所有者类型', trigger: 'change' }],
  ownerId: [{ required: true, message: '请输入所有者 ID', trigger: 'blur' }],
  certType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
  certName: [{ required: true, message: '请输入证件名称', trigger: 'blur' }],
  certNo: [{ required: true, message: '请输入证件编号', trigger: 'blur' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getCertificateList({
      page: pagination.page,
      size: pagination.size,
      ownerType: searchForm.ownerType,
      certType: searchForm.certType
    })
    tableData.value = res.data.records
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.ownerType = null
  searchForm.certType = null
  handleSearch()
}

// 显示新增弹窗
const handleAdd = () => {
  isEdit.value = false
  form.id = null
  form.ownerType = null
  form.ownerId = null
  form.certType = null
  form.certName = ''
  form.certNo = ''
  form.certFile = ''
  dialogVisible.value = true
}

// 显示编辑弹窗
const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.ownerType = row.ownerType
  form.ownerId = row.ownerId
  form.certType = row.certType
  form.certName = row.certName
  form.certNo = row.certNo
  form.certFile = row.certFile
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await saveOrUpdateCertificate(form)
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该证件吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCertificate({ ownerType: row.ownerType, ownerId: row.ownerId })
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 分页
const handleSizeChange = (size) => {
  pagination.size = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
