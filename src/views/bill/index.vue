<template>
    <div class="page-container">
        <el-card class="search-form">
            <el-row :gutter="20" align="middle">
                <el-col :span="5">
                    <el-select v-model="searchForm.status" placeholder="账单状态" clearable>
                        <el-option label="待支付" :value="0" />
                        <el-option label="已支付" :value="1" />
                        <el-option label="已逾期" :value="2" />
                        <el-option label="已取消" :value="3" />
                    </el-select>
                </el-col>
                <el-col :span="5">
                    <el-select v-model="searchForm.billType" placeholder="账单类型" clearable>
                        <el-option label="租金" :value="1" />
                        <el-option label="水电费" :value="2" />
                        <el-option label="押金" :value="3" />
                        <el-option label="其他" :value="4" />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="loadData">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-col>
                <el-col :span="10" style="text-align: right">
                    <el-button v-permission="'bill:create'" type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增账单
                    </el-button>
                </el-col>
            </el-row>
        </el-card>

        <el-card>
            <el-alert title="💡 账单管理说明" type="info" :closable="true" style="margin-bottom: 15px">
                <template #default>
                    <div style="font-size: 13px; line-height: 1.8">
                        <strong>租金账单：</strong>
                        合同审核通过后，系统会根据支付方式（月付/季付/半年付/年付）自动生成租金账单，无需手动创建
                        <br />
                        <strong>手动新增：</strong>
                        仅用于水电费、押金等其他费用，租金账单由系统自动生成
                        <br />
                        <strong>逾期处理：</strong>
                        系统每天自动检查，超过截止日期的账单会自动标记为"已逾期"
                    </div>
                </template>
            </el-alert>
            <el-table :data="tableData" v-loading="loading" border stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="tenantName" label="租客" width="100" />
                <el-table-column prop="contractNo" label="合同编号" width="160" />
                <el-table-column prop="billTypeDesc" label="类型" width="90" />
                <el-table-column prop="amount" label="金额(元)" width="110" />
                <el-table-column prop="billDate" label="账单日期" width="120" />
                <el-table-column prop="dueDate" label="截止日期" width="120" />
                <el-table-column prop="statusDesc" label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="statusTagType(row.status)">{{ row.statusDesc }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button v-permission="'bill:detail'" size="small" @click="handleDetail(row)">详情</el-button>
                        <el-button v-if="row.status === 0 || row.status === 2" v-permission="'bill:pay'" size="small" type="warning" @click="handleRemind(row)">提醒</el-button>
                        <el-button v-if="row.status === 0" v-permission="'bill:pay'" size="small" type="success" @click="handleConfirmPay(row)">确认收款</el-button>
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

        <!-- 新增账单弹窗 -->
        <el-dialog v-model="dialogVisible" title="新增账单" width="500px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <!-- 合同选择 -->
                <el-form-item label="合同" prop="contractId">
                    <div class="select-display">
                        <span v-if="selectedContract">{{ selectedContract.contractNo }} - {{ selectedContract.tenantName }}</span>
                        <span v-else class="placeholder">请选择合同</span>
                        <el-button type="primary" size="small" @click="showContractSelect">选择</el-button>
                        <el-button
                            v-if="selectedContract"
                            size="small"
                            @click="
                                selectedContract = null;
                                form.contractId = null;
                            "
                        >
                            清除
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item label="账单类型" prop="billType">
                    <el-select v-model="form.billType" style="width: 100%">
                        <el-option label="租金" :value="1" />
                        <el-option label="水电费" :value="2" />
                        <el-option label="押金" :value="3" />
                        <el-option label="其他" :value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item label="金额(元)" prop="amount">
                    <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="账单日期" prop="billDate">
                            <el-date-picker v-model="form.billDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="截止日期" prop="dueDate">
                            <el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注">
                    <el-input v-model="form.remark" type="textarea" :rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
            </template>
        </el-dialog>

        <!-- 账单详情弹窗 -->
        <el-dialog v-model="detailVisible" title="账单详情" width="600px">
            <el-descriptions :column="2" border v-if="detailData">
                <el-descriptions-item label="账单编号">{{ detailData.billNo }}</el-descriptions-item>
                <el-descriptions-item label="合同编号">{{ detailData.contractNo }}</el-descriptions-item>
                <el-descriptions-item label="租客">{{ detailData.tenantName }}</el-descriptions-item>
                <el-descriptions-item label="房间">{{ detailData.buildingName }}{{ detailData.roomNo }}</el-descriptions-item>
                <el-descriptions-item label="账单类型">{{ detailData.billTypeDesc }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="statusTagType(detailData.status)">{{ detailData.statusDesc }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="账单金额">¥{{ detailData.amount }}</el-descriptions-item>
                <el-descriptions-item label="已付金额">¥{{ detailData.paidAmount || 0 }}</el-descriptions-item>
                <el-descriptions-item label="账单日期">{{ detailData.billDate }}</el-descriptions-item>
                <el-descriptions-item label="截止日期">{{ detailData.dueDate }}</el-descriptions-item>
                <el-descriptions-item label="逾期天数" v-if="detailData.overdueDays > 0">
                    <span style="color: #F56C6C">{{ detailData.overdueDays }} 天</span>
                </el-descriptions-item>
                <el-descriptions-item label="支付时间" v-if="detailData.paidTime">{{ detailData.paidTime }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
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
                <el-table-column prop="monthlyRent" label="月租金(元)" width="100" />
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
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import { getBillList, createBill, confirmPayment, sendBillReminder, getBillDetail, cancelBill } from '@/api/bill';
    import request from '@/utils/request';

    const loading = ref(false);
    const submitLoading = ref(false);
    const tableData = ref([]);
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchForm = reactive({ status: null, billType: null });
    const dialogVisible = ref(false);
    const formRef = ref(null);

    const form = reactive({
        contractId: null,
        billType: 1,
        amount: null,
        billDate: '',
        dueDate: '',
        remark: '',
    });

    const rules = {
        contractId: [{ required: true, message: '请选择合同', trigger: 'change' }],
        billType: [{ required: true, message: '请选择账单类型', trigger: 'change' }],
        amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
        billDate: [{ required: true, message: '请选择账单日期', trigger: 'change' }],
        dueDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
    };

    // 详情弹窗
    const detailVisible = ref(false);
    const detailData = ref(null);

    // 选中的合同
    const selectedContract = ref(null);

    // 合同选择弹窗
    const contractSelectVisible = ref(false);
    const contractLoading = ref(false);
    const contractList = ref([]);
    const contractPage = ref(1);
    const contractSize = ref(10);
    const contractTotal = ref(0);
    const contractSearch = reactive({ keyword: '' });

    const statusTagType = status => {
        const map = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' };
        return map[status] || 'info';
    };

    const contractStatusTagType = status => {
        const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'danger' };
        return map[status] || 'info';
    };

    const loadData = async () => {
        loading.value = true;
        try {
            const res = await getBillList({
                page: page.value,
                size: size.value,
                status: searchForm.status,
                billType: searchForm.billType,
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

    // 显示合同选择弹窗
    const showContractSelect = () => {
        contractSearch.keyword = '';
        contractPage.value = 1;
        contractSelectVisible.value = true;
        loadContracts();
    };

    // 选择合同
    const handleContractSelect = row => {
        if (row) {
            selectedContract.value = row;
            form.contractId = row.id;
            // 自动填充金额
            if (row.monthlyRent && !form.amount) {
                form.amount = row.monthlyRent;
            }
            contractSelectVisible.value = false;
        }
    };

    const resetSearch = () => {
        searchForm.status = null;
        searchForm.billType = null;
        page.value = 1;
        loadData();
    };

    const handleAdd = () => {
        Object.assign(form, {
            contractId: null,
            billType: 1,
            amount: null,
            billDate: '',
            dueDate: '',
            remark: '',
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
                    await createBill(form);
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
        const res = await getBillDetail(row.id);
        detailData.value = res.data;
        detailVisible.value = true;
      } catch (error) {
        ElMessage.error('获取账单详情失败');
      }
    };

    const handleCancel = (row) => {
      ElMessageBox.prompt('请输入取消原因', '取消账单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '原因不能为空',
        type: 'warning',
      }).then(async ({ value }) => {
        await cancelBill(row.id, value);
        ElMessage.success('账单已取消');
        loadData();
      }).catch(() => {});
    };

    const handleConfirmPay = row => {
        ElMessageBox.confirm('确认该账单已收款？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await confirmPayment(row.id, row.amount);
            ElMessage.success('已确认收款');
            loadData();
        });
    };

    const handleRemind = row => {
        ElMessageBox.confirm('确认向租客发送账单提醒？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await sendBillReminder(row.id);
            ElMessage.success('已发送提醒');
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
