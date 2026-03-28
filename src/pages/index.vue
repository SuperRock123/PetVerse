<template>
  <div class="container">
    <div class="top">
      <header class="mask-paper">
        <a style="display: flex">PetVerse</a>
        <div class="tool-box"></div>
        <div class="input-box">
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索宠物相关内容" 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
          <div class="input-button">
            <div class="close-icon" @click="clearSearch"><Close style="width: 1em; height: 1em; margin-right: 8px" /></div>
            <div class="search-icon" @click="handleSearch"><Search style="width: 1em; height: 1em; margin-right: 8px" /></div>
          </div>
        </div>
        <div class="right">
          <ThemeSwitch />
        </div>
      </header>
    </div>
    <div class="main">
      <div class="side-bar">
        <ul class="channel-list">
          <li class="active-channel">
            <a class="link-wrapper"
              ><House style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toDashboard()"
                >首页</span
              ></a
            >
          </li>
          <li>
            <Star style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toSocial()">
              社区动态</span
            >
          </li>
          <li>
            <Avatar style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toPets()">
              宠物管理</span
            >
          </li>
          <li>
            <Cpu style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toAi()">
              AI服务</span
            >
          </li>
          <li>
            <Location style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toMap()">
              地图服务</span
            >
          </li>
          <li>
            <Bell style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toMessage()">
              消息</span
            >
          </li>
          <li>
            <CirclePlus style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toPush()">
              发布</span
            >
          </li>
          <li>
            <User style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toUser()">
              个人中心</span
            >
          </li>
          <li>
            <Key style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel" @click="toAdmin()">
              管理后台</span
            >
          </li>
        </ul>
        <!-- TODO: 底部信息栏 先不展示 -->
        <!-- <div class="information-container">
          <div class="information-pad">
            <div class="container">
              <div>
                <div>
                  <div class="group-wrapper">
                    <div class="menu-item hover-effect">
                      <span>关于小红书</span>
                      <div class="icon">
                        <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>隐私，协议</span>
                      <div class="icon">
                        <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>帮助与客服</span>
                    </div>
                  </div>
                  <div class="divider"></div>
                </div>
                <div>
                  <div class="group-wrapper">
                    <div class="group-header">访问方式</div>
                    <div class="menu-item hover-effect">
                      <span>键盘快捷键</span>
                      <div class="icon">
                        <Search style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>添加小红书到桌面</span>
                      <div class="icon">
                        <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>小窗模式</span>
                    </div>
                  </div>
                  <div class="divider"></div>
                </div>
                <div>
                  <div class="group-wrapper">
                    <div class="group-header">设置</div>
                    <div class="menu-item hover-effect">
                      <span>深色模式</span>
                      <div class="multistage-toggle component">
                        <button class="toggle-item active">
                          <div class="icon-wrapper"><Sunny style="width: 1em; height: 1em" /></div>
                        </button>
                        <button class="toggle-item">
                          <div class="icon-wrapper"><Moon style="width: 1em; height: 1em" /></div>
                        </button>
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>推出登录</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="information-wrapper">
            <More style="width: 1em; height: 1em; margin-right: 8px" /> <span class="channel"> 更多</span>
          </div>
        </div> -->
      </div>
      <div class="main-content with-side-bar">
        <router-view />
      </div>
    </div>

    <Login v-show="c" @click-child="close"></Login>
  </div>
</template>

<script lang="ts" setup>
import {
  Search,
  Close,
  House,
  Star,
  Bell,
  User,
  CirclePlus,
  Avatar,
  Cpu,
  Location,
  Key,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import Login from "@/pages/login.vue";
import ThemeSwitch from "@/components/ThemeSwitch.vue";
import { ref } from "vue";
const router = useRouter();

const c = ref(true);
const searchQuery = ref('');

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } });
  }
};

// 清空搜索
const clearSearch = () => {
  searchQuery.value = '';
};

const toDashboard = () => {
  router.push({ path: "/dashboard" });
};

const toSocial = () => {
  router.push({ path: "/social" });
};

const toPets = () => {
  router.push({ path: "/pets" });
};

const toAi = () => {
  router.push({ path: "/ai" });
};

const toMap = () => {
  router.push({ path: "/map" });
};

const toMessage = () => {
  router.push({ path: "/message" });
};

const toUser = () => {
  router.push({ path: "/user" });
};

const toPush = () => {
  router.push({ path: "/push" });
};

const toAdmin = () => {
  router.push({ path: "/admin" });
};

const close = (val: boolean) => {
  console.log(val);
  c.value = val;
};
</script>

