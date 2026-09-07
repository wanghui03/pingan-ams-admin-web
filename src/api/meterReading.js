import request from '@/utils/request'

// 获取抄表记录列表
export const getMeterReadingList = (params) => {
  return request({
    url: '/meter-reading/list',
    method: 'get',
    params
  })
}

// 获取抄表记录详情
export const getMeterReadingDetail = (id) => {
  return request({
    url: `/meter-reading/${id}`,
    method: 'get'
  })
}

// 新增抄表记录
export const addMeterReading = (data) => {
  return request({
    url: '/meter-reading',
    method: 'post',
    data
  })
}

// 为抄表记录生成账单
export const generateBillFromReading = (id) => {
  return request({
    url: `/meter-reading/${id}/generate-bill`,
    method: 'post'
  })
}
