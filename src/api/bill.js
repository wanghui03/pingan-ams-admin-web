import request from '@/utils/request'

// 获取账单列表
export const getBillList = (params) => {
  return request({
    url: '/bill/list',
    method: 'get',
    params
  })
}

// 获取账单详情
export const getBillDetail = (id) => {
  return request({
    url: `/bill/${id}`,
    method: 'get'
  })
}

// 创建账单
export const createBill = (data) => {
  return request({
    url: '/bill',
    method: 'post',
    data
  })
}

// 更新账单
export const updateBill = (id, data) => {
  return request({
    url: `/bill/${id}`,
    method: 'put',
    data
  })
}

// 删除账单
export const deleteBill = (id) => {
  return request({
    url: `/bill/${id}`,
    method: 'delete'
  })
}

// 确认收款
export const confirmPayment = (id, data) => {
  return request({
    url: `/bill/${id}/pay`,
    method: 'post',
    data
  })
}

// 发送账单提醒
export const sendBillReminder = (id) => {
  return request({
    url: `/bill/${id}/remind`,
    method: 'post'
  })
}
