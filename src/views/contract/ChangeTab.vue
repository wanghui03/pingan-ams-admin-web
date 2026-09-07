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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="primary"
              @click="handleAudit(row)"
            >审核</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'


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

const statusTagType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger' }
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

const handleDetail = (row) => {
  ElMessage.info('变更详情功能开发中...')
}

const handleAudit = (row) => {
  ElMessage.info('审核功能开发中...')
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