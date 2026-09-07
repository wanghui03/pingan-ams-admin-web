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

// 删除合同
export const deleteContract = (id) => {
  return request({
    url: `/contract/${id}`,
    method: 'delete'
  })
}

// 审核合同
export const auditContract = (id, data) => {
  return request({
    url: `/contract/${id}/audit`,
    method: 'post',
    data
  })
}

// 获取合同变更列表
export const getContractChangeList = (params) => {
  return request({
    url: '/contract/change/list',
    method: 'get',
    params
  })
}

// 创建合同变更
export const createContractChange = (data) => {
  return request({
    url: '/contract/change',
    method: 'post',
    data
  })
}

// 审核合同变更
export const auditContractChange = (id, data) => {
  return request({
    url: `/contract/change/${id}/audit`,
    method: 'post',
    data
  })
}
