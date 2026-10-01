import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(sessionStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(sessionStorage.getItem('userInfo') || '{}'))

  const setToken = (newToken) => {
    token.value = newToken
    sessionStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    sessionStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {}
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userInfo')
  }

  // 获取用户角色列表
  const roles = computed(() => userInfo.value.roles || [])

  // 获取用户权限列表
  const permissions = computed(() => userInfo.value.permissions || [])

  // 检查是否有指定角色
  const hasRole = (role) => {
    return roles.value.includes(role)
  }

  // 检查是否有指定权限
  const hasPermission = (permission) => {
    // 超级管理员拥有所有权限
    if (roles.value.includes('super_admin')) {
      return true
    }
    return permissions.value.includes(permission)
  }

  // 检查是否有任一权限
  const hasAnyPermission = (permissionList) => {
    if (roles.value.includes('super_admin')) {
      return true
    }
    return permissionList.some(p => permissions.value.includes(p))
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    roles,
    permissions,
    hasRole,
    hasPermission,
    hasAnyPermission
  }
})
