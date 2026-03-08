import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";

// 创建 axios 实例
const service = axios.create({
  // baseURL: import.meta.env.VITE_APP_BASE_API,
  baseURL: "http://localhost:5127/api",
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { success, message, data, statusCode } = response.data;
    console.log(response.data);
    if (success && (statusCode === 200 || statusCode === 201)) {
      return response.data;
    }
    // 响应数据为二进制流处理(Excel导出)
    if (response.data instanceof ArrayBuffer) {
      return response;
    }

    const errorMessage = message || "Error";
    if (import.meta.env.DEV) {
      ElMessage.error(errorMessage);
    }
    return Promise.reject(new Error(errorMessage));
  },
  (error: any) => {
    let errorMessage = "网络请求失败";
    
    if (error.response) {
      // 服务器返回错误
      const { data, status } = error.response;
      
      if (data && data.message) {
        errorMessage = data.message;
      } else {
        switch (status) {
          case 400:
            errorMessage = "请求参数错误";
            break;
          case 401:
            errorMessage = "未授权，请重新登录";
            // 可以在这里处理登录过期逻辑
            break;
          case 403:
            errorMessage = "拒绝访问";
            break;
          case 404:
            errorMessage = "请求地址不存在";
            break;
          case 500:
            errorMessage = "服务器内部错误";
            break;
          default:
            errorMessage = `请求失败 (${status})`;
        }
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = "网络连接失败，请检查网络";
    } else {
      // 请求配置出错
      errorMessage = error.message || "请求失败";
    }
    
    if (import.meta.env.DEV) {
      ElMessage.error(errorMessage);
    }
    
    return Promise.reject(errorMessage);
  }
);

// 导出 axios 实例
export default service;
