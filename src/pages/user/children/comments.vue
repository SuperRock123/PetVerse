<template>
  <div class="comments-list">
    <div class="list-header">
      <h2>评论与回复</h2>
    </div>
    
    <div class="loading-container" v-if="loading && comments.length === 0">
      <el-skeleton :rows="5" animated />
    </div>

    <div class="list-content" v-if="comments.length > 0">
      <div v-for="comment in comments" :key="comment.id" class="comment-card">
        <div class="comment-header">
          <div class="user-info">
            <img class="user-avatar" :src="comment.userAvatar || defaultAvatar" />
            <div class="user-details">
              <div class="user-name">{{ comment.nickname || comment.userName }}</div>
              <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
            </div>
          </div>
        </div>
        <div class="comment-content">
          <div class="comment-text">{{ comment.content }}</div>
        </div>
        <div class="comment-actions">
          <div class="action-item" :class="{ 'like-active': comment.isLiked }" @click="handleLike(comment)">
            <el-icon><Star /></el-icon>
            <span class="action-count">{{ comment.likesCount || 0 }}</span>
          </div>
          <div class="action-item" @click="toggleReply(comment.id)">
            <el-icon><ChatDotRound /></el-icon>
            <span class="action-count">{{ comment.replies?.length || 0 }}</span>
          </div>
        </div>
        <!-- 回复列表 -->
        <div class="replies-list" v-if="comment.replies && comment.replies.length > 0 && expandedReplies.includes(comment.id)">
          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
            <div class="reply-header">
              <img class="reply-avatar" :src="reply.userAvatar || defaultAvatar" />
              <div class="reply-user">{{ reply.nickname || reply.userName }}</div>
              <div class="reply-time">{{ formatTime(reply.createdAt) }}</div>
            </div>
            <div class="reply-content">{{ reply.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="feeds-loading" v-if="loadingMore">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div class="no-more" v-if="noMore && comments.length > 0">
      <span>没有更多了</span>
    </div>

    <el-empty v-if="!loading && comments.length === 0" description="暂无评论" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { getComments } from '@/api/comment';
import { toggleLike } from '@/api/post';
import { ElMessage } from 'element-plus';
import { Star, ChatDotRound, Loading } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/userStore';

const props = defineProps<{
  userId: number;
}>();

const userStore = useUserStore();

const comments = ref<any[]>([]);
const currentPage = ref(1);
const loading = ref(false);
const loadingMore = ref(false);
const noMore = ref(false);
const expandedReplies = ref<number[]>([]);

const defaultAvatar = computed(() => 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');

// 获取评论列表
const getCommentsList = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    const response = await getComments({
      page: currentPage.value,
      pageSize: 10,
      userId: props.userId
    });
    
    if (response.data && response.data.comments) {
      if (isLoadMore) {
        comments.value = [...comments.value, ...response.data.comments];
      } else {
        comments.value = response.data.comments;
      }
      
      // 检查是否还有更多数据
      noMore.value = !response.data.pagination?.hasNextPage;
      if (!noMore.value) {
        currentPage.value++;
      }
    }
  } catch (error) {
    console.error('获取评论列表失败:', error);
    ElMessage.error('获取评论列表失败');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 处理点赞
const handleLike = async (comment: any) => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await toggleLike({
      targetType: 'comment',
      targetId: comment.id,
      userId: userStore.userInfo.id
    });
    
    if (response.success) {
      comment.isLiked = response.data.isLiked;
      comment.likesCount = response.data.isLiked ? comment.likesCount + 1 : comment.likesCount - 1;
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    ElMessage.error('点赞操作失败');
  }
};

// 切换回复展开/收起
const toggleReply = (commentId: number) => {
  const index = expandedReplies.value.indexOf(commentId);
  if (index > -1) {
    expandedReplies.value.splice(index, 1);
  } else {
    expandedReplies.value.push(commentId);
  }
};

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
};

// 处理滚动加载
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingMore.value && !noMore.value) {
    getCommentsList(true);
  }
};

// 生命周期钩子
onMounted(async () => {
  await getCommentsList();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="less" scoped>
.comments-list {
  padding: 20px;
  
  .list-header {
    margin-bottom: 20px;
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .loading-container {
    padding: 40px;
  }
  
  .list-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .comment-card {
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f0f0f0;
      }
      
      .comment-header {
        margin-bottom: 12px;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid rgba(0, 0, 0, 0.08);
          }
          
          .user-details {
            flex: 1;
            
            .user-name {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
            }
            
            .comment-time {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
      
      .comment-content {
        margin-bottom: 12px;
        
        .comment-text {
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
      }
      
      .comment-actions {
        display: flex;
        gap: 24px;
        margin-bottom: 12px;
        
        .action-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;
          cursor: pointer;
          transition: color 0.3s ease;
          
          &:hover {
            color: #ff4757;
          }
          
          &.like-active {
            color: #ff4757;
          }
        }
      }
      
      .replies-list {
        padding-left: 48px;
        margin-top: 12px;
        
        .reply-item {
          padding: 12px;
          background: #f0f0f0;
          border-radius: 6px;
          margin-bottom: 8px;
          
          .reply-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            
            .reply-avatar {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              object-fit: cover;
              border: 1px solid rgba(0, 0, 0, 0.08);
            }
            
            .reply-user {
              font-size: 12px;
              font-weight: 500;
              color: #333;
            }
            
            .reply-time {
              font-size: 11px;
              color: #999;
            }
          }
          
          .reply-content {
            font-size: 13px;
            line-height: 1.4;
            color: #666;
          }
        }
      }
    }
  }
  
  .feeds-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--color-textSecondary);
    gap: 8px;
    transition: color 0.3s;
  }
  
  .no-more {
    text-align: center;
    padding: 20px;
    color: var(--color-textSecondary);
    font-size: 14px;
    transition: color 0.3s;
  }
}
</style>