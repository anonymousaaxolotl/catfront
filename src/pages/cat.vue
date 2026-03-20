<template>
  <div class="cat-room">
    <px-container title="🐱 像素小貓的溫馨小窩">
      <div class="room-wrapper">
        <div class="room-viewport" ref="viewportRef" :style="{ height: 750 * roomScale + 'px' }">
          <div class="roaming-area" :style="[wallStyle, { transform: `scale(${roomScale})` }]">
            <!-- 🌟 地板層：獨立出來，這樣牆壁跟地板才能分開換 -->
            <div class="room-floor" :style="floorStyle"></div>

            <!-- 🌟 窗戶層：如果有設定窗戶就顯示 -->
            <div
              v-if="currentWindow"
              class="room-window"
              :style="{ backgroundImage: `url(${currentWindow})` }"
            ></div>

            <!-- 🌟 時鐘層：放在窗戶右邊 -->
            <div
              v-if="currentClock"
              class="room-clock"
              :style="{ backgroundImage: `url(${currentClock})` }"
            ></div>

            <!-- 🌟 貓跳台層：放在最左邊 -->
            <div
              v-if="currentTower"
              class="room-tower"
              :style="{ backgroundImage: `url(${currentTower})` }"
            ></div>

            <!-- 🌟 植物層：放在貓跳台右邊 -->
            <div
              v-if="currentPlant"
              class="room-plant"
              :style="{ backgroundImage: `url(${currentPlant})` }"
            ></div>

            <!-- 🌟 床層：放在植物右邊 -->
            <div
              v-if="currentBed"
              class="room-bed"
              :style="{ backgroundImage: `url(${currentBed})` }"
            ></div>

            <!-- 🌟 書架層：放在最右邊 -->
            <div
              v-if="currentBookshelf"
              class="room-bookshelf"
              :style="{ backgroundImage: `url(${currentBookshelf})` }"
            ></div>

            <div
              v-for="item in cats"
              :key="item._id"
              class="cat-avatar-stage"
              :style="{
                left: item.x + 'px',
                bottom: (item.y || 10) + 'px' /* 🌟 新增：綁定垂直高度 */,
                zIndex: item._id === selectedCatId ? 9 : 1,
                cursor: 'pointer',
              }"
              @click="selectCat(item)"
            >
              <div v-if="item.activeEffect" class="floating-effect">
                {{ item.activeEffect }}
              </div>
              <div class="cat-flip-wrapper" :style="{ transform: `scaleX(${-item.dir})` }">
                <div class="cat-window">
                  <img
                    :src="
                      item.isMoving
                        ? getCatConfig(item.skin).walkUrl
                        : getCatConfig(item.skin).idleUrl
                    "
                    class="cat-sheet"
                    :class="{
                      'cat-mutated': item.form === 'mutated',
                      'cat-dirty': item.form === 'dirty',
                    }"
                    :style="{
                      transform: isBreathing
                        ? `translateX(${getCatConfig(item.skin).offset})`
                        : 'translateX(0px)',
                    }"
                    alt="小貓的像素化身"
                  />
                </div>

                <div class="pixel-shadow"></div>
                <!-- 🌟 選中指示器 -->
                <div v-if="item._id === selectedCatId" class="selection-arrow">▼</div>
                <!-- 🌟 狀態 Emoji 特效 -->
                <div class="status-emoji-container">
                  <div
                    v-for="(emoji, index) in getStatusEmojis(item)"
                    :key="index"
                    class="status-emoji"
                    :style="getEmojiStyle(index)"
                  >
                    {{ emoji }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cat-hud">
          <div class="hud-name">
            {{ currentCat.name }} <span class="lv-tag">LV.{{ currentCat.level }}</span>
          </div>
          <div class="hud-stats">
            <div class="hud-row">
              <span class="icon">🍖</span>
              <px-progress
                :percentage="currentCat.satiety"
                theme="warning"
                track-color="#e0d8c8"
                style="flex: 1"
              />
            </div>

            <div class="hud-row">
              <span class="icon">❤️</span>
              <px-progress
                :percentage="currentCat.mood"
                theme="danger"
                track-color="#e0d8c8"
                style="flex: 1"
              />
            </div>

            <div class="hud-row">
              <span class="icon">🛁</span>
              <px-progress
                :percentage="currentCat.hygiene"
                theme="notice"
                track-color="#e0d8c8"
                style="flex: 1"
              />
            </div>

            <div class="hud-exp">
              ✨ EXP: {{ currentCat.experience }} / {{ currentCat.level * 100 }}
            </div>
          </div>
        </div>
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
    <px-dialog
      v-model:visible="inventoryVisible"
      title="🎒 我的背包"
      width="400px"
      :show-footer="false"
    >
      <div v-if="inventory.length > 0">
        <div class="inventory-filters">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-btn"
            :class="{ active: inventoryFilter === filter.value }"
            @click="inventoryFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="inventory-grid">
          <div
            v-for="item in filteredInventory"
            :key="item._id"
            class="inventory-item"
            :class="{ 'is-equipped': isEquipped(item) }"
            @click="handleUseItem(item)"
          >
            <div class="item-icon">
              <img v-if="item.product.image" :src="item.product.image" :alt="item.product.name" />
              <span v-else>📦</span>
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.product.name }}</div>
              <div class="item-qty">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-inventory">背包空空的，去商店逛逛吧！</div>
      <div style="margin-top: 20px; text-align: right">
        <px-button
          color="#ffb7c5"
          textColor="#4e3629"
          variant="outline"
          @click="inventoryVisible = false"
          >關閉</px-button
        >
      </div>
    </px-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import catService from '@/services/cat'
