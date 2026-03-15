import request from "@/utils/request";

export interface PetQueryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  keyword?: string;
  status?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PetResponse {
  id: number;
  userId: number;
  name: string;
  breed: string;
  gender: number;
  birthday: string;
  weightKg: number;
  healthStatus: string;
  avatarUrl?: string;
  petTagId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PetListResult {
  pets: PetResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export const getPetList = (params: PetQueryParams = {}) => {
  return request({
    url: "/Pet",
    method: "get",
    params: {
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      UserId: params.userId,
      Keyword: params.keyword,
      Status: params.status,
      SortBy: params.sortBy,
      SortOrder: params.sortOrder,
    },
  });
};

export const getPetById = (id: number) => {
  return request({
    url: `/Pet/${id}`,
    method: "get",
  });
};

export const getPetsByUserId = (userId: number) => {
  return request({
    url: `/Pet/user/${userId}`,
    method: "get",
  });
};

export const createPet = (data: {
  userId: number;
  name: string;
  breed: string;
  gender: number;
  birthday: string;
  weightKg: number;
  healthStatus: string;
  avatarUrl?: string;
  petTagId?: string;
}) => {
  return request({
    url: "/Pet",
    method: "post",
    data,
  });
};

export const updatePet = (id: number, data: {
  name?: string;
  breed?: string;
  gender?: number;
  birthday?: string;
  weightKg?: number;
  healthStatus?: string;
  avatarUrl?: string;
  petTagId?: string;
}) => {
  return request({
    url: `/Pet/${id}`,
    method: "put",
    data,
  });
};

export const deletePet = (id: number) => {
  return request({
    url: `/Pet/${id}`,
    method: "delete",
  });
};

export const checkPetExists = (id: number) => {
  return request({
    url: `/Pet/${id}/exists`,
    method: "get",
  });
};

export const verifyPetBelongsToUser = (petId: number, userId: number) => {
  return request({
    url: `/Pet/${petId}/belongs-to/${userId}`,
    method: "get",
  });
};
