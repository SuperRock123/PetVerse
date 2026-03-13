<template>
  <div class="pets-container">
    <div class="pets-header">
      <div class="header-title">
        <h2>我的宠物</h2>
        <span class="pet-count">共 {{ total }} 只可爱的小伙伴</span>
      </div>
      <el-button type="primary" @click="openDialog()" class="add-btn">
        <el-icon><Plus /></el-icon>
        添加宠物
      </el-button>
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
        <div class="card-actions">
          <el-button text type="primary" @click.stop="openDialog(pet)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button text type="danger" @click.stop="deletePet(pet.id)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>

      <div v-if="petsData.length === 0 && !loading" class="empty-state">
        <el-icon :size="80"><Picture /></el-icon>
        <p>还没有添加宠物哦~</p>
        <el-button type="primary" @click="openDialog()">添加第一只宠物</el-button>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        layout="prev, pager, next, total"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑宠物' : '添加宠物'"
      width="500px"
      :close-on-click-modal="false"
      class="pet-dialog"
      @close="handleDialogClose"
    >
      <el-form :model="petForm" :rules="rules" ref="petFormRef" label-width="100px" class="pet-form">
        <el-form-item label="宠物头像">
          <el-upload 
            class="avatar-uploader" 
            action="#" 
            :show-file-list="false" 
            :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload"
          >
            <div v-if="localAvatarUrl" class="avatar-preview">
              <img :src="localAvatarUrl" class="avatar" />
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
            <div v-else class="avatar-placeholder">
              <el-icon :size="40"><Plus /></el-icon>
              <span>上传头像</span>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="宠物名称" prop="name">
          <el-input v-model="petForm.name" placeholder="给你的宠物起个名字吧" />
        </el-form-item>
        
        <el-form-item label="品种" prop="breed">
          <el-input v-model="petForm.breed" placeholder="例如：金毛、布偶猫" />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="petForm.gender" class="gender-radio">
            <el-radio :label="1" class="gender-option male-option">
              <span class="gender-icon">♂</span> 公
            </el-radio>
            <el-radio :label="2" class="gender-option female-option">
              <span class="gender-icon">♀</span> 母
            </el-radio>
            <el-radio :label="0" class="gender-option">
              <span class="gender-icon">?</span> 未知
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="生日" prop="birthday">
          <el-date-picker 
            v-model="petForm.birthday" 
            type="date" 
            placeholder="选择宠物生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="体重(kg)" prop="weightKg">
          <el-input-number 
            v-model="petForm.weightKg" 
            :min="0.1" 
            :max="200" 
            :precision="1"
            :step="0.5"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="健康状态" prop="healthStatus">
          <el-select v-model="petForm.healthStatus" placeholder="选择健康状态" style="width: 100%">
            <el-option label="健康" value="健康" />
            <el-option label="良好" value="良好" />
            <el-option label="一般" value="一般" />
            <el-option label="需要关注" value="需要关注" />
            <el-option label="生病中" value="生病中" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="宠物标签">
          <el-input v-model="petForm.petTagId" placeholder="绑定宠物智能标签ID（可选）" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '保存修改' : '添加宠物' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getPetList, deletePet as deletePetApi, createPet, updatePet, getPetById } from '@/api/pet';
import { uploadMedia, deleteMedia } from '@/api/media';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Calendar, ScaleToOriginal, CircleCheck, Camera, Picture } from '@element-plus/icons-vue';

const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const petsData = ref<any[]>([]);
const loading = ref(false);

const dialogVisible = ref(false);
const isEdit = ref(false);
const petId = ref<number | null>(null);
const petFormRef = ref();
const localAvatarUrl = ref('');
const submitting = ref(false);
const uploadedMediaId = ref<number | null>(null);
const uploadedStorageKey = ref('');

const petForm = reactive({
  name: '',
  breed: '',
  gender: 0,
  birthday: '',
  weightKg: 0,
  healthStatus: '',
  avatar: '',
  petTagId: ''
});

const rules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  breed: [{ required: true, message: '请输入宠物品种', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择宠物性别', trigger: 'change' }]
};

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
  ElMessage.info(`查看 ${pet.name} 的详情`);
};

const openDialog = async (pet?: any) => {
  uploadedMediaId.value = null;
  uploadedStorageKey.value = '';
  
  if (pet) {
    isEdit.value = true;
    petId.value = pet.id;
    try {
      const response = await getPetById(pet.id);
      const data = response.data;
      petForm.name = data.name;
      petForm.breed = data.breed;
      petForm.gender = data.gender;
      petForm.birthday = data.birthday;
      petForm.weightKg = data.weightKg;
      petForm.healthStatus = data.healthStatus;
      petForm.avatar = data.avatarUrl || '';
      petForm.petTagId = data.pettagId || '';
      localAvatarUrl.value = data.avatarUrl || '';
    } catch (error) {
      ElMessage.error('获取宠物信息失败');
    }
  } else {
    isEdit.value = false;
    petId.value = null;
    resetForm();
  }
  dialogVisible.value = true;
};

