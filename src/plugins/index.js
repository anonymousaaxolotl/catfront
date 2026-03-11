import pinia from '@/stores/index.js'

import Pixelium from '@pixelium/web-vue'
import '@pixelium/web-vue/dist/pixelium-vue.css'

import router from '@/router'

export function registerPlugins(app) {
  app.use(pinia).use(Pixelium).use(router)
}
