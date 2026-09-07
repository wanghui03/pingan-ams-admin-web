<template>
    <div class="page-container">
        <!-- 搜索栏 -->
        <el-card class="search-form">
            <el-row :gutter="20" align="middle">
                <el-col :span="5">
                    <el-input v-model="searchForm.keyword" placeholder="角色名称" clearable />
                </el-col>
                <el-col :span="5">
                    <el-button type="primary" @click="loadData">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-col>
                <el-col :span="14" style="text-align: right">
                    <el-button type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增角色
                    </el-button>
                </el-col>
            </el-row>
        </el-card>
        <el-card>
            <!-- 表格 -->
            <el-table :data="tableData" v-loading="loading" border stripe>
                <el-table-column prop="roleName" label="角色名称" width="150" />
                <el-table-column prop="roleCode" label="角色编码" width="150" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="userCount" label="用户数" width="100" />
                <el-table-column prop="statusDesc" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                            {{ row.statusDesc }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="primary" @click="handleAssignPermission(row)">分配权限</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination
                    v-model:current-page="page"
                    v-model:page-size="size"
                    :total="total"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="loadData"
                    @current-change="loadData"
                />
            </div>
        </el-card>

        <!-- 新增/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="form.roleName" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色编码" prop="roleCode">
                    <el-input v-model="form.roleCode" placeholder="请输入角色编码（如：admin）" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="form.description" type="textarea" placeholder="请输入角色描述" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
            </template>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog v-model="permissionDialogVisible" title="分配权限" width="600px">
            <div class="permission-tree">
                <el-tree
                    ref="permissionTreeRef"
                    :data="permissionTree"
                    :props="{ children: 'children', label: 'name' }"
                    node-key="id"
                    show-checkbox
                    default-expand-all
                    :default-checked-keys="checkedPermissions"
                />
            </div>
            <template #footer>
                <el-button @click="permissionDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmitPermission" :loading="permissionSubmitLoading">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import { getRoleList, createRole, updateRole, deleteRole, getPermissionTree, assignPermissions } from '@/api/role';

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(10);
    const total = ref(0);

    // 搜索表单
    const searchForm = reactive({
        keyword: '',
    });

    // 对话框
    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const formRef = ref(null);
    const submitLoading = ref(false);
    const form = reactive({
        id: null,
        roleName: '',
        roleCode: '',
        description: '',
        status: 1,
    });

    const rules = {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
    };

    // 权限分配对话框
    const permissionDialogVisible = ref(false);
    const permissionTreeRef = ref(null);
    const permissionTree = ref([]);
    const checkedPermissions = ref([]);
    const currentRoleId = ref(null);
    const permissionSubmitLoading = ref(false);

    // 加载数据
    const loadData = async () => {
        loading.value = true;
        try {
            const res = await getRoleList({
                page: page.value,
                size: size.value,
                keyword: searchForm.keyword,
            });
            tableData.value = res.data.records;
            total.value = res.data.total;
        } finally {
            loading.value = false;
        }
    };

    // 重置搜索
    const resetSearch = () => {
        searchForm.keyword = '';
        page.value = 1;
        loadData();
    };

    // 新增
    const handleAdd = () => {
        dialogTitle.value = '新增角色';
        Object.assign(form, {
            id: null,
            roleName: '',
            roleCode: '',
            description: '',
            status: 1,
        });
        dialogVisible.value = true;
    };

    // 编辑
    const handleEdit = row => {
        dialogTitle.value = '编辑角色';
        Object.assign(form, {
            id: row.id,
            roleName: row.roleName,
            roleCode: row.roleCode,
            description: row.description,
            status: row.status,
        });
        dialogVisible.value = true;
    };

    // 提交表单
    const handleSubmit = async () => {
        if (!formRef.value) return;
        await formRef.value.validate(async valid => {
            if (valid) {
                submitLoading.value = true;
                try {
                    if (form.id) {
                        await updateRole(form.id, form);
                        ElMessage.success('更新成功');
                    } else {
                        await createRole(form);
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

    // 删除
    const handleDelete = row => {
        ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
            .then(async () => {
                await deleteRole(row.id);
                ElMessage.success('删除成功');
                loadData();
            })
            .catch(() => {});
    };

    // 分配权限
    const handleAssignPermission = async row => {
        currentRoleId.value = row.id;
        checkedPermissions.value = row.permissionIds || [];

        // 加载权限树
        try {
            const res = await getPermissionTree();
            permissionTree.value = res.data;
            permissionDialogVisible.value = true;
        } catch (error) {
            ElMessage.error('加载权限列表失败');
        }
    };

    // 提交权限分配
    const handleSubmitPermission = async () => {
        permissionSubmitLoading.value = true;
        try {
            const checkedKeys = permissionTreeRef.value.getCheckedKeys();
            const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys();
            const permissionIds = [...checkedKeys, ...halfCheckedKeys];

            await assignPermissions(currentRoleId.value, permissionIds);
            ElMessage.success('权限分配成功');
            permissionDialogVisible.value = false;
            loadData();
        } finally {
            permissionSubmitLoading.value = false;
        }
    };

    onMounted(() => {
        loadData();
    });
</script>

<style scoped lang="scss">
    .role-manage {
        padding: 20px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .search-form {
        margin-bottom: 20px;
    }

    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }

    .permission-tree {
        max-height: 400px;
        overflow-y: auto;
    }
</style>
