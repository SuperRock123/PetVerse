<template>
  <div class="pets-add">
    <h2>{{ isEdit ? '编辑宠物' : '添加宠物' }}</h2>
    <el-form :model="petForm" :rules="rules" ref="petFormRef" label-width="120px">
      <el-form-item label="宠物名称" prop="name">
        <el-input v-model="petForm.name" placeholder="请输入宠物名称" />
      </el-form-item>
      <el-form-item label="品种" prop="breed">
        <el-input v-model="petForm.breed" placeholder="请输入宠物品种" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="petForm.gender">
          <el-radio label="1">公</el-radio>
          <el-radio label="0">母</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker v-model="petForm.birthday" type="date" placeholder="请选择宠物生日" style="width: 100%" />
      </el-form-item>
      <el-form-item label="体重(kg)" prop="weightKg">
        <el-input v-model.number="petForm.weightKg" placeholder="请输入宠物体重" type="number" />
      </el-form-item>
      <el-form-item label="健康状态" prop="healthStatus">
        <el-input v-model="petForm.healthStatus" placeholder="请输入宠物健康状态" />
      </el-form-item>
      <el-form-item label="头像">
        <el-upload class="avatar-uploader" action="#" :show-file-list="false" :on-change="handleAvatarChange"
          :before-upload="beforeAvatarUpload">
          <div v-if="localAvatarUrl" class="avatar-container">
            <img :src="localAvatarUrl" class="avatar" />
            <el-button type="danger" size="small" class="avatar-delete-btn" @click.stop="removeAvatar">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="宠物标签ID" prop="petTagId">
        <el-input v-model="petForm.petTagId" placeholder="请输入宠物标签ID" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createPet, updatePet, getPetById } from '@/api/pet';
import { uploadMedia, deleteMedia } from '@/api/media';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const petFormRef = ref();
const isEdit = ref(false);
const petId = ref<number | null>(null);
const localAvatarUrl = ref('');

const petForm = reactive({
  name: '',
  breed: '',
  gender: 1,
  birthday: '',
  weightKg: 0,
  healthStatus: '',
  avatar: '',
  petTagId: ''
});

const rules = {
  name: [
    { required: true, message: '请输入宠物名称', trigger: 'blur' }
  ],
  breed: [
    { required: true, message: '请输入宠物品种', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择宠物性别', trigger: 'change' }
  ],
  birthday: [
    { required: true, message: '请选择宠物生日', trigger: 'change' }
  ],
  weightKg: [
    { required: true, message: '请输入宠物体重', trigger: 'blur' }
  ],
  healthStatus: [
    { required: true, message: '请输入宠物健康状态', trigger: 'blur' }
  ]
};

const handleAvatarChange = async (file: any) => {
  try {
    // 上传文件到服务器
    const response = await uploadMedia(file.raw);
    console.log('uploadMedia response:', response);
    // 保存返回的storageKey
    petForm.avatar = response.data.storageKey;
    // 本地预览
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = (e) => {
      // 临时存储本地预览URL，用于显示
      localAvatarUrl.value = e.target?.result as string;
    };
    ElMessage.success('上传成功');
  } catch (error) {
    ElMessage.error('上传失败');
  }
};

const beforeAvatarUpload = (file: any) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG) {
    ElMessage.error('只能上传JPG/PNG格式的图片');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB');
  }
  return isJPG && isLt2M;
};

const removeAvatar = async () => {
  console.log('removeAvatar called');
  try {
    console.log('petForm.avatar:', petForm.avatar);
    if (petForm.avatar) {
      // 这里需要根据实际情况获取媒体文件的ID
      // 暂时假设我们有一个函数可以根据objectKey获取媒体ID
      // const mediaId = await getMediaIdByObjectKey(petForm.avatar);
      // await deleteMedia(mediaId);
      // 由于API可能还不支持根据objectKey删除，暂时只清空本地状态
      petForm.avatar = '';
      localAvatarUrl.value = '';
      ElMessage.success('删除成功');
      console.log('Avatar removed successfully');
    } else {
      console.log('No avatar to remove');
    }
  } catch (error) {
    console.error('Error removing avatar:', error);
    ElMessage.error('删除失败');
  }
};

const submitForm = async () => {
  if (!petFormRef.value) return;
  await petFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 从 localStorage 获取当前用户 ID
        const userId = Number(JSON.parse(localStorage.getItem('userInfo') || '{}').id || 0);
        // 构建提交数据，确保字段名与 API 要求一致
        const formData = {
          UserId: userId, // 从 userStorage 获取
          Name: petForm.name,
          Breed: petForm.breed,
          Gender: petForm.gender,
          Birthday: petForm.birthday ? new Date(petForm.birthday).toISOString().split('T')[0] : '',
          WeightKg: petForm.weightKg,
          HealthStatus: petForm.healthStatus,
          Avatar: petForm.avatar, // 使用正确的字段名 Avatar
          PetTagId: petForm.petTagId
        };

        console.log('提交的数据:', formData);

        if (isEdit.value && petId.value) {
          await updatePet(petId.value, formData);
          ElMessage.success('编辑成功');
        } else {
          await createPet(formData);
          ElMessage.success('添加成功');
        }

        router.push('/pets/list');
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('操作失败');
      }
    } else {
      return false;
    }
  });
};

const resetForm = () => {
  if (!petFormRef.value) return;
  petFormRef.value.resetFields();
};

const loadPetData = async () => {
  const id = route.query.id;
  if (id) {
    isEdit.value = true;
    petId.value = Number(id);
    try {
      const response = await getPetById(petId.value);
      const pet = response.data;
      petForm.name = pet.name;
      petForm.breed = pet.breed;
      petForm.gender = pet.gender;
      petForm.birthday = pet.birthday;
      petForm.weightKg = pet.weightKg;
      petForm.healthStatus = pet.healthStatus;
      petForm.avatar = pet.avatar;
      petForm.petTagId = pet.petTagId;
      // 设置本地预览URL，这里需要根据实际情况构建完整的图片URL
      // 暂时使用pet.avatar作为本地预览URL
      localAvatarUrl.value = pet.avatar;
    } catch (error) {
      ElMessage.error('获取宠物信息失败');
    }
  }
};

onMounted(() => {
  loadPetData();
});
</script>

<style scoped>
.pets-add {
  padding: 20px;
  max-width: 800px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all .3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-delete-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
}

.avatar-delete-btn .el-icon {
  font-size: 16px;
}
</style>