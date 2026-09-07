import request from '@/utils/request'

// 创建字典
export const createDict = (data) => {
  return request({
    url: '/dict',
    method: 'post',
    data
  })
}

// 更新字典
export const updateDict = (id, data) => {
  return request({
    url: `/dict/${id}`,
    method: 'put',
    data
  })
}

// 删除字典
export const deleteDict = (id) => {
  return request({
    url: `/dict/${id}`,
    method: 'delete'
  })
}

// 获取字典详情
export const getDictDetail = (id) => {
  return request({
    url: `/dict/${id}`,
    method: 'get'
  })
}

// 分页查询字典
export const getDictList = (params) => {
  return request({
    url: '/dict/list',
    method: 'get',
    params
  })
}

// 根据字典类型获取字典列表
export const getDictsByType = (dictType) => {
  return request({
    url: `/dict/type/${dictType}`,
    method: 'get'
  })
}

// 获取所有字典类型
export const getAllDictTypes = () => {
  return request({
    url: '/dict/types',
    method: 'get'
  })
}
