<template>
  <div class="page-container">
    <div class="page-header">
      <h2>操作日志</h2>
    </div>

    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-input v-model="searchForm.username" placeholder="用户名" clearable />
        </el-col>
        <el-col :span="5">
          <el-input v-model="searchForm.module" placeholder="操作模块" clearable />
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="操作状态" clearable>
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="5" style="text-align: right;">
          <el-button type="danger" @click="handleClear">
            <el-icon><Delete /></el-icon> 清空日志
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="operation" label="操作" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="80" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="statusDesc" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="耗时(ms)" width="100" />
        <el-table-column prop="operateTime" label="操作时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentLog.username }}</el-descriptions-item>
        <el-descriptions-item label="租户">{{ currentLog.tenantName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ currentLog.operation }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="currentLog.status === 1 ? 'success' : 'danger'" size="small">{{ currentLog.statusDesc }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentLog.costTime }} ms</el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">{{ currentLog.operateTime }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <div class="params-content">{{ currentLog.params || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <div class="params-content">{{ currentLog.result || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog.errorMsg" label="错误信息" :span="2">
          <div class="error-content">{{ currentLog.errorMsg }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({
  username: '',
  module: '',
  status: null
})

const detailVisible = ref(false)
const currentLog = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/operation-log/list',
      method: 'get',
      params: {
        page: page.value,
        size: size.value,
        username: searchForm.username || undefined,
        module: searchForm.module || undefined,
        status: searchForm.status
      }
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.module = ''
  searchForm.status = null
  page.value = 1
  loadData()
}

const handleDetail = (row) => {
  currentLog.value = row
  detailVisible.value = true
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有操作日志吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: '/operation-log/clear',
      method: 'delete'
    })
    ElMessage.success('日志已清空')
    loadData()
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.params-content {
  max-height: 200px;
  overflow-y: auto;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.error-content {
  color: #f56c6c;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  background: #fef0f0;
  padding: 10px;
  border-radius: 4px;
}
</style>
