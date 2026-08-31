<template>
  <div class="page-container">
    <div class="page-header">
      <h2>合同管理</h2>
    </div>

    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="合同状态" clearable>
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="生效中" :value="2" />
            <el-option label="已到期" :value="3" />
            <el-option label="已终止" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="searchForm.status = null; loadData()">重置</el-button>
        </el-col>
        <el-col :span="15" style="text-align: right;">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增合同
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="contractNo" label="合同编号" width="180" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="buildingName" label="楼栋" width="100" />
        <el-table-column prop="roomNo" label="房间" width="80" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="monthlyRent" label="月租金(元)" width="110" />
        <el-table-column prop="paymentMethodDesc" label="支付方式" width="90" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remainDays" label="剩余天数" width="90" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="primary"
              @click="handleSubmitForReview(row)"
            >提交审核</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              @click="handleApprove(row)"
            >审核通过</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="warning"
              @click="handleReject(row)"
            >审核驳回</el-button>
            <el-button
              v-if="row.status === 0 || row.status === 2"
              size="small"
              type="danger"
              @click="handleTerminate(row)"
            >终止</el-button>
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

    <!-- 新增合同弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增合同" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <!-- 租客选择 -->
        <el-form-item label="租客" prop="userId">
          <div class="select-display">
            <span v-if="selectedTenant">{{ selectedTenant.realName }} ({{ selectedTenant.phone }})</span>
            <span v-else class="placeholder">请选择租客</span>
            <el-button type="primary" size="small" @click="showTenantSelect">选择</el-button>
            <el-button v-if="selectedTenant" size="small" @click="selectedTenant = null; form.userId = null">清除</el-button>
          </div>
        </el-form-item>

        <!-- 房间选择 -->
        <el-form-item label="房间" prop="roomId">
          <div class="select-display">
            <span v-if="selectedRoom">{{ selectedRoom.buildingName }} - {{ selectedRoom.roomNo }}</span>
            <span v-else class="placeholder">请选择房间</span>
            <el-button type="primary" size="small" @click="showRoomSelect">选择</el-button>
            <el-button v-if="selectedRoom" size="small" @click="selectedRoom = null; form.roomId = null">清除</el-button>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="月租金(元)" prop="monthlyRent">
              <el-input-number v-model="form.monthlyRent" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金(元)">
              <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" style="width: 100%;">
            <el-option label="月付" :value="1" />
            <el-option label="季付" :value="2" />
            <el-option label="半年付" :value="3" />
            <el-option label="年付" :value="4" />
          </el-select>
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

    <!-- 租客选择弹窗 -->
    <el-dialog v-model="tenantSelectVisible" title="选择租客" width="700px" append-to-body>
      <el-row :gutter="10" style="margin-bottom: 15px;">
        <el-col :span="16">
          <el-input v-model="tenantSearch.keyword" placeholder="搜索姓名/手机号" clearable @keyup.enter="loadTenants" />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="loadTenants">搜索</el-button>
        </el-col>
      </el-row>
      <el-table :data="tenantList" v-loading="tenantLoading" border stripe highlight-current-row @current-change="handleTenantSelect" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="authStatusDesc" label="实名认证" width="100">
          <template #default="{ row }">
            <el-tag :type="row.authStatus === 1 ? 'success' : 'info'" size="small">{{ row.authStatusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusDesc" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="tenantPage"
          v-model:page-size="tenantSize"
          :total="tenantTotal"
          :page-sizes="[10, 20]"
          layout="total, prev, pager, next"
          @size-change="loadTenants"
          @current-change="loadTenants"
        />
      </div>
    </el-dialog>

    <!-- 房间选择弹窗 -->
    <el-dialog v-model="roomSelectVisible" title="选择房间（仅显示空置房间）" width="800px" append-to-body>
      <el-row :gutter="10" style="margin-bottom: 15px;">
        <el-col :span="8">
          <el-input v-model="roomSearch.keyword" placeholder="搜索房间号" clearable @keyup.enter="loadRooms" />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="loadRooms">搜索</el-button>
        </el-col>
      </el-row>
      <el-table :data="roomList" v-loading="roomLoading" border stripe highlight-current-row @current-change="handleRoomSelect" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="buildingName" label="楼栋" width="120" />
        <el-table-column prop="roomNo" label="房间号" width="100" />
        <el-table-column prop="roomTypeDesc" label="类型" width="100" />
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="area" label="面积(㎡)" width="90" />
        <el-table-column prop="monthlyRent" label="月租(元)" width="100" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'info'" size="small">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="roomPage"
          v-model:page-size="roomSize"
          :total="roomTotal"
          :page-sizes="[10, 20]"
          layout="total, prev, pager, next"
          @size-change="loadRooms"
          @current-change="loadRooms"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getContractList, createContract, terminateContract } from '@/api/contract'
import request from '@/utils/request'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({ status: null })
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  userId: null,
  roomId: null,
  startDate: '',
  endDate: '',
  monthlyRent: null,
  deposit: null,
  paymentMethod: 1,
  remark: ''
})

