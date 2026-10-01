<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 房源概览 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><House /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalRooms }}</div>
            <div class="stat-label">总房间数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.vacantRooms }}</div>
            <div class="stat-label">空置房间</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.occupancyRate }}%</div>
            <div class="stat-label">入住率</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #F56C6C;">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeContracts }}</div>
            <div class="stat-label">生效中合同</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 租金收入 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>租金收入</span>
              <el-tag type="success">本月</el-tag>
            </div>
          </template>
          <div class="income-stats">
            <div class="income-item">
              <span class="label">应收租金</span>
              <span class="value">¥{{ stats.monthlyReceivable }}</span>
            </div>
            <div class="income-item">
              <span class="label">实收租金</span>
              <span class="value">¥{{ stats.monthlyReceived }}</span>
            </div>
            <div class="income-item">
              <span class="label">收缴率</span>
              <span class="value rate">{{ stats.collectionRate }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 账单统计 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>账单统计</span>
              <el-tag type="warning">实时</el-tag>
            </div>
          </template>
          <el-table :data="billStats" :show-header="false" border>
            <el-table-column prop="label" label="类型" />
            <el-table-column prop="value" label="数量" align="right" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 待办事项 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-badge :value="todos.total" type="danger" />
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in todos.items"
              :key="item.id"
              :type="item.type"
              :timestamp="item.time"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 最近合同 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近合同</span>
              <el-link type="primary" :underline="'hover'">查看全部</el-link>
            </div>
          </template>
          <el-table :data="recentContracts" size="small" :show-header="true">
            <el-table-column prop="contractNo" label="合同编号" />
            <el-table-column prop="roomNo" label="房间" />
            <el-table-column prop="tenantName" label="租客" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 1 ? 'success' : 'warning'">
                  {{ row.statusDesc }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getDashboardStats } from '@/api/dashboard'

const stats = reactive({
  totalRooms: 0,
  vacantRooms: 0,
  occupancyRate: 0,
  activeContracts: 0,
  monthlyReceivable: 0,
  monthlyReceived: 0,
  collectionRate: 0
})

const billStats = ref([
  { label: '待支付账单', value: 0 },
  { label: '逾期账单', value: 0 },
  { label: '本月已收', value: 0 }
])

const todos = reactive({
  total: 0,
  items: []
})

const recentContracts = ref([])

const loadDashboardData = async () => {
  try {
    const res = await getDashboardStats()
    const data = res.data || res || {}

    console.log('Dashboard response:', res)
    console.log('Dashboard data:', data)

    // 房源概览数据
    stats.totalRooms = Number(data.roomCount || 0)
    stats.vacantRooms = Number(data.vacantRoomCount || 0)
    // 入住率是字符串如 "85%"，需要解析
    const rateStr = String(data.occupancyRate || '0%')
    stats.occupancyRate = parseFloat(rateStr) || 0
    stats.activeContracts = Number(data.activeContractCount || 0)

    // 租金收入数据（未收/已收）
    stats.monthlyReceivable = Number(data.unpaidAmount || 0)
    stats.monthlyReceived = Number(data.paidAmount || 0)
    // 收缴率
    const collectionRateStr = String(data.collectionRate || '0%')
    stats.collectionRate = parseFloat(collectionRateStr) || 0

    // 账单统计
    billStats.value = [
      { label: '待支付账单', value: Number(data.unpaidBillCount || 0) },
      { label: '逾期账单', value: Number(data.overdueBillCount || 0) },
      { label: '本月已收', value: Number(data.paidAmount || 0) }
    ]

    // 待办事项
    if (data.todoItems && Array.isArray(data.todoItems)) {
      todos.total = data.todoItems.length
      todos.items = data.todoItems.map((item, index) => ({
        id: index,
        type: item.type || 'info',
        content: item.content,
        time: item.time
      }))
    } else {
      todos.total = 0
      todos.items = []
    }

    // 最近合同
    if (data.recentContracts && Array.isArray(data.recentContracts)) {
      recentContracts.value = data.recentContracts
    } else {
      recentContracts.value = []
    }
  } catch (error) {
    console.error('加载看板数据失败', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
}

.stat-card {
  height: 140px;
  overflow: visible;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 20px;
    overflow: visible;
  }

  .stat-icon {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 36px;
      color: white;
    }
  }

  .stat-content {
    flex: 1;
    padding-left: 20px;
    min-width: 0;

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      white-space: nowrap;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.income-stats {
  .income-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #606266;
    }

    .value {
      font-weight: bold;
      color: #303133;

      &.rate {
        color: #67C23A;
      }
    }
  }
}
</style>