import userService from '@/services/user'

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
let moveTimer = null
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

const inventoryFilter = ref('all')
const filters = [
  { label: '全部', value: 'all' },
  { label: '食物', value: 'food' },
  { label: '玩具', value: 'toy' },
  { label: '家具', value: 'furniture' },
  { label: '特殊', value: 'cat' },
]

const filteredInventory = computed(() => {
  if (inventoryFilter.value === 'all') return inventory.value
  return inventory.value.filter((item) => item.product.category === inventoryFilter.value)
})

const isEquipped = (item) => {
  if (item.product.category !== 'furniture') return false
  const slot = item.product.effectValue || 'floor'
  const currentMap = {
    floor: currentFloor.value,
    window: currentWindow.value,
    wall: currentWall.value,
    tower: currentTower.value,
    plant: currentPlant.value,
    bed: currentBed.value,
    bookshelf: currentBookshelf.value,
    clock: currentClock.value,
  }
  return currentMap[slot] === item.product.image
}

const openInventory = async () => {
  try {
    const { data } = await userService.Profile()
    inventory.value = data.result.inventory
    inventoryFilter.value = 'all'
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
        activeEffect: effectMap[type] || '✨', // 觸發特效
      }

      setTimeout(() => {
        if (cats.value[idx]) cats.value[idx].activeEffect = ''
      }, 1000)
    }

    $dialog.success({
      title: '小貓收到囉！',
      content: data.message,
      okText: '太棒了！', // 🌟 小寶貝發現的魔法在這裡！把它變成可愛的中文！
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

const getImageUrl = (filename) => {
  return new URL(`../assets/images/${filename}`, import.meta.url).href
}

// 📖 升級版：同時記住「呼吸圖」和「走路圖」
const catConfigs = {
  benz: {
    idleUrl: getImageUrl('catbenz.png'),
    walkUrl: getImageUrl('benzjump.png'),
    offset: '-310px',
  },
  white: {
    idleUrl: getImageUrl('catwhite.png'),
    walkUrl: getImageUrl('whitejump.png'),
    offset: '-310px',
  },
  black: {
    idleUrl: getImageUrl('catblack.png'),
    walkUrl: getImageUrl('blackjump.png'),
    offset: '-310px',
  },
  orange: {
    idleUrl: getImageUrl('catorange.png'),
    walkUrl: getImageUrl('orangejump.png'),
    offset: '-310px',
  },
  mine: {
    idleUrl: getImageUrl('catmine.png'),
    walkUrl: getImageUrl('minejump.png'),
    offset: '-310px',
  },
}

const getCatConfig = (skin) => {
  return catConfigs[skin] || catConfigs.benz
}

const getStatusEmojis = (cat) => {
  const emojis = []
  if (cat.form === 'mutated') emojis.push('💀')
  if (cat.form === 'dirty') emojis.push('🤢')
  if (cat.form === 'hungry') emojis.push('🤤')
  if (cat.mood < 30) emojis.push('💢')
  return emojis
}

const getEmojiStyle = (index) => {
  // 🌟 預定義一些分散的位置，讓 Emoji 看起來像是隨機飄出來的
  // (不能用 Math.random，不然貓咪走路時 Emoji 會瘋狂抖動)
  const positions = [
    { left: '0px', top: '-5px' },
    { left: '-25px', top: '10px' },
    { left: '25px', top: '0px' },
    { left: '-10px', top: '-20px' },
    { left: '15px', top: '15px' },
  ]
  const pos = positions[index % positions.length]
  return {
    animationDelay: index * 0.3 + 's',
    left: pos.left,
    top: pos.top,
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

  // 3. 實體移動節拍器 (更新所有貓咪位置)
  moveTimer = setInterval(() => {
    cats.value.forEach((c) => {
      if (c.isMoving) {
        // 🌟 根據狀態調整速度
        let speedMultiplier = 1
        if (c.form === 'mutated')
          speedMultiplier = 0.2 // 餓壞了走不動
        else if (c.form === 'dirty')
          speedMultiplier = 0.8 // 髒兮兮有點不舒服
        else if (c.form === 'hungry')
          speedMultiplier = 0.5 // 肚子餓沒力氣
        else if (c.mood < 30) speedMultiplier = 1.5 // 生氣走很快！

        // 🌟 特殊狀態移動邏輯
        if (c.state === 'goingToTower') {
          c.x += c.vx * c.dir * speedMultiplier
          // 判斷是否到達目標
          if ((c.dir === -1 && c.x <= c.targetX) || (c.dir === 1 && c.x >= c.targetX)) {
            c.x = c.targetX
            c.y = 250 + Math.random() * 200 // 跳到隨機高度 (250~450)
            c.state = 'onTower'
            c.isMoving = false
            c.dir = 1 // 面向房間
          }
        } else {
          // 🌟 正常移動邏輯
          c.x += c.vx * c.dir * speedMultiplier

          // 碰到右邊牆壁，轉向左邊
          if (c.x >= roomWidth.value - 320) {
            c.dir = -1
          }
          // 碰到左邊牆壁，轉向右邊
          else if (c.x <= 0) {
            c.dir = 1
          }
        }
      }
    })
  }, 30)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateRoomWidth)
  clearInterval(breatheTimer)
  clearInterval(moveTimer)
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

/* 🌟 散步區：把小貓限制在這個框框裡 */
.roaming-area {
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -720px; /* 🌟 永遠保持置中 (1440的一半) */
  height: 750px; /* 🌟 放大活動空間 */
  width: 1440px; /* 🌟 內部固定 1440px */
  transform-origin: center top; /* 🌟 從上方中間開始等比例縮放 */
  overflow: hidden; /* 防止貓咪跑出螢幕 */
  border-bottom: 4px solid #000;
  background-color: #fcfcfc;
  /* 🌟 牆壁樣式 (背景) */
  background-repeat: repeat; /* 牆壁通常是整面平鋪 */
  background-size: auto;
  image-rendering: pixelated;
}

/* 🌟 地板樣式 (獨立圖層) */
.room-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 320px; /* 配合背景圖大小 */
  background-repeat: repeat-x;
  background-position: bottom;
  background-size: 320px 320px;
  image-rendering: pixelated;
  z-index: 0;
}

/* 🌟 窗戶樣式 */
.room-window {
  position: absolute;
  top: 150px; /* 🌟 調整垂直位置，讓它更居中於牆壁 */
  left: 50%;
  transform: translateX(-50%); /* 水平置中 */
  width: 320px; /* 窗戶寬度 */
  height: 320px; /* 窗戶高度 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  z-index: 0; /* 放在最底層 (但在地板背景圖之上) */
}

/* 🌟 時鐘樣式 */
.room-clock {
  position: absolute;
  top: -10px; /* 比窗戶(150px)稍微高一點 */
  right: calc(50% + 400px); /* 窗戶中心(50%) + 半寬(160px) + 間距 */
  width: 320px;
  height: 320px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  z-index: 0;
}

/* 🌟 貓跳台樣式 */
.room-tower {
  position: absolute;
  bottom: 0px; /* 🌟 修正：讓它貼齊地板底部 */
  left: 0;
  width: 640px; /* 🌟 放大寬度 */
  height: 640px; /* 🌟 放大高度 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom left;
  image-rendering: pixelated;
  z-index: 1; /* 在地板之上，但在貓咪(z=2)之下 */
}

/* 🌟 植物樣式 */
.room-plant {
  position: absolute;
  bottom: 20px; /* 放在地板上 */
  left: 550px; /* 🌟 再往右邊一點 */
  width: 320px; /* 🌟 放大寬度 */
  height: 320px; /* 🌟 放大高度 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom center;
  image-rendering: pixelated;
  z-index: 1;
}

/* 🌟 床的樣式 */
.room-bed {
  position: absolute;
  bottom: 20px; /* 放在地板上 */
  left: 800px; /* 放在植物(550px) + 植物寬度(320px) 的右邊 */
  width: 320px;
  height: 320px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom center;
  image-rendering: pixelated;
  z-index: 1;
}

/* 🌟 書架樣式 */
.room-bookshelf {
  position: absolute;
  bottom: 30px; /* 貼齊地板 */
  right: -100px; /* 靠右邊 */
  width: 640px;
  height: 640px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom right;
  image-rendering: pixelated;
  z-index: 0;
}

/* 🎪 舞台空間變成 absolute，這樣 JS 才能控制它在散步區裡滑動 */
.cat-avatar-stage {
  position: absolute;
  bottom: 10px; /* 🌟 讓小貓站在地板上 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cat-flip-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cat-window {
  width: 320px;
  height: 320px;
  overflow: hidden; /* 繼續負責切掉多餘的貓咪圖片 */
  position: relative;
  flex-shrink: 0;
  z-index: 2; /* 🌟 確保貓咪站在影子上面 */
}

.cat-sheet {
  width: 640px;
  height: 320px;
  position: absolute;
  top: 0;
  left: 0;
  image-rendering: pixelated;
}

/* 🌟 新增：HUD 狀態欄樣式 (取代原本的名字牌) */
.cat-hud {
  position: absolute;
  bottom: 24px; /* 🌟 提高一點避免擋到可能出現的捲軸 */
  right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #000;
  padding: 16px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  min-width: 220px;
}

.hud-name {
  font-weight: bold;
  margin-bottom: 12px;
  border-bottom: 2px dashed #ccc;
  padding-bottom: 4px;
  font-size: 18px;
}

.hud-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.hud-row .icon {
  margin-right: 8px;
  font-size: 18px;
}

.hud-exp {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.cat-mutated {
  filter: invert(0.8) hue-rotate(180deg) saturate(2);
  transition: filter 0.5s ease;
}

/* 🌟 新增：髒兮兮的特效 */
.cat-dirty {
  filter: grayscale(50%) sepia(40%) brightness(0.9);
  transition: filter 0.5s ease;
}

/* 🌟 終極自由的 8-bit 影子 */
.pixel-shadow {
  position: absolute;
  bottom: -8px;
  left: 115px;
  width: 140px;
  height: 16px;
  background-color: rgba(0, 0, 0, 0.2); /* 🌟 改成半透明黑色，更有陰影感 */
  z-index: 1; /* 乖乖墊在窗戶(z-index: 2)的下面 */

  /* 像素去背魔法 (保持不變) */
  clip-path: polygon(
    8px 0%,
    calc(100% - 8px) 0%,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    8px 100%,
    0% calc(100% - 8px),
    0% 8px
  );
}
/* 🌟 按鈕區塊置中 */
.action-grid {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto; /* 🌟 讓長條按鈕在窄螢幕上可以左右滑動 */
  padding-bottom: 8px; /* 留點空間給捲軸 */
}

/* 🌟 漂浮泡泡特效 */
.floating-effect {
  position: absolute;
  top: 0px; /* 從小貓的頭頂開始飄 */
  font-size: 40px; /* 圖案大一點比較可愛 */
  z-index: 20; /* 確保特效在最上層 */

  /* 呼叫下面寫好的 float-up 動畫，播放 1 秒鐘 */
  animation: float-up 1s ease-out forwards;
}

/* 🌟 動畫的分解動作 */
@keyframes float-up {
  0% {
    opacity: 1; /* 一開始很清楚 */
    transform: translateY(0) scale(1); /* 停在原點，正常大小 */
  }
  50% {
    transform: translateY(-40px) scale(1.3); /* 飛到一半時，稍微放大，超級有彈性！ */
  }
  100% {
    opacity: 0; /* 最後完全變透明消失 */
    transform: translateY(-80px) scale(1); /* 往上飛走 */
  }
}

/* 🌟 選中時的箭頭指示 */
.selection-arrow {
  position: absolute;
  top: -30px;
  font-size: 20px;
  color: #ff85a1;
  animation: float-arrow 0.5s infinite alternate;
  z-index: 20;
}

/* 🌟 新增：狀態 Emoji 容器 */
.status-emoji-container {
  position: absolute;
  top: 70px; /* 🌟 再往下調，從臉部/身體位置開始飄 */
  left: 50%;
  transform: translateX(-50%); /* 🌟 讓它水平置中 */
  z-index: 20;
}

/* 🌟 新增：狀態 Emoji */
.status-emoji {
  position: absolute;
  font-size: 24px; /*稍微縮小一點點比較精緻*/
  opacity: 0; /* 預設透明 */
  animation: float-fade 2s infinite; /* 改成飄出消失動畫 */
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
}

@keyframes float-fade {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(-30px) scale(1);
    opacity: 0;
  }
}

@keyframes float-arrow {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}

/* 🎒 背包篩選器 */
.inventory-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-btn {
  background: #fff;
  border: 2px solid #000;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  font-family: inherit;
}

.filter-btn.active {
  background: #000;
  color: #fff;
}

/* 🎒 背包樣式 */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 10px;
}

.inventory-item {
  border: 2px solid #000;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s;
  background: #fff;
}

.inventory-item:hover {
  transform: translateY(-2px);
  background: #fff0f5;
  border-color: #ff85a1;
}

/* 🌟 已裝備的家具樣式 */
.inventory-item.is-equipped {
  background-color: #e6f7ff;
  border-color: #1890ff;
  box-shadow: inset 0 0 0 1px #1890ff;
}

.inventory-item.is-equipped::after {
  content: '使用中';
  display: block;
  font-size: 10px;
  color: #1890ff;
  font-weight: bold;
}

.item-icon {
  font-size: 32px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon img {
  max-width: 100%;
  max-height: 100%;
}

.item-name {
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-qty {
  font-size: 10px;
  color: #666;
  font-weight: bold;
}

.empty-inventory {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* 📱 響應式魔法：手機尺寸時把狀態欄排到下面 */
@media (max-width: 768px) {
  .cat-hud {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .action-grid {
    margin-bottom: 24px; /* 🌟 增加手機版底部的留白，讓按鈕不會太貼邊界 */
  }
}
</style>
