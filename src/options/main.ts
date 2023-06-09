import { createApp } from 'vue'
import App from './App.vue'
import pinia from "@/stores"

// 引入全局样式
import '@/style/global.css'

const app = createApp(App)
app.use(pinia)

app.mount('#app')
