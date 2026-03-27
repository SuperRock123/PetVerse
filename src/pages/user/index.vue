<template>
  <div class="user-page">
    <div class="user">
      <div class="user-info">
        <div class="avatar">
          <div class="avatar-wrapper">
            <img
              :src="userInfo.avatarUrl || 'https://sns-avatar-qc.xhscdn.com/avatar/5fb295387373d50001ddf25f.jpg?imageView2/2/w/540/format/webp|imageMogr2/strip2'"
              class="user-image"
              style="border: 1px solid rgba(0, 0, 0, 0.08)"
            />
          </div>
        </div>
        <div class="info-part">
          <div class="info">
            <div class="basic-info">
              <div class="user-basic">
                <div class="user-nickname">
                  <div class="user-name">{{ userInfo.nickname || userInfo.username }}<!----></div>
                </div>
                <div class="user-content">
                  <span class="user-redId">用户ID：{{ userInfo.id }}</span><span class="user-IP"> IP属地：广东</span>
                </div>
              </div>
            </div>
            <div class="user-desc">
              {{ userInfo.bio || '这个人很懒，什么都没写' }}
            </div>
            <div class="user-tags">
              <div class="tag-item" v-for="tag in userInfo.tags" :key="tag">
                <div>{{ tag }}</div>
              </div>
            </div>
            <div class="data-info">
              <div class="user-interactions">
                <div @click="navigateToTab('followings')"><span class="count">{{ userStats.followingCount }}</span><span class="shows">关注</span></div>
                <div @click="navigateToTab('followers')"><span class="count">{{ userStats.followerCount }}</span><span class="shows">粉丝</span></div>
                <div @click="navigateToTab('likes')"><span class="count">{{ userStats.likesCount }}</span><span class="shows">获赞</span></div>
                <div @click="navigateToTab('posts')"><span class="count">{{ userStats.postsCount }}</span><span class="shows">帖子</span></div>
                <div @click="navigateToTab('pets')"><span class="count">{{ userStats.petsCount }}</span><span class="shows">宠物</span></div>
                <div @click="navigateToTab('comments')"><span class="count">{{ userStats.commentsCount }}</span><span class="shows">评论</span></div>
              </div>
            </div>
            <!---->
          </div>
          <div class="follow">
            <button v-if="isCurrentUser" class="edit-btn" @click="openEditProfileDialog">编辑资料</button>
            <button v-else-if="isFollowing" class="following-btn" @click="unfollowUserHandler">已关注</button>
            <button v-else class="follow-btn" @click="followUserHandler">关注</button>
          </div>
        </div>
      </div>
    </div>
    <div class="reds-sticky-box user-page-sticky" style="--1ee3a37c: all 0.4s cubic-bezier(0.2, 0, 0.25, 1) 0s">
      <div class="reds-sticky" style="">
        <div class="tertiary center reds-tabs-list" style="padding: 0px 12px">
          <div class="reds-tab-item" :class="{ active: activeTab === 'posts' }" style="padding: 0px 16px; margin-right: 0px; font-size: 16px" @click="switchTab('posts')">
            <!----><!----><span>帖子</span>
          </div>
          <div class="reds-tab-item" :class="{ active: activeTab === 'pets' }" style="padding: 0px 16px; margin-right: 0px; font-size: 16px" @click="switchTab('pets')">
            <!----><!----><span>宠物</span>
          </div>
          <div class="reds-tab-item" :class="{ active: activeTab === 'followings' }" style="padding: 0px 16px; margin-right: 0px; font-size: 16px" @click="switchTab('followings')">
            <!----><!----><span>关注</span>
          </div>
          <div class="reds-tab-item" :class="{ active: activeTab === 'followers' }" style="padding: 0px 16px; margin-right: 0px; font-size: 16px" @click="switchTab('followers')">
            <!----><!----><span>粉丝</span>
          </div>
          <div class="reds-tab-item" :class="{ active: activeTab === 'comments' }" style="padding: 0px 16px; margin-right: 0px; font-size: 16px" @click="switchTab('comments')">
            <!----><!----><span>评论</span>
          </div>
          <div class="active-tag" style="width: 64px; left: 627px"></div>
        </div>
      </div>
    </div>
    <div class="feeds-tab-container" style="--1ee3a37c: all 0.4s cubic-bezier(0.2, 0, 0.25, 1) 0s">
      <!-- 帖子列表 -->
      <Posts v-if="activeTab === 'posts'" :userId="userId" />
      <!-- 宠物列表 -->
      <Pets v-if="activeTab === 'pets'" :userId="userId" />
      <!-- 关注列表 -->
      <Followings v-if="activeTab === 'followings'" :userId="userId" />
      <!-- 粉丝列表 -->
      <Followers v-if="activeTab === 'followers'" :userId="userId" />
      <!-- 评论列表 -->
      <Comments v-if="activeTab === 'comments'" :userId="userId" />
    </div>
    
    <!-- 编辑个人资料弹窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
            <div v-else class="avatar-placeholder">
              <el-icon><Plus /></el-icon>
              <span>上传头像</span>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm" :loading="submitting">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getUserById, getFollowerCount, getFollowingCount, followUser, unfollowUser, checkFollowing, updateUser } from '@/api/user';
