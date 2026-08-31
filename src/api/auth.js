import request from '@/utils/request'

/**
 * 微信登录（小程序端）
 */
export const wxLogin = (data) => {
  return request({
    url: '/auth/wx/login',
    method: 'post',
    data
  })
}

/**
 * PC端登录（账号密码）
 */
export const adminLogin = (data) => {
  return request({
    url: '/auth/admin/login',
    method: 'post',
    data
  })
}

/**
 * 退出登录
 */
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
