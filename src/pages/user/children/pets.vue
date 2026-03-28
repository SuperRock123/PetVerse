<template>
  <div class="pets-list">
    <div class="list-header">
      <h2>宠物</h2>
    </div>
    
    <div class="pets-waterfall" v-loading="loading">
      <div 
        v-for="pet in petsData" 
        :key="pet.id" 
        class="pet-card"
        @click="viewPetDetail(pet)"
      >
        <div class="card-image">
          <img :src="getPetAvatar(pet)" :alt="pet.name" />
          <div class="gender-badge" :class="pet.gender === 1 ? 'male' : 'female'">
            {{ pet.gender === 1 ? '♂' : '♀' }}
          </div>
        </div>
        <div class="card-content">
          <h3 class="pet-name">{{ pet.name }}</h3>
          <p class="pet-breed">{{ pet.breed || '未知品种' }}</p>
          <div class="pet-info">
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ pet.birthday || '未知' }}</span>
            </div>
            <div class="info-item">
              <el-icon><ScaleToOriginal /></el-icon>
              <span>{{ pet.weightKg ? pet.weightKg + ' kg' : '未知' }}</span>
            </div>
          </div>
          <div class="health-status" :class="getHealthClass(pet.healthStatus)">
            <el-icon><CircleCheck /></el-icon>
            {{ pet.healthStatus || '健康' }}
          </div>
        </div>
      </div>

      <div v-if="petsData.length === 0 && !loading" class="empty-state">
        <el-icon :size="80"><Picture /></el-icon>
        <p>还没有添加宠物哦~</p>
      </div>
    </div>

    <div class="feeds-loading" v-if="loadingMore">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div class="no-more" v-if="noMore && petsData.length > 0">
      <span>没有更多了</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getPetList } from '@/api/pet';
import { ElMessage } from 'element-plus';
import { Calendar, ScaleToOriginal, CircleCheck, Picture, Loading } from '@element-plus/icons-vue';

const router = useRouter();

const props = defineProps<{
  userId: number;
}>();

const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const petsData = ref<any[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const noMore = ref(false);

const defaultAvatars = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop'
];

const getPetAvatar = (pet: any) => {
  if (pet.avatarUrl) return pet.avatarUrl;
  const index = pet.id % defaultAvatars.length;
  return defaultAvatars[index];
};

const getHealthClass = (status: string) => {
  if (!status) return 'healthy';
  const statusMap: Record<string, string> = {
    '健康': 'healthy',
    '良好': 'good',
    '一般': 'normal',
    '需要关注': 'attention',
    '生病中': 'sick'
  };
  return statusMap[status] || 'healthy';
};

const viewPetDetail = (pet: any) => {
  router.push(`/pet/${pet.id}`);
};

const fetchPets = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const response = await getPetList({
      page: currentPage.value,
      pageSize: pageSize.value,
      userId: props.userId
    });
    if (response.data && response.data.pets) {
      if (isLoadMore) {
        petsData.value = [...petsData.value, ...response.data.pets];
      } else {
        petsData.value = response.data.pets;
      }
      total.value = response.data.pagination?.totalCount || 0;
      noMore.value = !response.data.pagination?.hasNextPage;
    }
  } catch (error) {
    console.error('获取宠物列表失败:', error);
    ElMessage.error('获取宠物列表失败');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingMore.value && !noMore.value) {
    currentPage.value++;
    fetchPets(true);
  }
};

onMounted(() => {
  fetchPets();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.pets-list {
  padding: 20px;
  
  .list-header {
    margin-bottom: 20px;
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .pets-waterfall {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    min-height: 300px;
  }

  .pet-card {
    background: var(--color-surface);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .pet-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .pet-card:hover .card-image img {
    transform: scale(1.05);
  }

  .gender-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: white;
  }

  .gender-badge.male {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .gender-badge.female {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .card-content {
    padding: 16px;
  }

  .pet-name {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
  }

  .pet-breed {
    margin: 0 0 12px;
    color: var(--color-textSecondary);
    font-size: 14px;
  }

  .pet-info {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-textSecondary);
    font-size: 13px;
  }

  .info-item .el-icon {
    font-size: 14px;
  }

  .health-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .health-status.healthy {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .health-status.good {
    background: #e3f2fd;
    color: #1565c0;
  }

  .health-status.normal {
    background: #fff3e0;
    color: #e65100;
  }

  .health-status.attention,
  .health-status.sick {
    background: #ffebee;
    color: #c62828;
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--color-textSecondary);
  }

  .empty-state p {
    margin: 16px 0 24px;
    font-size: 16px;
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

  @media screen and (max-width: 768px) {
    padding: 16px;

    .pets-waterfall {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .card-image {
      height: 160px;
    }
  }
}
</style>