<template>
  <div class="page-container">
    <div class="page-header">
      <h2>消息通知</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.type" placeholder="通知类型" clearable>
            <el-option label="账单" :value="1" />
            <el-option label="合同" :value="2" />
            <el-option label="工单" :value="3" />
            <el-option label="系统" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.isRead" placeholder="状态" clearable>
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-col>
        <el-col :span="14" style="text-align: right;">
          <el-button v-permission="'notification:create'" type="danger" @click="showAnnouncementDialog">发布公告</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleMarkAllAsRead">全部标记已读</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
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

    <!-- 发布公告弹窗 -->
    <el-dialog v-model="announcementDialogVisible" title="发布系统公告" width="500px">
      <el-form :model="announcementForm" :rules="announcementRules" ref="announcementFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="announcementForm.content" type="textarea" :rows="5" placeholder="请输入公告内容" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="announcementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePublishAnnouncement" :loading="announcementLoading">发布</el-button>
      </template>
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
  deleteNotification,
  publishAnnouncement
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

// 发布公告弹窗
const announcementDialogVisible = ref(false)
const announcementLoading = ref(false)
const announcementFormRef = ref(null)
const announcementForm = reactive({
  title: '',
  content: ''
})

const announcementRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

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

// 显示发布公告弹窗
const showAnnouncementDialog = () => {
  announcementForm.title = ''
  announcementForm.content = ''
  announcementDialogVisible.value = true
}

// 发布系统公告
const handlePublishAnnouncement = async () => {
  if (!announcementFormRef.value) return
  await announcementFormRef.value.validate(async (valid) => {
    if (valid) {
      announcementLoading.value = true
      try {
        await publishAnnouncement(announcementForm)
        ElMessage.success('公告已发布')
        announcementDialogVisible.value = false
        loadData()
      } finally {
        announcementLoading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.title-cell {
  .badge {
    :deep(.el-badge__content) {
      top: -2px;
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
</style>
