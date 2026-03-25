import request from "@/utils/request";

export interface PostQueryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  petId?: number;
  keyword?: string;
  visibility?: number;
  status?: number;
  fromDate?: string;
  toDate?: string;
}

export interface PostResponse {
  id: number;
  userId: number;
  petId: number | null;
  content: string;
  mediaUrls: string[];
  location: string;
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  mediaCount: number | null;
  visibility: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  userName: string;
  userAvatar: string | null;
  nickname: string | null;
  petName: string | null;
  petAvatar: string | null;
  isLiked?: boolean;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PostListResult {
  posts: PostResponse[];
  pagination: PaginationInfo;
}

export interface CreatePostRequest {
  userId: number;
  petId?: number;
  content: string;
  location?: string;
  visibility: number;
  mediaIds?: number[];
}

export interface UpdatePostRequest {
  content?: string;
  location?: string;
  visibility?: number;
}

export interface CreateCommentRequest {
  postId: number;
  userId: number;
  parentId?: number;
  content: string;
}

export interface CommentInfo {
  id: number;
  userId: number;
  postId: number;
  parentId: number | null;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
  nickname: string | null;
  replies: CommentInfo[];
}

export interface LikeRequest {
  targetType: string;
  targetId: number;
  userId: number;
}

export interface UploadPostRequest {
  userId: number;
  petId?: number;
  content: string;
  location?: string;
  visibility: number;
  files: File[];
}

export const getPostList = (params: PostQueryParams = {}) => {
  return request({
    url: "/Post",
    method: "get",
    params: {
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      UserId: params.userId,
      PetId: params.petId,
      Keyword: params.keyword,
      Visibility: params.visibility,
      Status: params.status,
      FromDate: params.fromDate,
      ToDate: params.toDate,
    },
  });
};

export const getPostById = (id: number, currentUserId?: number) => {
  return request({
    url: `/Post/${id}`,
    method: "get",
    params: currentUserId ? { currentUserId } : {},
  });
};

export const getPostsByUserId = (userId: number, limit: number = 50) => {
  return request({
    url: `/Post/user/${userId}`,
    method: "get",
    params: { limit },
  });
};

export const getPostsByPetId = (petId: number, limit: number = 50) => {
  return request({
    url: `/Post/pet/${petId}`,
    method: "get",
    params: { limit },
  });
};

export const createPost = (data: CreatePostRequest) => {
  return request({
    url: "/Post",
    method: "post",
    data: {
      UserId: data.userId,
      PetId: data.petId,
      Content: data.content,
      Location: data.location,
      Visibility: data.visibility,
      MediaIds: data.mediaIds
    }
  });
};

export const updatePost = (id: number, data: UpdatePostRequest) => {
  return request({
    url: `/Post/${id}`,
    method: "put",
    data,
  });
};

export const deletePost = (id: number) => {
  return request({
    url: `/Post/${id}`,
    method: "delete",
  });
};

export const createComment = (data: CreateCommentRequest) => {
  return request({
    url: "/Post/comment",
    method: "post",
    data,
  });
};

export const deleteComment = (commentId: number, userId: number) => {
  return request({
    url: `/Post/comment/${commentId}`,
    method: "delete",
    params: { userId },
  });
};

export const getCommentsByPostId = (postId: number, currentUserId?: number) => {
  return request({
    url: `/Post/${postId}/comments`,
    method: "get",
    params: currentUserId ? { currentUserId } : {},
  });
};

export const toggleLike = (data: LikeRequest) => {
  return request({
    url: "/Post/like",
    method: "post",
    data,
  });
};

export const checkPostExists = (id: number) => {
  return request({
    url: `/Post/${id}/exists`,
    method: "get",
  });
};

export const verifyPostBelongsToUser = (postId: number, userId: number) => {
  return request({
    url: `/Post/${postId}/belongs-to/${userId}`,
    method: "get",
  });
};

export const uploadPost = (data: UploadPostRequest) => {
  const formData = new FormData();
  formData.append("UserId", data.userId.toString());
  if (data.petId) {
    formData.append("PetId", data.petId.toString());
  }
  formData.append("Content", data.content);
  if (data.location) {
    formData.append("Location", data.location);
  }
  formData.append("Visibility", data.visibility.toString());
  data.files.forEach((file) => {
    formData.append("Files", file);
  });
  return request({
    url: "/Post/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getRecommendedPosts = (limit: number = 20) => {
  return request({
    url: "/Post/recommended",
    method: "get",
    params: { limit },
  });
};
