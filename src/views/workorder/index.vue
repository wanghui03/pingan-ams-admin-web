<template>
  <div class="page-container">
    <div class="page-header">
      <h2>工单管理</h2>
    </div>

    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="工单状态" clearable>
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已关闭" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.orderType" placeholder="工单类型" clearable>
            <el-option label="报修" :value="1" />
            <el-option label="投诉" :value="2" />
            <el-option label="咨询" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="orderNo" label="工单编号" width="180" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="roomNo" label="房间" width="80" />
        <el-table-column prop="orderTypeDesc" label="类型" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.statusDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handlerName" label="处理人" width="100" />
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            <span v-if="row.rating">{{ row.rating }}分</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="primary"
              @click="handleAssign(row)"
            >分配</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              @click="handleComplete(row)"
            >完成</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWorkOrderList, assignWorkOrder, handleWorkOrder } from '@/api/workorder'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const searchForm = reactive({ status: null, orderType: null })

const statusTagType = (status) => {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWorkOrderList({
      page: page.value,
      size: size.value,
      status: searchForm.status,
      orderType: searchForm.orderType
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.status = null
  searchForm.orderType = null
  loadData()
}

const handleDetail = (row) => {
  ElMessage.info('工单详情功能待完善')
}

const handleAssign = (row) => {
  ElMessageBox.prompt('请输入处理人ID', '分配工单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    await assignWorkOrder(row.id, value)
    ElMessage.success('分配成功')
    loadData()
  })
}

const handleComplete = (row) => {
  ElMessageBox.prompt('请输入处理结果', '完成工单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    await handleWorkOrder(row.id, value, '')
    ElMessage.success('工单已完成')
    loadData()
  })
}

onMounted(() => {
  loadData()
})
</script>
