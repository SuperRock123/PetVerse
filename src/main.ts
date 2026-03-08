import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

import router from "./router/index";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// 加载主题配置
import { useThemeStore } from "./store/theme";
const themeStore = useThemeStore();
themeStore.loadTheme();

app.use(router);
app.use(ElementPlus);

app.mount("#app");
