<template>
  <div class="pet-card" @click="navigateToPet">
    <div class="pet-image">
      <img :src="pet.avatarUrl || defaultAvatar" :alt="pet.name" />
      <div class="pet-gender" :class="pet.gender === 1 ? 'male' : 'female'">
        {{ pet.gender === 1 ? '♂' : '♀' }}
      </div>
    </div>
    <div class="pet-info">
      <div class="pet-name">{{ pet.name }}</div>
      <div class="pet-breed">{{ pet.breed }}</div>
      <div class="pet-owner" v-if="pet.userName">
        主人: {{ pet.userName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const props = defineProps<{
  pet: {
    id: number;
    name: string;
    breed: string;
    gender: number;
    avatarUrl?: string;
    userName?: string;
  };
}>();

const router = useRouter();
const defaultAvatar = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png';

const navigateToPet = () => {
  router.push(`/pet/${props.pet.id}`);
};
</script>

<style lang="less" scoped>
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
</style>