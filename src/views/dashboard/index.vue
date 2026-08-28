<template>
  <div class="dashboard-container page-container">
    <div class="page-header">
      <h2>首页</h2>
    </div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon :size="30"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.buildingCount || 0 }}</p>
              <p class="stat-label">楼栋总数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon :size="30"><House /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.roomCount || 0 }}</p>
              <p class="stat-label">房间总数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon :size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.contractCount || 0 }}</p>
              <p class="stat-label">合同总数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">¥{{ stats.unpaidAmount || 0 }}</p>
              <p class="stat-label">待收金额</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="$router.push('/building')">
            <el-icon><Plus /></el-icon>
            新增楼栋
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="$router.push('/room')">
            <el-icon><Plus /></el-icon>
            新增房间
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="$router.push('/contract')">
            <el-icon><Plus /></el-icon>
            新增合同
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" @click="$router.push('/workorder')">
            <el-icon><Tickets /></el-icon>
            工单管理
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  buildingCount: 0,
  roomCount: 0,
  contractCount: 0,
  unpaidAmount: 0
})

onMounted(() => {
  // TODO: 加载统计数据
})
</script>

<style scoped lang="scss">
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  
  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.quick-actions {
  .el-button {
    width: 100%;
  }
}
</style>
