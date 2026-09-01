<template>
  <div class="notification-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="通知类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="账单" :value="1" />
            <el-option label="合同" :value="2" />
            <el-option label="工单" :value="3" />
            <el-option label="系统" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.isRead" placeholder="请选择" clearable>
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleMarkAllAsRead">全部标记已读</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="title" label="标题" width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <el-badge v-if="!row.isRead" is-dot class="badge">
                <span>{{ row.title }}</span>
              </el-badge>
              <span v-else>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="typeDesc" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.typeDesc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="isRead" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'info' : 'danger'">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="!row.isRead" 
              size="small" 
              type="primary" 
              @click="handleMarkAsRead(row)"
            >标记已读</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 通知详情弹窗 -->
    <el-dialog v-model="detailVisible" title="通知详情" width="600px">
      <div class="notification-detail">
        <h3>{{ currentNotification.title }}</h3>
        <div class="meta">
          <el-tag :type="getTypeTagType(currentNotification.type)" size="small">
            {{ currentNotification.typeDesc }}
          </el-tag>
          <span class="time">{{ currentNotification.createTime }}</span>
        </div>
        <div class="content">{{ currentNotification.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getNotificationList, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '@/api/notification'

// 搜索表单
const searchForm = reactive({
  type: null,
  isRead: null
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
const currentNotification = ref({})

// 获取类型标签类型
const getTypeTagType = (type) => {
  const map = { 1: 'warning', 2: 'primary', 3: 'success', 4: 'info' }
  return map[type] || 'info'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getNotificationList({
      page: pagination.page,
      size: pagination.size,
      type: searchForm.type,
      isRead: searchForm.isRead
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
  searchForm.type = null
  searchForm.isRead = null
  handleSearch()
}

// 标记已读
const handleMarkAsRead = async (row) => {
  try {
    await markNotificationAsRead(row.id)
    ElMessage.success('已标记为已读')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 全部标记已读
const handleMarkAllAsRead = () => {
  ElMessageBox.confirm('确认将所有通知标记为已读？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await markAllNotificationsAsRead()
      ElMessage.success('已全部标记为已读')
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// 删除通知
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该通知？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNotification(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
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
.notification-container {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .title-cell {
      .badge {
        :deep(.el-badge__content) {
          top: -2px;
        }
      }
    }
  }

  .notification-detail {
    h3 {
      margin-bottom: 12px;
      font-size: 18px;
      color: #303133;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .time {
        color: #909399;
        font-size: 14px;
      }
    }

    .content {
      line-height: 1.6;
      color: #606266;
      white-space: pre-wrap;
    }
  }
}
</style>
