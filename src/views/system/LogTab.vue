<template>
  <div class="log-tab">
    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-input v-model="searchForm.module" placeholder="模块名称" clearable @change="() => loadData()" />
        </el-col>
        <el-col :span="5">
          <el-input v-model="searchForm.operation" placeholder="操作类型" clearable @change="() => loadData()" />
        </el-col>
        <el-col :span="5">
          <el-input v-model="searchForm.operatorName" placeholder="操作人" clearable @change="() => loadData()" />
        </el-col>
        <el-col :span="9" style="text-align: right;">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="operation" label="操作" width="120" />
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column prop="operatorIp" label="IP地址" width="140" />
        <el-table-column prop="requestMethod" label="请求方式" width="100" />
        <el-table-column prop="requestUrl" label="请求URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
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

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="700px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ currentDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="模块">{{ currentDetail.module }}</el-descriptions-item>
          <el-descriptions-item label="操作">{{ currentDetail.operation }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ currentDetail.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDetail.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentDetail.operatorIp || '-' }}</el-descriptions-item>
          <el-descriptions-item label="请求方式">{{ currentDetail.requestMethod }}</el-descriptions-item>
          <el-descriptions-item label="请求URL">{{ currentDetail.requestUrl }}</el-descriptions-item>
          <el-descriptions-item label="请求参数" :span="2">
            <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">{{ currentDetail.requestParams || '-' }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="响应结果" :span="2">
            <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">{{ currentDetail.responseResult || '-' }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === 1 ? 'success' : 'danger'">
              {{ currentDetail.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="错误信息" :span="2" v-if="currentDetail.errorMsg">
            <pre style="white-space: pre-wrap; word-break: break-all; margin: 0; color: #F56C6C;">{{ currentDetail.errorMsg }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const searchForm = reactive({
  module: '',
  operation: '',
  operatorName: ''
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

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/operation-log/list',
      method: 'get',
      params: {
        page: pagination.page,
        size: pagination.size,
        module: searchForm.module,
        operation: searchForm.operation,
        operatorName: searchForm.operatorName
      }
    })
    tableData.value = res.data.records
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载日志数据失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.module = ''
  searchForm.operation = ''
  searchForm.operatorName = ''
  pagination.page = 1
  loadData()
}

const handleDetail = async (row) => {
  try {
    const res = await request({
      url: `/operation-log/${row.id}`,
      method: 'get'
    })
    currentDetail.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取日志详情失败')
  }
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
.log-tab {
  .search-form {
    margin-bottom: 20px;
  }
}
</style>