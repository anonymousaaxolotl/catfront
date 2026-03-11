<template>
  <div class="shop-page">
    <px-container title="🛒 像素雜貨店">
      <div class="shop-header">
        <p>歡迎光臨！這裡有各種貓咪喜歡的寶貝。</p>
        <div class="coin-display">
          目前擁有: <span class="coin-amount">💰 {{ userStore.coins }}</span>
        </div>
      </div>

      <!-- 🏷️ 分類標籤 -->
      <div class="category-tabs">
        <button
          v-for="tab in categories"
          :key="tab.value"
          class="pixel-tab"
          :class="{ active: activeCategory === tab.value }"
          @click="activeCategory = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      <br />
      <br />
      <br />
      <br />
      <!-- 📦 商品列表 -->
      <div v-if="loading" class="loading-box">正在進貨中...</div>
      <div v-else-if="filteredProducts.length === 0" class="empty-box">
        這個分類目前沒有商品喔！
      </div>
      <div v-else class="product-grid">
        <div v-for="product in filteredProducts" :key="product._id" class="product-card">
          <div class="product-image-box">
            <img v-if="product.image" :src="product.image" class="product-img" />
            <div v-else class="product-icon">{{ getProductIcon(product.category) }}</div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-footer">
              <span class="price">💰 {{ product.price }}</span>
              <px-button
                size="small"
                color="#8f9779"
                textColor="#4e3629"
                @click="handleBuy(product)"
                >購買</px-button
              >
            </div>
          </div>
        </div>
      </div>
    </px-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import productService from '@/services/product'
import userService from '@/services/user'
import { useUserStore } from '@/stores/user'

const products = ref([])
const loading = ref(true)
const activeCategory = ref('all')

const categories = [
  { label: '全部', value: 'all' },
  { label: '罐罐', value: 'food' },
  { label: '玩具', value: 'toy' },
  { label: '家具', value: 'furniture' },
  { label: '特別', value: 'cat' },
]

const userStore = useUserStore()

const fetchProducts = async () => {
  try {
    loading.value = true
    const { data } = await productService.getAll()
    products.value = data.result
  } catch (error) {
    console.error(error)
    $dialog.warning('無法取得商品列表，請稍後再試')
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') return products.value
  return products.value.filter((p) => p.category === activeCategory.value)
})

const getProductIcon = (category) => {
  const icons = { food: '🥫', toy: '🪀', furniture: '🛋️', cat: '🐱' }
  return icons[category] || '📦'
}

const handleBuy = async (product) => {
  try {
    const { data } = await userService.buy({ productId: product._id })
    $dialog.success({
      content: `買到 ${product.name} 了！`,
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    // 更新使用者的金幣
    userStore.coins = data.result
  } catch (error) {
    $dialog.warning(error.response?.data?.message || '購買失敗')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.pixel-tab {
  background: #fff;
  border: 2px solid #000;
  padding: 8px 16px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  transition: all 0.1s;
}

.pixel-tab.active {
  background: #000;
  color: #fff;
  transform: translateY(2px);
}

.product-grid {
  display: grid;
  /* 🌟 強制設定欄數，確保一定是橫向排列 */
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 0 auto;
}

/* 📱 響應式：螢幕變小自動調整欄數，但保持橫向 */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr); /* 手機版也強制 2 欄 */
  }
}

.product-card {
  border: 2px solid #000;
  background: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}

.product-image-box {
  height: 200px; /* 🌟 圖片區域加高 */
  background: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #000;
  margin-bottom: 10px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-icon {
  font-size: 80px; /* 🌟 圖示也放大 */
}

.product-name {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.product-desc {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 10px;
  flex-grow: 1; /* 讓描述撐開空間，保持按鈕對齊底部 */
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-weight: bold;
  color: #e67e22;
}

.loading-box,
.empty-box {
  text-align: center;
  padding: 40px;
  color: #888;
  border: 2px dashed #ccc;
}

.coin-amount {
  font-weight: bold;
  color: #e67e22;
}
</style>
