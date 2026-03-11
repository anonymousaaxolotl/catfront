<template>
  <div class="cat-page">
    <px-container title="🐱 貓咪管理中心">
      <div v-if="loading" class="loading-box">正在呼喚小貓中...</div>

      <div v-else-if="Object.keys(groupedCats).length > 0" class="user-group-list">
        <div v-for="(userCats, account) in groupedCats" :key="account" class="user-section">
          <h3 class="user-title">👤 主人：{{ account }} ({{ userCats.length }} 隻)</h3>
          <div class="cat-grid">
            <div v-for="item in userCats" :key="item._id" class="cat-card">
              <div class="cat-preview">
                <div class="cat-window">
                  <img :src="getCatImage(item.skin)" class="cat-sheet" />
                </div>
              </div>
              <div class="cat-header">
                <span class="cat-name">{{ item.name }}</span>
                <span class="cat-skin-tag">{{ item.skin }}</span>
              </div>
              <div class="cat-stats">
                <p>LV.{{ item.level }}</p>
                <p>飽食: {{ Math.round(item.satiety) }}</p>
                <p>心情: {{ Math.round(item.mood) }}</p>
              </div>
              <div class="cat-actions">
                <px-button
                  size="small"
                  color="#8f9779"
                  textColor="#4e3629"
                  @click="openEditDialog(item)"
                  >編輯</px-button
                >
                <px-button
                  size="small"
                  color="#a0522d"
                  textColor="#ffffff"
                  @click="handleDelete(item._id)"
                  >刪除</px-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-box">這裡目前沒有貓咪喔，快去領養一隻吧！</div>
    </px-container>

    <!-- ✏️ 編輯對話框 -->
    <px-dialog
      v-model:visible="dialogVisible"
      title="✏️ 編輯貓咪狀態"
      width="400px"
      :show-footer="false"
    >
      <div class="form-content">
        <div class="form-group">
          <label>名字</label>
          <input v-model="editForm.name" class="pixel-input" />
        </div>
        <div class="form-group">
          <label>等級 (Level)</label>
          <input v-model.number="editForm.level" type="number" class="pixel-input" />
        </div>
        <div class="form-group">
          <label>飽食度 (0-100)</label>
          <input v-model.number="editForm.satiety" type="number" class="pixel-input" />
        </div>
        <div class="form-group">
          <label>心情值 (0-100)</label>
          <input v-model.number="editForm.mood" type="number" class="pixel-input" />
        </div>
        <div class="form-group">
          <label>清潔度 (0-100)</label>
          <input v-model.number="editForm.hygiene" type="number" class="pixel-input" />
        </div>
        <div class="dialog-footer">
          <px-button color="#8f9779" textColor="#4e3629" @click="handleUpdate">儲存修改</px-button>
          <px-button
            color="#ffb7c5"
            textColor="#4e3629"
            variant="outline"
            @click="dialogVisible = false"
            >取消</px-button
          >
        </div>
      </div>
    </px-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import catService from '@/services/cat'

// 💡 宣告一個響應式的「大盒子」來裝貓咪陣列
const cats = ref([])
// 💡 宣告一個開關，用來控制是否正在讀取
const loading = ref(true)

// ✏️ 編輯相關狀態
const dialogVisible = ref(false)
const editId = ref('')
const editForm = reactive({
  name: '',
  level: 1,
  satiety: 0,
  mood: 0,
  hygiene: 0,
})

// 🕵️‍♂️ 核心功能：去後端抓資料
const fetchCats = async () => {
  try {
    loading.value = true // 開始抓資料，顯示「載入中」

    const { data } = await catService.getAll() // 🌟 改用管理員專用的 API

    // 把後端回傳的 result (陣列) 存進我們的大盒子
    cats.value = data.result
  } catch (error) {
    console.error('抓取貓咪失敗：', error)
    alert('喔不！伺服器不給貓咪資料 Q_Q')
  } finally {
    loading.value = false // 不管成功或失敗，都把「載入中」關掉
  }
}

// 🌟 計算屬性：把貓咪依照主人帳號分組
const groupedCats = computed(() => {
  const groups = {}
  cats.value.forEach((cat) => {
    const account = cat.userId?.account || '未知主人' // 取得主人帳號
    if (!groups[account]) {
      groups[account] = []
    }
    groups[account].push(cat)
  })
  return groups
})

const getImageUrl = (filename) => {
  return new URL(`../../assets/images/${filename}`, import.meta.url).href
}

const getCatImage = (skin) => {
  const map = {
    benz: 'catbenz.png',
    white: 'catwhite.png',
    black: 'catblack.png',
    orange: 'catorange.png',
    mine: 'catmine.png',
  }
  return getImageUrl(map[skin] || 'catbenz.png')
}

const openEditDialog = (cat) => {
  editId.value = cat._id
  editForm.name = cat.name
  editForm.level = cat.level
  editForm.satiety = Math.round(cat.satiety)
  editForm.mood = Math.round(cat.mood)
  editForm.hygiene = Math.round(cat.hygiene)
  dialogVisible.value = true
}

const handleUpdate = async () => {
  try {
    await catService.updateCat(editId.value, editForm)
    $dialog.success({
      content: '貓咪資料更新成功！',
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    dialogVisible.value = false
    fetchCats() // 重新整理列表
  } catch (error) {
    $dialog.warning('更新失敗')
  }
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除這隻貓咪嗎？此動作無法復原喔！')) return
  try {
    await catService.delete(id)
    $dialog.success({
      content: '貓咪已刪除',
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    fetchCats() // 重新整理列表
  } catch (error) {
    console.error(error)
    $dialog.warning(error.response?.data?.message || '刪除失敗')
  }
}

// ✨ 生命週期：當這個頁面「掛載完成（剛打開時）」，自動執行抓資料
onMounted(() => {
  fetchCats()
})
</script>

<style scoped>
.user-section {
  margin-bottom: 30px;
  border: 2px solid #000;
  background: #fff;
  padding: 15px;
}

.user-title {
  margin-top: 0;
  border-bottom: 2px dashed #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
  background: #f9f9f9;
  padding: 10px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.cat-card {
  border: 1px solid #ccc;
  padding: 10px;
  background: #fff;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.cat-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  background: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
}

.cat-window {
  width: 80px;
  height: 80px;
  overflow: hidden;
  position: relative;
}

.cat-sheet {
  width: 160px; /* 原圖是 640px，縮小 1/4 */
  height: 80px; /* 原圖是 320px，縮小 1/4 */
  position: absolute;
  left: 0;
  top: 0;
  image-rendering: pixelated;
}

.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.cat-skin-tag {
  font-size: 12px;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
}

.loading-box,
.empty-box {
  text-align: center;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.pixel-input {
  width: 100%;
  padding: 8px;
  border: 2px solid #000;
  font-family: inherit;
  box-sizing: border-box;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
