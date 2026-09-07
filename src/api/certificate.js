import request from '@/utils/request'

// 获取证件信息
export const getCertificate = (params) => {
  return request({
    url: '/certificate',
    method: 'get',
    params
  })
}

// 保存或更新证件信息
export const saveOrUpdateCertificate = (data) => {
  return request({
    url: '/certificate',
    method: 'post',
    data
  })
}

// 删除证件信息
export const deleteCertificate = (params) => {
  return request({
    url: '/certificate',
    method: 'delete',
    params
  })
}
