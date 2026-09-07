<template>
    <div class="page-container">
        <!-- 搜索栏 -->
        <el-card class="search-form">
            <el-row :gutter="20" align="middle">
                <el-col :span="5">
                    <el-select v-model="searchForm.buildingId" placeholder="选择楼栋" clearable filterable @change="loadData">
                        <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
                    </el-select>
                </el-col>
                <el-col :span="5">
                    <el-select v-model="searchForm.status" placeholder="房源状态" clearable @change="loadData">
                        <el-option label="空置" :value="0" />
                        <el-option label="已预订" :value="1" />
                        <el-option label="已入住" :value="2" />
                        <el-option label="维修中" :value="3" />
                    </el-select>
                </el-col>
                <el-col :span="5">
                    <el-input v-model="searchForm.keyword" placeholder="搜索房间号/户型" clearable @keyup.enter="loadData" />
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="loadData">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-col>
                <el-col :span="5" style="text-align: right">
                    <el-button type="success" @click="showAddBuilding">新增楼栋</el-button>
                    <el-button type="primary" @click="handleAdd">新增房间</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 房源卡片网格 -->
        <el-row :gutter="20" class="room-grid">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="room in tableData" :key="room.id">
                <el-card class="room-card" :class="'status-' + room.status" shadow="hover" @dblclick="openDetail(room)">
                    <template #header>
                        <div class="room-header">
                            <span class="room-no">{{ room.buildingName }} - {{ room.roomNo }}</span>
                            <el-tag :type="statusTagType(room.status)" size="small">{{ room.statusDesc }}</el-tag>
                        </div>
                    </template>

                    <div class="room-body">
                        <div class="room-info">
                            <div class="info-item">
                                <el-icon><House /></el-icon>
                                <span>{{ room.layout || '暂无' }}</span>
                            </div>
                            <div class="info-item">
                                <el-icon><ScaleToOriginal /></el-icon>
                                <span>{{ room.area }}㎡</span>
                            </div>
                            <div class="info-item">
                                <el-icon><Money /></el-icon>
                                <span class="rent">¥{{ room.monthlyRent }}/月</span>
                            </div>
                        </div>

                        <div v-if="room.tenantName" class="tenant-info">
                            <el-icon><User /></el-icon>
                            <span>{{ room.tenantName }}</span>
                            <el-tag v-if="room.contractEndDate" size="small" type="warning">{{ room.contractEndDate }}到期</el-tag>
                        </div>
                    </div>

                    <template #footer>
                        <div class="room-actions">
                            <el-button size="small" @click.stop="handleEdit(room)">编辑</el-button>
                            <el-button size="small" type="primary" @click.stop="openDetail(room)">详情</el-button>
                            <el-popconfirm title="确定删除吗？" @confirm="handleDelete(room.id)">
                                <template #reference>
                                    <el-button size="small" type="danger">删除</el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </template>
                </el-card>
            </el-col>
        </el-row>

        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="size"
                :total="total"
                :page-sizes="[12, 24, 36, 48]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="loadData"
                @current-change="loadData"
            />
        </div>

        <!-- 房间详情弹窗 -->
        <el-dialog v-model="detailVisible" title="房间详情" width="800px" :close-on-click-modal="false">
            <el-tabs v-model="activeTab">
                <!-- 基础信息 -->
                <el-tab-pane label="基础信息" name="basic">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="楼栋">{{ currentRoom.buildingName }}</el-descriptions-item>
                        <el-descriptions-item label="房间号">{{ currentRoom.roomNo }}</el-descriptions-item>
                        <el-descriptions-item label="楼层">{{ currentRoom.floor }}层</el-descriptions-item>
                        <el-descriptions-item label="户型">{{ currentRoom.layout }}</el-descriptions-item>
                        <el-descriptions-item label="面积">{{ currentRoom.area }}㎡</el-descriptions-item>
                        <el-descriptions-item label="朝向">{{ currentRoom.orientation || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="月租金">¥{{ currentRoom.monthlyRent }}</el-descriptions-item>
                        <el-descriptions-item label="押金">¥{{ currentRoom.deposit }}</el-descriptions-item>
                        <el-descriptions-item label="水费单价">¥{{ currentRoom.waterPrice }}/吨</el-descriptions-item>
                        <el-descriptions-item label="电费单价">¥{{ currentRoom.electricityPrice }}/度</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <el-tag :type="statusTagType(currentRoom.status)">{{ currentRoom.statusDesc }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="地址" :span="2">{{ currentRoom.address }}</el-descriptions-item>
                        <el-descriptions-item label="描述" :span="2">{{ currentRoom.description || '-' }}</el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <!-- 抄表记录 -->
                <el-tab-pane label="抄表记录" name="meter">
                    <el-table :data="meterData" size="small" :show-header="true">
                        <el-table-column prop="readingDate" label="抄表日期" width="120" />
                        <el-table-column prop="meterTypeDesc" label="类型" width="80" />
                        <el-table-column prop="previousReading" label="上次读数" width="100" align="right" />
                        <el-table-column prop="currentReading" label="本次读数" width="100" align="right" />
                        <el-table-column prop="meterUsage" label="用量" width="80" align="right" />
                        <el-table-column prop="amount" label="费用" width="80" align="right">
                            <template #default="{ row }">¥{{ row.amount }}</template>
                        </el-table-column>
                        <el-table-column label="状态" width="80">
                            <template #default="{ row }">
                                <el-tag :type="row.billGenerated ? 'success' : 'warning'" size="small">
                                    {{ row.billGenerated ? '已出账' : '未出账' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 账单明细 -->
                <el-tab-pane label="账单明细" name="bill">
                    <el-table :data="billData" size="small" :show-header="true">
                        <el-table-column prop="billNo" label="账单编号" width="150" />
                        <el-table-column prop="billTypeDesc" label="类型" width="80" />
                        <el-table-column prop="amount" label="金额" width="100" align="right">
                            <template #default="{ row }">¥{{ row.amount }}</template>
                        </el-table-column>
                        <el-table-column prop="dueDate" label="到期日期" width="120" />
                        <el-table-column prop="statusDesc" label="状态" width="80">
                            <template #default="{ row }">
                                <el-tag :type="statusTagType(row.status)" size="small">{{ row.statusDesc }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="paymentDate" label="支付时间" width="120" />
                    </el-table>
                </el-tab-pane>

                <!-- 工单记录 -->
                <el-tab-pane label="工单记录" name="workorder">
                    <el-table :data="workorderData" size="small" :show-header="true">
                        <el-table-column prop="orderNo" label="工单编号" width="150" />
                        <el-table-column prop="title" label="标题" min-width="150" />
                        <el-table-column prop="categoryDesc" label="分类" width="100" />
                        <el-table-column prop="priorityDesc" label="优先级" width="80">
                            <template #default="{ row }">
                                <el-tag :type="priorityTagType(row.priority)" size="small">{{ row.priorityDesc }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="statusDesc" label="状态" width="80">
                            <template #default="{ row }">
                                <el-tag :type="statusTagType(row.status)" size="small">{{ row.statusDesc }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" label="创建时间" width="160" />
                    </el-table>
                </el-tab-pane>
            </el-tabs>

            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
                <el-button type="primary" @click="handleEdit(currentRoom)">编辑房间</el-button>
            </template>
        </el-dialog>

        <!-- 新增/编辑房间弹窗 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑房间' : '新增房间'" width="600px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="楼栋" prop="buildingId">
                            <el-select v-model="form.buildingId" placeholder="选择楼栋" style="width: 100%">
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
                            <el-input-number v-model="form.floor" :min="1" :max="100" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="房源类型" prop="roomType">
                            <el-select v-model="form.roomType" placeholder="选择类型" style="width: 100%">
                                <el-option label="商品房" :value="1" />
                                <el-option label="拆迁房" :value="2" />
                                <el-option label="自建房" :value="3" />
                                <el-option label="公寓" :value="4" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="面积" prop="area">
                            <el-input-number v-model="form.area" :min="0" :precision="2" style="width: 100%">
                                <template #suffix><span class="input-suffix">㎡</span></template>
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="户型" prop="layout">
                            <el-input v-model="form.layout" placeholder="如：一室一厅" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="月租金" prop="monthlyRent">
                            <el-input-number v-model="form.monthlyRent" :min="0" :precision="2" style="width: 100%">
                                <template #suffix><span class="input-suffix">元</span></template>
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="押金">
                            <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%">
                                <template #suffix><span class="input-suffix">元</span></template>
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="水费单价">
                            <el-input-number v-model="form.waterPrice" :min="0" :precision="2" style="width: 100%">
                                <template #suffix><span class="input-suffix">元/吨</span></template>
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="电费单价">
                            <el-input-number v-model="form.electricityPrice" :min="0" :precision="2" style="width: 100%">
                                <template #suffix><span class="input-suffix">元/度</span></template>
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="朝向">
                            <el-select v-model="form.orientation" placeholder="选择朝向" style="width: 100%">
                                <el-option label="东" value="东" />
                                <el-option label="南" value="南" />
                                <el-option label="西" value="西" />
                                <el-option label="北" value="北" />
                                <el-option label="东南" value="东南" />
                                <el-option label="西南" value="西南" />
                                <el-option label="西北" value="西北" />
                                <el-option label="东北" value="东北" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态" prop="status">
                            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
                                <el-option label="空置" :value="0" />
                                <el-option label="已预订" :value="1" />
                                <el-option label="已入住" :value="2" />
                                <el-option label="维修中" :value="3" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="地址">
                    <el-input v-model="form.address" placeholder="请输入详细地址" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入房间描述" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
            </template>
        </el-dialog>

        <!-- 新增楼栋弹窗 -->
        <el-dialog v-model="buildingDialogVisible" title="新增楼栋" width="500px">
            <el-form :model="buildingForm" :rules="buildingRules" ref="buildingFormRef" label-width="100px">
                <el-form-item label="楼栋名称" prop="name">
                    <el-input v-model="buildingForm.name" placeholder="请输入楼栋名称" />
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="buildingForm.address" placeholder="请输入地址" />
                </el-form-item>
                <el-form-item label="总楼层" prop="totalFloors">
                    <el-input-number v-model="buildingForm.totalFloors" :min="1" :max="100" style="width: 100%">
                        <template #suffix><span class="input-suffix">层</span></template>
                    </el-input-number>
                </el-form-item>
                <el-form-item label="总房间数">
                    <el-input-number v-model="buildingForm.totalRooms" :min="1" style="width: 100%">
                        <template #suffix><span class="input-suffix">间</span></template>
                    </el-input-number>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="buildingForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="buildingDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAddBuilding" :loading="buildingSubmitLoading">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { ElMessage } from 'element-plus';
    import { House, ScaleToOriginal, Money, User } from '@element-plus/icons-vue';
    import request from '@/utils/request';

    const searchForm = reactive({
        buildingId: null,
        status: null,
        keyword: '',
    });

    const tableData = ref([]);
    const buildings = ref([]);
    const page = ref(1);
    const size = ref(12);
    const total = ref(0);

    const detailVisible = ref(false);
    const activeTab = ref('basic');
    const currentRoom = ref({});
    const meterData = ref([]);
    const billData = ref([]);
    const workorderData = ref([]);

    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const submitLoading = ref(false);
    const formRef = ref(null);
    const editId = ref(null);

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
        description: '',
        status: 0,
    });

    const rules = {
        buildingId: [{ required: true, message: '请选择楼栋', trigger: 'change' }],
        roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
        floor: [{ required: true, message: '请输入楼层', trigger: 'blur' }],
        roomType: [{ required: true, message: '请选择房源类型', trigger: 'change' }],
        monthlyRent: [{ required: true, message: '请输入月租金', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    };

    // 楼栋相关
    const buildingDialogVisible = ref(false);
    const buildingSubmitLoading = ref(false);
    const buildingFormRef = ref(null);
    const buildingForm = reactive({
        name: '',
        address: '',
        totalFloors: null,
        totalRooms: null,
        description: '',
    });

    const buildingRules = {
        name: [{ required: true, message: '请输入楼栋名称', trigger: 'blur' }],
        totalFloors: [{ required: true, message: '请输入总楼层', trigger: 'blur' }],
    };

    const statusTagType = status => {
        const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
        return types[status] || 'info';
    };

    const priorityTagType = priority => {
        const types = { 1: 'danger', 2: 'primary', 3: 'info' };
        return types[priority] || 'info';
    };

    const loadBuildings = async () => {
        const res = await request({ url: '/building/all', method: 'get' });
        buildings.value = res.data || [];
    };

    const loadData = async () => {
        try {
            const res = await request({
                url: '/room/list',
                method: 'get',
                params: {
                    page: page.value,
                    size: size.value,
                    buildingId: searchForm.buildingId,
                    status: searchForm.status,
                    keyword: searchForm.keyword,
                },
            });
            tableData.value = res.data.records;
            total.value = Number(res.data.total);
        } catch (error) {
            ElMessage.error('加载数据失败');
        }
    };

    const resetSearch = () => {
        searchForm.buildingId = null;
        searchForm.status = null;
        searchForm.keyword = '';
        page.value = 1;
        loadData();
    };

    const handleAdd = () => {
        isEdit.value = false;
        editId.value = null;
        Object.assign(form, {
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
            description: '',
            status: 0,
        });
        dialogVisible.value = true;
    };

    const handleEdit = row => {
        isEdit.value = true;
        editId.value = row.id;
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
            description: row.description,
            status: row.status,
        });
        dialogVisible.value = true;
    };

    const handleSubmit = async () => {
        if (!formRef.value) return;
        await formRef.value.validate(async valid => {
            if (valid) {
                submitLoading.value = true;
                try {
                    if (isEdit.value) {
                        await request({ url: `/room/${editId.value}`, method: 'put', data: form });
                        ElMessage.success('更新成功');
                    } else {
                        await request({ url: '/room', method: 'post', data: form });
                        ElMessage.success('创建成功');
                    }
                    dialogVisible.value = false;
                    loadData();
                } finally {
                    submitLoading.value = false;
                }
            }
        });
    };

    const handleDelete = async id => {
        await request({ url: `/room/${id}`, method: 'delete' });
        ElMessage.success('删除成功');
        loadData();
    };

    const showAddBuilding = () => {
        Object.assign(buildingForm, {
            name: '',
            address: '',
            totalFloors: null,
            totalRooms: null,
            description: '',
        });
        buildingDialogVisible.value = true;
    };

    const handleAddBuilding = async () => {
        if (!buildingFormRef.value) return;
        await buildingFormRef.value.validate(async valid => {
            if (valid) {
                buildingSubmitLoading.value = true;
                try {
                    await request({ url: '/building', method: 'post', data: buildingForm });
                    ElMessage.success('楼栋创建成功');
                    buildingDialogVisible.value = false;
                    loadBuildings();
                    loadData();
                } catch (error) {
                    ElMessage.error(error.message || '创建失败');
                } finally {
                    buildingSubmitLoading.value = false;
                }
            }
        });
    };

    const openDetail = async room => {
        currentRoom.value = room;
        detailVisible.value = true;
        activeTab.value = 'basic';

        // 加载抄表记录
        try {
            const meterRes = await request({
                url: '/meter-reading/list',
                method: 'get',
                params: { page: 1, size: 100, roomId: room.id },
            });
            meterData.value = meterRes.data.records || [];
        } catch (e) {
            meterData.value = [];
        }

        // 加载账单
        try {
            const billRes = await request({
                url: '/bill/list',
                method: 'get',
                params: { page: 1, size: 100, roomId: room.id },
            });
            billData.value = billRes.data.records || [];
        } catch (e) {
            billData.value = [];
        }

        // 加载工单
        try {
            const workorderRes = await request({
                url: '/work-order/list',
                method: 'get',
                params: { page: 1, size: 100, roomId: room.id },
            });
            workorderData.value = workorderRes.data.records || [];
        } catch (e) {
            workorderData.value = [];
        }
    };

    onMounted(() => {
        loadBuildings();
        loadData();
    });
</script>

<style scoped lang="scss">
    .room-grid {
        padding: 0 10px;

        .room-card {
            margin-bottom: 20px;
            cursor: pointer;
            transition: transform 0.3s;

            &:hover {
                transform: translateY(-5px);
            }

            &.status-0 {
                border-top: 3px solid #909399;
            }
            &.status-1 {
                border-top: 3px solid #e6a23c;
            }
            &.status-2 {
                border-top: 3px solid #67c23a;
            }
            &.status-3 {
                border-top: 3px solid #f56c6c;
            }

            .room-header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .room-no {
                    font-weight: bold;
                    font-size: 16px;
                }
            }

            .room-body {
                min-height: 100px;

                .room-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 10px;

                    .info-item {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        font-size: 13px;
                        color: #606266;

                        .rent {
                            color: #f56c6c;
                            font-weight: bold;
                        }
                    }
                }

                .tenant-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 0;
                    border-top: 1px solid #f0f0f0;
                    font-size: 13px;
                    color: #606266;
                }
            }

            .room-actions {
                display: flex;
                gap: 8px;
                justify-content: center;
            }
        }
    }
    .input-suffix {
        color: #909399;
        font-size: 13px;
        margin-left: 5px;
    }
</style>
