import request from "@/utils/request";

// 获取帖子列表
export const getPostList = (params: {
  page?: number;
  pageSize?: number;
  userId?: number;
  petId?: number;
  keyword?: string;
  visibility?: number;
  status?: number;
  fromDate?: string;
  toDate?: string;
}) => {
  return request({
    url: "/post",
    method: "get",
    params,
  });
};

// 获取帖子详情
export const getPostById = (id: number, currentUserId?: number) => {
  return request({
    url: `/post/${id}`,
    method: "get",
    params: currentUserId ? { currentUserId } : {},
  });
};

// 根据用户ID获取帖子列表
export const getPostsByUserId = (userId: number) => {
  return request({
    url: `/post/user/${userId}`,
    method: "get",
  });
};

// 根据宠物ID获取帖子列表
export const getPostsByPetId = (petId: number) => {
  return request({
    url: `/post/pet/${petId}`,
    method: "get",
  });
};

// 创建帖子
export const createPost = (data: {
  userId: number;
  petId: number;
  content: string;
  mediaUrls?: string[];
  location?: string;
  visibility: number;
}) => {
  return request({
    url: "/post",
    method: "post",
    data,
  });
};

// 更新帖子信息
export const updatePost = (id: number, data: {
  content?: string;
  mediaUrls?: string[];
  location?: string;
  visibility?: number;
}) => {
  return request({
    url: `/post/${id}`,
    method: "put",
    data,
  });
};

// 删除帖子
export const deletePost = (id: number) => {
  return request({
    url: `/post/${id}`,
    method: "delete",
  });
};

// 创建评论
export const createComment = (data: {
  userId: number;
  postId: number;
  parentId?: number;
  content: string;
}) => {
  return request({
    url: "/post/comment",
    method: "post",
    data,
  });
};

// 点赞/取消点赞
export const like = (data: {
  userId: number;
  targetType: string;
  targetId: number;
}) => {
  return request({
    url: "/post/like",
    method: "post",
    data,
  });
};

// 检查帖子是否存在
export const checkPostExists = (id: number) => {
  return request({
    url: `/post/${id}/exists`,
    method: "get",
  });
};

// 验证帖子归属关系
export const verifyPostBelongsToUser = (postId: number, userId: number) => {
  return request({
    url: `/post/${postId}/belongs-to/${userId}`,
    method: "get",
  });
};
