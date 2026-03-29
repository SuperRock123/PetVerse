import request from "@/utils/request";

// 创建对话会话
export const createChatSession = (data: { title?: string; model?: string }) => {
  return request({
    url: "/Chat/session",
    method: "post",
    data,
  });
};

// 发送消息
export const sendChatMessage = (data: { sessionId: string; message: string; model: string }) => {
  return request({
    url: "/Chat/message",
    method: "post",
    data,
  });
};

// 获取用户的对话会话列表
export const getUserSessions = () => {
  return request({
    url: "/Chat/sessions",
    method: "get",
  });
};

// 获取会话的消息记录
export const getSessionMessages = (sessionId: string) => {
  return request({
    url: `/Chat/session/${sessionId}/messages`,
    method: "get",
  });
};

// 更新会话标题
export const updateSessionTitle = (sessionId: string, title: string) => {
  return request({
    url: `/Chat/session/${sessionId}/title`,
    method: "put",
    data: title,
  });
};

// 删除会话
export const deleteChatSession = (sessionId: string) => {
  return request({
    url: `/Chat/session/${sessionId}`,
    method: "delete",
  });
};