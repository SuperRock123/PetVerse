<template>
  <div class="user-profile">
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
              </div>
            </div>
            <!---->
          </div>
          <div class="follow">
            <button v-if="isFollowing" class="following-btn" @click="unfollowUserHandler">已关注</button>
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getUserById, getFollowerCount, getFollowingCount, followUser, unfollowUser, checkFollowing } from '@/api/user';
import Posts from './children/posts.vue';
import Pets from './children/pets.vue';
import Followings from './children/followings.vue';
import Followers from './children/followers.vue';
import Comments from './children/comments.vue';

const router = useRouter();
const route = useRoute();

// 从路由参数获取用户ID
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

// 是否已关注
const isFollowing = ref(false);

// 切换标签页
const switchTab = (tab: string) => {
  activeTab.value = tab;
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await getUserById(userId.value);
    userInfo.value = response.data;
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

// 生命周期钩子
onMounted(async () => {
  await getUserInfo();
  await getUserStats();
  await checkIsFollowing();
});
</script>

<style lang="less" scoped>
.user-profile {
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
              cursor: pointer;
            }
          }
        }

        .follow {
          position: absolute;
          margin-left: auto;
          display: block;
          right: 0;
          top: 0;
          .follow-btn,
          .following-btn {
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
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
    padding: 2rem;
    .posts-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      .post-item {
        .post-image {
          width: 100%;
          height: 300px;
          overflow: hidden;
          border-radius: 8px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          &:hover img {
            transform: scale(1.05);
          }
        }
      }
    }
  }
}
</style>