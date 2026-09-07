import request from '@/utils/request'

// 获取首页统计数据
export const getDashboardStats = () => {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

// 获取房源概览
export const getPropertyOverview = () => {
  return request({
    url: '/dashboard/property',
    method: 'get'
  })
}

// 获取租金收入统计
export const getIncomeStats = (params) => {
  return request({
    url: '/dashboard/income',
    method: 'get',
    params
  })
}

// 获取账单统计
export const getBillStats = () => {
  return request({
    url: '/dashboard/bills',
    method: 'get'
  })
}

// 获取待办事项
export const getTodos = () => {
  return request({
    url: '/dashboard/todos',
    method: 'get'
  })
}

// 获取最近合同
export const getRecentContracts = (limit = 5) => {
  return request({
    url: '/dashboard/contracts',
    method: 'get',
    params: { limit }
  })
}
