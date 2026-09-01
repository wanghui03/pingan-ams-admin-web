import { useUserStore } from '@/stores/user'

/**
 * 权限指令
 * 使用方式：
 * v-permission="'building:create'" - 检查功能权限
 * v-permission:role="'admin'" - 检查角色权限
 * 
 * 兼容模式：
 * - 超级管理员(userType=0)和租户管理员(userType=3)默认显示所有按钮
 * - 未配置权限时默认显示（兼容未开启RBAC的情况）
 */
export const vPermission = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { value, arg } = binding
    
    // 超级管理员和租户管理员直接放行
    if (userStore.userInfo.userType === 0 || userStore.userInfo.userType === 3) {
      return
    }
    
    // 如果用户没有加载到权限列表，默认显示（兼容未开启RBAC的情况）
    if (!userStore.permissions || userStore.permissions.length === 0) {
      return
    }
    
    if (arg === 'role') {
      // 角色权限校验
      if (!userStore.hasRole(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      // 功能权限校验
      if (!userStore.hasPermission(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  },
  updated(el, binding) {
    const userStore = useUserStore()
    const { value, oldValue, arg } = binding
    
    if (value !== oldValue) {
      // 超级管理员和租户管理员直接放行
      if (userStore.userInfo.userType === 0 || userStore.userInfo.userType === 3) {
        return
      }
      
      if (!userStore.permissions || userStore.permissions.length === 0) {
        return
      }
      
      if (arg === 'role') {
        if (!userStore.hasRole(value)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      } else {
        if (!userStore.hasPermission(value)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      }
    }
  }
}

export default vPermission
