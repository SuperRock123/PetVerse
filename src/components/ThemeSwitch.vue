<template>
  <div class="theme-switch">
    <el-dropdown @command="handleThemeChange">
      <el-button type="primary" size="small">
        {{ currentThemeText }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="light">
            <span class="theme-option light">亮色主题</span>
          </el-dropdown-item>
          <el-dropdown-item command="dark">
            <span class="theme-option dark">暗色主题</span>
          </el-dropdown-item>
          <el-dropdown-item command="pet">
            <span class="theme-option pet">宠物主题</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { useThemeStore } from '@/store/theme';
import type { ThemeType } from '@/styles/theme';

const themeStore = useThemeStore();

const currentThemeText = computed(() => {
  const themes: Record<ThemeType, string> = {
    light: '亮色主题',
    dark: '暗色主题',
    pet: '宠物主题'
  };
  return themes[themeStore.currentTheme.value];
});

const handleThemeChange = (theme: ThemeType) => {
  themeStore.setTheme(theme);
};
</script>

<style scoped>
.theme-switch {
  margin: 0 10px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-option::before {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.theme-option.light::before {
  background-color: #F5F5F5;
  border: 1px solid #333333;
}

.theme-option.dark::before {
  background-color: #121212;
  border: 1px solid #FFFFFF;
}

.theme-option.pet::before {
  background-color: #FF6B6B;
  border: 1px solid #333333;
}
</style>