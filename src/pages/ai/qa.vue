<template>
  <div class="ai-chat">
    <div class="chat-container">
      <!-- 左侧会话列表 -->
      <div class="sessions-sidebar">
        <div class="sidebar-header">
          <h3>对话</h3>
          <button class="new-session-btn" @click="createNewSession">
            <span class="plus-icon">+</span> 新对话
          </button>
        </div>
        <div class="sessions-list">
          <div 
            v-for="session in sessions" 
            :key="session.sessionId"
            class="session-item"
            :class="{ active: currentSession?.sessionId === session.sessionId }"
            @click="selectSession(session)"
          >
            <div class="session-info">
              <div class="session-title">{{ session.title }}</div>
              <div class="session-time">{{ formatTime(session.updatedAt) }}</div>
            </div>
            <button class="delete-session-btn" @click.stop="deleteSession(session.sessionId)">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧聊天界面 -->
      <div class="chat-main">
        <div v-if="!currentSession" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>开始新对话</h3>
          <p>点击左侧 "新对话" 按钮开始与 AI 聊天</p>
        </div>
        
        <div v-else class="chat-content">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <h2>{{ currentSession.title }}</h2>
            <div class="session-actions">
              <button class="edit-title-btn" @click="showEditTitle = true">
                编辑
              </button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="messages-list">
            <div 
              v-for="message in messages" 
              :key="message.messageId"
              class="message-item"
              :class="message.role"
            >
              <div class="message-avatar">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createdAt) }}</div>
              </div>
            </div>
            <div v-if="isLoading" class="loading-message">
              <div class="loading-spinner"></div>
              <span>AI 正在思考...</span>
            </div>
          </div>

          <!-- 消息输入框 -->
          <div class="message-input-area">
            <input 
              v-model="inputMessage"
              type="text"
              class="message-input"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              :disabled="isLoading"
            />
            <button 
              class="send-btn"
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
            >
              发送
            </button>
          </div>

          <!-- 编辑标题弹窗 -->
          <div v-if="showEditTitle" class="edit-title-modal">
            <div class="modal-content">
              <h3>编辑对话标题</h3>
              <input 
                v-model="editTitleValue"
                type="text"
                class="title-input"
                @keyup.enter="saveTitle"
              />
              <div class="modal-actions">
                <button class="cancel-btn" @click="showEditTitle = false">取消</button>
                <button class="save-btn" @click="saveTitle">保存</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as chatApi from '@/api/chat';

interface ChatSession {
  sessionId: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  messageId: number;
  sessionId: string;
  role: string;
  content: string;
  tokensUsed: number;
  createdAt: string;
}

const sessions = ref<ChatSession[]>([]);
const currentSession = ref<ChatSession | null>(null);
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const showEditTitle = ref(false);
const editTitleValue = ref('');

// 格式化时间
const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取会话列表
const fetchSessions = async () => {
  try {
    const response = await chatApi.getUserSessions();
    sessions.value = response.data;
  } catch (error) {
    console.error('获取会话列表失败:', error);
  }
};

// 获取会话消息
const fetchMessages = async (sessionId: string) => {
  try {
    const response = await chatApi.getSessionMessages(sessionId);
    messages.value = response.data;
  } catch (error) {
    console.error('获取消息失败:', error);
  }
};

// 创建新会话
const createNewSession = async () => {
  try {
    const response = await chatApi.createChatSession({ title: '新对话', model: 'qwen-turbo' });
    const newSession = response.data;
    sessions.value.unshift(newSession);
    selectSession(newSession);
  } catch (error) {
    console.error('创建会话失败:', error);
  }
};

