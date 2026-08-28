import request from '@/utils/request'

// 获取楼栋列表
export const getBuildingList = (params) => {
  return request({
    url: '/building/list',
    method: 'get',
    params
  })
}

// 获取所有楼栋（下拉选择用）
export const getAllBuildings = () => {
  return request({
    url: '/building/all',
    method: 'get'
  })
}

// 获取楼栋详情
export const getBuildingDetail = (id) => {
  return request({
    url: `/building/${id}`,
    method: 'get'
  })
}

// 创建楼栋
export const createBuilding = (data) => {
  return request({
    url: '/building',
    method: 'post',
    data
  })
}

// 更新楼栋
export const updateBuilding = (id, data) => {
  return request({
    url: `/building/${id}`,
    method: 'put',
    data
  })
}

// 删除楼栋
export const deleteBuilding = (id) => {
  return request({
    url: `/building/${id}`,
    method: 'delete'
  })
}
