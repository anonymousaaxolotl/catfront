<template>
  <div class="cat-room">
    <px-container title="🐱 像素小貓的溫馨小窩">
      <div class="room-wrapper">
        <div class="room-viewport" ref="viewportRef" :style="{ height: 750 * roomScale + 'px' }">
          <RoomScene
            :room-scale="roomScale"
            :wall-style="wallStyle"
            :floor-style="floorStyle"
            :current-window="currentWindow"
            :current-clock="currentClock"
            :current-tower="currentTower"
            :current-plant="currentPlant"
            :current-bed="currentBed"
            :current-bookshelf="currentBookshelf"
          >
            <CatAvatar
              v-for="item in cats"
              :key="item._id"
              :cat="item"
              :is-breathing="isBreathing"
              :is-selected="item._id === selectedCatId"
              @select="selectCat(item)"
            />
          </RoomScene>
        </div>

        <CatHud :cat="currentCat" />
      </div>

      <div class="action-grid">
        <px-button-group shape="round" size="large">
          <px-button color="#ffb7c5" textColor="#4e3629" @click="doInteract('feed')"
            >餵食罐罐</px-button
          >
          <px-button color="#ffb7c5" textColor="#4e3629" @click="doInteract('pet')"
            >摸摸小貓</px-button
          >
          <px-button color="#ffb7c5" textColor="#4e3629" @click="doInteract('play')"
            >玩逗貓棒</px-button
          >
          <px-button color="#ffb7c5" textColor="#4e3629" @click="doInteract('clean')"
            >打掃房間</px-button
          >
          <px-button color="#8f9779" textColor="#4e3629" @click="openInventory"
            >🎒 打開背包</px-button
          >
        </px-button-group>
      </div>
    </px-container>

    <!-- 🎒 背包視窗 -->
    <InventoryModal
      v-model:visible="inventoryVisible"
      :inventory="inventory"
      :current-equipment="{
        floor: currentFloor,
        window: currentWindow,
        wall: currentWall,
        tower: currentTower,
        plant: currentPlant,
        bed: currentBed,
        bookshelf: currentBookshelf,
        clock: currentClock,
      }"
      @use-item="handleUseItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import catService from '@/services/cat'
import userService from '@/services/user'

import RoomScene from '@/components/RoomScene.vue'
import CatAvatar from '@/components/CatAvatar.vue'
import CatHud from '@/components/CatHud.vue'
import InventoryModal from '@/components/InventoryModal.vue'

const cats = ref([])
const selectedCatId = ref(null)

// 🌟 計算目前選中的貓咪 (給 HUD 顯示用)
const currentCat = computed(() => {
  if (cats.value.length === 0)
    return { name: '載入中...', level: 1, satiety: 0, mood: 0, experience: 0, hygiene: 0 }
  return cats.value.find((c) => c._id === selectedCatId.value) || cats.value[0]
})

const isBreathing = ref(false)
let breatheTimer = null

// 🌟 縮放計算與移動大腦
const viewportRef = ref(null)
const viewportWidth = ref(window.innerWidth || 1440)
const roomScale = computed(() => {
  return viewportWidth.value < 1440 ? viewportWidth.value / 1440 : 1
})
const roomWidth = ref(1440) // 🌟 內部邏輯永遠固定 1440
let animationFrameId = null
let aiTimer = null

const updateRoomWidth = () => {
  if (viewportRef.value) {
    viewportWidth.value = viewportRef.value.clientWidth
  } else {
    viewportWidth.value = window.innerWidth
  }
}

// 🎒 背包相關狀態
const inventoryVisible = ref(false)
const inventory = ref([])
const currentFloor = ref('')
const currentWindow = ref('')
const currentWall = ref('')
const currentTower = ref('')
const currentPlant = ref('')
const currentBed = ref('')
const currentBookshelf = ref('')
const currentClock = ref('')

const openInventory = async () => {
  try {
    const { data } = await userService.Profile()
    inventory.value = data.result.inventory
    inventoryVisible.value = true
  } catch (error) {
    $dialog.warning('無法打開背包')
  }
}