<style lang="less" scoped>
.container {
  max-width: 1728px;
  background-color: var(--color-background);
  margin: 0 auto;
  color: var(--color-text);
  transition: background-color 0.3s, color 0.3s;

  .top {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 72px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    align-items: center;
    background: var(--color-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.3s, box-shadow 0.3s;

    header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1728px;
      height: 72px;
      padding: 0 16px 0 24px;
      z-index: 10;

      a {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-primary);
        text-decoration: none;
      }

      .tool-box {
        width: 24px;
        height: 70px;
        position: absolute;
        left: 0;
        top: 0;
      }

      .input-box {
        height: 40px;
        position: fixed;
        left: 50%;
        transform: translate(-50%);

        @media screen and (max-width: 695px) {
          display: none;
        }

        @media screen and (min-width: 960px) and (max-width: 1191px) {
          width: calc(-36px + 50vw);
        }

        @media screen and (min-width: 1192px) and (max-width: 1423px) {
          width: calc(-33.6px + 40vw);
        }

        @media screen and (min-width: 1424px) and (max-width: 1727px) {
          width: calc(-42.66667px + 33.33333vw);
        }

        @media screen and (min-width: 1728px) {
          width: 533.33333px;
        }
        .search-input {
          padding: 0 84px 0 16px;
          width: 100%;
          height: 100%;
          font-size: 16px;
          line-height: 120%;
          color: var(--color-text);
          caret-color: var(--color-primary);
          background: rgba(0, 0, 0, 0.03);
          border-radius: 999px;
          transition: background-color 0.3s, color 0.3s;
        }

        .input-button {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-textSecondary);
          transition: color 0.3s;

          .close-icon, .search-icon {
            width: 40px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--color-textSecondary);
            transition: color 0.3s;
          }
        }
      }

      .right {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }
  }

  .main {
    display: flex;

    .side-bar {
      @media screen and (max-width: 695px) {
        display: none;
      }
      @media screen and (min-width: 696px) and (max-width: 959px) {
        display: none;
      }

      @media screen and (min-width: 960px) and (max-width: 1191px) {
        width: calc(-18px + 25vw);
        margin-left: 12px;
      }

      @media screen and (min-width: 1192px) and (max-width: 1423px) {
        width: calc(-16.8px + 20vw);
        margin-left: 12px;
      }

      @media screen and (min-width: 1424px) and (max-width: 1727px) {
        width: calc(-21.33333px + 16.66667vw);
        margin-left: 16px;
      }

      @media screen and (min-width: 1728px) {
        width: 266.66667px;
        margin-left: 16px;
      }

      height: calc(100vh - 72px);
      overflow-y: scroll;
      background-color: var(--color-surface);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      padding-top: 16px;
      margin-top: 72px;
      position: fixed;
      overflow: visible;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
      transition: background-color 0.3s, box-shadow 0.3s;

      .channel-list {
        min-height: auto;
        -webkit-user-select: none;
        user-select: none;

        .active-channel {
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 999px;
          color: var(--color-text);
        }

        li {
          padding-left: 16px;
          min-height: 48px;
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-bottom: 8px;
          color: var(--color-textSecondary);
          transition: color 0.3s;

          .link-wrapper {
            display: flex;
            width: 100%;
            height: 48px;
            align-items: center;
          }

          &:hover {
            color: var(--color-primary);
          }
        }

        .channel {
          font-size: 16px;
          font-weight: 600;
          margin-left: 12px;
          color: var(--color-text);
          transition: color 0.3s;
        }
      }

      .information-container {
        display: inline-block;
        width: 100%;
        color: var(--color-text);
        font-size: 16px;
        position: absolute;
        bottom: 0;
        transition: color 0.3s;

        .information-pad {
          z-index: 16;
          margin-bottom: 4px;
          width: 100%;

          .container {
            width: 100%;
            background: var(--color-surface);
            box-shadow:
              0 4px 32px 0 rgba(0, 0, 0, 0.08),
              0 1px 4px 0 rgba(0, 0, 0, 0.04);
            border-radius: 12px;
            transition: background-color 0.3s, box-shadow 0.3s;

            .divider {
              margin: 0px 12px;
              list-style: none;
              height: 0;
              border: 1px solid var(--color-border);
              border-width: 1px 0 0;
              transition: border-color 0.3s;
            }

            .group-wrapper {
              padding: 4px;

              .group-header {
                display: flex;
                align-items: center;
                padding: 0 12px;
                font-weight: 400;
                height: 32px;
                color: var(--color-textSecondary);
                font-size: 12px;
                transition: color 0.3s;
              }

              .menu-item {
                height: 40px;
                color: var(--color-textSecondary);
                font-size: 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                padding: 0 12px;
                font-weight: 400;
                transition: color 0.3s, background-color 0.3s;

                &:hover {
                  background-color: rgba(0, 0, 0, 0.03);
                }

                .icon {
                  color: var(--color-textSecondary);
                  margin-left: auto;
                  transition: color 0.3s;
                }

                .component {
                  margin-left: auto;
                }

                .multistage-toggle {
                  position: relative;
                  background: rgba(0, 0, 0, 0.03);
                  display: flex;
                  padding: 2px;
                  border-radius: 999px;
                  cursor: pointer;

                  .active {
                    background: var(--color-surface);
                    box-shadow:
                      0 2px 8px 0 rgba(0, 0, 0, 0.04),
                      0 1px 2px 0 rgba(0, 0, 0, 0.02);
                    color: var(--color-text);
                    transition: background-color 0.3s, box-shadow 0.3s, color 0.3s;
                  }

                  .toggle-item {
                    border-radius: 999px;
                    background: transparent;
                    color: var(--color-textSecondary);
                    transition: color 0.3s;

                    .icon-wrapper {
                      width: 24px;
                      height: 24px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                    }
                  }
                }
              }
            }
          }
        }

        .information-wrapper {
          -webkit-user-select: none;
          user-select: none;
          cursor: pointer;
          position: relative;
          margin-bottom: 20px;
          height: 48px;
          width: 100%;
          display: flex;
          font-weight: 600;
          align-items: center;
          border-radius: 999px;
          transition: color 0.3s;

          &:hover {
            color: var(--color-primary);
          }
        }
      }
    }

    .main-content {
      width: 100%;
      min-height: calc(100vh - 72px);
      margin-top: 72px;
      padding: 20px;
      transition: background-color 0.3s;
    }

    .main-content {
      @media screen and (min-width: 960px) and (max-width: 1191px) {
        padding-left: calc(-6px + 25vw + 20px);
      }

      @media screen and (min-width: 1192px) and (max-width: 1423px) {
        padding-left: calc(-4.8px + 20vw + 20px);
      }

      @media screen and (min-width: 1424px) and (max-width: 1727px) {
        padding-left: calc(-5.33333px + 16.66667vw + 20px);
      }

      @media screen and (min-width: 1728px) {
        padding-left: 302.66667px;
      }
    }
  }
}
</style>
