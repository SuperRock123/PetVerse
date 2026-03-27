<template>
  <div class="posts-list">
    <div class="list-header">
      <h2>帖子</h2>
    </div>
    
    <div class="loading-container" v-if="loading && posts.length === 0">
      <el-skeleton :rows="5" animated />
    </div>

    <div class="feeds-container" v-if="posts.length > 0">
      <Waterfall :list="posts" :width="240" :hasAroundGutter="false" style="max-width: 1260px">
        <template #item="{ item }">
          <div class="card" @click="openPostDetail(item)">
            <LazyImg :url="getPostCover(item)" style="border-radius: 8px" />
            <div class="footer">
              <a class="title"><span>{{ item.content?.slice(0, 50) || '分享动态' }}</span></a>
              <div class="author-wrapper">
                <a class="author">
                  <img class="author-avatar" :src="item.userAvatar || defaultAvatar" />
                  <span class="name">{{ item.nickname || item.userName || '用户' }}</span>
                </a>
                <span class="like-wrapper" :class="{ 'like-active': item.isLiked }" @click.stop="handleLike(item)">
                  <Star style="width: 1em; height: 1em" />
                  <span class="count">{{ item.likesCount || 0 }}</span>
                </span>
              </div>
            </div>
          </div>
        </template>
      </Waterfall>
    </div>

    <div class="feeds-loading" v-if="loadingMore">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div class="no-more" v-if="noMore && posts.length > 0">
      <span>没有更多了</span>
    </div>

    <el-empty v-if="!loading && posts.length === 0" description="暂无动态" />

    <el-dialog
      v-model="showPostDetail"
      :title="null"
      width="800px"
      class="post-detail-dialog"
      :close-on-click-modal="true"
    >
      <div class="post-detail" v-if="currentPost">
        <div class="post-detail-media" v-if="currentPost.mediaUrls?.length > 0">
          <el-carousel :interval="5000" arrow="always" height="400px">
            <el-carousel-item v-for="(url, index) in currentPost.mediaUrls" :key="index">
              <el-image :src="url" fit="contain" style="width: 100%; height: 100%;" :preview-src-list="currentPost.mediaUrls" />
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="post-detail-content">
          <div class="post-detail-header">
            <el-avatar :size="48" :src="currentPost.userAvatar || defaultAvatar">
              {{ currentPost.userName?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <div class="post-detail-user">
              <div class="user-name">{{ currentPost.nickname || currentPost.userName }}</div>
              <div class="post-time">{{ formatTime(currentPost.createdAt) }}</div>
            </div>
          </div>
          <div class="post-detail-text">
            <p>{{ currentPost.content }}</p>
            <div v-if="currentPost.location" class="post-location">
              <el-icon><Location /></el-icon>
              {{ currentPost.location }}
            </div>
          </div>
          <div class="post-detail-stats">
            <span><el-icon><View /></el-icon> {{ currentPost.viewCount || 0 }}</span>
            <span><el-icon><ChatDotRound /></el-icon> {{ currentPost.commentsCount || 0 }}</span>
            <span><el-icon><Star /></el-icon> {{ currentPost.likesCount || 0 }}</span>
          </div>
          <div class="post-detail-actions">
            <el-button :type="currentPost.isLiked ? 'danger' : 'default'" @click="handleLike(currentPost)">
              <el-icon><Star /></el-icon>
              {{ currentPost.isLiked ? '取消点赞' : '点赞' }}
            </el-button>
            <el-button @click="focusCommentInput">
              <el-icon><ChatDotRound /></el-icon>
              评论
            </el-button>
            <el-button>
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, Location, View, ChatDotRound, Loading, Share, Close } from '@element-plus/icons-vue'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import { getPostList, toggleLike, type PostResponse } from '@/api/post'
import { useUserStore } from '@/store/userStore'

const props = defineProps<{
  userId: number;
}>();

const userStore = useUserStore()

const loading = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const posts = ref<PostResponse[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const showPostDetail = ref(false)
const currentPost = ref<PostResponse | null>(null)

const defaultAvatar = computed(() => 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const getPostCover = (post: PostResponse) => {
  if (post.mediaUrls && post.mediaUrls.length > 0) {
    return post.mediaUrls[0]
  }
  return 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const fetchPosts = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const res = await getPostList({
      page: currentPage.value,
      pageSize: pageSize.value,
      userId: props.userId
    })
    if ((res as any).success && (res as any).data) {
      if (isLoadMore) {
        posts.value = [...posts.value, ...res.data.posts]
      } else {
        posts.value = res.data.posts
      }
      noMore.value = !res.data.pagination.hasNextPage
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    if (!isLoadMore) {
      ElMessage.error('获取帖子列表失败')
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const handleLike = async (post: PostResponse) => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const res = await toggleLike({
      targetType: 'post',
      targetId: post.id,
      userId: userStore.userInfo.id
    })
    if ((res as any).success) {
      post.isLiked = (res as any).data.isLiked
      post.likesCount = (res as any).data.isLiked ? post.likesCount + 1 : post.likesCount - 1
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const openPostDetail = async (post: PostResponse) => {
  currentPost.value = post
  showPostDetail.value = true
}

const focusCommentInput = () => {
  // 这里可以添加评论输入框聚焦逻辑
  console.log('聚焦评论输入框')
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingMore.value && !noMore.value) {
    currentPage.value++
    fetchPosts(true)
  }
}

onMounted(() => {
  fetchPosts()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="less" scoped>
.posts-list {
  padding: 20px;
  
  .list-header {
    margin-bottom: 20px;
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .loading-container {
    padding: 40px;
  }

  .feeds-container {
    position: relative;
    transition: width 0.5s;
    margin: 0 auto;

    .card {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-4px);
      }
    }

    .footer {
      padding: 12px;

      .title {
        margin-bottom: 8px;
        word-break: break-all;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        font-weight: 500;
        font-size: 14px;
        line-height: 140%;
        color: var(--color-text);
        transition: color 0.3s;
      }

      .author-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 20px;
        color: var(--color-textSecondary);
        font-size: 12px;
        transition: color 1s;

        .author {
          display: flex;
          align-items: center;
          color: inherit;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 12px;

          .author-avatar {
            margin-right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 20px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
          }

          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .like-wrapper {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.3s;

          .count {
            margin-left: 2px;
          }

          &.like-active {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .feeds-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--color-textSecondary);
    gap: 8px;
    transition: color 0.3s;
  }

  .no-more {
    text-align: center;
    padding: 20px;
    color: var(--color-textSecondary);
    font-size: 14px;
    transition: color 0.3s;
  }
}

.post-detail-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 80vh;
    overflow-y: auto;
  }

  .post-detail {
    display: flex;
    flex-direction: column;

    .post-detail-media {
      background: #000;
    }

    .post-detail-content {
      padding: 20px;

      .post-detail-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .post-detail-user {
          .user-name {
            font-weight: 600;
            font-size: 16px;
            color: var(--color-text);
            transition: color 0.3s;
          }

          .post-time {
            font-size: 12px;
            color: var(--color-textSecondary);
            margin-top: 4px;
            transition: color 0.3s;
          }
        }
      }

      .post-detail-text {
        margin-bottom: 16px;

        p {
          margin: 0 0 8px 0;
          color: var(--color-text);
          line-height: 1.6;
          font-size: 15px;
          transition: color 0.3s;
        }

        .post-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--color-textSecondary);
          transition: color 0.3s;
        }
      }

      .post-detail-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        color: var(--color-textSecondary);
        font-size: 14px;
        transition: color 0.3s;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .post-detail-actions {
        display: flex;
        gap: 12px;
      }
    }
  }
}
</style>