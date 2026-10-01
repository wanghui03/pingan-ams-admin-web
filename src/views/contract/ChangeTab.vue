<template>
  <div class="contract-change-tab">
    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.changeType" placeholder="变更类型" clearable @change="() => loadData()">
            <el-option label="续租" :value="1" />
            <el-option label="转租" :value="2" />
            <el-option label="退租" :value="3" />
            <el-option label="调价" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="审核状态" clearable @change="() => loadData()">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-col>
        <el-col :span="14" style="text-align: right;">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="contractNo" label="合同编号" width="150" />
        <el-table-column prop="roomNo" label="房间号" width="100" />
        <el-table-column prop="tenantName" label="租客" width="120" />
        <el-table-column prop="changeTypeDesc" label="变更类型" width="100" />
        <el-table-column prop="changeDate" label="变更日期" width="120" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="primary"
              @click="handleAudit(row)"
            >审核</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              @click="handleExecute(row)"
            >执行</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 变更详情弹窗 -->
    <el-dialog v-model="detailVisible" title="变更详情" width="650px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="变更单号">{{ currentDetail.changeNo }}</el-descriptions-item>
          <el-descriptions-item label="合同编号">{{ currentDetail.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="变更类型">
            <el-tag :type="statusTagType(currentDetail.status)">{{ currentDetail.changeTypeDesc }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentDetail.status)">{{ currentDetail.statusDesc }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentDetail.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>

          <!-- 续租信息 -->
          <template v-if="currentDetail.changeType === 1">
            <el-descriptions-item label="新开始日期">{{ currentDetail.newStartDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="新结束日期">{{ currentDetail.newEndDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="新月租金">{{ currentDetail.newMonthlyRent ? `¥${currentDetail.newMonthlyRent}` : '-' }}</el-descriptions-item>
          </template>

          <!-- 转租信息 -->
          <template v-if="currentDetail.changeType === 2">
            <el-descriptions-item label="新租客">{{ currentDetail.newUserName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="转租手续费">{{ currentDetail.transferFee ? `¥${currentDetail.transferFee}` : '-' }}</el-descriptions-item>
          </template>

          <!-- 退租信息 -->
          <template v-if="currentDetail.changeType === 3">
            <el-descriptions-item label="退租日期">{{ currentDetail.terminateDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="违约金">{{ currentDetail.penaltyAmount ? `¥${currentDetail.penaltyAmount}` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="押金退还">{{ currentDetail.depositRefund ? `¥${currentDetail.depositRefund}` : '-' }}</el-descriptions-item>
          </template>

          <el-descriptions-item label="变更原因" :span="2">{{ currentDetail.reason || '-' }}</el-descriptions-item>

          <!-- 审批信息 -->
          <template v-if="currentDetail.status !== 0">
            <el-descriptions-item label="审批人">{{ currentDetail.approverName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审批时间">{{ currentDetail.approveTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审批意见" :span="2">{{ currentDetail.approveRemark || '-' }}</el-descriptions-item>
          </template>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditVisible" title="审核变更申请" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" placeholder="请输入审核意见（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="auditLoading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getContractChangeDetail, approveContractChange, executeContractChange } from '@/api/contractChange'


const searchForm = reactive({
  changeType: null,
  status: null
})

const tableData = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref(null)

// 审核弹窗
const auditVisible = ref(false)
const auditLoading = ref(false)
const auditForm = reactive({
  changeId: null,
  approved: true,
  remark: ''
})

const statusTagType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'primary' }
  return types[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/contract-change/list',
      method: 'get',
      params: {
        page: pagination.page,
        size: pagination.size,
        changeType: searchForm.changeType,
        status: searchForm.status
      }
    })
    tableData.value = res.data.records
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.changeType = null
  searchForm.status = null
  loadData()
}

// 查看详情
const handleDetail = async (row) => {
  try {
    const res = await getContractChangeDetail(row.id)
    currentDetail.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 打开审核弹窗
const handleAudit = (row) => {
  auditForm.changeId = row.id
  auditForm.approved = true
  auditForm.remark = ''
  auditVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  auditLoading.value = true
  try {
    await approveContractChange(auditForm.changeId, auditForm.approved, auditForm.remark)
    ElMessage.success(auditForm.approved ? '已通过' : '已驳回')
    auditVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '审核失败')
  } finally {
    auditLoading.value = false
  }
}

// 执行变更
const handleExecute = (row) => {
  ElMessageBox.confirm('确认执行该变更？执行后将直接修改合同信息', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await executeContractChange(row.id)
      ElMessage.success('变更已执行')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '执行失败')
    }
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadData()
}

defineExpose({ loadData })

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.contract-change-tab {
  .search-form {
    margin-bottom: 20px;
  }
}
</style>