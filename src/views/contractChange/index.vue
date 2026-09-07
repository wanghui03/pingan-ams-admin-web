<template>
  <div class="page-container">
    <div class="page-header">
      <h2>合同变更</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select
            v-model="searchForm.changeType"
            placeholder="变更类型"
            clearable
          >
            <el-option label="续约" :value="1" />
            <el-option label="转租" :value="2" />
            <el-option label="提前退租" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
            <el-option label="已执行" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="14">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="showCreateDialog">新建变更申请</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="changeNo" label="变更单号" width="180" />
        <el-table-column prop="contractNo" label="合同编号" width="180" />
        <el-table-column prop="changeTypeDesc" label="变更类型" width="100" />
        <el-table-column prop="statusDesc" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              row.statusDesc
            }}</el-tag>
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
              >通过</el-button
            >
            <el-button
              v-if="row.status === 0"
              size="small"
              type="danger"
              @click="handleApprove(row, false)"
              >驳回</el-button
            >
            <el-button
              v-if="row.status === 1"
              size="small"
              type="primary"
              @click="handleExecute(row)"
              >执行</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
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
      </div>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailVisible" title="变更申请详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="变更单号">{{
          currentRow.changeNo
        }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{
          currentRow.contractNo
        }}</el-descriptions-item>
        <el-descriptions-item label="变更类型">{{
          currentRow.changeTypeDesc
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{
          currentRow.statusDesc
        }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{
          currentRow.applicantName
        }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{
          currentRow.createTime
        }}</el-descriptions-item>

        <!-- 续约信息 -->
        <template v-if="currentRow.changeType === 1">
          <el-descriptions-item label="新开始日期">{{
            currentRow.newStartDate
          }}</el-descriptions-item>
          <el-descriptions-item label="新结束日期">{{
            currentRow.newEndDate
          }}</el-descriptions-item>
          <el-descriptions-item
            label="新月租金"
            v-if="currentRow.newMonthlyRent"
          >
            {{ currentRow.newMonthlyRent }} 元
          </el-descriptions-item>
        </template>

        <!-- 转租信息 -->
        <template v-if="currentRow.changeType === 2">
          <el-descriptions-item label="新租客">{{
            currentRow.newUserName
          }}</el-descriptions-item>
          <el-descriptions-item
            label="转租手续费"
            v-if="currentRow.transferFee"
          >
            {{ currentRow.transferFee }} 元
          </el-descriptions-item>
        </template>

        <!-- 提前退租信息 -->
        <template v-if="currentRow.changeType === 3">
          <el-descriptions-item label="退租日期">{{
            currentRow.terminateDate
          }}</el-descriptions-item>
          <el-descriptions-item label="违约金" v-if="currentRow.penaltyAmount">
            {{ currentRow.penaltyAmount }} 元
          </el-descriptions-item>
          <el-descriptions-item
            label="押金退还"
            v-if="currentRow.depositRefund"
          >
            {{ currentRow.depositRefund }} 元
          </el-descriptions-item>
        </template>

        <el-descriptions-item label="变更原因" :span="2">{{
          currentRow.reason
        }}</el-descriptions-item>

        <template v-if="currentRow.approverName">
          <el-descriptions-item label="审批人">{{
            currentRow.approverName
          }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{
            currentRow.approveTime
          }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">{{
            currentRow.approveRemark
          }}</el-descriptions-item>
        </template>
      </el-descriptions>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog
      v-model="approveVisible"
      :title="approveForm.approved ? '通过申请' : '驳回申请'"
      width="500px"
    >
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
          {{ approveForm.approved ? "确认通过" : "确认驳回" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 新建变更申请弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建合同变更申请"
      width="700px"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-form-item label="合同" prop="contractId">
          <div class="select-display">
            <span v-if="createForm.contractNo">{{ createForm.contractNo }}</span>
            <span v-else class="placeholder">请选择合同</span>
            <el-button type="primary" size="small" @click="showContractSelect">选择</el-button>
            <el-button v-if="createForm.contractNo" size="small" @click="createForm.contractId = null; createForm.contractNo = ''">清除</el-button>
          </div>
        </el-form-item>

        <el-form-item label="变更类型" prop="changeType">
          <el-select v-model="createForm.changeType" placeholder="请选择变更类型" style="width: 100%">
            <el-option label="续约" :value="1" />
            <el-option label="转租" :value="2" />
            <el-option label="提前退租" :value="3" />
          </el-select>
        </el-form-item>

        <!-- 续约字段 -->
        <template v-if="createForm.changeType === 1">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="新开始日期" prop="newStartDate">
                <el-date-picker
                  v-model="createForm.newStartDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="新结束日期" prop="newEndDate">
                <el-date-picker
                  v-model="createForm.newEndDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="新月租金">
            <el-input-number
              v-model="createForm.newMonthlyRent"
              :min="0"
              :precision="2"
              placeholder="不填则保持不变"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 转租字段 -->
        <template v-if="createForm.changeType === 2">
          <el-form-item label="新租客" prop="newUserId">
            <div class="select-display">
              <span v-if="createForm.newUserName">{{ createForm.newUserName }}</span>
              <span v-else class="placeholder">请选择新租客</span>
              <el-button type="primary" size="small" @click="showTenantSelect">选择</el-button>
              <el-button v-if="createForm.newUserName" size="small" @click="createForm.newUserId = null; createForm.newUserName = ''">清除</el-button>
            </div>
          </el-form-item>
          <el-form-item label="转租手续费">
            <el-input-number
              v-model="createForm.transferFee"
              :min="0"
              :precision="2"
              placeholder="可选"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 提前退租字段 -->
        <template v-if="createForm.changeType === 3">
          <el-form-item label="退租日期" prop="terminateDate">
            <el-date-picker
              v-model="createForm.terminateDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择退租日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="违约金">
                <el-input-number
                  v-model="createForm.penaltyAmount"
                  :min="0"
                  :precision="2"
                  placeholder="可选"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="押金退还">
                <el-input-number
                  v-model="createForm.depositRefund"
                  :min="0"
                  :precision="2"
                  placeholder="可选"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="createForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入变更原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate" :loading="createLoading">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 合同选择弹窗 -->
    <el-dialog v-model="contractSelectVisible" title="选择合同（仅显示生效中的合同）" width="800px" append-to-body>
      <el-row :gutter="10" style="margin-bottom: 15px">
        <el-col :span="8">
          <el-input v-model="contractSearch.keyword" placeholder="搜索合同编号" clearable @keyup.enter="loadContracts" />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="loadContracts">搜索</el-button>
        </el-col>
      </el-row>
      <el-table :data="contractList" v-loading="contractLoading" border stripe highlight-current-row @current-change="handleContractSelect" style="width: 100%">
        <el-table-column prop="contractNo" label="合同编号" width="180" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="buildingName" label="楼栋" width="100" />
        <el-table-column prop="roomNo" label="房间" width="80" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="monthlyRent" label="月租金(元)" width="110" />
      </el-table>
      <div style="margin-top: 15px; display: flex; justify-content: flex-end">
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

    <!-- 租客选择弹窗（转租用） -->
    <el-dialog v-model="tenantSelectVisible" title="选择新租客" width="700px" append-to-body>
      <el-row :gutter="10" style="margin-bottom: 15px">
        <el-col :span="16">
          <el-input v-model="tenantSearch.keyword" placeholder="搜索姓名/手机号" clearable @keyup.enter="loadTenants" />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="loadTenants">搜索</el-button>
        </el-col>
      </el-row>
      <el-table :data="tenantList" v-loading="tenantLoading" border stripe highlight-current-row @current-change="handleTenantSelect" style="width: 100%">
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
      <div style="margin-top: 15px; display: flex; justify-content: flex-end">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getContractChangeList,
  getContractChangeDetail,
  approveContractChange,
  executeContractChange,
  createContractChange
} from '@/api/contractChange'
import request from '@/utils/request'

const route = useRoute()

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

// 新建变更申请弹窗
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)
const createForm = reactive({
  contractId: null,
  contractNo: '',
  changeType: null,
  reason: '',
  // 续约字段
  newStartDate: '',
  newEndDate: '',
  newMonthlyRent: null,
  // 转租字段
  newUserId: null,
  newUserName: '',
  transferFee: null,
  // 提前退租字段
  terminateDate: '',
  penaltyAmount: null,
  depositRefund: null
})

