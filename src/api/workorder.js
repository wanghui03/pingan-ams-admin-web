import request from '@/utils/request'

// 获取工单列表
export const getWorkOrderList = (params) => {
  return request({
    url: '/work-order/list',
    method: 'get',
    params
  })
}

// 获取工单详情
export const getWorkOrderDetail = (id) => {
  return request({
    url: `/work-order/${id}`,
    method: 'get'
  })
}

// 创建工单
export const createWorkOrder = (data) => {
  return request({
    url: '/work-order',
    method: 'post',
    data
  })
}

// 分配工单
export const assignWorkOrder = (id, handlerId) => {
  return request({
    url: `/work-order/${id}/assign`,
    method: 'put',
    params: { handlerId }
  })
}

// 处理工单
export const handleWorkOrder = (id, handleResult, handleImages) => {
  return request({
    url: `/work-order/${id}/handle`,
    method: 'put',
    params: { handleResult, handleImages }
  })
}

// 完成工单
export const completeWorkOrder = (id) => {
  return request({
    url: `/work-order/${id}/complete`,
    method: 'put'
  })
}

// 关闭工单
export const closeWorkOrder = (id) => {
  return request({
    url: `/work-order/${id}/close`,
    method: 'put'
  })
}