const resetForm = () => {
  petForm.name = '';
  petForm.breed = '';
  petForm.gender = 0;
  petForm.birthday = '';
  petForm.weightKg = 0;
  petForm.healthStatus = '';
  petForm.avatar = '';
  petForm.petTagId = '';
  localAvatarUrl.value = '';
  uploadedMediaId.value = null;
  uploadedStorageKey.value = '';
  petFormRef.value?.resetFields();
};

const handleDialogClose = async () => {
  if (uploadedMediaId.value && !submitting.value) {
    try {
      await deleteMedia(uploadedMediaId.value);
      console.log('已删除未使用的图片');
    } catch (e) {
      console.warn('删除未使用图片失败', e);
    }
  }
  uploadedMediaId.value = null;
  uploadedStorageKey.value = '';
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleAvatarChange = async (file: any) => {
  try {
    const response = await uploadMedia(file.raw);
    const mediaData = response.data;
    
    if (uploadedMediaId.value && uploadedStorageKey.value) {
      try {
        await deleteMedia(uploadedMediaId.value);
      } catch (e) {
        console.warn('删除旧图片失败', e);
      }
    }
    
    uploadedMediaId.value = mediaData.id;
    uploadedStorageKey.value = mediaData.storageKey;
    petForm.avatar = mediaData.storageKey;
    
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = (e) => {
      localAvatarUrl.value = e.target?.result as string;
    };
    ElMessage.success('上传成功');
  } catch (error) {
    ElMessage.error('上传失败');
  }
};

const beforeAvatarUpload = (file: any) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/GIF 格式的图片');
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB');
  }
  return isImage && isLt5M;
};

const submitForm = async () => {
  if (!petFormRef.value) return;
  await petFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      try {
        const userId = Number(JSON.parse(localStorage.getItem('userInfo') || '{}').id || 1);
        const formData = {
          UserId: userId,
          Name: petForm.name,
          Breed: petForm.breed,
          Gender: petForm.gender,
          Birthday: petForm.birthday,
          WeightKg: petForm.weightKg,
          HealthStatus: petForm.healthStatus,
          AvatarUrl: petForm.avatar,
          PettagId: petForm.petTagId
        };

        if (isEdit.value && petId.value) {
          await updatePet(petId.value, formData);
          ElMessage.success('修改成功');
        } else {
          await createPet(formData);
          ElMessage.success('添加成功');
        }

        uploadedMediaId.value = null;
        uploadedStorageKey.value = '';
        dialogVisible.value = false;
        fetchPets();
      } catch (error) {
        ElMessage.error('操作失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

const deletePet = (id: number) => {
  ElMessageBox.confirm('确定要删除这只宠物吗？删除后无法恢复', '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  })
    .then(async () => {
      try {
        await deletePetApi(id);
        ElMessage.success('删除成功');
        fetchPets();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

const fetchPets = async () => {
  loading.value = true;
  try {
    const response = await getPetList({
      Page: currentPage.value,
      PageSize: pageSize.value
    });
    petsData.value = response.data.pets || [];
    total.value = response.data.pagination?.totalCount || 0;
  } catch (error) {
    ElMessage.error('获取宠物列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchPets();
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchPets();
};

onMounted(() => {
  fetchPets();
});
</script>

<style scoped>
.pets-container {
  padding: 24px;
  min-height: calc(100vh - 120px);
}

.pets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
}

.pet-count {
  color: var(--color-textSecondary);
  font-size: 14px;
  margin-left: 12px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
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

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
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

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 16px 0;
}

.pet-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.pet-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.pet-form {
  max-height: 60vh;
  overflow-y: auto;
}

.avatar-uploader {
  width: 100%;
}

.avatar-preview,
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-preview {
  position: relative;
  overflow: hidden;
}

.avatar-preview .avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-placeholder {
  border: 2px dashed var(--color-border);
  background: var(--color-background);
  color: var(--color-textSecondary);
}

.avatar-placeholder:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.gender-radio {
  display: flex;
  gap: 12px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gender-icon {
  font-size: 16px;
  font-weight: bold;
}

.male-option .gender-icon {
  color: #667eea;
}

.female-option .gender-icon {
  color: #f5576c;
}

@media screen and (max-width: 768px) {
  .pets-container {
    padding: 16px;
  }

  .pets-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .pets-waterfall {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .card-image {
    height: 160px;
  }
}
</style>
