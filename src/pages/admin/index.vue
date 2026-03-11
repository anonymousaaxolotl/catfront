<template>
  <div class="admin-dashboard">
    <h1>📊 管理者後台中心</h1>
    <p>這裡可以看目前貓咪俱樂部的營運狀況喔！</p>
    <div class="stats-grid">
      <px-container>
        <div class="stat-item">
          <div class="stat-label">🐱 貓咪總數</div>
          <div class="stat-value">{{ stats.catCount }} 隻</div>
        </div>
      </px-container>
      <px-container>
        <div class="stat-item">
          <div class="stat-label">👥 新主人數量</div>
          <div class="stat-value">{{ stats.userCount }} 位</div>
        </div>
      </px-container>
      <px-container>
        <div class="stat-item">
          <div class="stat-label">📦 商品總數</div>
          <div class="stat-value">{{ stats.productCount }} 件</div>
        </div>
      </px-container>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/user'

const stats = ref({
  userCount: 0,
  catCount: 0,
  productCount: 0,
})

const fetchStats = async () => {
  try {
    const { data } = await userService.getStats()
    stats.value = data.result
  } catch (error) {
    console.error('無法取得統計數據', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-label {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #e67e22;
}
</style>
