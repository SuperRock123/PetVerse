<template>
  <el-popconfirm
    :title="title"
    :confirm-button-text="confirmText"
    :cancel-button-text="cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #reference>
      <slot name="reference">
        <el-button size="small" type="danger" plain>
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </slot>
    </template>
  </el-popconfirm>
</template>

<script lang="ts" setup>
import { Delete } from '@element-plus/icons-vue';

const props = defineProps({
  title: {
    type: String,
    default: '确定要删除吗？'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
/* 组件样式可以根据需要添加 */
</style>