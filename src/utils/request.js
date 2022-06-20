import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import { isCheckTimeout } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加icode
    config.headers.icode = 'EE5E29F169B94E59'
    // 在这个位置需要统一的去注入token
    if (store.getters.token) {
      if (isCheckTimeout()) {
        // 退出操作
        store.dispatch('user/logout')
        return Promise.reject(new Error('token失效'))
      }
      // 如果token存在 注入token
      config.headers.Authorization = `Bearer ${store.getters.token}`
    }
    // 配置接口国际化
    config.headers['Accept-Language'] = store.getters.language
    return config // 必须返回配置
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const {
      success,
      message,
      data
    } = response.data
    //   要根据success的成功与否决定下面的操作
    if (success) {
      return data
    } else {
      // 业务错误
      ElMessage.error(message) // 提示错误消息
      return Promise.reject(new Error(message))
    }
  },
  // 请求失败
  error => {
    // token 过期了
    if (error.response &&
      error.response.data &&
      error.response.data.code === 401) {
      // token 超时
      store.dispatch('user/logout')
    }
    // TODO: 将来处理 token 超时问题
    ElMessage.error(error.message)
    // 提示错误信息
    return Promise.reject(error)
  }
)

export default service
