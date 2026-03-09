<template>
  <div class="pets-list">
    <h2>宠物列表</h2>
    <div class="list-header">
      <el-button type="primary" @click="navigateToAdd">添加宠物</el-button>
    </div>
    <el-table :data="petsData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="宠物名称" />
      <el-table-column prop="breed" label="品种" />
      <el-table-column prop="gender" label="性别" width="80">
        <template #default="scope">
          {{ scope.row.gender === 1 ? '公' : '母' }}
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="生日" width="180" />
      <el-table-column prop="weightKg" label="体重(kg)" width="100" />
      <el-table-column prop="healthStatus" label="健康状态" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editPet(scope.row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="deletePet(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPetList, deletePet as deletePetApi } from '@/api/pet';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const petsData = ref<any[]>([]);

const navigateToAdd = () => {
  router.push('/pets/add');
};

const editPet = (id: number) => {
  // 编辑宠物逻辑，暂时跳转到添加页面，后续可以添加编辑页面
  router.push(`/pets/add?id=${id}`);
};

const deletePetConfirm = async (id: number) => {
  try {
    await deletePetApi(id);
    await fetchPets();
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const deletePet = (id: number) => {
  ElMessageBox.confirm('确定要删除这个宠物吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deletePetConfirm(id);
    })
    .catch(() => {
      // 取消删除
    });
};

const fetchPets = async () => {
  try {
    const response = await getPetList({
      Page: currentPage.value,
      PageSize: pageSize.value
    });
    petsData.value = response.data.items || [];
    total.value = response.data.total || 0;
  } catch (error) {
    ElMessage.error('获取宠物列表失败');
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
.pets-list {
  padding: 20px;
}

.list-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>