<template>
    <div class="page-container">
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
                <el-col :span="10" style="text-align: right">
                    <el-button v-permission="'workorder:create'" type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增工单
                    </el-button>
                </el-col>
            </el-row>
        </el-card>

        <el-card>
            <el-table :data="tableData" v-loading="loading" border stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="tenantName" label="租客" width="100" />
                <el-table-column prop="buildingName" label="楼栋" width="100" />
                <el-table-column prop="roomNo" label="房间" width="80" />
                <el-table-column prop="orderTypeDesc" label="类型" width="80" />
                <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
                <el-table-column prop="statusDesc" label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="statusTagType(row.status)">{{ row.statusDesc }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="160" />
                <el-table-column label="操作" width="280" fixed="right">
                    <template #default="{ row }">
                        <el-button v-permission="'workorder:detail'" size="small" @click="handleDetail(row)">详情</el-button>
                        <el-button v-if="row.status === 0" v-permission="'workorder:assign'" size="small" type="primary" @click="handleAssign(row)">分配</el-button>
                        <el-button v-if="row.status === 1" v-permission="'workorder:complete'" size="small" type="success" @click="handleComplete(row)">完成</el-button>
                        <el-button v-if="row.status === 0 || row.status === 1" v-permission="'workorder:close'" size="small" @click="handleClose(row)">关闭</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div style="margin-top: 20px; display: flex; justify-content: flex-end">
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

        <!-- 新增工单弹窗 -->
        <el-dialog v-model="dialogVisible" title="新增工单" width="600px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <!-- 合同选择 -->
                <el-form-item label="合同" prop="roomId">
                    <div class="select-display">
                        <span v-if="selectedContract">{{ selectedContract.contractNo }} - {{ selectedContract.tenantName }}</span>
                        <span v-else class="placeholder">请选择合同</span>
                        <el-button type="primary" size="small" @click="showContractSelect">选择</el-button>
                        <el-button
                            v-if="selectedContract"
                            size="small"
                            @click="
                                selectedContract = null;
                                form.roomId = null;
                            "
                        >
                            清除
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item label="工单类型" prop="orderType">
                    <el-select v-model="form.orderType" style="width: 100%">
                        <el-option label="报修" :value="1" />
                        <el-option label="投诉" :value="2" />
                        <el-option label="咨询" :value="3" />
                        <el-option label="其他" :value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入工单标题" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述问题" />
                </el-form-item>
                <el-form-item label="图片">
                    <el-input v-model="form.images" placeholder="图片URL，多个用逗号分隔" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
            </template>
        </el-dialog>

        <!-- 分配工单弹窗 -->
        <el-dialog v-model="assignDialogVisible" title="分配工单" width="400px">
            <el-form :model="assignForm" label-width="100px">
                <el-form-item label="处理人">
                    <div class="select-display">
                        <span v-if="selectedStaff">{{ selectedStaff.realName }}</span>
                        <span v-else class="placeholder">请选择处理人</span>
                        <el-button type="primary" size="small" @click="showStaffSelect">选择</el-button>
                        <el-button
                            v-if="selectedStaff"
                            size="small"
                            @click="
                                selectedStaff = null;
                                assignForm.assignee = null;
                            "
                        >
                            清除
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="assignDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitAssign">确定</el-button>
            </template>
        </el-dialog>

        <!-- 合同选择弹窗 -->
        <el-dialog v-model="contractSelectVisible" title="选择合同" width="800px" append-to-body>
            <el-row :gutter="10" style="margin-bottom: 15px">
                <el-col :span="16">
                    <el-input v-model="contractSearch.keyword" placeholder="搜索合同编号/租客姓名" clearable @keyup.enter="loadContracts" />
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" @click="loadContracts">搜索</el-button>
                </el-col>
            </el-row>
            <el-table :data="contractList" v-loading="contractLoading" border stripe highlight-current-row @current-change="handleContractSelect" style="width: 100%">
                <el-table-column prop="contractNo" label="合同编号" width="160" />
                <el-table-column prop="tenantName" label="租客" width="100" />
                <el-table-column prop="buildingName" label="楼栋" width="100" />
                <el-table-column prop="roomNo" label="房间" width="80" />
                <el-table-column prop="statusDesc" label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="contractStatusTagType(row.status)" size="small">{{ row.statusDesc }}</el-tag>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin-top: 15px; display: flex; justify-content: flex-end">
                <el-pagination
                    v-model:current-page="contractPage"
                    v-model:page-size="contractSize"
                    :total="contractTotal"
                    :page-sizes="[10, 20]"
                    layout="total, prev, pager, next"
                    @size-change="loadContracts"
                    @current-change="loadContracts"
                />
            </div>
        </el-dialog>

        <!-- 员工选择弹窗 -->
        <el-dialog v-model="staffSelectVisible" title="选择员工" width="700px" append-to-body>
            <el-row :gutter="10" style="margin-bottom: 15px">
                <el-col :span="16">
                    <el-input v-model="staffSearch.keyword" placeholder="搜索姓名/手机号" clearable @keyup.enter="loadStaffList" />
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" @click="loadStaffList">搜索</el-button>
                </el-col>
            </el-row>
            <el-table :data="staffList" v-loading="staffLoading" border stripe highlight-current-row @current-change="handleStaffSelect" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="realName" label="姓名" width="100" />
                <el-table-column prop="phone" label="手机号" width="130" />
                <el-table-column prop="roleDesc" label="角色" width="100" />
                <el-table-column prop="statusDesc" label="状态" width="80">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.statusDesc }}</el-tag>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin-top: 15px; display: flex; justify-content: flex-end">
                <el-pagination
                    v-model:current-page="staffPage"
                    v-model:page-size="staffSize"
                    :total="staffTotal"
                    :page-sizes="[10, 20]"
                    layout="total, prev, pager, next"
                    @size-change="loadStaffList"
                    @current-change="loadStaffList"
                />
            </div>
        </el-dialog>

        <!-- 工单详情弹窗 -->
        <el-dialog v-model="detailVisible" title="工单详情" width="650px">
            <div v-if="detailData">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="工单编号">{{ detailData.orderNo }}</el-descriptions-item>
                    <el-descriptions-item label="工单类型">{{ orderTypeDesc(detailData.orderType) }}</el-descriptions-item>
                    <el-descriptions-item label="标题" :span="2">{{ detailData.title }}</el-descriptions-item>
                    <el-descriptions-item label="租客">{{ detailData.tenantName }}</el-descriptions-item>
                    <el-descriptions-item label="房间">{{ detailData.buildingName }}{{ detailData.roomNo }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="statusTagType(detailData.status)">{{ statusDesc(detailData.status) }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
                    <el-descriptions-item label="描述" :span="2">{{ detailData.description }}</el-descriptions-item>
                    <el-descriptions-item label="图片" :span="2" v-if="detailData.images">
                        <div class="detail-images">
                            <el-image
                                v-for="(img, index) in detailData.images.split(',')"
                                :key="index"
                                :src="img"
                                :preview-src-list="detailData.images.split(',')"
                                fit="cover"
                                style="width: 80px; height: 80px; margin-right: 8px;"
                            />
                        </div>
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 处理信息 -->
                <el-descriptions :column="2" border style="margin-top: 15px" v-if="detailData.handlerName">
                    <template #title>
                        <span>处理信息</span>
                    </template>
                    <el-descriptions-item label="处理人">{{ detailData.handlerName }}</el-descriptions-item>
                    <el-descriptions-item label="处理时间">{{ detailData.handleTime || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="处理结果" :span="2">{{ detailData.handleResult || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="处理图片" :span="2" v-if="detailData.handleImages">
                        <div class="detail-images">
                            <el-image
                                v-for="(img, index) in detailData.handleImages.split(',')"
                                :key="index"
                                :src="img"
                                :preview-src-list="detailData.handleImages.split(',')"
                                fit="cover"
                                style="width: 80px; height: 80px; margin-right: 8px;"
                            />
                        </div>
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 评价信息 -->
                <el-descriptions :column="2" border style="margin-top: 15px" v-if="detailData.rating">
                    <template #title>
                        <span>评价信息</span>
                    </template>
                    <el-descriptions-item label="评分">
                        <el-rate :model-value="detailData.rating" disabled />
                    </el-descriptions-item>
                    <el-descriptions-item label="评价内容">{{ detailData.ratingContent || '-' }}</el-descriptions-item>
                </el-descriptions>
            </div>
            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import { getWorkOrderList, createWorkOrder, assignWorkOrder, processWorkOrder, closeWorkOrder, completeWorkOrder, getWorkOrderDetail } from '@/api/workorder';
    import request from '@/utils/request';

    const loading = ref(false);
    const submitLoading = ref(false);
    const tableData = ref([]);
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchForm = reactive({ status: null, orderType: null });
    const dialogVisible = ref(false);
    const assignDialogVisible = ref(false);
    const formRef = ref(null);

    const form = reactive({
        roomId: null,
        userId: null,
        orderType: 1,
        title: '',
        description: '',
        images: '',
    });

    const assignForm = reactive({
        workOrderId: null,
        assignee: null,
    });

    const rules = {
        roomId: [{ required: true, message: '请选择合同', trigger: 'change' }],
        orderType: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
        description: [{ required: true, message: '请输入工单内容', trigger: 'blur' }],
    };

    // 选中的数据
    const selectedContract = ref(null);
    const selectedStaff = ref(null);
    const currentWorkOrder = ref(null);

    // 详情弹窗
    const detailVisible = ref(false);
    const detailData = ref(null);

    // 合同选择弹窗
    const contractSelectVisible = ref(false);
    const contractLoading = ref(false);
    const contractList = ref([]);
    const contractPage = ref(1);
    const contractSize = ref(10);
    const contractTotal = ref(0);
    const contractSearch = reactive({ keyword: '' });

    // 员工选择弹窗
    const staffSelectVisible = ref(false);
    const staffLoading = ref(false);
    const staffList = ref([]);
    const staffPage = ref(1);
    const staffSize = ref(10);
    const staffTotal = ref(0);
    const staffSearch = reactive({ keyword: '' });

    const statusTagType = status => {
        const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info' };
        return map[status] || 'info';
    };

    const statusDesc = status => {
        const map = { 0: '待处理', 1: '处理中', 2: '已完成', 3: '已关闭' };
        return map[status] || '未知';
    };

    const orderTypeDesc = type => {
        const map = { 1: '报修', 2: '投诉', 3: '咨询', 4: '其他' };
        return map[type] || '未知';
    };

    const contractStatusTagType = status => {
        const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'danger' };
        return map[status] || 'info';
    };

    const loadData = async () => {
        loading.value = true;
        try {
            const res = await getWorkOrderList({
                page: page.value,
                size: size.value,
                status: searchForm.status,
                orderType: searchForm.orderType,
            });
            tableData.value = res.data.records;
            total.value = Number(res.data.total);
        } finally {
            loading.value = false;
        }
    };

    // 加载合同列表
    const loadContracts = async () => {
        contractLoading.value = true;
        try {
            const res = await request({
                url: '/contract/list',
                method: 'get',
                params: {
                    page: contractPage.value,
                    size: contractSize.value,
                    keyword: contractSearch.keyword,
                },
            });
            contractList.value = res.data.records;
            contractTotal.value = Number(res.data.total);
        } finally {
            contractLoading.value = false;
        }
    };

    // 加载员工列表
    const loadStaffList = async () => {
        staffLoading.value = true;
        try {
            const res = await request({
                url: '/staff/list',
                method: 'get',
                params: {
                    page: staffPage.value,
                    size: staffSize.value,
                    keyword: staffSearch.keyword,
                },
            });
            staffList.value = res.data.records;
            staffTotal.value = Number(res.data.total);
        } finally {
            staffLoading.value = false;
        }
    };

    // 显示合同选择弹窗
    const showContractSelect = () => {
        contractSearch.keyword = '';
        contractPage.value = 1;
        contractSelectVisible.value = true;
        loadContracts();
    };

    // 显示员工选择弹窗
    const showStaffSelect = () => {
        staffSearch.keyword = '';
        staffPage.value = 1;
        staffSelectVisible.value = true;
        loadStaffList();
    };

    // 选择合同
    const handleContractSelect = row => {
        if (row) {
            selectedContract.value = row;
            form.roomId = row.roomId; // 从合同中获取房间ID
            form.userId = row.userId; // 从合同中获取租客ID
            contractSelectVisible.value = false;
        }
    };

    // 选择员工
    const handleStaffSelect = row => {
        if (row) {
            selectedStaff.value = row;
            assignForm.assignee = row.id;
            staffSelectVisible.value = false;
        }
    };

    const resetSearch = () => {
        searchForm.status = null;
        searchForm.orderType = null;
        page.value = 1;
        loadData();
    };

    const handleAdd = () => {
        Object.assign(form, {
            roomId: null,
            userId: null,
            orderType: 1,
            title: '',
            description: '',
            images: '',
        });
        selectedContract.value = null;
        dialogVisible.value = true;
    };

    const handleSubmit = async () => {
        if (!formRef.value) return;
        await formRef.value.validate(async valid => {
            if (valid) {
                submitLoading.value = true;
                try {
                    await createWorkOrder(form);
                    ElMessage.success('创建成功');
                    dialogVisible.value = false;
                    loadData();
                } finally {
                    submitLoading.value = false;
                }
            }
        });
    };

    const handleDetail = async (row) => {
      try {
        const res = await getWorkOrderDetail(row.id);
        detailData.value = res.data;
        detailVisible.value = true;
      } catch (error) {
        ElMessage.error('获取工单详情失败');
      }
    };

    const handleAssign = row => {
        currentWorkOrder.value = row;
        assignForm.workOrderId = row.id;
        assignForm.assignee = null;
        selectedStaff.value = null;
        assignDialogVisible.value = true;
    };

    const submitAssign = async () => {
        if (!assignForm.assignee) {
            ElMessage.warning('请选择处理人');
            return;
        }
        await assignWorkOrder(assignForm.workOrderId, assignForm.assignee);
        ElMessage.success('分配成功');
        assignDialogVisible.value = false;
        loadData();
    };

    const handleComplete = row => {
        ElMessageBox.confirm('确认该工单已完成？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await completeWorkOrder(row.id);
            ElMessage.success('工单已完成');
            loadData();
        });
    };

    const handleClose = row => {
        ElMessageBox.confirm('确定要关闭该工单吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await closeWorkOrder(row.id);
            ElMessage.success('工单已关闭');
            loadData();
        });
    };

    onMounted(() => {
        loadData();
    });
</script>

<style scoped lang="scss">
    .select-display {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 5px 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        min-height: 32px;

        .placeholder {
            color: #c0c4cc;
            flex: 1;
        }

        span:not(.placeholder) {
            flex: 1;
            color: #606266;
        }
    }
</style>
