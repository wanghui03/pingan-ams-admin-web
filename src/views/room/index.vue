<template>
  <div class="page-container">
    <div class="page-header">
      <h2>房间管理</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-form">
      <el-row :gutter="20" align="middle">
        <el-col :span="5">
          <el-select v-model="searchForm.status" placeholder="房源状态" clearable>
            <el-option label="空置" :value="0" />
            <el-option label="已预订" :value="1" />
            <el-option label="已入住" :value="2" />
            <el-option label="维修中" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="searchForm.roomType" placeholder="房源类型" clearable>
            <el-option label="商品房" :value="1" />
            <el-option label="拆迁房" :value="2" />
            <el-option label="自建房" :value="3" />
            <el-option label="公寓" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="10" style="text-align: right;">
          <el-button v-permission="'room:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增房间
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roomNo" label="房间号" width="100" />
        <el-table-column prop="roomTypeDesc" label="房源类型" width="100" />
        <el-table-column prop="layout" label="户型" width="100" />
        <el-table-column prop="area" label="面积(㎡)" width="90" />
        <el-table-column prop="monthlyRent" label="月租金(元)" width="110" />
        <el-table-column prop="statusDesc" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'room:edit'" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm v-permission="'room:delete'" title="确定删除吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑房间' : '新增房间'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="楼栋" prop="buildingId">
              <el-select v-model="form.buildingId" placeholder="选择楼栋" style="width: 100%;">
                <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间号" prop="roomNo">
              <el-input v-model="form.roomNo" placeholder="如：301" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="楼层" prop="floor">
              <el-input-number v-model="form.floor" :min="1" :max="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源类型" prop="roomType">
              <el-select v-model="form.roomType" placeholder="选择类型" style="width: 100%;">
                <el-option label="商品房" value="COMMERCIAL" />
                <el-option label="拆迁房" value="RESETTLEMENT" />
                <el-option label="自建房" value="SELF_BUILT" />
                <el-option label="公寓" value="APARTMENT" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="面积(㎡)">
              <el-input-number v-model="form.area" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="户型">
              <el-input v-model="form.layout" placeholder="如：一室一厅" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="月租金(元)" prop="monthlyRent">
              <el-input-number v-model="form.monthlyRent" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金(元)">
              <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="水费单价(元/吨)">
              <el-input-number v-model="form.waterPrice" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电费单价(元/度)">
              <el-input-number v-model="form.electricityPrice" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="朝向">
          <el-select v-model="form.orientation" placeholder="选择朝向" style="width: 100%;">
            <el-option label="东" value="东" />
            <el-option label="南" value="南" />
            <el-option label="西" value="西" />
            <el-option label="北" value="北" />
            <el-option label="东南" value="东南" />
            <el-option label="东北" value="东北" />
            <el-option label="西南" value="西南" />
            <el-option label="西北" value="西北" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRoomList, createRoom, updateRoom, deleteRoom } from '@/api/room'
import { getAllBuildings } from '@/api/building'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const buildings = ref([])

const searchForm = reactive({ status: null, roomType: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editId = ref(null)

const form = reactive({
  buildingId: null,
  roomNo: '',
  floor: 1,
  roomType: '',
  area: null,
  layout: '',
  monthlyRent: null,
  deposit: null,
  waterPrice: null,
  electricityPrice: null,
  orientation: '',
  address: '',
  description: ''
})

const rules = {
  buildingId: [{ required: true, message: '请选择楼栋', trigger: 'change' }],
  roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  roomType: [{ required: true, message: '请选择房源类型', trigger: 'change' }],
  monthlyRent: [{ required: true, message: '请输入月租金', trigger: 'blur' }]
}

const statusTagType = (status) => {
  const map = { 0: 'success', 1: 'warning', 2: 'primary', 3: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoomList({
      page: page.value,
      size: size.value,
      status: searchForm.status,
      roomType: searchForm.roomType
    })
    tableData.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

const loadBuildings = async () => {
  const res = await getAllBuildings()
  buildings.value = res.data
}

const resetSearch = () => {
  searchForm.status = null
  searchForm.roomType = null
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, {
    buildingId: null, roomNo: '', floor: 1, roomType: '',
    area: null, layout: '', monthlyRent: null, deposit: null,
    waterPrice: null, electricityPrice: null,
    orientation: '', address: '', description: ''
  })
  loadBuildings()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    buildingId: row.buildingId,
    roomNo: row.roomNo,
    floor: row.floor,
    roomType: row.roomType,
    area: row.area,
    layout: row.layout,
    monthlyRent: row.monthlyRent,
    deposit: row.deposit,
    waterPrice: row.waterPrice,
    electricityPrice: row.electricityPrice,
    orientation: row.orientation,
    address: row.address,
    description: row.description
  })
  loadBuildings()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateRoom(editId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createRoom(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = async (id) => {
  await deleteRoom(id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
