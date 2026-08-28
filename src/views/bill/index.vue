<template>
  <div class="page-container">
    <div class="page-header">
      <h2>账单管理</h2>
    </div>

    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="账单状态" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已逾期" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.billType" placeholder="账单类型" clearable>
            <el-option label="租金" :value="1" />
            <el-option label="水电费" :value="2" />
            <el-option label="押金" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="10" style="text-align: right;">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增账单
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="billNo" label="账单编号" width="180" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="roomNo" label="房间" width="80" />
        <el-table-column prop="billTypeDesc" label="类型" width="80" />
        <el-table-column prop="amount" label="金额(元)" width="110" />
        <el-table-column prop="dueDate" label="应付日期" width="120" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="overdueDays" label="逾期天数" width="90">
          <template #default="{ row }">
            <span :style="{ color: row.overdueDays > 0 ? '#f56c6c' : '' }">
              {{ row.overdueDays || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已付金额" width="110" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              size="small"
              type="success"
              @click="handlePay(row)"
            >确认收款</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="danger"
              @click="handleCancel(row)"
            >取消</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 新增账单弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增账单" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="合同ID" prop="contractId">
          <el-input v-model.number="form.contractId" placeholder="请输入合同ID" />
        </el-form-item>
        <el-form-item label="账单类型" prop="billType">
          <el-select v-model="form.billType" style="width: 100%;">
            <el-option label="租金" :value="1" />
            <el-option label="水电费" :value="2" />
            <el-option label="押金" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额(元)" prop="amount">
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="应付日期">
          <el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
import { getBillList, createBill, markAsPaid, cancelBill } from '@/api/bill'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({ status: null, billType: null })
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  contractId: null,
  billType: 1,
  amount: null,
  dueDate: '',
  remark: ''
})

const rules = {
  contractId: [{ required: true, message: '请输入合同ID', trigger: 'blur' }],
  billType: [{ required: true, message: '请选择账单类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

const statusTagType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBillList({
      page: page.value,
      size: size.value,
      status: searchForm.status,
      billType: searchForm.billType
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.status = null
  searchForm.billType = null
  loadData()
}

const handleAdd = () => {
  Object.assign(form, { contractId: null, billType: 1, amount: null, dueDate: '', remark: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await createBill(form)
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handlePay = (row) => {
  ElMessageBox.prompt('请输入实付金额', '确认收款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.amount
  }).then(async ({ value }) => {
    await markAsPaid(row.id, value, '')
    ElMessage.success('收款成功')
    loadData()
  })
}

const handleCancel = (row) => {
  ElMessageBox.prompt('请输入取消原因', '取消账单', {
    confirmButtonText: '确定',
    cancelButtonText: '返回'
  }).then(async ({ value }) => {
    await cancelBill(row.id, value)
    ElMessage.success('账单已取消')
    loadData()
  })
}

onMounted(() => {
  loadData()
})
</script>
