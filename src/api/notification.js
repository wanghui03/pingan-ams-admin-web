import request from '@/utils/request'

/**
 * 创建通知
 */
export const createNotification = (data) => {
  return request({
    url: '/notification',
    method: 'post',
    data
  })
}

/**
 * 标记通知为已读
 */
export const markNotificationAsRead = (notificationId) => {
  return request({
    url: `/notification/${notificationId}/read`,
    method: 'put'
  })
}

/**
 * 标记所有通知为已读
 */
export const markAllNotificationsAsRead = () => {
  return request({
    url: '/notification/read-all',
    method: 'put'
  })
}

/**
 * 删除通知
 */
export const deleteNotification = (notificationId) => {
  return request({
    url: `/notification/${notificationId}`,
    method: 'delete'
  })
}

/**
 * 分页查询通知列表
 */
export const getNotificationList = (params) => {
  return request({
    url: '/notification/list',
    method: 'get',
    params
  })
}

/**
 * 获取未读通知数量
 */
export const getUnreadNotificationCount = () => {
  return request({
    url: '/notification/unread-count',
    method: 'get'
  })
}