import { uploadMedia } from '@/api/media';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import Posts from './children/posts.vue';
import Pets from './children/pets.vue';
import Followings from './children/followings.vue';
import Followers from './children/followers.vue';
import Comments from './children/comments.vue';

const router = useRouter();
const route = useRoute();

// 模拟用户ID，实际应该从路由参数或用户登录状态获取
const userId = ref(Number(route.params.id) || 1);
const currentUserId = ref(1); // 模拟当前登录用户ID

// 当前激活的标签页
const activeTab = ref('posts');

// 用户信息
const userInfo = ref({
  id: 0,
  username: '',
  nickname: '',
  avatarUrl: '',
  bio: '',
  tags: []
});

// 用户统计信息
const userStats = ref({
  followingCount: 0,
  followerCount: 0,
  likesCount: 0,
  postsCount: 0,
  petsCount: 0,
  commentsCount: 0
});

// 是否是当前用户
const isCurrentUser = ref(false);
// 是否已关注
const isFollowing = ref(false);

// 编辑资料相关
const showEditDialog = ref(false);
const editFormRef = ref();
const submitting = ref(false);
const editForm = reactive({
  nickname: '',
  bio: '',
  avatar: ''
});
const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
};

// 切换标签页
const switchTab = (tab: string) => {
  activeTab.value = tab;
};

// 打开编辑资料弹窗
const openEditProfileDialog = () => {
  // 初始化表单数据
  editForm.nickname = userInfo.value.nickname;
  editForm.bio = userInfo.value.bio;
  editForm.avatar = userInfo.value.avatarUrl || '';
  showEditDialog.value = true;
};

// 处理头像上传
const handleAvatarChange = async (file: any) => {
  try {
    const response = await uploadMedia(file.raw);
    const mediaData = response.data;
    editForm.avatar = mediaData.storageKey;
    ElMessage.success('头像上传成功');
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败');
  }
};