const createRules = {
  contractId: [{ required: true, message: '请选择合同', trigger: 'change' }],
  changeType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入变更原因', trigger: 'blur' }]
}

// 合同选择弹窗
const contractSelectVisible = ref(false)
const contractLoading = ref(false)
const contractList = ref([])
const contractPage = ref(1)
const contractSize = ref(10)
const contractTotal = ref(0)
const contractSearch = reactive({ keyword: '' })

// 租客选择弹窗（转租用）
const tenantSelectVisible = ref(false)
const tenantLoading = ref(false)
const tenantList = ref([])
const tenantPage = ref(1)
const tenantSize = ref(10)
const tenantTotal = ref(0)
const tenantSearch = reactive({ keyword: '' })

// 获取状态标签类型
const getStatusType = (status) => {
  const map = { 0: "warning", 1: "success", 2: "danger", 3: "info" };
  return map[status] || "info";
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getContractChangeList({
      page: pagination.page,
      size: pagination.size,
      changeType: searchForm.changeType,
      status: searchForm.status,
    });
    tableData.value = res.data.records;
    pagination.total = res.data.total;
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.changeType = null;
  searchForm.status = null;
  handleSearch();
};

// 查看详情
const handleView = (row) => {
  currentRow.value = row;
  detailVisible.value = true;
};

