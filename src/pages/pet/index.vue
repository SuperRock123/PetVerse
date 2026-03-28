<template>
  <div class="pet-page">
    <!-- 宠物头部信息 -->
    <div class="pet-header">
      <div class="pet-avatar">
        <img :src="petInfo.avatarUrl || defaultAvatar" :alt="petInfo.name" />
      </div>
      <div class="pet-basic-info">
        <h1 class="pet-name">{{ petInfo.name }}</h1>
        <div class="pet-details">
          <span class="pet-breed">{{ petInfo.breed }}</span>
          <span class="pet-gender" :class="petInfo.gender === 1 ? 'male' : 'female'">
            {{ petInfo.gender === 1 ? '♂' : '♀' }}
          </span>
          <span class="pet-age">{{ calculateAge(petInfo.birthday) }}</span>
          <span class="pet-weight">{{ petInfo.weightKg }}kg</span>
        </div>
        <div class="pet-health">
          <span class="health-status" :class="petInfo.healthStatus === '良好' ? 'good' : 'bad'">
            健康状态: {{ petInfo.healthStatus }}
          </span>
        </div>
      </div>
      <div class="pet-stats">
        <div class="stat-item">
          <div class="stat-value">{{ petInfo.postsCount || 0 }}</div>
          <div class="stat-label">动态</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ petInfo.vaccinesCount || 0 }}</div>
          <div class="stat-label">疫苗</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ petInfo.likesCount || 0 }}</div>
          <div class="stat-label">获赞</div>
        </div>
      </div>
    </div>

    <!-- 主人信息 -->
    <div class="owner-section" v-if="petInfo.userName">
      <h2 class="section-title">主人信息</h2>
      <div class="owner-info" @click="navigateToUser">
        <img class="owner-avatar" :src="petInfo.userAvatar || defaultUserAvatar" />
        <div class="owner-details">
          <div class="owner-name">{{ petInfo.userName }}</div>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 宠物相册 -->
    <div class="album-section" v-if="petInfo.mediaResources && petInfo.mediaResources.length > 0">
      <h2 class="section-title">宠物相册</h2>
      <div class="album-grid">
        <div v-for="(media, index) in petInfo.mediaResources" :key="media.id" class="album-item">
          <img :src="media.url" :alt="`${petInfo.name}的照片 ${index + 1}`" />
        </div>
      </div>
    </div>

    <!-- 相关动态 -->
    <div class="posts-section" v-if="posts.length > 0">
      <h2 class="section-title">相关动态</h2>
      <div class="posts-list">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <div class="post-author">
              <img class="author-avatar" :src="post.userAvatar || defaultUserAvatar" />
              <div class="author-info">
                <div class="author-name">{{ post.nickname || post.userName }}</div>
                <div class="post-time">{{ formatTime(post.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="post-content">{{ post.content }}</div>
          <div class="post-media" v-if="post.mediaUrls && post.mediaUrls.length > 0">
            <img v-for="(url, index) in post.mediaUrls" :key="index" :src="url" :alt="`帖子图片 ${index + 1}`" />
          </div>
          <div class="post-stats">
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ post.commentsCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ post.likesCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ post.viewCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 无数据状态 -->
    <el-empty v-if="!loading && !petInfo.id" description="宠物不存在" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowRight, ChatDotRound, Star, View } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getPetById } from '@/api/pet';
import { getPostsByPetId } from '@/api/post';

const router = useRouter();
const route = useRoute();

const petId = ref<number>(Number(route.params.id));
const petInfo = ref<any>({});
const posts = ref<any[]>([]);
const loading = ref(true);

const defaultAvatar = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png';
const defaultUserAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 获取宠物信息
const fetchPetInfo = async () => {
  try {
    const response = await getPetById(petId.value);
    if (response.data) {
      petInfo.value = response.data;
    }
  } catch (error) {
    console.error('获取宠物信息失败:', error);
    ElMessage.error('获取宠物信息失败');
  }
};

// 获取宠物相关帖子
const fetchPetPosts = async () => {
  try {
    const response = await getPostsByPetId(petId.value);
    if (response.data?.posts) {
      posts.value = response.data.posts;
    }
  } catch (error) {
    console.error('获取宠物帖子失败:', error);
    ElMessage.error('获取宠物帖子失败');
  }
};

// 计算宠物年龄
const calculateAge = (birthday: string) => {
  if (!birthday) return '未知';
  const birthDate = new Date(birthday);
  const now = new Date();
  const diff = now.getTime() - birthDate.getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0) {
    return `${years}岁${remainingMonths > 0 ? remainingMonths + '个月' : ''}`;
  } else {
    return `${months}个月`;
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

// 导航到用户页面
const navigateToUser = () => {
  if (petInfo.value.userId) {
    router.push(`/user/profile?id=${petInfo.value.userId}`);
  }
};

// 组件挂载时获取数据
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchPetInfo(),
      fetchPetPosts()
    ]);
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="less" scoped>
.pet-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  .pet-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 30px;
    
    .pet-avatar {
      width: 150px;
      height: 150px;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .pet-basic-info {
      flex: 1;
      
      .pet-name {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        color: #333;
      }
      
      .pet-details {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        
        .pet-breed {
          font-size: 16px;
          color: #666;
        }
        
        .pet-gender {
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
        
        .pet-age,
        .pet-weight {
          font-size: 14px;
          color: #999;
        }
      }
      
      .pet-health {
        .health-status {
          font-size: 14px;
          padding: 4px 12px;
          border-radius: 12px;
          
          &.good {
            background: #e8f5e8;
            color: #4caf50;
          }
          
          &.bad {
            background: #ffebee;
            color: #f44336;
          }
        }
      }
    }
    
    .pet-stats {
      display: flex;
      gap: 20px;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
  
  .owner-section,
  .album-section,
  .posts-section {
    margin-bottom: 30px;
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }
  }
  
  .owner-section {
    .owner-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f0f0f0;
      }
      
      .owner-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .owner-details {
        flex: 1;
        
        .owner-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
      }
      
      .arrow-icon {
        color: #999;
      }
    }
  }
  
  .album-section {
    .album-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      
      .album-item {
        width: 100%;
        height: 200px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s ease;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }
  
  .posts-section {
    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      .post-card {
        padding: 15px;
        background: #f9f9f9;
        border-radius: 8px;
        
        .post-header {
          margin-bottom: 12px;
          
          .post-author {
            display: flex;
            align-items: center;
            gap: 12px;
            
            .author-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
            }
            
            .author-info {
              .author-name {
                font-size: 14px;
                font-weight: 500;
                color: #333;
                margin-bottom: 4px;
              }
              
              .post-time {
                font-size: 12px;
                color: #999;
              }
            }
          }
        }
        
        .post-content {
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          margin-bottom: 12px;
        }
        
        .post-media {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          
          img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 6px;
          }
        }
        
        .post-stats {
          display: flex;
          gap: 20px;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #999;
            
            :deep(.el-icon) {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  
  .loading-container {
    padding: 40px;
  }
}
</style>