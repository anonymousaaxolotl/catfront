// src/main.js
import './assets/main.css'
import { registerPlugins } from '@/plugins'
import { createApp } from 'vue'
import App from './App.vue'
import '@pixelium/web-vue/dist/font.css'
import { useThemeMode } from '@pixelium/web-vue'

const [mode] = useThemeMode()

mode.value = 'light'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
