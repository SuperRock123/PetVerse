<template>
  <div class="container">
    <div class="push-container">
      <div class="header"><span class="header-icon"></span><span class="header-title">发布动态</span></div>
      <div class="img-list">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          :limit="9"
          accept="image/*,video/*"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>

        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%;" />
        </el-dialog>
      </div>
      <el-divider style="margin: 12px; width: 576px" />
      <div class="push-content">
        <el-input
          v-model="formData.content"
          :rows="5"
          maxlength="2000"
          show-word-limit
          type="textarea"
          placeholder="分享你和宠物的故事..."
          class="input-content"
        />
      </div>
      <div class="options">
        <div class="option-item">
          <span class="option-label">关联宠物</span>
          <el-select
            v-model="formData.petId"
            placeholder="选择宠物（可选）"
            clearable
            style="width: 200px;"
          >
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name"
              :value="pet.id"
            >
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-avatar :size="24" :src="pet.avatarUrl">
                  {{ pet.name?.charAt(0) }}
                </el-avatar>
                <span>{{ pet.name }}</span>
                <el-tag size="small" type="info">{{ pet.breed }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </div>
        <div class="option-item">
          <span class="option-label">位置</span>
          <el-input
            v-model="formData.location"
            placeholder="添加位置（可选）"
            style="width: 200px;"
          />
        </div>
        <div class="option-item">
          <span class="option-label">可见性</span>
          <el-radio-group v-model="formData.visibility">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="2">好友可见</el-radio>
            <el-radio :label="3">仅自己</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="submit">
        <button class="publishBtn" @click="publish()" :disabled="submitting">
          {{ submitting ? '发布中...' : '发布' }}
        </button>
        <button class="clearBtn" @click="handleCancel()">
          <span class="btn-content">取消</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, type UploadProps, type UploadUserFile } from "element-plus";
import { createPost } from "@/api/post";
import { getPetList } from "@/api/pet";
import { uploadMedia, deleteMedia, batchDeleteMediaByStorageKeys } from "@/api/media";
import { useUserStore } from "@/store/userStore";

interface PetInfo {
  id: number;
  name: string;
  breed: string;
  avatarUrl?: string;
}

interface UploadedMedia {
  uid: number;
  mediaId: number;
  storageKey: string;
}

const router = useRouter();
const userStore = useUserStore();

const fileList = ref<UploadUserFile[]>([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const submitting = ref(false);
const pets = ref<PetInfo[]>([]);
const uploadedMedias = ref<UploadedMedia[]>([]);

const formData = reactive({
  content: "",
  petId: undefined as number | undefined,
  location: "",
  visibility: 1,
});

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/');
  const isVideo = rawFile.type.startsWith('video/');
  
  if (!isImage && !isVideo) {
    ElMessage.error('只能上传图片或视频文件');
    return false;
  }
  
  const isLt10M = rawFile.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB');
    return false;
  }
  
  return true;
};

