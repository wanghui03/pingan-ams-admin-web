/**
 * 表单校验工具类
 * 提供常用的表单校验规则，配合 Element Plus 表单使用
 */

/**
 * 手机号校验（中国大陆11位手机号）
 * 支持 13x, 14x, 15x, 16x, 17x, 18x, 19x 等号段
 */
export const isPhone = (value) => {
  if (!value) return false
  const reg = /^1[3-9]\d{9}$/
  return reg.test(value)
}

/**
 * 手机号校验规则（用于 el-form rules）
 */
export const phoneRule = {
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!isPhone(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 手机号可选填校验规则
 */
export const phoneRuleOptional = {
  validator: (rule, value, callback) => {
    if (value && !isPhone(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 身份证号校验（中国大陆18位身份证号）
 */
export const isIdCard = (value) => {
  if (!value) return false
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  if (!reg.test(value)) return false
  
  // 校验码验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(value[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  return value[17].toUpperCase() === checkCode
}

/**
 * 身份证号校验规则（用于 el-form rules）
 */
export const idCardRule = {
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入身份证号'))
    } else if (!isIdCard(value)) {
      callback(new Error('请输入正确的身份证号'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 身份证号可选填校验规则
 */
export const idCardRuleOptional = {
  validator: (rule, value, callback) => {
    if (value && !isIdCard(value)) {
      callback(new Error('请输入正确的身份证号'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 邮箱校验
 */
export const isEmail = (value) => {
  if (!value) return false
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(value)
}

/**
 * 邮箱校验规则（用于 el-form rules）
 */
export const emailRule = {
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入邮箱'))
    } else if (!isEmail(value)) {
      callback(new Error('请输入正确的邮箱地址'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 邮箱可选填校验规则
 */
export const emailRuleOptional = {
  validator: (rule, value, callback) => {
    if (value && !isEmail(value)) {
      callback(new Error('请输入正确的邮箱地址'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 金额校验（正数，最多两位小数）
 */
export const isAmount = (value) => {
  if (!value && value !== 0) return false
  const reg = /^\d+(\.\d{1,2})?$/
  return reg.test(value) && parseFloat(value) >= 0
}

/**
 * 金额校验规则（用于 el-form rules）
 */
export const amountRule = {
  validator: (rule, value, callback) => {
    if (value === '' || value === null || value === undefined) {
      callback(new Error('请输入金额'))
    } else if (!isAmount(value)) {
      callback(new Error('请输入正确的金额（最多两位小数）'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 金额可选填校验规则
 */
export const amountRuleOptional = {
  validator: (rule, value, callback) => {
    if (value !== '' && value !== null && value !== undefined && !isAmount(value)) {
      callback(new Error('请输入正确的金额（最多两位小数）'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 用户名校验（字母开头，4-20位字母数字下划线）
 */
export const isUsername = (value) => {
  if (!value) return false
  const reg = /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/
  return reg.test(value)
}

/**
 * 用户名校验规则（用于 el-form rules）
 */
export const usernameRule = {
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入用户名'))
    } else if (!isUsername(value)) {
      callback(new Error('用户名需字母开头，4-20位字母数字下划线'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 密码校验（6-20位，至少包含字母和数字）
 */
export const isPassword = (value) => {
  if (!value) return false
  if (value.length < 6 || value.length > 20) return false
  // 至少包含一个字母和一个数字
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  return hasLetter && hasNumber
}

/**
 * 密码校验规则（用于 el-form rules）
 */
export const passwordRule = {
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入密码'))
    } else if (!isPassword(value)) {
      callback(new Error('密码需6-20位，至少包含字母和数字'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 确认密码校验规则
 * @param {string} passwordField - 密码字段的名称
 */
export const confirmPasswordRule = (passwordField = 'password') => ({
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请再次输入密码'))
    } else if (value !== rule.model[passwordField]) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
})

/**
 * 整数校验（正整数）
 */
export const isPositiveInteger = (value) => {
  if (value === '' || value === null || value === undefined) return false
  const reg = /^[1-9]\d*$/
  return reg.test(value)
}

/**
 * 正整数校验规则（用于 el-form rules）
 */
export const positiveIntegerRule = {
  validator: (rule, value, callback) => {
    if (value === '' || value === null || value === undefined) {
      callback(new Error('请输入数值'))
    } else if (!isPositiveInteger(value)) {
      callback(new Error('请输入正整数'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

/**
 * 通用必填校验
 */
export const requiredRule = (message = '此项为必填项') => ({
  required: true,
  message,
  trigger: 'blur'
})

/**
 * 长度范围校验
 */
export const lengthRangeRule = (min, max, message) => ({
  validator: (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入内容'))
    } else if (value.length < min || value.length > max) {
      callback(new Error(message || `长度需在${min}-${max}个字符之间`))
    } else {
      callback()
    }
  },
  trigger: 'blur'
})

// 默认导出
export default {
  isPhone,
  phoneRule,
  phoneRuleOptional,
  isIdCard,
  idCardRule,
  idCardRuleOptional,
  isEmail,
  emailRule,
  emailRuleOptional,
  isAmount,
  amountRule,
  amountRuleOptional,
  isUsername,
  usernameRule,
  isPassword,
  passwordRule,
  confirmPasswordRule,
  isPositiveInteger,
  positiveIntegerRule,
  requiredRule,
  lengthRangeRule
}
