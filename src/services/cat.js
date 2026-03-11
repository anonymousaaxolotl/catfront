// src/services/cat.js
import { api } from '@/composables/api'

export default {
  // 1. 領養小貓 (POST)
  newCat(data) {
    return api.post('/cat', data) // 💡 網址直接用 /cat，對應後端的 router.post('/')
  },

  // 2. 取得小貓清單 (GET)
  getCat() {
    return api.get('/cat') // 💡 改用 .get()，網址也是 /cat
  },

  // 🌟 管理員取得所有貓咪
  getAll() {
    return api.get('/cat/all')
  },

  // 3. 刪除小貓 (DELETE) - 傳入 ID
  delete(id) {
    return api.delete(`/cat/${id}`) // 💡 使用反引號，把 ID 塞進網址裡
  },

  // 4. 更新小貓 (PATCH) - 傳入 ID 與要改的內容
  updateCat(id, data) {
    return api.patch(`/cat/${id}`, data)
  },

  // 5. 互動功能 (PATCH) - 傳入 ID 與互動類型
  interact(id, type) {
    return api.patch(`/cat/${id}/interact?type=${type}`)
  },
}
