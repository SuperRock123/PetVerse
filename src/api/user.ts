import request from "@/utils/request";

// 用户登录
export const login = (data: { usernameOrEmail: string; password: string }) => {
  return request({
    url: "/user/login",
    method: "post",
    data,
  });
};

// 获取用户列表（分页）
export const getUserList = (params: { Page: number; PageSize: number; SortBy?: string; SortOrder?: string }) => {
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

// 用户注册
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
    url: "/User/register",
    method: "post",
    data,
  });
};

// 更新用户信息
export const updateUser = (
  id: number,
  data: {
    Username?: string;
    Email?: string;
    Phone?: string;
    Avatar?: string;
    Bio?: string;
  }
) => {
  return request({
    url: `/user/${id}`,
    method: "put",
    data,
  });
};

// 删除用户（软删除）
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

// 关注用户
export const followUser = (followerId: number, followedId: number) => {
  return request({
    url: `/UserRelation/follow/${followerId}/${followedId}`,
    method: "post",
  });
};

// 取消关注用户
export const unfollowUser = (followerId: number, followedId: number) => {
  return request({
    url: `/UserRelation/unfollow/${followerId}/${followedId}`,
    method: "post",
  });
};

// 检查是否已关注
export const checkFollowing = (followerId: number, followedId: number) => {
  return request({
    url: `/UserRelation/check/${followerId}/${followedId}`,
    method: "get",
  });
};

// 获取用户的粉丝列表
export const getFollowers = (userId: number, page: number = 1, pageSize: number = 20) => {
  return request({
    url: `/UserRelation/followers/${userId}`,
    method: "get",
    params: { page, pageSize },
  });
};

// 获取用户关注的列表
export const getFollowings = (userId: number, page: number = 1, pageSize: number = 20) => {
  return request({
    url: `/UserRelation/followings/${userId}`,
    method: "get",
    params: { page, pageSize },
  });
};

// 获取用户的粉丝数量
export const getFollowerCount = (userId: number) => {
  return request({
    url: `/UserRelation/followers/count/${userId}`,
    method: "get",
  });
};

// 获取用户关注的数量
export const getFollowingCount = (userId: number) => {
  return request({
    url: `/UserRelation/followings/count/${userId}`,
    method: "get",
  });
};

// 获取用户统计信息
export const getUserStats = (userId: number) => {
  return request({
    url: `/user/${userId}`,
    method: "get",
  });
};
