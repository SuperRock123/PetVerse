import request from "@/utils/request";

// 获取宠物列表
export const getPetList = (params: {
  page?: number;
  pageSize?: number;
  userId?: number;
  keyword?: string;
  breed?: string;
  gender?: number;
}) => {
  return request({
    url: "/pet",
    method: "get",
    params,
  });
};

// 获取宠物详情
export const getPetById = (id: number) => {
  return request({
    url: `/pet/${id}`,
    method: "get",
  });
};

// 根据用户ID获取宠物列表
export const getPetsByUserId = (userId: number) => {
  return request({
    url: `/pet/user/${userId}`,
    method: "get",
  });
};

// 创建宠物
export const createPet = (data: {
  userId: number;
  name: string;
  breed: string;
  gender: number;
  birthday: string;
  weightKg: number;
  healthStatus: string;
  avatarUrl?: string;
  pettagId?: string;
}) => {
  return request({
    url: "/pet",
    method: "post",
    data,
  });
};

// 更新宠物信息
export const updatePet = (id: number, data: {
  name?: string;
  breed?: string;
  gender?: number;
  birthday?: string;
  weightKg?: number;
  healthStatus?: string;
  avatarUrl?: string;
  pettagId?: string;
}) => {
  return request({
    url: `/pet/${id}`,
    method: "put",
    data,
  });
};

// 删除宠物
export const deletePet = (id: number) => {
  return request({
    url: `/pet/${id}`,
    method: "delete",
  });
};

// 检查宠物是否存在
export const checkPetExists = (id: number) => {
  return request({
    url: `/pet/${id}/exists`,
    method: "get",
  });
};

// 验证宠物归属关系
export const verifyPetBelongsToUser = (petId: number, userId: number) => {
  return request({
    url: `/pet/${petId}/belongs-to/${userId}`,
    method: "get",
  });
};
