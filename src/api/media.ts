import request from "@/utils/request";

// 上传单个媒体文件
export const uploadMedia = (file: File) => {
  const formData = new FormData();
  formData.append("File", file);
  return request({
    url: "/media",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// 批量上传媒体文件
export const batchUploadMedia = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("Files", file);
  });
  return request({
    url: "/media/batch",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// 删除媒体文件
export const deleteMedia = (id: number) => {
  return request({
    url: `/media/${id}`,
    method: "delete"
  });
};

// 批量删除媒体文件
export const batchDeleteMedia = (ids: number[]) => {
  return request({
    url: "/media/batch",
    method: "delete",
    data: ids
  });
};

// 通过存储键批量删除媒体文件
export const batchDeleteMediaByStorageKeys = (storageKeys: string[]) => {
  return request({
    url: "/media/batch/by-storage-keys",
    method: "delete",
    data: storageKeys
  });
};

// 获取媒体详情
export const getMediaById = (id: number) => {
  return request({
    url: `/media/${id}`,
    method: "get"
  });
};

// 根据相对路径获取媒体详情
export const getMediaByObjectPath = (objectPath: string) => {
  return request({
    url: "/media",
    method: "get",
    params: {
      objectPath
    }
  });
};

// 更新媒体信息
export const updateMedia = (id: number, data: {
  OriginalName?: string;
  Meta?: any;
  Status?: number;
}) => {
  return request({
    url: `/media/${id}`,
    method: "put",
    data
  });
};

// 获取用户的所有媒体文件
export const getUserMedia = () => {
  return request({
    url: "/media/user",
    method: "get"
  });
};

// 获取支持的文件类型
export const getSupportedTypes = () => {
  return request({
    url: "/media/supported-types",
    method: "get"
  });
};

// 生成预签名URL
export const generatePresignedUrl = (data: {
  FileName: string;
  ContentType: string;
  ExpireMinutes: number;
}) => {
  return request({
    url: "/media/presigned-url",
    method: "post",
    data
  });
};

// 获取文件大小限制
export const getSizeLimit = () => {
  return request({
    url: "/media/size-limit",
    method: "get"
  });
};