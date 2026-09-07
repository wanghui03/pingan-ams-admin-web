import request from '@/utils/request'

// 获取房源列表
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

// 获取所有楼栋
export const getAllBuildings = () => {
  return request({
    url: '/building/all',
    method: 'get'
  })
}

// 获取房间抄表记录
export const getRoomMeterReadings = (roomId, params) => {
  return request({
    url: `/room/${roomId}/meter-readings`,
    method: 'get',
    params
  })
}

// 获取房间账单列表
export const getRoomBills = (roomId, params) => {
  return request({
    url: `/room/${roomId}/bills`,
    method: 'get',
    params
  })
}

// 获取房间工单列表
export const getRoomWorkOrders = (roomId, params) => {
  return request({
    url: `/room/${roomId}/workorders`,
    method: 'get',
    params
  })
}