// 审批
const handleApprove = (row, approved) => {
  approveForm.changeId = row.id;
  approveForm.approved = approved;
  approveForm.remark = "";
  approveVisible.value = true;
};

// 提交审批
const submitApprove = async () => {
  approveLoading.value = true;
  try {
    await approveContractChange(
      approveForm.changeId,
      approveForm.approved,
      approveForm.remark,
    );
    ElMessage.success(approveForm.approved ? "已通过" : "已驳回");
    approveVisible.value = false;
    loadData();
  } catch (error) {
    ElMessage.error("操作失败");
  } finally {
    approveLoading.value = false;
  }
};

// 执行变更
const handleExecute = (row) => {
  ElMessageBox.confirm("确认执行该变更申请？执行后将修改原合同信息。", "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        await executeContractChange(row.id);
        ElMessage.success("执行成功");
        loadData();
      } catch (error) {
        ElMessage.error("执行失败");
      }
    })
    .catch(() => {});
};

// 分页
const handleSizeChange = (size) => {
  pagination.size = size;
  loadData();
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  loadData();
};

onMounted(() => {
  loadData()
  // 检查是否有从合同页面传递的参数
  if (route.query.contractId) {
    showCreateDialog()
    // 自动加载合同信息
    loadContractDetail(route.query.contractId)
  }
})

// 加载合同详情
const loadContractDetail = async (contractId) => {
  try {
    const res = await request({
      url: `/contract/${contractId}`,
      method: 'get'
    })
    if (res.data) {
      createForm.contractId = res.data.id
      createForm.contractNo = res.data.contractNo
    }
  } catch (error) {
    console.error('加载合同详情失败', error)
  }
}

// 显示新建变更申请弹窗
const showCreateDialog = () => {
  // 重置表单
  Object.assign(createForm, {
    contractId: route.query.contractId || null,
    contractNo: route.query.contractNo || '',
    changeType: null,
    reason: '',
    newStartDate: '',
    newEndDate: '',
    newMonthlyRent: null,
    newUserId: null,
    newUserName: '',
    transferFee: null,
    terminateDate: '',
    penaltyAmount: null,
    depositRefund: null
  })
  createDialogVisible.value = true
}

// 显示合同选择弹窗
const showContractSelect = () => {
  contractSearch.keyword = ''
  contractPage.value = 1
  contractSelectVisible.value = true
  loadContracts()
}

// 加载合同列表（仅生效中的合同）
const loadContracts = async () => {
  contractLoading.value = true
  try {
    const res = await request({
      url: '/contract/list',
      method: 'get',
      params: {
        page: contractPage.value,
        size: contractSize.value,
        status: 2, // 只查询生效中的合同
        keyword: contractSearch.keyword
      }
    })
    contractList.value = res.data.records
    contractTotal.value = Number(res.data.total)
  } finally {
    contractLoading.value = false
  }
}

// 选择合同
const handleContractSelect = (row) => {
  if (row) {
    createForm.contractId = row.id
    createForm.contractNo = row.contractNo
    contractSelectVisible.value = false
  }
}

// 显示租客选择弹窗（转租用）
const showTenantSelect = () => {
  tenantSearch.keyword = ''
  tenantPage.value = 1
  tenantSelectVisible.value = true
  loadTenants()
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

// 选择租客
const handleTenantSelect = (row) => {
  if (row) {
    createForm.newUserId = row.id
    createForm.newUserName = `${row.realName} (${row.phone})`
    tenantSelectVisible.value = false
  }
}

// 提交新建变更申请
const submitCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      createLoading.value = true
      try {
        await createContractChange(createForm)
        ElMessage.success('变更申请创建成功')
        createDialogVisible.value = false
        loadData()
      } finally {
        createLoading.value = false
      }
    }
  })
}
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
