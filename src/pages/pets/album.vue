<template>
  <div class="pets-album">
    <h2>相册管理</h2>
    <div class="album-header">
      <el-button type="primary" @click="openUploadDialog">上传图片</el-button>
    </div>
    <div class="album-grid">
      <div v-for="(item, index) in albumData" :key="item.id" class="album-item">
        <el-image
          :src="item.url"
          fit="cover"
          class="album-image"
          @click="previewImage(index)"
        />
        <div class="album-item-footer">
          <span class="image-name">{{ item.name }}</span>
          <el-button size="small" type="danger" @click="deleteImage(item.id)">删除</el-button>
        </div>
      </div>
    </div>
    <!-- 上传图片对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传图片">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadFormRef" label-width="120px">
        <el-form-item label="宠物ID" prop="petId">
          <el-input v-model="uploadForm.petId" placeholder="请输入宠物ID" />
        </el-form-item>
        <el-form-item label="图片描述" prop="description">
          <el-input v-model="uploadForm.description" placeholder="请输入图片描述" type="textarea" />
        </el-form-item>
        <el-form-item label="图片上传" prop="image">
          <el-upload
            class="upload-demo"
            action="#"
            :on-change="handleImageChange"
            :before-upload="beforeImageUpload"
            :multiple="false"
            :show-file-list="false"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
          <div v-if="uploadForm.image" class="preview-image">
            <el-image :src="uploadForm.image" fit="cover" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="图片预览" width="80%">
      <el-image
        :src="previewImageUrl"
        fit="contain"
        class="preview-full-image"
      />
      <div class="preview-info">
        <p>描述: {{ previewImageDescription }}</p>
        <p>上传时间: {{ previewImageTime }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const uploadDialogVisible = ref(false);
const previewDialogVisible = ref(false);
const uploadFormRef = ref();
const previewImageUrl = ref('');
const previewImageDescription = ref('');
const previewImageTime = ref('');

const albumData = ref<any[]>([]);

const uploadForm = reactive({
  petId: '',
  description: '',
  image: ''
});

const uploadRules = {
  petId: [
    { required: true, message: '请输入宠物ID', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ]
};

const openUploadDialog = () => {
  // 重置表单
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }
  uploadForm.image = '';
  uploadDialogVisible.value = true;
};

const handleImageChange = (file: any) => {
  // 处理图片上传逻辑，暂时使用本地预览
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = (e) => {
    uploadForm.image = e.target?.result as string;
  };
};

const beforeImageUpload = (file: any) => {
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

const submitUpload = async () => {
  if (!uploadFormRef.value) return;
  await uploadFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 模拟上传操作
        const newImage = {
          id: Date.now(),
          petId: uploadForm.petId,
          url: uploadForm.image,
          name: `图片${Date.now()}`,
          description: uploadForm.description,
          uploadTime: new Date().toISOString().split('T')[0]
        };
        albumData.value.push(newImage);
        ElMessage.success('上传成功');
        uploadDialogVisible.value = false;
      } catch (error) {
        ElMessage.error('上传失败');
      }
    } else {
      return false;
    }
  });
};

const deleteImage = (id: number) => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 模拟删除操作
      albumData.value = albumData.value.filter(item => item.id !== id);
      ElMessage.success('删除成功');
    })
    .catch(() => {
      // 取消删除
    });
};

const previewImage = (index: number) => {
  const image = albumData.value[index];
  previewImageUrl.value = image.url;
  previewImageDescription.value = image.description;
  previewImageTime.value = image.uploadTime;
  previewDialogVisible.value = true;
};

// 模拟数据
const fetchAlbum = () => {
  albumData.value = [
    {
      id: 1,
      petId: 1,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20pet%20photo&image_size=square',
      name: '猫咪照片1',
      description: '可爱的猫咪',
      uploadTime: '2024-01-01'
    },
    {
      id: 2,
      petId: 1,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20pet%20photo&image_size=square',
      name: '狗狗照片1',
      description: '活泼的狗狗',
      uploadTime: '2024-01-02'
    }
  ];
};

onMounted(() => {
  fetchAlbum();
});
</script>

<style scoped>
.pets-album {
  padding: 20px;
}

.album-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.album-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.album-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.album-image {
  width: 100%;
  height: 150px;
  cursor: pointer;
}

.album-item-footer {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.preview-image {
  margin-top: 10px;
  width: 200px;
  height: 150px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.preview-full-image {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
}

.preview-info {
  margin-top: 10px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>