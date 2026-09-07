<template>
    <div class="page-container">
        <!-- 搜索栏 -->
        <el-card class="search-form">
            <el-row :gutter="20" align="middle">
                <el-col :span="6">
                    <el-input v-model="searchForm.keyword" placeholder="搜索姓名/手机号/昵称" clearable @keyup.enter="loadData" />
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="loadData">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-col>
                <el-col :span="14" style="text-align: right">
                    <el-button type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增租客
                    </el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 表格 -->
        <el-card>
            <el-table :data="tableData" v-loading="loading" border stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="realName" label="姓名" width="100" />
                <el-table-column prop="phone" label="手机号" width="130" />
                <el-table-column prop="nickname" label="昵称" width="120" />
                <el-table-column prop="authStatusDesc" label="实名认证" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.authStatus === 1 ? 'success' : 'info'">
                            {{ row.authStatusDesc }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="statusDesc" label="状态" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                            {{ row.statusDesc }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="注册时间" width="160" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" @click="handleView(row)">详情</el-button>
                        <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="handleToggleStatus(row)">
                            {{ row.status === 1 ? '禁用' : '启用' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
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

        <!-- 新增/编辑弹窗 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑租客' : '新增租客'" width="500px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="form.realName" placeholder="请输入真实姓名" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="身份证号" prop="idCard">
                    <el-input v-model="form.idCard" placeholder="请输入身份证号（可选）" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
            </template>
        </el-dialog>

        <!-- 详情弹窗 -->
        <el-dialog v-model="detailDialogVisible" title="租客详情" width="600px">
            <el-descriptions :column="2" border v-if="currentTenantUser">
                <el-descriptions-item label="用户ID">{{ currentTenantUser.id }}</el-descriptions-item>
                <el-descriptions-item label="登录账号">{{ currentTenantUser.username || '-' }}</el-descriptions-item>
                <el-descriptions-item label="真实姓名">{{ currentTenantUser.realName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ currentTenantUser.phone || '-' }}</el-descriptions-item>
                <el-descriptions-item label="昵称">{{ currentTenantUser.nickname || '-' }}</el-descriptions-item>
                <el-descriptions-item label="身份证号">{{ currentTenantUser.idCard || '-' }}</el-descriptions-item>
                <el-descriptions-item label="实名认证">
                    <el-tag :type="currentTenantUser.authStatus === 1 ? 'success' : 'info'">
                        {{ currentTenantUser.authStatusDesc }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="currentTenantUser.status === 1 ? 'success' : 'danger'">
                        {{ currentTenantUser.statusDesc }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ currentTenantUser.createTime }}</el-descriptions-item>
                <el-descriptions-item label="最后登录">{{ currentTenantUser.lastLoginTime || '-' }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import request from '@/utils/request';
    import { phoneRule, phoneRuleOptional, idCardRuleOptional } from '@/utils/validators';

    const loading = ref(false);
    const submitLoading = ref(false);
    const tableData = ref([]);
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    const searchForm = reactive({ keyword: '' });

    // 新增/编辑相关
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const formRef = ref(null);
    const editId = ref(null);

    const form = reactive({
        realName: '',
        phone: '',
        idCard: '',
    });

    const rules = {
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        phone: [phoneRule],
        idCard: [idCardRuleOptional],
    };

    // 详情相关
    const detailDialogVisible = ref(false);
    const currentTenantUser = ref(null);

    const loadData = async () => {
        loading.value = true;
        try {
            const res = await request({
                url: '/tenant-user/list',
                method: 'get',
                params: {
                    page: page.value,
                    size: size.value,
                    keyword: searchForm.keyword,
                },
            });
            tableData.value = res.data.records;
            total.value = Number(res.data.total);
        } finally {
            loading.value = false;
        }
    };

    const resetSearch = () => {
        searchForm.keyword = '';
        loadData();
    };

    const handleView = async row => {
        try {
            const res = await request({
                url: `/tenant-user/${row.id}`,
                method: 'get',
            });
            currentTenantUser.value = res.data;
            detailDialogVisible.value = true;
        } catch (error) {
            ElMessage.error('获取详情失败');
        }
    };

    const handleAdd = () => {
        isEdit.value = false;
        editId.value = null;
        Object.assign(form, {
            realName: '',
            phone: '',
            idCard: '',
        });
        dialogVisible.value = true;
    };

    const handleEdit = row => {
        isEdit.value = true;
        editId.value = row.id;
        Object.assign(form, {
            realName: row.realName,
            phone: row.phone,
            idCard: row.idCard || '',
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
                        await request({
                            url: `/tenant-user/${editId.value}`,
                            method: 'put',
                            data: form,
                        });
                        ElMessage.success('更新成功');
                    } else {
                        await request({
                            url: '/tenant-user',
                            method: 'post',
                            data: form,
                        });
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

    const handleToggleStatus = row => {
        const action = row.status === 1 ? '禁用' : '启用';
        ElMessageBox.confirm(`确定要${action}该租客吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await request({
                url: `/tenant-user/${row.id}/status`,
                method: 'put',
                params: { status: row.status === 1 ? 0 : 1 },
            });
            ElMessage.success(`${action}成功`);
            loadData();
        });
    };

    onMounted(() => {
        loadData();
    });
</script>
