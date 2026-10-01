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
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" @click="handleChange(row)">变更</el-button>
          <!-- 草稿状态：提交审核 -->
          <el-button
            v-if="row.status === 0"
            size="small"
            type="primary"
            @click="handleSubmitAudit(row)"
          >提交审核</el-button>
          <!-- 待审核状态：审核通过/驳回 -->
          <el-button
            v-if="row.status === 1"
            size="small"
            type="success"
            @click="handleApprove(row)"
          >审核通过</el-button>
          <el-button
            v-if="row.status === 1"
            size="small"
            type="danger"
            @click="handleReject(row)"
          >审核驳回</el-button>
          <!-- 生效中状态：终止 -->
          <el-button
            v-if="row.status === 2"
            size="small"
            type="warning"
            @click="handleTerminate(row)"
          >终止</el-button>
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

    <!-- 合同变更弹窗 -->
    <el-dialog v-model="changeDialogVisible" title="发起合同变更" width="600px">
      <el-alert
        v-if="currentContract"
        :title="`合同：${currentContract.contractNo} | 租客：${currentContract.tenantName} | 房间：${currentContract.roomNo}`"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form :model="changeForm" :rules="changeRules" ref="changeFormRef" label-width="110px">
        <el-form-item label="变更类型" prop="changeType">
          <el-select v-model="changeForm.changeType" style="width: 100%" @change="handleChangeTypeChange">
            <el-option label="续租" :value="1" />
            <el-option label="转租" :value="2" />
            <el-option label="提前退租" :value="3" />
          </el-select>
        </el-form-item>

        <!-- 续租字段 -->
        <template v-if="changeForm.changeType === 1">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="新开始日期" prop="newStartDate">
                <el-date-picker v-model="changeForm.newStartDate" type="date" placeholder="选择开始日期" style="width: 100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="新结束日期" prop="newEndDate">
                <el-date-picker v-model="changeForm.newEndDate" type="date" placeholder="选择结束日期" style="width: 100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="新月租金 (元)" prop="newMonthlyRent">
            <el-input-number v-model="changeForm.newMonthlyRent" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </template>

        <!-- 转租字段 -->
        <template v-if="changeForm.changeType === 2">
          <el-form-item label="新租客" prop="newUserId">
            <el-select v-model="changeForm.newUserId" placeholder="选择新租客" style="width: 100%">
              <el-option v-for="t in tenantList" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="转租手续费 (元)">
            <el-input-number v-model="changeForm.transferFee" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </template>

        <!-- 提前退租字段 -->
        <template v-if="changeForm.changeType === 3">
          <el-form-item label="退租日期" prop="terminateDate">
            <el-date-picker v-model="changeForm.terminateDate" type="date" placeholder="选择退租日期" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="违约金 (元)">
                <el-input-number v-model="changeForm.penaltyAmount" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="押金退还 (元)">
                <el-input-number v-model="changeForm.depositRefund" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-form-item label="变更原因" prop="reason">
          <el-input v-model="changeForm.reason" type="textarea" :rows="3" placeholder="请输入变更原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitChange" :loading="changeLoading">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { createContractChange } from '@/api/contractChange'
import { submitContract, approveContract, rejectContract, terminateContract } from '@/api/contract'

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
  // 只有生效中的合同才能变更
  if (row.status !== 2) {
    ElMessage.warning('只有生效中的合同才能发起变更')
    return
  }
  // 打开变更弹窗，传入合同信息
  openChangeDialog(row)
}

// ========== 合同变更弹窗 ==========
const changeDialogVisible = ref(false)
const changeLoading = ref(false)
const changeFormRef = ref(null)
const currentContract = ref(null)

const changeForm = reactive({
  changeType: 1,
  newStartDate: '',
  newEndDate: '',
  newMonthlyRent: null,
  newUserId: null,
  transferFee: null,
  terminateDate: '',
  penaltyAmount: null,
  depositRefund: null,
  reason: ''
})

const changeRules = {
  changeType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入变更原因', trigger: 'blur' }]
}

const openChangeDialog = (row) => {
  currentContract.value = row
  Object.assign(changeForm, {
    changeType: 1,
    newStartDate: row.endDate, // 续约默认从原结束日期开始
    newEndDate: '',
    newMonthlyRent: row.monthlyRent,
    newUserId: null,
    transferFee: null,
    terminateDate: '',
    penaltyAmount: null,
    depositRefund: null,
    reason: ''
  })
  changeDialogVisible.value = true
}

const handleChangeTypeChange = (type) => {
  // 切换变更类型时重置相关字段
  if (type === 1) {
    // 续约
    changeForm.newStartDate = currentContract.value.endDate
    changeForm.newMonthlyRent = currentContract.value.monthlyRent
  } else if (type === 2) {
    // 转租
    changeForm.newUserId = null
    changeForm.transferFee = null
  } else if (type === 3) {
    // 提前退租
    changeForm.terminateDate = ''
    changeForm.penaltyAmount = null
    changeForm.depositRefund = null
  }
}

const submitChange = async () => {
  if (!changeFormRef.value) return
  await changeFormRef.value.validate(async (valid) => {
    if (valid) {
      changeLoading.value = true
      try {
        const data = {
          contractId: currentContract.value.id,
          changeType: changeForm.changeType,
          reason: changeForm.reason
        }

        // 根据变更类型填充不同字段
        if (changeForm.changeType === 1) {
          // 续约
          data.newStartDate = changeForm.newStartDate
          data.newEndDate = changeForm.newEndDate
          data.newMonthlyRent = changeForm.newMonthlyRent
        } else if (changeForm.changeType === 2) {
          // 转租
          data.newUserId = changeForm.newUserId
          data.transferFee = changeForm.transferFee
        } else if (changeForm.changeType === 3) {
          // 提前退租
          data.terminateDate = changeForm.terminateDate
          data.penaltyAmount = changeForm.penaltyAmount
          data.depositRefund = changeForm.depositRefund
        }

        await createContractChange(data)
        ElMessage.success('变更申请已提交')
        changeDialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '提交失败')
      } finally {
        changeLoading.value = false
      }
    }
  })
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

// 提交审核
const handleSubmitAudit = (row) => {
  ElMessageBox.confirm('确定要提交该合同进行审核吗？', '提示', {
    type: 'info'
  }).then(async () => {
    try {
      await submitContract(row.id)
      ElMessage.success('已提交审核')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '提交失败')
    }
  }).catch(() => {})
}

// 审核通过
const handleApprove = (row) => {
  ElMessageBox.confirm('确定要通过该合同审核吗？通过后将自动生成租金账单', '提示', {
    type: 'success'
  }).then(async () => {
    try {
      await approveContract(row.id)
      ElMessage.success('审核通过')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {})
}

// 审核驳回
const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '审核驳回', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '原因不能为空',
    type: 'warning'
  }).then(async ({ value }) => {
    try {
      await rejectContract(row.id, value)
      ElMessage.success('已驳回')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {})
}

// 终止合同
const handleTerminate = (row) => {
  ElMessageBox.prompt('请输入终止原因', '终止合同', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '原因不能为空',
    type: 'warning'
  }).then(async ({ value }) => {
    try {
      await terminateContract(row.id, value)
      ElMessage.success('合同已终止')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
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
