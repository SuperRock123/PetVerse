<template>
  <div class="feeds-page">
    <div class="channel-container">
      <div class="scroll-container channel-scroll-container">
        <div class="content-container">
          <div class="channel" :class="{ active: activeChannel === 'recommend' }" @click="switchChannel('recommend')">推荐</div>
          <div class="channel" :class="{ active: activeChannel === 'follow' }" @click="switchChannel('follow')">关注</div>
          <div class="channel" :class="{ active: activeChannel === 'hot' }" @click="switchChannel('hot')">热门</div>
          <div class="channel" :class="{ active: activeChannel === 'newest' }" @click="switchChannel('newest')">最新</div>
        </div>
      </div>
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
          
          <el-divider>评论 ({{ currentPost.commentsCount || 0 }})</el-divider>
          
          <div class="comment-section">
            <div class="comment-input-wrapper">
              <div class="reply-indicator" v-if="replyingTo">
                <span>回复 @{{ replyingTo.nickname || replyingTo.userName }}</span>
                <el-icon class="cancel-reply" @click="cancelReply"><Close /></el-icon>
              </div>
              <el-input
                ref="commentInputRef"
                v-model="newComment"
                type="textarea"
                :rows="2"
                :placeholder="replyingTo ? `回复 @${replyingTo.nickname || replyingTo.userName}...` : '写下你的评论...'"
                maxlength="500"
                show-word-limit
              />
              <el-button type="primary" @click="submitComment" :loading="submittingComment" :disabled="!newComment.trim()">
                发送
              </el-button>
            </div>
            
            <div class="comments-list" v-if="comments.length > 0">
              <div class="comment-item" v-for="comment in comments" :key="comment.id">
                <el-avatar :size="36" :src="comment.userAvatar || defaultAvatar">
                  {{ comment.userName?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-username">{{ comment.nickname || comment.userName }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <span class="action-btn" :class="{ 'liked': comment.isLiked }" @click="handleCommentLike(comment)">
                      <el-icon><Star /></el-icon>
                      {{ comment.likesCount || 0 }}
                    </span>
                    <span class="action-btn" @click="replyToComment(comment)">
                      回复
                    </span>
                  </div>
                  
                  <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
                    <div class="comment-item reply-item" v-for="reply in comment.replies" :key="reply.id">
                      <el-avatar :size="28" :src="reply.userAvatar || defaultAvatar">
                        {{ reply.userName?.charAt(0)?.toUpperCase() }}
                      </el-avatar>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-username">{{ reply.nickname || reply.userName }}</span>
                          <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>
                        </div>
                        <p class="comment-text">{{ reply.content }}</p>
                        <div class="comment-actions">
                          <span class="action-btn" :class="{ 'liked': reply.isLiked }" @click="handleCommentLike(reply)">
                            <el-icon><Star /></el-icon>
                            {{ reply.likesCount || 0 }}
                          </span>
                          <span class="action-btn" @click="replyToComment(reply)">
                            回复
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <el-empty v-else-if="!loadingComments" description="暂无评论，快来抢沙发吧~" :image-size="80" />
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
import { getPostList, getRecommendedPosts, toggleLike, type PostResponse } from '@/api/post'
import { createComment, getPostComments, type CommentInfo } from '@/api/comment'
import { useUserStore } from '@/store/userStore'


const userStore = useUserStore()

const loading = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const posts = ref<PostResponse[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const activeChannel = ref('recommend')
const showPostDetail = ref(false)
const currentPost = ref<PostResponse | null>(null)

const commentInputRef = ref()
const newComment = ref('')
const submittingComment = ref(false)
const loadingComments = ref(false)
const comments = ref<CommentInfo[]>([])
const replyingTo = ref<CommentInfo | null>(null)

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
    let res
    if (activeChannel.value === 'recommend') {
      res = await getRecommendedPosts(pageSize.value)
      if ((res as any).success && (res as any).data) {
        if (isLoadMore) {
          posts.value = [...posts.value, ...res.data]
        } else {
          posts.value = res.data
        }
        noMore.value = res.data.length < pageSize.value
      }
    } else {
      res = await getPostList({
        page: currentPage.value,
        pageSize: pageSize.value
      })
      if ((res as any).success && (res as any).data) {
        if (isLoadMore) {
          posts.value = [...posts.value, ...res.data.posts]
        } else {
          posts.value = res.data.posts
        }
        noMore.value = !res.data.pagination.hasNextPage
      }
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

const switchChannel = (channel: string) => {
  activeChannel.value = channel
  currentPage.value = 1
  noMore.value = false
  posts.value = []
  fetchPosts()
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
  comments.value = post.comments || []
  if (comments.value.length === 0 && post.commentsCount > 0) {
    await fetchComments()
  }
}

const fetchComments = async () => {
  if (!currentPost.value) return
  loadingComments.value = true
  try {
    const currentUserId = userStore.userInfo?.id
    const res = await getPostComments(currentPost.value.id, currentUserId)
    if (res.data) {
      comments.value = res.data
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loadingComments.value = false
  }
}

const focusCommentInput = () => {
  nextTick(() => {
    commentInputRef.value?.focus()
  })
}

const submitComment = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }
  if (!currentPost.value || !newComment.value.trim()) return
  
  submittingComment.value = true
  try {
    const res = await createComment({
      postId: currentPost.value.id,
      userId: userStore.userInfo.id,
      content: newComment.value.trim(),
      parentId: replyingTo.value?.id
    })
    if ((res as any).success) {
      const newCommentData: CommentInfo = {
        id: (res as any).data.id,
        userId: userStore.userInfo.id,
        postId: currentPost.value.id,
        parentId: replyingTo.value?.id || null,
        content: newComment.value.trim(),
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        userName: userStore.userInfo.username || '',
        userAvatar: userStore.userInfo.avatarUrl || null,
        nickname: userStore.userInfo.nickname || null,
        replies: []
      }
      
      if (replyingTo.value) {
        const parentComment = findCommentById(comments.value, replyingTo.value.id)
        if (parentComment) {
          parentComment.replies.unshift(newCommentData)
        }
        replyingTo.value = null
      } else {
        comments.value.unshift(newCommentData)
      }
      
      if (currentPost.value) {
        currentPost.value.commentsCount = (currentPost.value.commentsCount || 0) + 1
      }
      newComment.value = ''
      ElMessage.success('评论成功')
    }
  } catch (error) {
    console.error('评论失败:', error)
    ElMessage.error('评论失败，请重试')
  } finally {
    submittingComment.value = false
  }
}

const findCommentById = (commentList: CommentInfo[], id: number): CommentInfo | null => {
  for (const comment of commentList) {
    if (comment.id === id) return comment
    const found = findCommentById(comment.replies, id)
    if (found) return found
  }
  return null
}

const handleCommentLike = async (comment: CommentInfo) => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const res = await toggleLike({
      targetType: 'comment',
      targetId: comment.id,
      userId: userStore.userInfo.id
    })
    if ((res as any).success) {
      comment.isLiked = (res as any).data.isLiked
      comment.likesCount = (res as any).data.isLiked ? comment.likesCount + 1 : comment.likesCount - 1
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const replyToComment = (comment: CommentInfo) => {
  replyingTo.value = comment
  newComment.value = `@${comment.nickname || comment.userName} `
  focusCommentInput()
}

const cancelReply = () => {
  replyingTo.value = null
  newComment.value = ''
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
.feeds-page {
  flex: 1;
  padding: 0 24px;
  padding-top: 72px;

  .channel-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;

    .channel-scroll-container {
      backdrop-filter: blur(20px);
      background-color: transparent;
      width: calc(100vw - 24px);

      position: relative;
      overflow: hidden;
      display: flex;
      user-select: none;
      -webkit-user-select: none;
      align-items: center;
      font-size: 16px;
      color: rgba(51, 51, 51, 0.8);
      height: 40px;
      white-space: nowrap;
      height: 72px;

      .content-container::-webkit-scrollbar {
        display: none;
      }

      .content-container {
        display: flex;
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
        color: var(--color-textSecondary);
        transition: color 0.3s;

        .active {
          font-weight: 600;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 999px;
          color: var(--color-text);
        }

        .channel {
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 16px;
          cursor: pointer;
          -webkit-user-select: none;
          user-select: none;
          transition: color 0.3s;

          &:hover {
            color: var(--color-primary);
          }
        }
      }
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
      
      .comment-section {
        margin-top: 16px;
        
        .comment-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          
          .reply-indicator {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: var(--el-fill-color-light);
            border-radius: 4px;
            font-size: 13px;
            color: var(--color-textSecondary);
            
            .cancel-reply {
              cursor: pointer;
              color: var(--color-textSecondary);
              transition: color 0.3s;
              
              &:hover {
                color: var(--color-danger);
              }
            }
          }
          
          .el-textarea {
            flex: 1;
          }
          
          > .el-button {
            align-self: flex-end;
          }
        }
        
        .comments-list {
          .comment-item {
            display: flex;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid var(--el-border-color-lighter);
            
            &:last-child {
              border-bottom: none;
            }
            
            &.reply-item {
              margin-top: 12px;
              padding: 8px 0;
              padding-left: 48px;
              border-bottom: none;
            }
            
            .comment-content {
              flex: 1;
              
              .comment-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;
                
                .comment-username {
                  font-weight: 500;
                  font-size: 14px;
                  color: var(--color-text);
                }
                
                .comment-time {
                  font-size: 12px;
                  color: var(--color-textSecondary);
                }
              }
              
              .comment-text {
                margin: 0 0 8px 0;
                font-size: 14px;
                line-height: 1.5;
                color: var(--color-text);
              }
              
              .comment-actions {
                display: flex;
                gap: 16px;
                
                .action-btn {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  font-size: 12px;
                  color: var(--color-textSecondary);
                  cursor: pointer;
                  transition: color 0.3s;
                  
                  &:hover {
                    color: var(--color-primary);
                  }
                  
                  &.liked {
                    color: #f56c6c;
                  }
                }
              }
              
              .replies-list {
                margin-top: 8px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
