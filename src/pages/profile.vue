<template>
  <div class="profile-page">
    <px-container title="👤 小主人檔案">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="pixel-avatar">🧑‍🌾</div>
        </div>
        <div class="info-section">
          <h2>{{ user.account }}</h2>
          <p class="role-tag">{{ user.role === 'admin' ? '👑 管理員' : '🌱 鏟屎官' }}</p>
          <p class="coins">💰 金幣: {{ user.coins }}</p>
        </div>
        <div class="action-section">
          <px-button
            color="#8f9779"
            textColor="#4e3629"
            @click="handleCheckIn"
            :disabled="isCheckedIn"
          >
            {{ isCheckedIn ? '今日已簽到' : '📅 每日簽到' }}
          </px-button>
        </div>
      </div>

      <div class="cats-section">
        <h3>🐾 我的貓咪</h3>
        <div v-if="cats.length > 0" class="cats-grid">
          <div v-for="cat in cats" :key="cat._id" class="cat-card">
            <div class="cat-avatar">{{ getCatIcon(cat.skin) }}</div>
            <div class="cat-info">
              <div class="cat-name">
                {{ cat.name }} <span class="cat-lv">LV.{{ cat.level }}</span>
              </div>
              <div class="cat-stat-row">
                🍖 {{ Math.round(cat.satiety) }} ❤️ {{ Math.round(cat.mood) }}
              </div>
              <div class="cat-stat-row">
                🛁 {{ Math.round(cat.hygiene) }} ✨ {{ Math.round(cat.experience) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-cats">還沒有領養貓咪，快去領養中心看看吧！</div>
      </div>

      <div class="inventory-section">
        <h3>🎒 我的背包</h3>
        <div v-if="user.inventory && user.inventory.length > 0" class="inventory-grid">
          <div v-for="item in user.inventory" :key="item._id" class="inventory-item">
            <div class="item-icon">
              <img v-if="item.product.image" :src="item.product.image" :alt="item.product.name" />
              <span v-else>📦</span>
            </div>
            <div class="item-info">
              <span class="item-name">{{ item.product.name }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-inventory">背包空空的，去商店逛逛吧！</div>
      </div>
    </px-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import userService from '@/services/user'
import catService from '@/services/cat'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const user = ref({
  account: '',
  role: 'user',
  coins: 0,
  inventory: [],
  lastCheckIn: null,
})
const cats = ref([])

const isCheckedIn = computed(() => {
  if (!user.value.lastCheckIn) return false
  const last = new Date(user.value.lastCheckIn).setHours(0, 0, 0, 0)
  const today = new Date().setHours(0, 0, 0, 0)
  return last === today
})

const fetchProfile = async () => {
  try {
    const { data } = await userService.Profile()
    user.value = data.result
    // 同步更新 store 中的金幣，確保顯示一致
    userStore.coins = data.result.coins
  } catch (error) {
    console.error(error)
    $dialog.warning('無法取得個人資料')
  }
}

const fetchCats = async () => {
  try {
    const { data } = await catService.getCat()
    cats.value = data.result
  } catch (error) {
    console.error('無法取得貓咪列表', error)
  }
}

const handleCheckIn = async () => {
  try {
    const { data } = await userService.checkIn()
    $dialog.success({
      content: data.message,
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    await fetchProfile() // 重新抓取資料以更新金幣和簽到狀態
  } catch (error) {
    $dialog.warning(error.response?.data?.message || '簽到失敗')
  }
}

const getCatIcon = (skin) => {
  const icons = {
    benz: '🐼',
    white: '🦢',
    black: '🐈‍⬛',
    orange: '🍊',
    mine: '🎨',
  }
  return icons[skin] || '🐱'
}

onMounted(() => {
  fetchProfile()
  fetchCats()
})
</script>

<style scoped>
.profile-header {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 4px solid #000;
  align-items: center;
  flex-wrap: wrap;
}

.pixel-avatar {
  font-size: 64px;
  background: #eee;
  border: 4px solid #000;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-section {
  flex: 1;
}

.info-section h2 {
  margin: 0 0 10px 0;
}

.role-tag {
  display: inline-block;
  background: #000;
  color: #fff;
  padding: 4px 8px;
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.coins {
  font-weight: bold;
  color: #e67e22;
  font-size: 1.2rem;
}

.cats-section {
  padding: 20px;
  border-bottom: 4px solid #000;
}

.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.cat-card {
  border: 2px solid #000;
  padding: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cat-avatar {
  font-size: 40px;
  margin-bottom: 5px;
}

.cat-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.cat-lv {
  font-size: 0.8rem;
  color: #666;
  background: #eee;
  padding: 2px 4px;
  border-radius: 4px;
}

.cat-stat-row {
  font-size: 0.8rem;
  margin-top: 2px;
}

.empty-cats {
  text-align: center;
  color: #888;
  padding: 20px;
  border: 2px dashed #ccc;
}

.inventory-section {
  padding: 20px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.inventory-item {
  border: 2px solid #000;
  padding: 5px;
  text-align: center;
  background: #fff;
  position: relative;
}

.item-icon {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 5px;
}

.item-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-name {
  display: block;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-qty {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff85a1;
  color: #fff;
  border: 2px solid #000;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: bold;
}

.empty-inventory {
  text-align: center;
  color: #888;
  padding: 20px;
  border: 2px dashed #ccc;
}
</style>
