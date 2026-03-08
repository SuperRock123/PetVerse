/**
 * 用户状态管理
 * 使用Pinia的setup模式定义
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { storage } from "@/utils/storage";
import { login, createUser } from "@/api/user";
import { store } from "@/store";

/**
 * 登录数据接口
 */
interface LoginData {
  usernameOrEmail: string;
  password: string;
}

/**
 * 注册数据接口
 */
interface RegisterData {
  username: string;
  nickname: string;
  phone: string;
  email: string;
  password: string;
}

/**
 * 用户信息接口
 */
interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  phone: string;
  email: string;
  avatarUrl: string;
  bio: string;
  token: string;
}

// 使用setup模式定义
export const userStore = defineStore("userStore", () => {
  /**
   * 令牌
   * 从本地存储初始化，持久化存储
   */
  const token = ref<string>(storage.get<string>("token") || "");
  
  /**
   * 用户信息
   * 从本地存储初始化，持久化存储
   */
  const userInfo = ref<UserInfo | null>(storage.get<UserInfo>("userInfo") || null);
  
  /**
   * 登录状态
   * 根据token值是否存在初始化，非持久化
   */
  const isLogin = ref<boolean>(!!token.value);

  /**
   * 设置令牌
   * @param newToken 令牌字符串
   */
  const setToken = (newToken: string) => {
    token.value = newToken;
    // 直接存储字符串，不需要JSON.stringify
    localStorage.setItem("token", newToken);
  };

  /**
   * 设置用户信息
   * @param info 用户信息对象
   */
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info;
    storage.set("userInfo", info);
  };

  /**
   * 获取令牌
   * @returns 令牌字符串
   */
  const getToken = () => {
    return token.value;
  };

  /**
   * 登录操作
   * @param loginData 登录数据
   * @returns Promise
   */
  const loginAction = (loginData: LoginData) => {
    return new Promise<void>((resolve, reject) => {
      login(loginData)
        .then((res) => {
          if (res.success && res.data) {
            setToken(res.data.token);
            // 构建符合UserInfo接口的用户信息对象
            const userInfoData = {
              id: res.data.user.id,
              username: res.data.user.username,
              nickname: res.data.user.nickname,
              phone: res.data.user.phone,
              email: res.data.user.email,
              avatarUrl: res.data.user.avatarUrl,
              bio: res.data.user.bio,
              token: res.data.token
            };
            setUserInfo(userInfoData);
            isLogin.value = true;
            resolve();
          } else {
            reject(new Error(res.message || "登录失败"));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  /**
   * 注册操作
   * @param registerData 注册数据
   * @returns Promise
   */
  const registerAction = (registerData: RegisterData) => {
    return new Promise<void>((resolve, reject) => {
      createUser(registerData)
        .then((res) => {
          if (res.success) {
            resolve();
          } else {
            reject(new Error(res.message || "注册失败"));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  /**
   * 登出操作
   */
  const logout = () => {
    token.value = "";
    userInfo.value = null;
    isLogin.value = false;
    storage.remove("token");
    storage.remove("userInfo");
  };

  return { 
    token, 
    userInfo, 
    isLogin, 
    setToken, 
    setUserInfo, 
    getToken, 
    loginAction, 
    registerAction, 
    logout 
  };
});

/**
 * 获取用户Store实例
 * @returns 用户Store实例
 */
export function useUserStore() {
  return userStore(store);
}
