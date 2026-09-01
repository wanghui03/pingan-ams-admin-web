import request from '@/utils/request'

// 获取角色列表
export const getRoleList = (params) => {
  return request({
    url: '/role/list',
    method: 'get',
    params
  })
}

// 获取所有角色（下拉选择）
export const getAllRoles = () => {
  return request({
    url: '/role/all',
    method: 'get'
  })
}

// 获取角色详情
export const getRoleDetail = (id) => {
  return request({
    url: `/role/${id}`,
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
export const assignPermissions = (roleId, permissionIds) => {
  return request({
    url: `/role/${roleId}/permissions`,
    method: 'post',
    data: permissionIds
  })
}

// 获取用户的角色列表
export const getUserRoles = (userId) => {
  return request({
    url: `/role/user/${userId}`,
    method: 'get'
  })
}

// 为用户分配角色
export const assignUserRoles = (userId, roleIds) => {
  return request({
    url: `/role/user/${userId}/assign`,
    method: 'post',
    data: roleIds
  })
}

// 获取当前用户的权限编码列表
export const getMyPermissions = () => {
  return request({
    url: '/role/my/permissions',
    method: 'get'
  })
}

// 获取权限列表
export const getPermissionList = () => {
  return request({
    url: '/permission/list',
    method: 'get'
  })
}

// 获取权限树
export const getPermissionTree = () => {
  return request({
    url: '/permission/tree',
    method: 'get'
  })
}