const handleFileChange: UploadProps['onChange'] = async (uploadFile, uploadFiles) => {
  if (uploadFile.status === 'ready' && uploadFile.raw) {
    uploadFile.status = 'uploading';
    try {
      const res = await uploadMedia(uploadFile.raw);
      if (res.success && res.data) {
        uploadedMedias.value.push({
          uid: uploadFile.uid,
          mediaId: res.data.id,
          storageKey: res.data.storageKey
        });
        uploadFile.status = 'success';
        ElMessage.success('图片上传成功');
      } else {
        uploadFile.status = 'exception';
        ElMessage.error('图片上传失败');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      uploadFile.status = 'exception';
      ElMessage.error('图片上传失败');
    }
  }
};

const handleFileRemove: UploadProps['onRemove'] = async (uploadFile, uploadFiles) => {
  const uploadedMedia = uploadedMedias.value.find(m => m.uid === uploadFile.uid);
  if (uploadedMedia) {
    try {
      await deleteMedia(uploadedMedia.mediaId);
      uploadedMedias.value = uploadedMedias.value.filter(m => m.uid !== uploadFile.uid);
      console.log('已删除图片:', uploadedMedia.storageKey);
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  }
};

const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

const fetchPets = async () => {
  if (!userStore.userInfo?.id) return;
  
  try {
    const res = await getPetList({
      page: 1,
      pageSize: 100,
      userId: userStore.userInfo.id
    });
    if (res.success && res.data) {
      pets.value = res.data.pets || [];
    }
  } catch (error) {
    console.error('获取宠物列表失败:', error);
  }
};

const publish = async () => {
  if (!formData.content.trim()) {
    ElMessage.warning('请输入动态内容');
    return;
  }
  
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  submitting.value = true;
  
  try {
    const mediaIds = uploadedMedias.value.map(m => m.mediaId);
    
    const res = await createPost({
      userId: userStore.userInfo.id,
      petId: formData.petId,
      content: formData.content,
      location: formData.location,
      visibility: formData.visibility,
      mediaIds: mediaIds.length > 0 ? mediaIds : undefined
    });
    
    if (res.success) {
      ElMessage.success('发布成功');
      uploadedMedias.value = [];
      reset();
      router.push('/social');
    }
  } catch (error) {
    console.error('发布失败:', error);
    ElMessage.error('发布失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = async () => {
  if (uploadedMedias.value.length > 0) {
    try {
      const storageKeys = uploadedMedias.value.map(m => m.storageKey);
      await batchDeleteMediaByStorageKeys(storageKeys);
      console.log('已清理上传的图片');
    } catch (error) {
      console.error('清理图片失败:', error);
    }
  }
  reset();
  router.push('/social');
};

const reset = () => {
  formData.content = "";
  formData.petId = undefined;
  formData.location = "";
  formData.visibility = 1;
  fileList.value = [];
  uploadedMedias.value = [];
};

onMounted(() => {
  fetchPets();
});

onUnmounted(() => {
  if (uploadedMedias.value.length > 0 && !submitting.value) {
    const storageKeys = uploadedMedias.value.map(m => m.storageKey);
    batchDeleteMediaByStorageKeys(storageKeys).catch(console.error);
  }
});
</script>
<style lang="less" scoped>
/deep/ .el-upload-list--picture-card .el-upload-list__item {
  width: 80px;
  height: 80px;
}
/deep/ .el-upload-list__item.is-success .el-upload-list__item-status-label {
  display: none;
}
/deep/ .el-upload--picture-card {
  width: 80px;
  height: 80px;
}

.container {
  flex: 1;
  padding: 0 24px;
  padding-top: 72px;
  width: 67%;
  margin: 0 auto;
  
  .push-container {
    width: 600px;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: var(--el-box-shadow-lighter);
    background: var(--color-surface);
    transition: background-color 0.3s, box-shadow 0.3s;

    .header {
      padding: 15px 20px;
      line-height: 16px;
      font-size: 16px;
      font-weight: 400;
      color: var(--color-text);
      transition: color 0.3s;

      .header-icon {
        position: relative;
        top: 2px;
        display: inline-block;
        width: 6px;
        height: 16px;
        background: #3a64ff;
        border-radius: 3px;
        margin-right: 2px;
      }
    }

    .img-list {
      width: 540px;
      margin: auto;
      padding: 0px 6px 0px 6px;
    }

    .push-content {
      padding: 0 12px 10px 12px;

      .input-content {
        font-size: 14px;
        
        :deep(.el-textarea__inner) {
          background: var(--color-surface);
          color: var(--color-text);
          transition: background-color 0.3s, color 0.3s;
        }
      }
    }
    
    .options {
      padding: 0 12px 10px 12px;
      
      .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .option-label {
          width: 70px;
          font-size: 14px;
          color: var(--color-textSecondary);
          transition: color 0.3s;
        }
      }
    }
    
    .submit {
      padding: 0 12px 10px 12px;
      margin-top: 10px;
      
      button {
        width: 80px;
        height: 32px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .publishBtn {
        background-color: #ff2442;
        color: #fff;
        border-radius: 4px;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: #e61f3c;
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
      
      .clearBtn {
        border-radius: 4px;
        margin-left: 10px;
        border: 1px solid rgb(217, 217, 217);
        background: var(--color-surface);
        color: var(--color-text);
        transition: background-color 0.3s, color 0.3s;
      }
    }
  }
}
</style>
