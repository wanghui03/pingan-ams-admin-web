<template>
  <div class="log-tab">
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="100" />
      <el-table-column prop="module" label="模块" width="100" />
      <el-table-column prop="operation" label="操作" width="100" />
      <el-table-column prop="method" label="请求方法" min-width="150" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP 地址" width="120" />
      <el-table-column prop="statusDesc" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.statusDesc }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作时间" width="160" />
    </el-table>

    <!-- 分页 -->
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/operation-log/list',
      method: 'get',
      params: {
        page: pagination.page,
        size: pagination.size
      }
    })
    tableData.value = res.data.records.map(item => ({
      ...item,
      statusDesc: item.status === 1 ? '成功' : '失败'
    }))
    pagination.total = res.data.total
  } finally {
    loading.value = false
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
  min-height: 400px;
}
</style>