const handleUseItem = async (item) => {
  // 🌟 防呆：如果沒有選中貓咪，且房間有貓，就自動選第一隻
  if (!selectedCatId.value && cats.value.length > 0) {
    selectedCatId.value = cats.value[0]._id
  }

  // 🌟 如果真的沒有貓咪 (房間是空的)，就提示去領養
  // 💡 家具不需要貓咪
  if (!selectedCatId.value && item.product.category !== 'furniture') {
    $dialog.warning('房間裡沒有貓咪可以接收道具喔，快去領養一隻吧！')
    return
  }

  try {
    const { data } = await userService.useItem({
      productId: item.product._id,
      catId: selectedCatId.value, // 🌟 告訴後端是哪隻貓要用
    })
    $dialog.success({
      content: data.message,
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })

    // 如果是家具，更新地板
    if (item.product.category === 'furniture' && data.result.roomConfig) {
      currentFloor.value = data.result.roomConfig.floor
      currentWindow.value = data.result.roomConfig.window
      currentWall.value = data.result.roomConfig.wall
      currentTower.value = data.result.roomConfig.tower
      currentPlant.value = data.result.roomConfig.plant
      currentBed.value = data.result.roomConfig.bed
      currentBookshelf.value = data.result.roomConfig.bookshelf
      currentClock.value = data.result.roomConfig.clock
    }

    // 使用後重新整理背包和貓咪狀態 (因為食物可能會影響貓咪數值)
    await openInventory()
    await fetchCatData()
  } catch (error) {
    $dialog.warning(error.response?.data?.message || '使用失敗')
  }
}

const fetchCatData = async () => {
  try {
    const { data } = await catService.getCat()
    // 🌟 初始化每隻貓咪的位置與狀態
    cats.value = data.result.map((c) => ({
      ...c,
      x: Math.random() * (roomWidth.value - 320), // 隨機位置
      y: 10, // 🌟 新增：垂直位置 (預設在地板)
      vx: 2 + Math.random() * 2, // 隨機速度
      dir: Math.random() > 0.5 ? 1 : -1, // 隨機方向
      isMoving: Math.random() > 0.5, // 隨機動靜
      state: 'normal', // 🌟 新增：狀態 (normal, goingToTower, onTower)
      activeEffect: '',
    }))

    if (cats.value.length > 0 && !selectedCatId.value) {
      selectedCatId.value = cats.value[0]._id
    }
  } catch (error) {
    console.error('抓不到小貓 Q_Q')
  }
}

const selectCat = (cat) => {
  selectedCatId.value = cat._id
}

const fetchRoomData = async () => {
  try {
    const { data } = await userService.Profile()
    if (data.result.roomConfig) {
      currentFloor.value = data.result.roomConfig.floor || ''
      currentWindow.value = data.result.roomConfig.window || ''
      currentWall.value = data.result.roomConfig.wall || ''
      currentTower.value = data.result.roomConfig.tower || ''
      currentPlant.value = data.result.roomConfig.plant || ''
      currentBed.value = data.result.roomConfig.bed || ''
      currentBookshelf.value = data.result.roomConfig.bookshelf || ''
      currentClock.value = data.result.roomConfig.clock || ''
    }
  } catch (error) {
    console.error('無法取得房間設定')
  }
}

const wallStyle = computed(() => {
  if (!currentWall.value) return {}
  return {
    backgroundImage: `url(${currentWall.value})`,
  }
})

const floorStyle = computed(() => {
  if (!currentFloor.value) return {}
  return {
    backgroundImage: `url(${currentFloor.value})`,
  }
})

const doInteract = async (type) => {
  const targetCat = currentCat.value
  if (!targetCat._id) return

  // 🎨 特效字典
  const effectMap = {
    feed: '🐟',
    pet: '❤️',
    play: '🎵',
    clean: '✨',
  }

  try {
    const { data } = await catService.interact(targetCat._id, type)

    //  更新陣列中那隻貓咪的數值，但保留它的位置狀態 (x, dir...)
    const idx = cats.value.findIndex((c) => c._id === targetCat._id)
    if (idx !== -1) {
      const oldState = cats.value[idx]
      cats.value[idx] = {
        ...data.result.cat, // 新的數值
        x: oldState.x,
        y: oldState.y, // 🌟 保留高度
        vx: oldState.vx,
        dir: oldState.dir,
        isMoving: oldState.isMoving,
        state: oldState.state, // 🌟 保留狀態
        targetX: oldState.targetX, // 🌟 修正：保留目標位置，避免去跳台途中被互動導致迷失方向
        activeEffect: effectMap[type] || '✨', // 觸發特效
      }

      setTimeout(() => {
        if (cats.value[idx]) cats.value[idx].activeEffect = ''
      }, 1000)
    }

    $dialog.success({
      title: '小貓收到囉！',
      content: data.message,
      okText: '太棒了！', // 🌟 把它變成可愛的中文！
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
      // 🎨 用 containerProps 強制幫對話框換上米白色的衣服！
      containerProps: {
        style: {
          backgroundColor: '#fcfcfc', // 換成跟小貓房間一樣的溫暖米白色
          color: '#333', // 文字變成深灰色比較好讀
          border: '4px solid #000', // 加上像素風專屬的粗黑邊框
        },
      },
    })
  } catch (error) {
    $dialog.warning({
      title: '哎呀💦',
      content: error.response?.data?.message || '小貓現在不想理妳...',
      okText: '知道啦', // 改成溫柔的確認語氣
      okButtonProps: { color: '#ffb7c5', textColor: '#4e3629' },
      containerProps: {
        style: {
          backgroundColor: '#fcfcfc',
          color: '#333',
          border: '4px solid #000',
        },
      },
    })
  }
}

