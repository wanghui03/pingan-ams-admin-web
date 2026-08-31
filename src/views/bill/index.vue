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
            <el-option label="其他" :value="9" />
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="contractNo" label="合同编号" width="160" />
        <el-table-column prop="billTypeDesc" label="类型" width="90" />
        <el-table-column prop="amount" label="金额(元)" width="110" />
        <el-table-column prop="billDate" label="账单日期" width="120" />
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === 0" size="small" type="success" @click="handleConfirmPay(row)">确认收款</el-button>
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
        <!-- 合同选择 -->
        <el-form-item label="合同" prop="contractId">
          <div class="select-display">
            <span v-if="selectedContract">{{ selectedContract.contractNo }} - {{ selectedContract.tenantName }}</span>
            <span v-else class="placeholder">请选择合同</span>
            <el-button type="primary" size="small" @click="showContractSelect">选择</el-button>
            <el-button v-if="selectedContract" size="small" @click="selectedContract = null; form.contractId = null">清除</el-button>
          </div>
        </el-form-item>

        <el-form-item label="账单类型" prop="billType">
          <el-select v-model="form.billType" style="width: 100%;">
            <el-option label="租金" :value="1" />
            <el-option label="押金" :value="2" />
            <el-option label="水电费" :value="3" />
            <el-option label="其他" :value="9" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额(元)" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账单日期" prop="billDate">
              <el-date-picker v-model="form.billDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="dueDate">
              <el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 合同选择弹窗 -->
    <el-dialog v-model="contractSelectVisible" title="选择合同" width="800px" append-to-body>
      <el-row :gutter="10" style="margin-bottom: 15px;">
        <el-col :span="16">
          <el-input v-model="contractSearch.keyword" placeholder="搜索合同编号/租客姓名" clearable @keyup.enter="loadContracts" />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="loadContracts">搜索</el-button>
        </el-col>
      </el-row>
      <el-table :data="contractList" v-loading="contractLoading" border stripe highlight-current-row @current-change="handleContractSelect" style="width: 100%;">
        <el-table-column prop="contractNo" label="合同编号" width="160" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="buildingName" label="楼栋" width="100" />
        <el-table-column prop="roomNo" label="房间" width="80" />
        <el-table-column prop="monthlyRent" label="月租金(元)" width="100" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="contractStatusTagType(row.status)" size="small">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="contractPage"
          v-model:page-size="contractSize"
          :total="contractTotal"
          :page-sizes="[10, 20]"
          layout="total, prev, pager, next"
          @size-change="loadContracts"
          @current-change="loadContracts"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBillList, createBill, confirmPayment } from '@/api/bill'
import request from '@/utils/request'

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
  billDate: '',
  dueDate: '',
  remark: ''
})

const rules = {
  contractId: [{ required: true, message: '请选择合同', trigger: 'change' }],
  billType: [{ required: true, message: '请选择账单类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  billDate: [{ required: true, message: '请选择账单日期', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }]
}

// 选中的合同
const selectedContract = ref(null)

// 合同选择弹窗
const contractSelectVisible = ref(false)
const contractLoading = ref(false)
const contractList = ref([])
const contractPage = ref(1)
const contractSize = ref(10)
const contractTotal = ref(0)
const contractSearch = reactive({ keyword: '' })

const statusTagType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
  return map[status] || 'info'
}

const contractStatusTagType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBillList({
      page: page.value, size: size.value,
      status: searchForm.status, billType: searchForm.billType
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

// 加载合同列表
const loadContracts = async () => {
  contractLoading.value = true
  try {
    const res = await request({
      url: '/contract/list',
      method: 'get',
      params: {
        page: contractPage.value,
        size: contractSize.value,
        keyword: contractSearch.keyword
      }
    })
    contractList.value = res.data.records
    contractTotal.value = Number(res.data.total)
  } finally {
    contractLoading.value = false
  }
}

// 显示合同选择弹窗
const showContractSelect = () => {
  contractSearch.keyword = ''
  contractPage.value = 1
  contractSelectVisible.value = true
  loadContracts()
}

// 选择合同
const handleContractSelect = (row) => {
  if (row) {
    selectedContract.value = row
    form.contractId = row.id
    // 自动填充金额
    if (row.monthlyRent && !form.amount) {
      form.amount = row.monthlyRent
    }
    contractSelectVisible.value = false
  }
}

const resetSearch = () => {
  searchForm.status = null
  searchForm.billType = null
  page.value = 1
  loadData()
}

const handleAdd = () => {
  Object.assign(form, {
    contractId: null, billType: 1, amount: null,
    billDate: '', dueDate: '', remark: ''
  })
  selectedContract.value = null
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

const handleDetail = (row) => {
  ElMessage.info('账单详情功能待完善')
}

const handleConfirmPay = (row) => {
  ElMessageBox.confirm('确认该账单已收款？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await confirmPayment(row.id)
    ElMessage.success('已确认收款')
    loadData()
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.select-display {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 5px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 32px;

  .placeholder {
    color: #c0c4cc;
    flex: 1;
  }

  span:not(.placeholder) {
    flex: 1;
    color: #606266;
  }
}
</style>
