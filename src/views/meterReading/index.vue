<template>
    <div class="page-container">
        <!-- 搜索栏 -->
        <el-card class="search-form">
            <el-row :gutter="20" align="middle">
                <el-col :span="5">
                    <el-select v-model="searchForm.roomId" placeholder="选择房间" clearable filterable>
                        <el-option v-for="room in roomList" :key="room.id" :label="`${room.buildingName}${room.roomNo}`" :value="room.id" />
                    </el-select>
                </el-col>
                <el-col :span="5">
                    <el-select v-model="searchForm.meterType" placeholder="抄表类型" clearable>
                        <el-option label="水表" :value="1" />
                        <el-option label="电表" :value="2" />
                    </el-select>
                </el-col>
                <el-col :span="5">
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-col>
                <el-col :span="9" style="text-align: right">
                    <el-button type="primary" @click="showAddDialog">
                        <el-icon><Plus /></el-icon>
                        新增抄表
                    </el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 数据表格 -->
        <el-card>
            <el-table :data="tableData" v-loading="loading" border stripe>
                <el-table-column prop="buildingName" label="楼栋" width="120" />
                <el-table-column prop="roomNo" label="房间号" width="100" />
                <el-table-column prop="meterTypeDesc" label="类型" width="80">
                    <template #default="{ row }">
                        <el-tag :type="row.meterType === 1 ? 'primary' : 'warning'">
                            {{ row.meterTypeDesc }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="previousReading" label="上次读数" width="120" align="right" />
                <el-table-column prop="currentReading" label="本次读数" width="120" align="right" />
                <el-table-column prop="meterUsage" label="用量" width="100" align="right">
                    <template #default="{ row }">{{ row.meterUsage }} {{ row.meterType === 1 ? '吨' : '度' }}</template>
                </el-table-column>
                <el-table-column prop="unitPrice" label="单价" width="100" align="right">
                    <template #default="{ row }">¥{{ row.unitPrice }}/{{ row.meterType === 1 ? '吨' : '度' }}</template>
                </el-table-column>
                <el-table-column prop="amount" label="费用" width="120" align="right">
                    <template #default="{ row }">
                        <span class="amount">¥{{ row.amount }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="readingDate" label="抄表日期" width="120" />
                <el-table-column prop="billGenerated" label="账单状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.billGenerated ? 'success' : 'info'">
                            {{ row.billGenerated ? '已生成' : '未生成' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="{ row }">
                        <el-button v-if="!row.billGenerated" size="small" type="primary" @click="handleGenerateBill(row)">生成账单</el-button>
                        <el-button size="small" @click="handleDetail(row)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
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

        <!-- 新增抄表弹窗 -->
        <el-dialog v-model="addDialogVisible" title="新增抄表" width="500px">
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
                <el-form-item label="房间" prop="roomId">
                    <el-select v-model="addForm.roomId" placeholder="选择房间" filterable style="width: 100%">
                        <el-option v-for="room in roomList" :key="room.id" :label="`${room.buildingName}${room.roomNo}`" :value="room.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="抄表类型" prop="meterType">
                    <el-radio-group v-model="addForm.meterType">
                        <el-radio :label="1">水表</el-radio>
                        <el-radio :label="2">电表</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="本次读数" prop="currentReading">
                    <el-input-number v-model="addForm.currentReading" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
                <el-form-item label="抄表日期" prop="readingDate">
                    <el-date-picker v-model="addForm.readingDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
                <el-form-item label="生成账单" prop="generateBill">
                    <el-switch v-model="addForm.generateBill" :active-value="1" :inactive-value="0" />
                    <span style="margin-left: 10px; color: #909399; font-size: 12px">开启后将自动生成账单</span>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="addForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAdd" :loading="addLoading">确定</el-button>
            </template>
        </el-dialog>

        <!-- 详情弹窗 -->
        <el-dialog v-model="detailVisible" title="抄表详情" width="500px">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="楼栋">{{ currentDetail.buildingName }}</el-descriptions-item>
                <el-descriptions-item label="房间号">{{ currentDetail.roomNo }}</el-descriptions-item>
                <el-descriptions-item label="抄表类型">{{ currentDetail.meterTypeDesc }}</el-descriptions-item>
                <el-descriptions-item label="抄表日期">{{ currentDetail.readingDate }}</el-descriptions-item>
                <el-descriptions-item label="上次读数">{{ currentDetail.previousReading }}</el-descriptions-item>
                <el-descriptions-item label="本次读数">{{ currentDetail.currentReading }}</el-descriptions-item>
                <el-descriptions-item label="用量">{{ currentDetail.usage }} {{ currentDetail.meterType === 1 ? '吨' : '度' }}</el-descriptions-item>
                <el-descriptions-item label="单价">¥{{ currentDetail.unitPrice }}/{{ currentDetail.meterType === 1 ? '吨' : '度' }}</el-descriptions-item>
                <el-descriptions-item label="费用" :span="2">
                    <span class="amount">¥{{ currentDetail.amount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="账单状态">
                    <el-tag :type="currentDetail.billGenerated ? 'success' : 'info'">
                        {{ currentDetail.billGenerated ? '已生成' : '未生成' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="操作人">{{ currentDetail.operatorName }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '-' }}</el-descriptions-item>
            </el-descriptions>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import { getMeterReadingList, addMeterReading, generateBillFromReading } from '@/api/meterReading';
    import { getRoomList } from '@/api/room';

    // 搜索表单
    const searchForm = reactive({
        roomId: null,
        meterType: null,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);

    // 分页
    const pagination = reactive({
        page: 1,
        size: 10,
        total: 0,
    });

    // 房间列表
    const roomList = ref([]);

    // 新增弹窗
    const addDialogVisible = ref(false);
    const addLoading = ref(false);
    const addFormRef = ref(null);
    const addForm = reactive({
        roomId: null,
        meterType: 1,
        currentReading: null,
        readingDate: '',
        generateBill: 0,
        remark: '',
    });

    const addRules = {
        roomId: [{ required: true, message: '请选择房间', trigger: 'change' }],
        meterType: [{ required: true, message: '请选择抄表类型', trigger: 'change' }],
        currentReading: [{ required: true, message: '请输入本次读数', trigger: 'blur' }],
        readingDate: [{ required: true, message: '请选择抄表日期', trigger: 'change' }],
    };

    // 详情弹窗
    const detailVisible = ref(false);
    const currentDetail = ref({});

    // 加载房间列表
    const loadRoomList = async () => {
        try {
            const res = await getRoomList({ page: 1, size: 1000 });
            roomList.value = res.data.records.map(room => ({
                ...room,
                buildingName: room.buildingName || '',
            }));
        } catch (error) {
            console.error('加载房间列表失败', error);
        }
    };

    // 加载数据
    const loadData = async () => {
        loading.value = true;
        try {
            const res = await getMeterReadingList({
                page: pagination.page,
                size: pagination.size,
                roomId: searchForm.roomId,
                meterType: searchForm.meterType,
            });
            tableData.value = res.data.records;
            pagination.total = res.data.total;
        } catch (error) {
            ElMessage.error('加载数据失败');
        } finally {
            loading.value = false;
        }
    };

    // 搜索
    const handleSearch = () => {
        pagination.page = 1;
        loadData();
    };

    // 重置
    const handleReset = () => {
        searchForm.roomId = null;
        searchForm.meterType = null;
        handleSearch();
    };

    // 显示新增弹窗
    const showAddDialog = () => {
        addForm.roomId = null;
        addForm.meterType = 1;
        addForm.currentReading = null;
        addForm.readingDate = new Date().toISOString().split('T')[0];
        addForm.generateBill = 0;
        addForm.remark = '';
        addDialogVisible.value = true;
    };

    // 新增抄表
    const handleAdd = async () => {
        if (!addFormRef.value) return;
        await addFormRef.value.validate(async valid => {
            if (valid) {
                addLoading.value = true;
                try {
                    await addMeterReading(addForm);
                    ElMessage.success('抄表成功');
                    addDialogVisible.value = false;
                    loadData();
                } finally {
                    addLoading.value = false;
                }
            }
        });
    };

    // 生成账单
    const handleGenerateBill = row => {
        ElMessageBox.confirm('确认根据该抄表记录生成账单？', '提示', {
            type: 'warning',
        })
            .then(async () => {
                try {
                    await generateBillFromReading(row.id);
                    ElMessage.success('账单已生成');
                    loadData();
                } catch (error) {
                    ElMessage.error(error.message || '生成失败');
                }
            })
            .catch(() => {});
    };

    // 查看详情
    const handleDetail = row => {
        currentDetail.value = row;
        detailVisible.value = true;
    };

    // 分页
    const handleSizeChange = size => {
        pagination.size = size;
        loadData();
    };

    const handleCurrentChange = page => {
        pagination.page = page;
        loadData();
    };

    onMounted(() => {
        loadRoomList();
        loadData();
    });
</script>

<style scoped lang="scss">
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .amount {
        color: #e6a23c;
        font-weight: bold;
    }
</style>
