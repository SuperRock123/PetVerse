import request from "@/utils/request";

// 用户登录
export const login = (data: {
  usernameOrEmail: string;
  password: string;
}) => {
  return request({
    url: "/user/login",
    method: "post",
    data,
  });
};

// 获取用户列表
export const getUserList = (params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}) => {
  return request({
    url: "/user",
    method: "get",
    params,
  });
};

// 获取用户详情
export const getUserById = (id: number) => {
  return request({
    url: `/user/${id}`,
    method: "get",
  });
};

// 创建用户
export const createUser = (data: {
  username: string;
  nickname: string;
  phone: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
}) => {
  return request({
    url: "/user",
    method: "post",
    data,
  });
};

// 更新用户信息
export const updateUser = (id: number, data: {
  nickname?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}) => {
  return request({
    url: `/user/${id}`,
    method: "put",
    data,
  });
};

// 删除用户
export const deleteUser = (id: number) => {
  return request({
    url: `/user/${id}`,
    method: "delete",
  });
};

// 检查用户名是否可用
export const checkUsername = (username: string) => {
  return request({
    url: `/user/check-username/${username}`,
    method: "get",
  });
};

// 检查邮箱是否可用
export const checkEmail = (email: string) => {
  return request({
    url: `/user/check-email/${email}`,
    method: "get",
  });
};
