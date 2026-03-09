<template>
  <div class="pets-vaccine">
    <h2>疫苗管理</h2>
    <div class="vaccine-header">
      <el-button type="primary" @click="addVaccine">添加疫苗</el-button>
    </div>
    <el-table :data="vaccinesData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="petId" label="宠物ID" width="100" />
      <el-table-column prop="vaccineName" label="疫苗名称" />
      <el-table-column prop="vaccineDate" label="接种日期" width="180" />
      <el-table-column prop="nextDate" label="下次接种日期" width="180" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editVaccine(scope.row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteVaccine(scope.row.id)">删除</el-button>
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
    <!-- 添加/编辑疫苗对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditVaccine ? '编辑疫苗' : '添加疫苗'">
      <el-form :model="vaccineForm" :rules="vaccineRules" ref="vaccineFormRef" label-width="120px">
        <el-form-item label="宠物ID" prop="petId">
          <el-input v-model="vaccineForm.petId" placeholder="请输入宠物ID" />
        </el-form-item>
        <el-form-item label="疫苗名称" prop="vaccineName">
          <el-input v-model="vaccineForm.vaccineName" placeholder="请输入疫苗名称" />
        </el-form-item>
        <el-form-item label="接种日期" prop="vaccineDate">
          <el-date-picker
            v-model="vaccineForm.vaccineDate"
            type="date"
            placeholder="请选择接种日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="下次接种日期" prop="nextDate">
          <el-date-picker
            v-model="vaccineForm.nextDate"
            type="date"
            placeholder="请选择下次接种日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="vaccineForm.description" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVaccineForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const vaccinesData = ref<any[]>([]);
const dialogVisible = ref(false);
const isEditVaccine = ref(false);
const vaccineFormRef = ref();
const vaccineId = ref<number | null>(null);

const vaccineForm = reactive({
  petId: '',
  vaccineName: '',
  vaccineDate: '',
  nextDate: '',
  description: ''
});

const vaccineRules = {
  petId: [
    { required: true, message: '请输入宠物ID', trigger: 'blur' }
  ],
  vaccineName: [
    { required: true, message: '请输入疫苗名称', trigger: 'blur' }
  ],
  vaccineDate: [
    { required: true, message: '请选择接种日期', trigger: 'change' }
  ],
  nextDate: [
    { required: true, message: '请选择下次接种日期', trigger: 'change' }
  ]
};

const addVaccine = () => {
  isEditVaccine.value = false;
  vaccineId.value = null;
  // 重置表单
  if (vaccineFormRef.value) {
    vaccineFormRef.value.resetFields();
  }
  dialogVisible.value = true;
};

const editVaccine = (id: number) => {
  isEditVaccine.value = true;
  vaccineId.value = id;
  // 模拟获取疫苗详情
  const vaccine = vaccinesData.value.find(item => item.id === id);
  if (vaccine) {
    Object.assign(vaccineForm, vaccine);
  }
  dialogVisible.value = true;
};

const deleteVaccine = (id: number) => {
  ElMessageBox.confirm('确定要删除这个疫苗记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 模拟删除操作
      vaccinesData.value = vaccinesData.value.filter(item => item.id !== id);
      total.value = vaccinesData.value.length;
      ElMessage.success('删除成功');
    })
    .catch(() => {
      // 取消删除
    });
};

const submitVaccineForm = async () => {
  if (!vaccineFormRef.value) return;
  await vaccineFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const formData = {
          ...vaccineForm,
          vaccineDate: vaccineForm.vaccineDate ? new Date(vaccineForm.vaccineDate).toISOString().split('T')[0] : '',
          nextDate: vaccineForm.nextDate ? new Date(vaccineForm.nextDate).toISOString().split('T')[0] : ''
        };
        
        if (isEditVaccine.value && vaccineId.value) {
          // 模拟编辑操作
          const index = vaccinesData.value.findIndex(item => item.id === vaccineId.value);
          if (index !== -1) {
            vaccinesData.value[index] = { ...formData, id: vaccineId.value };
          }
          ElMessage.success('编辑成功');
        } else {
          // 模拟添加操作
          const newVaccine = {
            ...formData,
            id: Date.now()
          };
          vaccinesData.value.push(newVaccine);
          total.value = vaccinesData.value.length;
          ElMessage.success('添加成功');
        }
        
        dialogVisible.value = false;
      } catch (error) {
        ElMessage.error('操作失败');
      }
    } else {
      return false;
    }
  });
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  // 模拟分页操作
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  // 模拟分页操作
};

// 模拟数据
const fetchVaccines = () => {
  vaccinesData.value = [
    {
      id: 1,
      petId: 1,
      vaccineName: '狂犬疫苗',
      vaccineDate: '2024-01-01',
      nextDate: '2025-01-01',
      description: '每年接种一次'
    },
    {
      id: 2,
      petId: 1,
      vaccineName: '猫三联',
      vaccineDate: '2024-02-01',
      nextDate: '2024-08-01',
      description: '半年接种一次'
    }
  ];
  total.value = vaccinesData.value.length;
};

onMounted(() => {
  fetchVaccines();
});
</script>

<style scoped>
.pets-vaccine {
  padding: 20px;
}

.vaccine-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>