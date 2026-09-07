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
    url: '/workorder',
    method: 'post',
    data
  })
}

// 更新工单
export const updateWorkOrder = (id, data) => {
  return request({
    url: `/work-order/${id}`,
    method: 'put',
    data
  })
}

// 删除工单
export const deleteWorkOrder = (id) => {
  return request({
    url: `/work-order/${id}`,
    method: 'delete'
  })
}

// 分配工单
export const assignWorkOrder = (id, data) => {
  return request({
    url: `/work-order/${id}/assign`,
    method: 'post',
    data
  })
}

// 处理工单
export const processWorkOrder = (id, data) => {
  return request({
    url: `/work-order/${id}/process`,
    method: 'post',
    data
  })
}

// 关闭工单
export const closeWorkOrder = (id, data) => {
  return request({
    url: `/work-order/${id}/close`,
    method: 'post',
    data
  })
}
