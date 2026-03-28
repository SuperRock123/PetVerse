import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/login.vue";
import Dashboard from "@/pages/dashboard/dashboard.vue";

export const routes = [
  {
    path: "/",
    redirect: "/index",
  },
  {
    name: "login",
    path: "/login",
    component: Login,
  },
  {
    name: "index",
    path: "/index",
    component: () => import("@/pages/index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "/dashboard",
        component: Dashboard,
        name: "dashboard", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
      },
      {
        path: "/followTrend",
        component: () => import("@/pages/follow-trend/follow-trend.vue"),
        name: "followTrend", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        meta: { requiresAuth: true }
      },
      {
        path: "/notice",
        component: () => import("@/pages/message/index.vue"),
        name: "notice", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        redirect: "/message",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/message",
            component: () => import("@/pages/message/children/message.vue"),
            name: "message", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
          {
            path: "/agreeCollection",
            component: () => import("@/pages/message/children/agree-collection.vue"),
            name: "agreeCollection", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
          {
            path: "/follower",
            component: () => import("@/pages/message/children/follower.vue"),
            name: "follower", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
          {
            path: "/comment",
            component: () => import("@/pages/message/children/comment.vue"),
            name: "comment", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
          {
            path: "/chat",
            component: () => import("@/pages/chat/index.vue"),
            name: "chat", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
        ],
      },
      {
        path: "/user",
        component: () => import("@/pages/user/index.vue"),
        name: "user", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        redirect: "/note",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/note",
            component: () => import("@/pages/user/children/note.vue"),
            name: "note", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
          {
            path: "/agree",
            component: () => import("@/pages/user/children/agree.vue"),
            name: "agree", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
          {
            path: "/collection",
            component: () => import("@/pages/user/children/collection.vue"),
            name: "collection", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
          },
        ],
      },
      {
        path: "/push",
        component: () => import("@/pages/push/index.vue"),
        name: "push", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        meta: { requiresAuth: true }
      },
      // 用户模块
      {
        path: "/user/profile",
        component: () => import("@/pages/user/profile.vue"),
        name: "userProfile",
        meta: { requiresAuth: true }
      },
      {
        path: "/user/tags",
        component: () => import("@/pages/user/tags.vue"),
        name: "userTags",
        meta: { requiresAuth: true }
      },
      // 宠物管理模块
      {
        path: "/pets",
        component: () => import("@/pages/pets/index.vue"),
        name: "pets",
        redirect: "/pets/list",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/pets/list",
            component: () => import("@/pages/pets/list.vue"),
            name: "petsList",
          },
          {
            path: "/pets/vaccine",
            component: () => import("@/pages/pets/vaccine.vue"),
            name: "petsVaccine",
          },
          {
            path: "/pets/album",
            component: () => import("@/pages/pets/album.vue"),
            name: "petsAlbum",
          },
        ],
      },
      // 社区动态模块
      {
        path: "/social",
        component: () => import("@/pages/social/index.vue"),
        name: "social",
        meta: { requiresAuth: true }
      },
      // AI模块
      {
        path: "/ai",
        component: () => import("@/pages/ai/index.vue"),
        name: "ai",
        redirect: "/ai/qa",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/ai/qa",
            component: () => import("@/pages/ai/qa.vue"),
            name: "aiQa",
          },
          {
            path: "/ai/avatar",
            component: () => import("@/pages/ai/avatar.vue"),
            name: "aiAvatar",
          },
          {
            path: "/ai/emoji",
            component: () => import("@/pages/ai/emoji.vue"),
            name: "aiEmoji",
          },
        ],
      },
      // Pettag模块
      {
        path: "/pettag",
        component: () => import("@/pages/pettag/index.vue"),
        name: "pettag",
        redirect: "/pettag/list",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/pettag/list",
            component: () => import("@/pages/pettag/list.vue"),
            name: "pettagList",
          },
          {
            path: "/pettag/location",
            component: () => import("@/pages/pettag/location.vue"),
            name: "pettagLocation",
          },
          {
            path: "/pettag/status",
            component: () => import("@/pages/pettag/status.vue"),
            name: "pettagStatus",
          },
        ],
      },
      // 地图模块
      {
        path: "/map",
        component: () => import("@/pages/map/index.vue"),
        name: "map",
        redirect: "/map/pet-location",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/map/pet-location",
            component: () => import("@/pages/map/pet-location.vue"),
            name: "mapPetLocation",
          },
          {
            path: "/map/nearby",
            component: () => import("@/pages/map/nearby.vue"),
            name: "mapNearby",
          },
        ],
      },
      // 管理后台模块
      {
        path: "/admin",
        component: () => import("@/pages/admin/index.vue"),
        name: "admin",
        redirect: "/admin/users",
        meta: { requiresAuth: true },
        children: [
          {
            path: "/admin/users",
            component: () => import("@/pages/admin/users.vue"),
            name: "adminUsers",
          },
          {
            path: "/admin/content",
            component: () => import("@/pages/admin/content.vue"),
            name: "adminContent",
          },
          {
            path: "/admin/reports",
            component: () => import("@/pages/admin/reports.vue"),
            name: "adminReports",
          },
          {
            path: "/admin/dashboard",
            component: () => import("@/pages/admin/dashboard.vue"),
            name: "adminDashboard",
          },
        ],
      },
      // 搜索模块
      {
        path: "/search",
        component: () => import("@/pages/search/index.vue"),
        name: "search",
        meta: { requiresAuth: true }
      },
      // 宠物主页
      {
        path: "/pet/:id",
        component: () => import("@/pages/pet/index.vue"),
        name: "petDetail",
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    name: "main",
    path: "/main",
    component: () => import("@/pages/main.vue"),
  },
];
const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth || false;
  const isLoggedIn = !!localStorage.getItem('token');
  
  if (requiresAuth && !isLoggedIn) {
    // 未登录，重定向到登录页
    next({ path: '/login' });
  } else {
    next();
  }
});
export default router;