onMounted(() => {
  updateRoomWidth()
  window.addEventListener('resize', updateRoomWidth)
  fetchCatData()
  fetchRoomData()

  // 1. 動畫切換節拍器 (0.4秒跳一次)
  breatheTimer = setInterval(() => {
    isBreathing.value = !isBreathing.value
  }, 400)

  // 2. 🧠 貓咪大腦：每 2.5 秒隨機決定每隻貓要不要走路
  aiTimer = setInterval(() => {
    cats.value.forEach((c) => {
      // 🌟 如果貓咪正在去跳台的路上，就不要打擾牠
      if (c.state === 'goingToTower') return

      if (c.state === 'onTower') {
        // 🌟 如果在跳台上，有機會跳下來
        if (Math.random() > 0.7) {
          c.state = 'normal'
          c.y = 10 // 回到地板
          c.isMoving = true
          c.dir = 1 // 往右跳
        } else {
          // 在跳台上休息，偶爾換個方向看
          c.isMoving = false
          c.dir = Math.random() > 0.5 ? 1 : -1
        }
        return
      }

      // 🌟 正常狀態
      c.isMoving = Math.random() > 0.4

      // 🌟 如果有貓跳台，且貓咪現在是閒置或走動中，有機會去跳台
      if (currentTower.value && Math.random() > 0.8) {
        c.state = 'goingToTower'
        c.isMoving = true
        c.targetX = 50 + Math.random() * 100 // 跳台的位置範圍
        c.dir = c.x > c.targetX ? -1 : 1 // 決定往左還是往右走
      }
    })
  }, 2500)

  // 3. 實體移動節拍器 (使用 requestAnimationFrame 提升效能)
  let lastTime = 0
  const updatePosition = (timestamp) => {
    if (!lastTime) lastTime = timestamp
    const deltaTime = timestamp - lastTime

    // 🌟 控制約每 30ms 運算一次 (符合原本速度並節省資源)
    if (deltaTime >= 30) {
      cats.value.forEach((c) => {
        if (c.isMoving) {
          // 🌟 根據狀態調整速度
          let speedMultiplier = 1
          if (c.form === 'mutated') speedMultiplier = 0.2
          else if (c.form === 'dirty') speedMultiplier = 0.8
          else if (c.form === 'hungry') speedMultiplier = 0.5
          else if (c.mood < 30) speedMultiplier = 1.5

          // 🌟 特殊狀態移動邏輯
          if (c.state === 'goingToTower') {
            c.x += c.vx * c.dir * speedMultiplier
            if ((c.dir === -1 && c.x <= c.targetX) || (c.dir === 1 && c.x >= c.targetX)) {
              c.x = c.targetX
              c.y = 250 + Math.random() * 200
              c.state = 'onTower'
              c.isMoving = false
              c.dir = 1
            }
          } else {
            // 🌟 正常移動邏輯
            c.x += c.vx * c.dir * speedMultiplier
            if (c.x >= roomWidth.value - 320) {
              c.x = roomWidth.value - 320 // 強制限制在右邊界內
              c.dir = -1
            } else if (c.x <= 0) {
              c.x = 0 // 強制限制在左邊界內
              c.dir = 1
            }
          }
        }
      })
      lastTime = timestamp
    }
    // 遞迴呼叫下一幀
    animationFrameId = requestAnimationFrame(updatePosition)
  }
  // 啟動迴圈
  animationFrameId = requestAnimationFrame(updatePosition)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateRoomWidth)
  clearInterval(breatheTimer)
  cancelAnimationFrame(animationFrameId)
  clearInterval(aiTimer) // 記得關掉大腦！
})
</script>

<style scoped>
/* 🌟 用來包住房間與狀態欄，讓狀態欄能正常定位 */
.room-wrapper {
  position: relative;
  margin-bottom: 20px;
}

/* 🌟 外層容器，用來定位 HUD 不受捲軸影響 */
.room-viewport {
  position: relative;
  width: 100%;
  overflow: hidden; /* 🌟 隱藏超出範圍的縮放內容 */
}

/* 🌟 按鈕區塊置中 */
.action-grid {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto; /* 🌟 讓長條按鈕在窄螢幕上可以左右滑動 */
  padding-bottom: 8px; /* 留點空間給捲軸 */
}

/* 📱 響應式魔法：手機尺寸時把狀態欄排到下面 */
@media (max-width: 768px) {
  .action-grid {
    margin-bottom: 24px; /* 🌟 增加手機版底部的留白，讓按鈕不會太貼邊界 */
  }
}
</style>
