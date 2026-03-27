<template>
  <div class="followings-list">
    <div class="list-header">
      <h2>关注</h2>
    </div>
    
    <div class="loading-container" v-if="loading && followings.length === 0">
      <el-skeleton :rows="5" animated />
    </div>

    <div class="list-content" v-if="followings.length > 0">
      <div v-for="user in followings" :key="user.id" class="user-card">
        <div class="user-avatar">
          <img :src="user.avatarUrl || defaultAvatar" alt="用户头像" @click="navigateToUserProfile(user.id)" />
        </div>
        <div class="user-info" @click="navigateToUserProfile(user.id)">
          <div class="user-name">{{ user.nickname || user.username }}</div>
          <div class="user-bio">{{ user.bio || '这个人很懒，什么都没写' }}</div>
        </div>
        <div class="user-actions">
          <el-button 
            v-if="isFollowing(user.id)" 
            size="small" 
            @click="unfollowUserHandler(user.id)"
          >
            已关注
          </el-button>
          <el-button 
            v-else 
            size="small" 
            type="primary" 
            @click="followUserHandler(user.id)"
          >
            关注
          </el-button>
        </div>
      </div>
    </div>

    <div class="feeds-loading" v-if="loadingMore">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div class="no-more" v-if="noMore && followings.length > 0">
      <span>没有更多了</span>
    </div>

    <el-empty v-if="!loading && followings.length === 0" description="暂无关注" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFollowings, followUser, unfollowUser, checkFollowing } from '@/api/user';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

const props = defineProps<{
  userId: number;
}>();

const router = useRouter();

const followings = ref<any[]>([]);
const currentPage = ref(1);
const loading = ref(false);
const loadingMore = ref(false);
const noMore = ref(false);
const currentUserId = ref(1); // 模拟当前登录用户ID
const followingStatus = ref<Record<number, boolean>>({});

const defaultAvatar = computed(() => 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');

// 获取关注列表
const getFollowingsList = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    const response = await getFollowings(props.userId, currentPage.value);
    const newFollowings = response.data.followings || [];
    
    // 转换数据格式，只保留用户信息
    const formattedFollowings = newFollowings.map((item: any) => ({
      id: item.followedId,
      nickname: item.followedNickname,
      username: item.followedUsername || '',
      avatarUrl: item.followedAvatar,
      bio: '' // 这里可以从用户详情API获取
    }));
    
    if (isLoadMore) {
      followings.value = [...followings.value, ...formattedFollowings];
    } else {
      followings.value = formattedFollowings;
    }
    
    // 检查关注状态
    for (const user of formattedFollowings) {
      await checkUserFollowingStatus(user.id);
    }
    
    // 检查是否还有更多数据
    noMore.value = !response.data.pagination?.hasNextPage;
    if (!noMore.value) {
      currentPage.value++;
    }
  } catch (error) {
    console.error('获取关注列表失败:', error);
    ElMessage.error('获取关注列表失败');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 检查用户关注状态
const checkUserFollowingStatus = async (userId: number) => {
  try {
    const response = await checkFollowing(currentUserId.value, userId);
    followingStatus.value[userId] = response.data.isFollowing;
  } catch (error) {
    console.error('检查关注状态失败:', error);
    followingStatus.value[userId] = false;
  }
};

// 检查是否已关注
const isFollowing = (userId: number) => {
  return followingStatus.value[userId] || false;
};

// 关注用户
const followUserHandler = async (userId: number) => {
  try {
    await followUser(currentUserId.value, userId);
    followingStatus.value[userId] = true;
    ElMessage.success('关注成功');
  } catch (error) {
    console.error('关注用户失败:', error);
    ElMessage.error('关注失败');
  }
};

// 取消关注用户
const unfollowUserHandler = async (userId: number) => {
  try {
    await unfollowUser(currentUserId.value, userId);
    followingStatus.value[userId] = false;
    ElMessage.success('取消关注成功');
  } catch (error) {
    console.error('取消关注用户失败:', error);
    ElMessage.error('取消关注失败');
  }
};

// 导航到用户个人页面
const navigateToUserProfile = (userId: number) => {
  router.push(`/user/profile/${userId}`);
};

// 处理滚动加载
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingMore.value && !noMore.value) {
    getFollowingsList(true);
  }
};

// 生命周期钩子
onMounted(async () => {
  await getFollowingsList();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="less" scoped>
.followings-list {
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
    gap: 16px;
    
    .user-card {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        background: #f0f0f0;
      }
      
      .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 16px;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        &:hover img {
          transform: scale(1.1);
        }
      }
      
      .user-info {
        flex: 1;
        
        .user-name {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }
        
        .user-bio {
          font-size: 12px;
          color: #999;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
        }
        
        &:hover .user-name {
          color: var(--color-primary);
        }
      }
      
      .user-actions {
        flex-shrink: 0;
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