// 头像上传前验证
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

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      try {
        const response = await updateUser(userId.value, {
          Nickname: editForm.nickname,
          Bio: editForm.bio,
          Avatar: editForm.avatar
        });
        if (response.success) {
          // 更新用户信息
          userInfo.value.nickname = editForm.nickname;
          userInfo.value.bio = editForm.bio;
          userInfo.value.avatarUrl = editForm.avatar;
          ElMessage.success('资料更新成功');
          showEditDialog.value = false;
        }
      } catch (error) {
        console.error('更新资料失败:', error);
        ElMessage.error('更新资料失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await getUserById(userId.value);
    userInfo.value = response.data;
    isCurrentUser.value = userId.value === currentUserId.value;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 获取用户统计信息
const getUserStats = async () => {
  try {
    // 获取关注和粉丝数量
    const followerCountResponse = await getFollowerCount(userId.value);
    const followingCountResponse = await getFollowingCount(userId.value);
    
    userStats.value.followerCount = followerCountResponse.data.count || 0;
    userStats.value.followingCount = followingCountResponse.data.count || 0;
    
    // 从用户详情获取其他统计信息
    const userDetailResponse = await getUserById(userId.value);
    userStats.value.postsCount = userDetailResponse.data.postsCount || 0;
    userStats.value.petsCount = userDetailResponse.data.petsCount || 0;
    
    // 其他统计信息暂时使用模拟数据
    userStats.value.likesCount = Math.floor(Math.random() * 1000);
    userStats.value.commentsCount = Math.floor(Math.random() * 500);
  } catch (error) {
    console.error('获取用户统计信息失败:', error);
  }
};

// 检查是否已关注
const checkIsFollowing = async () => {
  if (isCurrentUser.value) return;
  
  try {
    const response = await checkFollowing(currentUserId.value, userId.value);
    isFollowing.value = response.data.isFollowing;
  } catch (error) {
    console.error('检查关注状态失败:', error);
  }
};

// 关注用户
const followUserHandler = async () => {
  try {
    await followUser(currentUserId.value, userId.value);
    isFollowing.value = true;
    userStats.value.followerCount++;
  } catch (error) {
    console.error('关注用户失败:', error);
  }
};

// 取消关注用户
const unfollowUserHandler = async () => {
  try {
    await unfollowUser(currentUserId.value, userId.value);
    isFollowing.value = false;
    userStats.value.followerCount--;
  } catch (error) {
    console.error('取消关注用户失败:', error);
  }
};

// 导航到标签页
const navigateToTab = (tab: string) => {
  // 这里可以实现导航到不同标签页的逻辑
  console.log('导航到标签页:', tab);
};

// 跳转到点赞页面
const toAgree = () => {
  router.push({ path: "/agree" });
};

// 生命周期钩子
onMounted(async () => {
  await getUserInfo();
  await getUserStats();
  await checkIsFollowing();
});
</script>
<style lang="less" scoped>
.user-page {
  background: #fff;
  overflow-y: scroll;
  overflow-x: hidden;

  .user {
    padding-top: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    .user-info {
      display: flex;
      justify-content: center;
      padding: 48px 0;

      .avatar {
        .avatar-wrapper {
          text-align: center;
          width: 250.66667px;
          height: 175.46667px;
          .user-image {
            border-radius: 50%;
            margin: 0 auto;
            width: 70%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .info-part {
        position: relative;
        width: 100%;

        .info {
          @media screen and (min-width: 1728px) {
            width: 533.33333px;
          }
          margin-left: 32px;
          .basic-info {
            display: flex;
            align-items: center;
            .user-basic {
              width: 100%;
              .user-nickname {
                width: 100%;
                display: flex;
                align-items: center;
                max-width: calc(100% - 96px);
                .user-name {
                  font-weight: 600;
                  font-size: 24px;
                  line-height: 120%;
                  color: #333;
                }
              }
              .user-content {
                width: 100%;
                font-size: 12px;
                line-height: 120%;
                color: rgba(51, 51, 51, 0.6);
                display: flex;
                margin-top: 8px;
                .user-redId {
                  padding-right: 12px;
                }
              }
            }
          }
          .user-desc {
            width: 100%;
            font-size: 14px;
            line-height: 140%;
            color: #333;
            margin-top: 16px;
            white-space: pre-line;
          }
          .user-tags {
            height: 24px;
            margin-top: 16px;
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #333;
            text-align: center;
            font-weight: 400;
            line-height: 120%;
            .tag-item :first-child {
              padding: 3px 6px;
            }
            .tag-item {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px 8px;
              grid-gap: 4px;
              gap: 4px;
              height: 18px;
              border-radius: 41px;
              background: rgba(0, 0, 0, 0.03);
              height: 24px;
              line-height: 24px;
              margin-right: 6px;
              color: rgba(51, 51, 51, 0.6);
            }
          }
          .data-info {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
            .user-interactions {
              width: 100%;
              display: flex;
              align-items: center;
              .count {
                font-weight: 500;
                font-size: 14px;
                margin-right: 4px;
              }
              .shows {
                color: rgba(51, 51, 51, 0.6);
                font-size: 14px;
                line-height: 120%;
              }
            }
            .user-interactions > div {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              margin-right: 16px;
            }
          }
        }

        .follow {
          position: absolute;
          margin-left: auto;
          display: block;
          right: 0;
          top: 0;
          .edit-btn,
          .follow-btn,
          .following-btn {
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .edit-btn {
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #e0e0e0;
          }
          .follow-btn {
            background-color: #ff4757;
            color: white;
            border: none;
          }
          .following-btn {
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #e0e0e0;
          }
          .edit-btn:hover {
            background-color: #e0e0e0;
          }
          .follow-btn:hover {
            background-color: #ff3742;
          }
          .following-btn:hover {
            background-color: #e0e0e0;
          }
        }
      }
    }
  }

  .reds-sticky {
    padding: 16px 0;
    z-index: 5 !important;
    background: hsla(0, 0%, 100%, 0.98);

    .reds-tabs-list {
      screen and (min-width: 1728px) {
        width: 1445.33333px;
      }
      display: flex;
      flex-wrap: nowrap;
      position: relative;
      font-size: 16px;
      justify-content: center;

      .reds-tab-item {
        padding: 0px 16px;
        margin-right: 0px;
        font-size: 16px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 40px;
        cursor: pointer;
        color: rgba(51, 51, 51, 0.8);
        white-space: nowrap;
        transition: transform 0.3s cubic-bezier(0.2, 0, 0.25, 1);
        z-index: 1;
      }
      .reds-tab-item.active {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 20px;
        font-weight: 600;
        color: rgba(51, 51, 51, 0.8);
      }
    }
  }

  .feeds-tab-container {
    padding-left: 2rem;
  }
}
</style>
