<template>
  <div class="search-container">
    <!-- 搜索框 -->
    <div class="search-header">
      <div class="search-input-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索帖子、用户、宠物"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="el-input__icon"><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <!-- 搜索结果分类 -->
    <div class="search-tabs" v-if="searchQuery">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="全部" name="all">
          <span class="tab-count">{{ totalResults }}</span>
        </el-tab-pane>
        <el-tab-pane label="帖子" name="posts">
          <span class="tab-count">{{ searchResults.posts?.length || 0 }}</span>
        </el-tab-pane>
        <el-tab-pane label="用户" name="users">
          <span class="tab-count">{{ searchResults.users?.length || 0 }}</span>
        </el-tab-pane>
        <el-tab-pane label="宠物" name="pets">
          <span class="tab-count">{{ searchResults.pets?.length || 0 }}</span>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 搜索结果内容 -->
    <div class="search-results" v-if="searchQuery">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 无结果 -->
      <el-empty
        v-else-if="!loading && !hasResults"
        description="未找到相关内容"
      />

      <!-- 全部结果 -->
      <div v-else-if="activeTab === 'all'" class="all-results">
        <!-- 帖子结果 -->
        <div v-if="searchResults.posts && searchResults.posts.length > 0" class="result-section">
          <h3 class="section-title">相关帖子</h3>
          <div class="post-results">
            <div
              v-for="post in searchResults.posts"
              :key="post.id"
              class="post-card"
              @click="navigateToPost(post.id)"
            >
              <div class="post-content">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-text">{{ post.content }}</div>
                <div class="post-meta">
                  <span class="post-author">{{ post.authorName }}</span>
                  <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                  <span class="post-stats">
                    <el-icon><ChatDotRound /></el-icon>
                    {{ post.commentCount || 0 }}
                    <el-icon><Star /></el-icon>
                    {{ post.likeCount || 0 }}
                  </span>
                </div>
              </div>
              <div v-if="post.mediaUrls && post.mediaUrls.length > 0" class="post-media">
                <img :src="post.mediaUrls[0]" :alt="post.title" />
              </div>
            </div>
          </div>
        </div>

        <!-- 用户结果 -->
        <div v-if="searchResults.users && searchResults.users.length > 0" class="result-section">
          <h3 class="section-title">相关用户</h3>
          <div class="user-results">
            <div
              v-for="user in searchResults.users"
              :key="user.id"
              class="user-card"
              @click="navigateToUser(user.id)"
            >
              <img class="user-avatar" :src="user.avatar || defaultAvatar" />
              <div class="user-info">
                <div class="user-name">{{ user.nickname || user.username }}</div>
                <div class="user-bio">{{ user.bio || '暂无个人简介' }}</div>
                <div class="user-stats">
                  <span>{{ user.followingCount || 0 }} 关注</span>
                  <span>{{ user.followerCount || 0 }} 粉丝</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 宠物结果 -->
        <div v-if="searchResults.pets && searchResults.pets.length > 0" class="result-section">
          <h3 class="section-title">相关宠物</h3>
          <div class="pet-results">
            <pet-card v-for="pet in searchResults.pets" :key="pet.id" :pet="pet" />
          </div>
        </div>
      </div>

      <!-- 帖子结果 -->
      <div v-else-if="activeTab === 'posts'" class="tab-results">
        <div v-if="searchResults.posts && searchResults.posts.length > 0" class="post-results">
          <div
            v-for="post in searchResults.posts"
            :key="post.id"
            class="post-card"
            @click="navigateToPost(post.id)"
          >
            <div class="post-content">
              <div class="post-title">{{ post.title }}</div>
              <div class="post-text">{{ post.content }}</div>
              <div class="post-meta">
                <span class="post-author">{{ post.authorName }}</span>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                <span class="post-stats">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ post.commentCount || 0 }}
                  <el-icon><Star /></el-icon>
                  {{ post.likeCount || 0 }}
                </span>
              </div>
            </div>
            <div v-if="post.mediaUrls && post.mediaUrls.length > 0" class="post-media">
              <img :src="post.mediaUrls[0]" :alt="post.title" />
            </div>
          </div>
        </div>
        <el-empty v-else description="未找到相关帖子" />
      </div>

      <!-- 用户结果 -->
      <div v-else-if="activeTab === 'users'" class="tab-results">
        <div v-if="searchResults.users && searchResults.users.length > 0" class="user-results">
          <div
            v-for="user in searchResults.users"
            :key="user.id"
            class="user-card"
            @click="navigateToUser(user.id)"
          >
            <img class="user-avatar" :src="user.avatar || defaultAvatar" />
            <div class="user-info">
              <div class="user-name">{{ user.nickname || user.username }}</div>
              <div class="user-bio">{{ user.bio || '暂无个人简介' }}</div>
              <div class="user-stats">
                <span>{{ user.followingCount || 0 }} 关注</span>
                <span>{{ user.followerCount || 0 }} 粉丝</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="未找到相关用户" />
      </div>

      <!-- 宠物结果 -->
      <div v-else-if="activeTab === 'pets'" class="tab-results">
        <div v-if="searchResults.pets && searchResults.pets.length > 0" class="pet-results">
          <pet-card v-for="pet in searchResults.pets" :key="pet.id" :pet="pet" />
        </div>
        <el-empty v-else description="未找到相关宠物" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, ChatDotRound, Star } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getPostList } from '@/api/post';
