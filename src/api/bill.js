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

// 标记账单已支付
export const markAsPaid = (id, paidAmount, transactionNo) => {
  return request({
    url: `/bill/${id}/pay`,
    method: 'put',
    params: { paidAmount, transactionNo }
  })
}

// 取消账单
export const cancelBill = (id, reason) => {
  return request({
    url: `/bill/${id}/cancel`,
    method: 'put',
    params: { reason }
  })
}

// 获取待支付总金额
export const getUnpaidAmount = () => {
  return request({
    url: '/bill/unpaid-amount',
    method: 'get'
  })
}
