import request from "@/utils/request";

// 获取宠物列表（分页）
export const getPetList = (params: {
  Page: number;
  PageSize: number;
  SortBy?: string;
  SortOrder?: string;
}) => {
  return request({
    url: "/Pet",
    method: "get",
    params,
  });
};

// 根据ID获取宠物详情
export const getPetById = (id: number) => {
  return request({
    url: `/Pet/${id}`,
    method: "get",
  });
};

// 根据用户ID获取宠物列表
export const getPetsByUserId = (userId: number) => {
  return request({
    url: `/Pet/user/${userId}`,
    method: "get",
  });
};

// 创建宠物
export const createPet = (data: {
  UserId: number;
  Name: string;
  Breed: string;
  Gender: number;
  Birthday: string;
  WeightKg: number;
  HealthStatus: string;
  Avatar?: string;
  PetTagId?: string;
}) => {
  return request({
    url: "/Pet",
    method: "post",
    data,
  });
};

// 更新宠物信息
export const updatePet = (id: number, data: {
  Name?: string;
  Breed?: string;
  Gender?: number;
  Birthday?: string;
  WeightKg?: number;
  HealthStatus?: string;
  Avatar?: string;
  PetTagId?: string;
}) => {
  return request({
    url: `/Pet/${id}`,
    method: "put",
    data,
  });
};

// 删除宠物（软删除）
export const deletePet = (id: number) => {
  return request({
    url: `/Pet/${id}`,
    method: "delete",
  });
};

// 检查宠物是否存在
export const checkPetExists = (id: number) => {
  return request({
    url: `/Pet/${id}/exists`,
    method: "get",
  });
};

// 验证宠物归属关系
export const verifyPetBelongsToUser = (petId: number, userId: number) => {
  return request({
    url: `/Pet/${petId}/belongs-to/${userId}`,
    method: "get",
  });
};