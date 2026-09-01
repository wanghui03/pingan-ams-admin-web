<template>
  <div class="contract-change-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="变更类型">
          <el-select v-model="searchForm.changeType" placeholder="请选择" clearable>
            <el-option label="续约" :value="1" />
            <el-option label="转租" :value="2" />
            <el-option label="提前退租" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
            <el-option label="已执行" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="changeNo" label="变更单号" width="180" />
        <el-table-column prop="contractNo" label="合同编号" width="180" />
        <el-table-column prop="changeTypeDesc" label="变更类型" width="100" />
        <el-table-column prop="statusDesc" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" width="120" />
        <el-table-column prop="approverName" label="审批人" width="120" />
        <el-table-column prop="reason" label="变更原因" show-overflow-tooltip />
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="success" 
              @click="handleApprove(row, true)"
            >通过</el-button>
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="danger" 
              @click="handleApprove(row, false)"
            >驳回</el-button>
            <el-button 
              v-if="row.status === 1" 
              size="small" 
              type="primary" 
              @click="handleExecute(row)"
            >执行</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailVisible" title="变更申请详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="变更单号">{{ currentRow.changeNo }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{ currentRow.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="变更类型">{{ currentRow.changeTypeDesc }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentRow.statusDesc }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentRow.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRow.createTime }}</el-descriptions-item>
        
        <!-- 续约信息 -->
        <template v-if="currentRow.changeType === 1">
          <el-descriptions-item label="新开始日期">{{ currentRow.newStartDate }}</el-descriptions-item>
          <el-descriptions-item label="新结束日期">{{ currentRow.newEndDate }}</el-descriptions-item>
          <el-descriptions-item label="新月租金" v-if="currentRow.newMonthlyRent">
            {{ currentRow.newMonthlyRent }} 元
          </el-descriptions-item>
        </template>
        
        <!-- 转租信息 -->
        <template v-if="currentRow.changeType === 2">
          <el-descriptions-item label="新租客">{{ currentRow.newUserName }}</el-descriptions-item>
          <el-descriptions-item label="转租手续费" v-if="currentRow.transferFee">
            {{ currentRow.transferFee }} 元
          </el-descriptions-item>
        </template>
        
        <!-- 提前退租信息 -->
        <template v-if="currentRow.changeType === 3">
          <el-descriptions-item label="退租日期">{{ currentRow.terminateDate }}</el-descriptions-item>
          <el-descriptions-item label="违约金" v-if="currentRow.penaltyAmount">
            {{ currentRow.penaltyAmount }} 元
          </el-descriptions-item>
          <el-descriptions-item label="押金退还" v-if="currentRow.depositRefund">
            {{ currentRow.depositRefund }} 元
          </el-descriptions-item>
        </template>
        
        <el-descriptions-item label="变更原因" :span="2">{{ currentRow.reason }}</el-descriptions-item>
        
        <template v-if="currentRow.approverName">
          <el-descriptions-item label="审批人">{{ currentRow.approverName }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentRow.approveTime }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">{{ currentRow.approveRemark }}</el-descriptions-item>
        </template>
      </el-descriptions>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog v-model="approveVisible" :title="approveForm.approved ? '通过申请' : '驳回申请'" width="500px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-input 
            v-model="approveForm.remark" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button 
          :type="approveForm.approved ? 'success' : 'danger'" 
          @click="submitApprove"
          :loading="approveLoading"
        >
          {{ approveForm.approved ? '确认通过' : '确认驳回' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getContractChangeList, 
  getContractChangeDetail, 
  approveContractChange, 
  executeContractChange 
} from '@/api/contractChange'

// 搜索表单
const searchForm = reactive({
  changeType: null,
  status: null
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

// 详情弹窗
const detailVisible = ref(false)
const currentRow = ref({})

// 审批弹窗
const approveVisible = ref(false)
const approveLoading = ref(false)
const approveForm = reactive({
  changeId: null,
  approved: true,
  remark: ''
})

// 获取状态标签类型
const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
  return map[status] || 'info'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getContractChangeList({
      page: pagination.page,
      size: pagination.size,
      changeType: searchForm.changeType,
      status: searchForm.status
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
  searchForm.changeType = null
  searchForm.status = null
  handleSearch()
}

// 查看详情
const handleView = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

// 审批
const handleApprove = (row, approved) => {
  approveForm.changeId = row.id
  approveForm.approved = approved
  approveForm.remark = ''
  approveVisible.value = true
}

// 提交审批
const submitApprove = async () => {
  approveLoading.value = true
  try {
    await approveContractChange(approveForm.changeId, approveForm.approved, approveForm.remark)
    ElMessage.success(approveForm.approved ? '已通过' : '已驳回')
    approveVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    approveLoading.value = false
  }
}

// 执行变更
const handleExecute = (row) => {
  ElMessageBox.confirm('确认执行该变更申请？执行后将修改原合同信息。', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await executeContractChange(row.id)
      ElMessage.success('执行成功')
      loadData()
    } catch (error) {
      ElMessage.error('执行失败')
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
.contract-change-container {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