const rules = {
  userId: [{ required: true, message: '请选择租客', trigger: 'change' }],
  roomId: [{ required: true, message: '请选择房间', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  monthlyRent: [{ required: true, message: '请输入月租金', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

// 选中的数据
const selectedTenant = ref(null)
const selectedRoom = ref(null)

// 租客选择弹窗
const tenantSelectVisible = ref(false)
const tenantLoading = ref(false)
const tenantList = ref([])
const tenantPage = ref(1)
const tenantSize = ref(10)
const tenantTotal = ref(0)
const tenantSearch = reactive({ keyword: '' })

// 房间选择弹窗
const roomSelectVisible = ref(false)
const roomLoading = ref(false)
const roomList = ref([])
const roomPage = ref(1)
const roomSize = ref(10)
const roomTotal = ref(0)
const roomSearch = reactive({ keyword: '' })

const statusTagType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getContractList({
      page: page.value, size: size.value, status: searchForm.status
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

// 加载租客列表
const loadTenants = async () => {
  tenantLoading.value = true
  try {
    const res = await request({
      url: '/tenant-user/list',
      method: 'get',
      params: {
        page: tenantPage.value,
        size: tenantSize.value,
        keyword: tenantSearch.keyword
      }
    })
    tenantList.value = res.data.records
    tenantTotal.value = Number(res.data.total)
  } finally {
    tenantLoading.value = false
  }
}

// 加载房间列表（仅空置）
const loadRooms = async () => {
  roomLoading.value = true
  try {
    const res = await request({
      url: '/room/list',
      method: 'get',
      params: {
        page: roomPage.value,
        size: roomSize.value,
        status: 0, // 只查询空置房间
        keyword: roomSearch.keyword
      }
    })
    roomList.value = res.data.records
    roomTotal.value = Number(res.data.total)
  } finally {
    roomLoading.value = false
  }
}

// 显示租客选择弹窗
const showTenantSelect = () => {
  tenantSearch.keyword = ''
  tenantPage.value = 1
  tenantSelectVisible.value = true
  loadTenants()
}

// 显示房间选择弹窗
const showRoomSelect = () => {
  roomSearch.keyword = ''
  roomPage.value = 1
  roomSelectVisible.value = true
  loadRooms()
}

// 选择租客
const handleTenantSelect = (row) => {
  if (row) {
    selectedTenant.value = row
    form.userId = row.id
    tenantSelectVisible.value = false
  }
}

// 选择房间
const handleRoomSelect = (row) => {
  if (row) {
    selectedRoom.value = row
    form.roomId = row.id
    // 自动填充月租金
    if (row.monthlyRent && !form.monthlyRent) {
      form.monthlyRent = row.monthlyRent
    }
    roomSelectVisible.value = false
  }
}

const handleAdd = () => {
  Object.assign(form, {
    userId: null, roomId: null, startDate: '', endDate: '',
    monthlyRent: null, deposit: null, paymentMethod: 1, remark: ''
  })
  selectedTenant.value = null
  selectedRoom.value = null
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await createContract(form)
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
  ElMessage.info('合同详情功能待完善')
}

const handleSubmitForReview = (row) => {
  ElMessageBox.confirm('确定要提交审核吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/contract/${row.id}/submit`,
      method: 'put'
    })
    ElMessage.success('已提交审核')
    loadData()
  })
}

const handleApprove = (row) => {
  ElMessageBox.confirm('审核通过后合同将生效，确定吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/contract/${row.id}/approve`,
      method: 'put'
    })
    ElMessage.success('审核通过，合同已生效')
    loadData()
  })
}

const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '审核驳回', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    await request({
      url: `/contract/${row.id}/reject`,
      method: 'put',
      params: { reason: value }
    })
    ElMessage.success('已驳回')
    loadData()
  })
}

const handleTerminate = (row) => {
  ElMessageBox.prompt('请输入终止原因', '终止合同', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    await terminateContract(row.id, value)
    ElMessage.success('合同已终止')
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
