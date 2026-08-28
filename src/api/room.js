import request from '@/utils/request'

// 获取房间列表
export const getRoomList = (params) => {
  return request({
    url: '/room/list',
    method: 'get',
    params
  })
}

// 获取房间详情
export const getRoomDetail = (id) => {
  return request({
    url: `/room/${id}`,
    method: 'get'
  })
}

// 创建房间
export const createRoom = (data) => {
  return request({
    url: '/room',
    method: 'post',
    data
  })
}

// 更新房间
export const updateRoom = (id, data) => {
  return request({
    url: `/room/${id}`,
    method: 'put',
    data
  })
}

// 删除房间
export const deleteRoom = (id) => {
  return request({
    url: `/room/${id}`,
    method: 'delete'
  })
}
