import axios from 'axios'
// import {Message} from "element-ui";
// import storage from "@/utils/storage"

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
}
const request = axios.create({
  // API 请求的默认前缀
  // baseURL: 'https://s.taobao.com/',
  timeout: 20000 // 请求超时时间 20s
})

// 异常拦截处理器
const errorHandler = (error: any) => {
  const { response, message } = error
  const { status, statusText, data, config = {} } = response || {}
  console.log('error:', error)
  //  日志记录请求的链接
  // const log_data = {
  //   title: 'amz api (error)：' + config.baseURL + config.url
  // }
  // 如果有错误配置才添加错误日志
  if(Object.keys(config).length) {
    // storage.addNew_BgLog(log_data)
  }

  let info = {}

  // 断网 或者 请求超时 状态
  if (!response) {
    // 请求超时状态
    if (message.includes('timeout')) {
      console.log('taobao 访问 超时了')
      info = {
        code: 5000,
        msg: 'Network Error'
      }
    } else {
      // 可以展示断网组件
      console.log('taobao 访问 断网了')
      info = {
        code: status,
        data: data,
        msg: statusText
      }
    }
    return Promise.reject(info)
  }
  console.error(data.message && data.message || codeMessage[status] || '未知错误！')
  // Message({
  //   message: data.message && data.message || codeMessage[status] || '未知错误！',
  //   type: 'error',
  //   duration: 5 * 1000
  // })
  return Promise.reject(error)
}

request.interceptors.request.use(config => {
  // console.log('request:', config)
  return config
})

// response interceptor
request.interceptors.response.use(
  (response) => {
    console.log('taobao_response:', response)
    const { config = {} } = response
    //  日志记录请求的链接
    // const log_data = {
    //   title: '请求链接(response)：' + config.baseURL + config.url
    // }
    // storage.addNew_BgLog(log_data)

    if(config.responseAll === true) {
      return response
    }
    return response.data
  },
  errorHandler
)

export default request
