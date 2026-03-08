import { defineStore } from "pinia";
import { ref } from "vue";
import { storage } from "@/utils/storage";
import { login, createUser } from "@/api/user";
import { store } from "@/store";

interface LoginData {
  usernameOrEmail: string;
  password: string;
}

interface RegisterData {
  username: string;
  nickname: string;
  phone: string;
  email: string;
  password: string;
}

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
  const token = ref<string>(storage.get<string>("token") || "");
  const userInfo = ref<UserInfo | null>(storage.get<UserInfo>("userInfo") || null);
  const isLogin = ref<boolean>(!!token.value);

  const setToken = (token: string) => {
    token.value = token;
    // 直接存储字符串，不需要JSON.stringify
    localStorage.setItem("token", token);
  };

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info;
    storage.set("userInfo", info);
  };

  const getToken = () => {
    return token.value;
  };

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

export function useUserStore() {
  return userStore(store);
}
