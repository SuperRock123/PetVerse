<template>
  <div class="pets-container">
    <h1>宠物管理</h1>
    <div class="pets-nav">
      <router-link to="/pets/list" class="nav-item">宠物列表</router-link>
      <router-link to="/pets/add" class="nav-item">添加宠物</router-link>
      <router-link to="/pets/vaccine" class="nav-item">疫苗管理</router-link>
      <router-link to="/pets/album" class="nav-item">相册管理</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
// 宠物管理主页面逻辑
</script>

<style scoped>
.pets-container {
  padding: 20px;
}

.pets-nav {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.nav-item {
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #409eff;
}

.router-link-active {
  background-color: #409eff;
  color: white;
}
</style>