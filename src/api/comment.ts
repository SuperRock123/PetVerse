import request from "@/utils/request";

export interface CreateCommentRequest {
  userId: number;
  postId: number;
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

export interface CommentQueryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  postId?: number;
  parentId?: number;
  content?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface CommentListResult {
  comments: CommentInfo[];
  pagination: PaginationInfo;
}

// 创建评论
export const createComment = (data: CreateCommentRequest) => {
  return request({
    url: "/comment",
    method: "post",
    data: {
      userId: data.userId,
      postId: data.postId,
      parentId: data.parentId,
      content: data.content
    }
  });
};

// 删除评论
export const deleteComment = (commentId: number, userId: number) => {
  return request({
    url: `/comment/${commentId}`,
    method: "delete",
    params: { userId }
  });
};

// 获取帖子评论列表（树形结构）
export const getPostComments = (postId: number, currentUserId?: number) => {
  return request({
    url: `/comment/post/${postId}`,
    method: "get",
    params: currentUserId ? { currentUserId } : {}
  });
};

// 条件查询评论（分页）
export const getComments = (params: CommentQueryParams = {}) => {
  return request({
    url: "/comment",
    method: "get",
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      userId: params.userId,
      postId: params.postId,
      parentId: params.parentId,
      content: params.content,
      fromDate: params.fromDate,
      toDate: params.toDate
    }
  });
};
