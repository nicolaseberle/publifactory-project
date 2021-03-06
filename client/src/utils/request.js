import axios from 'axios'
import { Message } from 'element-ui'
import store from '../store'
import { getToken } from './auth.js'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api  base_url
  timeout: 5000 // request timeout
})
// request interceptor

service.interceptors.request.use(
  config => {
    console.log('interceptors') // for debug
    // Do something before request is sent
    if (store.getters.token) {
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => response,

  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
