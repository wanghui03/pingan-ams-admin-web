import request from '@/utils/request'

/**
 * 创建合同变更申请
 */
export const createContractChange = (data) => {
  return request({
    url: '/contract-change',
    method: 'post',
    data
  })
}

/**
 * 审批合同变更申请
 */
export const approveContractChange = (changeId, approved, remark) => {
  return request({
    url: `/contract-change/${changeId}/approve`,
    method: 'put',
    params: { approved, remark }
  })
}

/**
 * 执行合同变更
 */
export const executeContractChange = (changeId) => {
  return request({
    url: `/contract-change/${changeId}/execute`,
    method: 'put'
  })
}

/**
 * 获取变更申请详情
 */
export const getContractChangeDetail = (changeId) => {
  return request({
    url: `/contract-change/${changeId}`,
    method: 'get'
  })
}

/**
 * 分页查询变更申请列表
 */
export const getContractChangeList = (params) => {
  return request({
    url: '/contract-change/list',
    method: 'get',
    params
  })
}

/**
 * 根据合同ID查询变更申请列表
 */
export const getContractChangesByContractId = (contractId) => {
  return request({
    url: `/contract-change/contract/${contractId}`,
    method: 'get'
  })
}