import { getPetList } from '@/api/pet';
import { searchUsers } from '@/api/user';
import PetCard from '@/components/PetCard.vue';

const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const activeTab = ref('all');
const loading = ref(false);
const searchResults = ref({
  posts: [],
  users: [],
  pets: []
});

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
const defaultPetAvatar = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png';

// 计算总结果数
const totalResults = computed(() => {
  return (
    (searchResults.value.posts?.length || 0) +
    (searchResults.value.users?.length || 0) +
    (searchResults.value.pets?.length || 0)
  );
});

// 检查是否有结果
const hasResults = computed(() => {
  return totalResults.value > 0;
});

// 处理搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容');
    return;
  }

  loading.value = true;
  try {
    // 并行调用三个API获取搜索结果
    const [postsResponse, petsResponse, usersResponse] = await Promise.all([
      getPostList({ keyword: searchQuery.value.trim() }),
      getPetList({ keyword: searchQuery.value.trim() }),
      searchUsers({ keyword: searchQuery.value.trim() })
    ]);
    
    // 处理帖子搜索结果
    const posts = postsResponse.data?.posts || [];
    
    // 处理宠物搜索结果
    const pets = petsResponse.data?.pets || [];
    
    // 处理用户搜索结果
    const users = usersResponse.data?.users || [];
    
    // 更新搜索结果
    searchResults.value = {
      posts: posts.map((post: any) => ({
        id: post.id,
        title: post.content.substring(0, 20) + '...',
        content: post.content,
        authorName: post.nickname || post.userName,
        createdAt: post.createdAt,
        commentCount: post.commentsCount || 0,
        likeCount: post.likesCount || 0,
        mediaUrls: post.mediaUrls || []
      })),
      users: users.map((user: any) => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        bio: user.bio || '暂无个人简介',
        avatar: user.avatarUrl || defaultAvatar,
        followingCount: 0, // 暂时使用0，实际应该从API获取
        followerCount: 0 // 暂时使用0，实际应该从API获取
      })),
      pets: pets.map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        gender: pet.gender,
        avatarUrl: pet.avatarUrl || defaultPetAvatar,
        userName: pet.userName || '未知'
      }))
    };
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 处理标签切换
const handleTabChange = () => {
  // 标签切换时不需要重新搜索，直接显示对应分类的结果
};

// 导航到帖子详情
const navigateToPost = (postId: number) => {
  // 这里应该导航到帖子详情页
  console.log('导航到帖子详情:', postId);
};

// 导航到用户个人主页
const navigateToUser = (userId: number) => {
  router.push(`/user/profile?id=${userId}`);
};

// 导航到宠物详情
const navigateToPet = (petId: number) => {
  // 这里应该导航到宠物详情页
  console.log('导航到宠物详情:', petId);
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

// 监听路由参数
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery as string;
      handleSearch();
    }
  },
  { immediate: true }
);

// 组件挂载时，如果路由有搜索参数，自动搜索
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q as string;
    handleSearch();
  }
});
</script>

<style lang="less" scoped>
.search-container {
  padding: 20px;
  
  .search-header {
    margin-bottom: 20px;
    
    .search-input-box {
      display: flex;
      gap: 10px;
      max-width: 600px;
      margin: 0 auto;
      
      :deep(.el-input) {
        flex: 1;
      }
    }
  }
  
  .search-tabs {
    margin-bottom: 20px;
    
    .tab-count {
      margin-left: 8px;
      font-size: 12px;
      color: #999;
    }
  }
  
  .search-results {
    .loading-container {
      padding: 40px;
    }
    
    .all-results {
      .result-section {
        margin-bottom: 30px;
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }
      }
    }
    
    .post-results {
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      .post-card {
        display: flex;
        gap: 15px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        .post-content {
          flex: 1;
          
          .post-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 8px;
            color: #333;
          }
          
          .post-text {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 12px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .post-meta {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 12px;
            color: #999;
            
            .post-stats {
              display: flex;
              align-items: center;
              gap: 10px;
              
              :deep(.el-icon) {
                margin-right: 4px;
              }
            }
          }
        }
        
        .post-media {
          width: 120px;
          height: 90px;
          flex-shrink: 0;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
          }
        }
      }
    }
    
    .user-results {
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      .user-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        
        .user-info {
          flex: 1;
          
          .user-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
            color: #333;
          }
          
          .user-bio {
            font-size: 14px;
            margin-bottom: 8px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .user-stats {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
    
    .pet-results {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      
      .pet-card {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        .pet-image {
          position: relative;
          width: 100%;
          height: 150px;
          margin-bottom: 12px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
          }
          
          .pet-gender {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            
            &.male {
              background: #e3f2fd;
              color: #2196f3;
            }
            
            &.female {
              background: #fce4ec;
              color: #e91e63;
            }
          }
        }
        
        .pet-info {
          text-align: center;
          
          .pet-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
            color: #333;
          }
          
          .pet-breed {
            font-size: 14px;
            margin-bottom: 4px;
            color: #666;
          }
          
          .pet-owner {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }
}
</style>