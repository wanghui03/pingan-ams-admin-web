import request from '@/utils/request'

// 获取系统配置列表
export const getSysConfigList = () => {
  return request({
    url: '/sys-config/list',
    method: 'get'
  })
}

// 保存系统配置
export const saveSysConfig = (data) => {
  return request({
    url: '/sys-config',
    method: 'post',
    data
  })
}

// 删除系统配置
export const deleteSysConfig = (id) => {
  return request({
    url: `/sys-config/${id}`,
    method: 'delete'
  })
}

// 获取字典列表
export const getDictList = (params) => {
  return request({
    url: '/dict/list',
    method: 'get',
    params
  })
}

// 创建字典
export const createDict = (data) => {
  return request({
    url: '/dict',
    method: 'post',
    data
  })
}

// 更新字典
export const updateDict = (id, data) => {
  return request({
    url: `/dict/${id}`,
    method: 'put',
    data
  })
}

// 删除字典
export const deleteDict = (id) => {
  return request({
    url: `/dict/${id}`,
    method: 'delete'
  })
}

// 获取操作日志列表
export const getOperationLogList = (params) => {
  return request({
    url: '/log/list',
    method: 'get',
    params
  })
}

// 获取角色列表
export const getRoleList = (params) => {
  return request({
    url: '/role/list',
    method: 'get',
    params
  })
}

// 获取所有角色
export const getAllRoles = () => {
  return request({
    url: '/role/all',
    method: 'get'
  })
}

// 创建角色
export const createRole = (data) => {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

// 更新角色
export const updateRole = (id, data) => {
  return request({
    url: `/role/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
export const deleteRole = (id) => {
  return request({
    url: `/role/${id}`,
    method: 'delete'
  })
}

// 分配角色权限
export const assignRolePermissions = (roleId, permissionIds) => {
  return request({
    url: `/role/${roleId}/permissions`,
    method: 'post',
    data: permissionIds
  })
}
