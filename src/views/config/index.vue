<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <!-- 系统配置 -->
      <el-tab-pane label="系统配置" name="config">
        <div class="tab-content">
          <div style="margin-bottom: 20px;">
            <el-button type="primary" @click="handleConfigAdd">
              <el-icon><Plus /></el-icon> 新增配置
            </el-button>
          </div>

          <el-table :data="configData" v-loading="configLoading" border stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="configKey" label="配置键" width="200" />
            <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleConfigEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleConfigDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 字典配置 -->
      <el-tab-pane label="字典配置" name="dict">
        <div class="tab-content">
          <div style="margin-bottom: 20px;">
            <el-button type="primary" @click="handleDictAdd">
              <el-icon><Plus /></el-icon> 新增字典
            </el-button>
          </div>

          <el-table :data="dictData" v-loading="dictLoading" border stripe>
            <el-table-column prop="dictType" label="字典类型" width="150" />
            <el-table-column prop="dictCode" label="字典编码" width="120" />
            <el-table-column prop="dictName" label="字典名称" width="150" />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column prop="statusDesc" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.statusDesc }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleDictEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDictDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="log">
        <div class="tab-content">
          <el-table :data="logData" v-loading="logLoading" border stripe>
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
              :current-page="logPagination.page"
              :page-size="logPagination.size"
              :total="logPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleLogSizeChange"
              @current-change="handleLogCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 系统配置弹窗 -->
    <el-dialog v-model="configDialogVisible" :title="isConfigEdit ? '编辑配置' : '新增配置'" width="500px">
      <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="100px">
        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="configForm.configKey" placeholder="请输入配置键" :disabled="isConfigEdit" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="configForm.configValue" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="configForm.description" placeholder="请输入配置描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfigSubmit" :loading="configSubmitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典配置弹窗 -->
    <el-dialog v-model="dictDialogVisible" :title="isDictEdit ? '编辑字典' : '新增字典'" width="500px">
      <el-form :model="dictForm" :rules="dictRules" ref="dictFormRef" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="dictForm.dictType" placeholder="如：room_status" :disabled="isDictEdit" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="dictForm.dictCode" placeholder="如：0, 1, 2" :disabled="isDictEdit" />
        </el-form-item>
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="dictForm.dictName" placeholder="如：空置" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dictForm.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dictForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dictForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dictDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDictSubmit" :loading="dictSubmitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getDictList, createDict, updateDict, deleteDict } from '@/api/dict'

const activeTab = ref('config')

// 系统配置
const configLoading = ref(false)
const configSubmitLoading = ref(false)
const configData = ref([])
const configDialogVisible = ref(false)
const isConfigEdit = ref(false)
const configFormRef = ref(null)
const configForm = reactive({
  id: null,
  configKey: '',
  configValue: '',
  description: ''
})

const configRules = {
  configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
}

const loadConfigData = async () => {
  configLoading.value = true
  try {
    const res = await request({
      url: '/sys-config/list',
      method: 'get'
    })
    configData.value = res.data
  } finally {
    configLoading.value = false
  }
}

const handleConfigAdd = () => {
  isConfigEdit.value = false
  configForm.id = null
  Object.assign(configForm, { configKey: '', configValue: '', description: '' })
  configDialogVisible.value = true
}

const handleConfigEdit = (row) => {
  isConfigEdit.value = true
  configForm.id = row.id
  Object.assign(configForm, {
    configKey: row.configKey,
    configValue: row.configValue,
    description: row.description
  })
  configDialogVisible.value = true
}

const handleConfigSubmit = async () => {
  if (!configFormRef.value) return
  await configFormRef.value.validate(async (valid) => {
    if (valid) {
      configSubmitLoading.value = true
      try {
        await request({
          url: '/sys-config',
          method: 'post',
          data: configForm
        })
        ElMessage.success(isConfigEdit.value ? '更新成功' : '创建成功')
        configDialogVisible.value = false
        loadConfigData()
      } finally {
        configSubmitLoading.value = false
      }
    }
  })
}

const handleConfigDelete = (row) => {
  ElMessageBox.confirm('确定要删除该配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/sys-config/${row.id}`,
      method: 'delete'
    })
    ElMessage.success('删除成功')
    loadConfigData()
  })
}

// 字典配置
const dictLoading = ref(false)
const dictSubmitLoading = ref(false)
const dictData = ref([])
const dictDialogVisible = ref(false)
const isDictEdit = ref(false)
const dictFormRef = ref(null)
const dictForm = reactive({
  id: null,
  dictType: '',
  dictCode: '',
  dictName: '',
  sortOrder: 0,
  status: 1,
  remark: ''
})

const dictRules = {
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  dictCode: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }]
}

const loadDictData = async () => {
  dictLoading.value = true
  try {
    const res = await getDictList({ page: 1, size: 1000 })
    dictData.value = res.data.records
  } finally {
    dictLoading.value = false
  }
}

const handleDictAdd = () => {
  isDictEdit.value = false
  dictForm.id = null
  Object.assign(dictForm, {
    dictType: '',
    dictCode: '',
    dictName: '',
    sortOrder: 0,
    status: 1,
    remark: ''
  })
  dictDialogVisible.value = true
}

const handleDictEdit = (row) => {
  isDictEdit.value = true
  dictForm.id = row.id
  Object.assign(dictForm, {
    dictType: row.dictType,
    dictCode: row.dictCode,
    dictName: row.dictName,
    sortOrder: row.sortOrder,
    status: row.status,
    remark: row.remark || ''
  })
  dictDialogVisible.value = true
}

const handleDictSubmit = async () => {
  if (!dictFormRef.value) return
  await dictFormRef.value.validate(async (valid) => {
    if (valid) {
      dictSubmitLoading.value = true
      try {
        if (isDictEdit.value) {
          await updateDict(dictForm.id, dictForm)
          ElMessage.success('更新成功')
        } else {
          await createDict(dictForm)
          ElMessage.success('创建成功')
        }
        dictDialogVisible.value = false
        loadDictData()
      } finally {
        dictSubmitLoading.value = false
      }
    }
  })
}

const handleDictDelete = (row) => {
  ElMessageBox.confirm('确定删除该字典吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDict(row.id)
      ElMessage.success('删除成功')
      loadDictData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 操作日志
const logLoading = ref(false)
const logData = ref([])
const logPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loadLogData = async () => {
  logLoading.value = true
  try {
    const res = await request({
      url: '/operation-log/list',
      method: 'get',
      params: {
        page: logPagination.page,
        size: logPagination.size
      }
    })
    logData.value = res.data.records.map(item => ({
      ...item,
      statusDesc: item.status === 1 ? '成功' : '失败'
    }))
    logPagination.total = res.data.total
  } finally {
    logLoading.value = false
  }
}

const handleLogSizeChange = (size) => {
  logPagination.size = size
  loadLogData()
}

const handleLogCurrentChange = (page) => {
  logPagination.page = page
  loadLogData()
}

onMounted(() => {
  loadConfigData()
  loadDictData()
  loadLogData()
})
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}
</style>
