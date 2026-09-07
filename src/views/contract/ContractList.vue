<template>
  <div class="contract-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-select v-model="searchForm.status" placeholder="合同状态" clearable @change="loadData">
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="生效中" :value="2" />
            <el-option label="已到期" :value="3" />
            <el-option label="已终止" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.paymentMethod" placeholder="支付方式" clearable @change="loadData">
            <el-option label="月付" :value="1" />
            <el-option label="季付" :value="2" />
            <el-option label="半年付" :value="3" />
            <el-option label="年付" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchForm.keyword" placeholder="搜索合同号/租客" clearable @keyup.enter="loadData" />
        </el-col>
        <el-col :span="6" style="text-align: right;">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAdd">新增合同</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-alert
      title="合同状态流转说明"
      type="info"
      :closable="false"
      style="margin-bottom: 15px"
    >
      <template #default>
        <div style="font-size: 13px">
          <strong>草稿</strong> → 提交审核 → <strong>待审核</strong> → 审核通过
          → <strong>生效中</strong>（自动生成首期账单）
          <br />
          生效中的合同到期后自动变为 <strong>已到期</strong>，也可手动
          <strong>终止</strong>
        </div>
      </template>
    </el-alert>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="contractNo" label="合同编号" width="180" />
      <el-table-column prop="tenantName" label="租客" width="100" />
      <el-table-column prop="roomNo" label="房间" width="80" />
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column prop="monthlyRent" label="月租金 (元)" width="110" />
      <el-table-column prop="paymentMethodDesc" label="支付方式" width="90" />
      <el-table-column prop="statusDesc" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{
            row.statusDesc
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" @click="handleChange(row)">变更</el-button>
          <el-button
            size="small"
            :type="row.status === 2 ? 'warning' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 2 ? "终止" : "生效" }}
          </el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑合同' : '新增合同'" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="form.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租客" prop="userId">
              <el-select v-model="form.userId" placeholder="选择租客" style="width: 100%">
                <el-option v-for="t in tenantList" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间" prop="roomId">
              <el-select v-model="form.roomId" placeholder="选择房间" style="width: 100%">
                <el-option v-for="r in roomList" :key="r.id" :label="`${r.buildingName}${r.roomNo}`" :value="r.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月租金 (元)" prop="monthlyRent">
              <el-input-number v-model="form.monthlyRent" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="押金 (元)">
              <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select v-model="form.paymentMethod" placeholder="选择支付方式" style="width: 100%">
                <el-option label="月付" :value="1" />
                <el-option label="季付" :value="2" />
                <el-option label="半年付" :value="3" />
                <el-option label="年付" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({
  status: null,
  paymentMethod: null,
  keyword: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editId = ref(null)

const form = reactive({
  contractNo: '',
  userId: null,
  roomId: null,
  startDate: '',
  endDate: '',
  monthlyRent: null,
  deposit: null,
  paymentMethod: null,
  remark: ''
})

const tenantList = ref([])
const roomList = ref([])

const rules = {
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  userId: [{ required: true, message: '请选择租客', trigger: 'change' }],
  roomId: [{ required: true, message: '请选择房间', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  monthlyRent: [{ required: true, message: '请输入月租金', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

const statusTagType = (status) => {
  const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'info', 4: 'danger' }
  return types[status] || 'info'
}

const loadTenantList = async () => {
  try {
    const res = await request({ url: '/tenant-user/list', method: 'get', params: { page: 1, size: 1000 } })
    tenantList.value = res.data.records || []
  } catch (e) {
    console.error('加载租客列表失败', e)
  }
}

const loadRoomList = async () => {
  try {
    const res = await request({ url: '/room/list', method: 'get', params: { page: 1, size: 1000 } })
    roomList.value = res.data.records || []
  } catch (e) {
    console.error('加载房间列表失败', e)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/contract/list',
      method: 'get',
      params: {
        page: page.value,
        size: size.value,
        status: searchForm.status,
        paymentMethod: searchForm.paymentMethod,
        keyword: searchForm.keyword
      }
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.status = null
  searchForm.paymentMethod = null
  searchForm.keyword = ''
  page.value = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, {
    contractNo: '',
    userId: null,
    roomId: null,
    startDate: '',
    endDate: '',
    monthlyRent: null,
    deposit: null,
    paymentMethod: null,
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    contractNo: row.contractNo,
    userId: row.userId,
    roomId: row.roomId,
    startDate: row.startDate,
    endDate: row.endDate,
    monthlyRent: row.monthlyRent,
    deposit: row.deposit,
    paymentMethod: row.paymentMethod,
    remark: row.remark
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
          await request({ url: `/contract/${editId.value}`, method: 'put', data: form })
          ElMessage.success('更新成功')
        } else {
          await request({ url: '/contract', method: 'post', data: form })
          ElMessage.success('创建成功')
        }
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

const handleChange = (row) => {
  ElMessage.info('合同变更功能开发中...')
}

const handleToggleStatus = (row) => {
  const action = row.status === 2 ? '终止' : '生效'
  ElMessageBox.confirm(`确定要${action}该合同吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await request({
        url: `/contract/${row.id}/status`,
        method: 'post',
        data: { status: row.status === 2 ? 4 : 2 }
      })
      ElMessage.success(`${action}成功`)
      loadData()
    } catch (error) {
      ElMessage.error(error.message || `${action}失败`)
    }
  }).catch(() => {})
}

const handleDelete = async (id) => {
  await request({ url: `/contract/${id}`, method: 'delete' })
  ElMessage.success('删除成功')
  loadData()
}

defineExpose({ loadData })

onMounted(() => {
  loadTenantList()
  loadRoomList()
  loadData()
})
</script>

<style scoped lang="scss">
.contract-list {
  .search-card {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
