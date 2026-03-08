import request from "@/utils/request";

// 获取帖子列表（分页）
export const getPostList = (params: {
  Page: number;
  PageSize: number;
  SortBy?: string;
  SortOrder?: string;
}) => {
  return request({
    url: "/post",
    method: "get",
    params,
  });
};

// 根据ID获取帖子详情
export const getPostById = (id: number, currentUserId?: number) => {
  return request({
    url: `/post/${id}`,
    method: "get",
    params: currentUserId ? { currentUserId } : {},
  });
};

// 根据用户ID获取帖子列表
export const getPostsByUserId = (userId: number, limit?: number) => {
  return request({
    url: `/post/user/${userId}`,
    method: "get",
    params: limit ? { limit } : {},
  });
};

// 根据宠物ID获取帖子列表
export const getPostsByPetId = (petId: number, limit?: number) => {
  return request({
    url: `/post/pet/${petId}`,
    method: "get",
    params: limit ? { limit } : {},
  });
};

// 创建帖子
export const createPost = (data: {
  UserId: number;
  PetId: number;
  Content: string;
  Location?: string;
  Visibility: string;
}) => {
  return request({
    url: "/post",
    method: "post",
    data,
  });
};

// 更新帖子信息
export const updatePost = (id: number, data: {
  Content?: string;
  Location?: string;
  Visibility?: string;
}) => {
  return request({
    url: `/post/${id}`,
    method: "put",
    data,
  });
};

// 删除帖子（软删除）
export const deletePost = (id: number) => {
  return request({
    url: `/post/${id}`,
    method: "delete",
  });
};

// 创建评论
export const createComment = (data: {
  PostId: number;
  UserId: number;
  Content: string;
}) => {
  return request({
    url: "/post/comment",
    method: "post",
    data,
  });
};

// 点赞/取消点赞
export const likePost = (data: {
  PostId: number;
  UserId: number;
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

// 上传完整post信息
export const uploadPost = (data: {
  UserId: number;
  PetId: number;
  Content: string;
  Location: string;
  Visibility: string;
  Files: File[];
}) => {
  const formData = new FormData();
  formData.append("UserId", data.UserId.toString());
  formData.append("PetId", data.PetId.toString());
  formData.append("Content", data.Content);
  formData.append("Location", data.Location);
  formData.append("Visibility", data.Visibility);
  data.Files.forEach((file) => {
    formData.append("Files", file);
  });
  return request({
    url: "/post/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// 获取推荐帖子列表
export const getRecommendedPosts = (limit?: number) => {
  return request({
    url: "/post/recommended",
    method: "get",
    params: limit ? { limit } : {},
  });
};