// 选择会话
const selectSession = (session: ChatSession) => {
  currentSession.value = session;
  editTitleValue.value = session.title;
  fetchMessages(session.sessionId);
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentSession.value || isLoading.value) return;

  const message = inputMessage.value.trim();
  inputMessage.value = '';

  // 先显示用户消息
  const userMessage: ChatMessage = {
    messageId: Date.now(),
    sessionId: currentSession.value.sessionId,
    role: 'user',
    content: message,
    tokensUsed: 0,
    createdAt: new Date().toISOString()
  };
  messages.value.push(userMessage);

  isLoading.value = true;

  try {
    const response = await chatApi.sendChatMessage({
      sessionId: currentSession.value.sessionId,
      message: message,
      model: currentSession.value.model
    });
    
    const aiMessage: ChatMessage = {
      messageId: Date.now(),
      sessionId: currentSession.value.sessionId,
      role: 'assistant',
      content: response.data.message,
      tokensUsed: response.data.tokensUsed,
      createdAt: response.data.createdAt
    };
    messages.value.push(aiMessage);

    // 更新会话列表中的最后更新时间
    const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSession.value?.sessionId);
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex].updatedAt = new Date().toISOString();
      // 移到列表顶部
      const session = sessions.value.splice(sessionIndex, 1)[0];
      sessions.value.unshift(session);
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    // 移除用户消息
    messages.value.pop();
  } finally {
    isLoading.value = false;
  }
};

// 保存会话标题
const saveTitle = async () => {
  if (!currentSession.value || !editTitleValue.value.trim()) return;

  try {
    await chatApi.updateSessionTitle(currentSession.value.sessionId, editTitleValue.value.trim());
    currentSession.value.title = editTitleValue.value.trim();
    
    // 更新会话列表中的标题
    const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSession.value?.sessionId);
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex].title = editTitleValue.value.trim();
    }
    
    showEditTitle.value = false;
  } catch (error) {
    console.error('更新标题失败:', error);
  }
};

// 删除会话
const deleteSession = async (sessionId: string) => {
  if (confirm('确定要删除这个对话吗？')) {
    try {
      await chatApi.deleteChatSession(sessionId);
      sessions.value = sessions.value.filter(s => s.sessionId !== sessionId);
      
      if (currentSession.value?.sessionId === sessionId) {
        currentSession.value = null;
        messages.value = [];
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  }
};

// 初始化
onMounted(() => {
  fetchSessions();
});
</script>

<style scoped>
.ai-chat {
  height: 100vh;
  background: #f5f5f5;
}

.chat-container {
  display: flex;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* 左侧会话列表 */
.sessions-sidebar {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
}

.new-session-btn {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.new-session-btn:hover {
  background: #45a049;
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.session-item {
  padding: 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.session-item:hover {
  background: #f0f0f0;
}

.session-item.active {
  background: #e3f2fd;
  border-left: 4px solid #2196F3;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.delete-session-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0 5px;
  border-radius: 4px;
  margin-left: 10px;
}

.delete-session-btn:hover {
  background: #ffeeee;
  color: #ff4444;
}

/* 右侧聊天界面 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.edit-title-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.edit-title-btn:hover {
  background: #e0e0e0;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 70%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 4px;
}

.message-content {
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.message-item.user .message-content {
  background: #2196F3;
  color: white;
}

.message-text {
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  color: #999;
  text-align: right;
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 16px;
  align-self: flex-start;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message-input-area {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  background: #f9f9f9;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
}

.message-input:focus {
  border-color: #2196F3;
}

.send-btn {
  padding: 0 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #1976D2;
}

.send-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 编辑标题弹窗 */
.edit-title-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.title-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
  outline: none;
}

.title-input:focus {
  border-color: #2196F3;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: #2196F3;
  color: white;
}

.save-btn:hover {
  background: #1976D2;
}

/* 滚动条样式 */
.sessions-list::-webkit-scrollbar,
.messages-list::-webkit-scrollbar {
  width: 6px;
}

.sessions-list::-webkit-scrollbar-track,
.messages-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sessions-list::-webkit-scrollbar-thumb,
.messages-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sessions-list::-webkit-scrollbar-thumb:hover,
.messages-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>