import { createApp } from 'vue'
import Popup from './Popup.vue'
import pinia from "@/stores"

// 引入全局样式
import '@/style/global.css'
import 'element-plus/theme-chalk/index.css'
const app = createApp(Popup)
app.use(pinia)

app.mount('#app')
