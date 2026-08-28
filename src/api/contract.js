import request from '@/utils/request'

// 获取合同列表
export const getContractList = (params) => {
  return request({
    url: '/contract/list',
    method: 'get',
    params
  })
}

// 获取合同详情
export const getContractDetail = (id) => {
  return request({
    url: `/contract/${id}`,
    method: 'get'
  })
}

// 创建合同
export const createContract = (data) => {
  return request({
    url: '/contract',
    method: 'post',
    data
  })
}

// 更新合同
export const updateContract = (id, data) => {
  return request({
    url: `/contract/${id}`,
    method: 'put',
    data
  })
}

// 终止合同
export const terminateContract = (id, reason) => {
  return request({
    url: `/contract/${id}/terminate`,
    method: 'put',
    params: { reason }
  })
}
