<template>
  <div class="adopt-page">
    <px-container title="✨ 領養中心">
      <div class="adopt-content">
        <div class="npc-dialog">
          <div class="npc-avatar">👩‍🌾</div>
          <div class="npc-text">
            <p>歡迎來到領養中心！</p>
            <p>這裡有許多可愛的小貓正在等待一個溫暖的家。</p>
          </div>
        </div>

        <div class="form-card">
          <div class="form-group">
            <label style="text-align: center">1. 選擇小貓的花色</label>
            <div class="skin-selector">
              <button class="arrow-btn" @click="prevSkin">◀</button>
              <div class="cat-preview-wrapper">
                <div class="cat-preview-window">
                  <img :src="currentSkinData.img" class="cat-preview-sheet" alt="貓咪預覽" />
                </div>
                <div class="skin-name-display">{{ currentSkinData.label }}</div>
              </div>
              <button class="arrow-btn" @click="nextSkin">▶</button>
            </div>
          </div>

          <div class="form-group">
            <label>2. 幫小貓取個名字</label>
            <input
              v-model="form.name"
              class="pixel-input"
              placeholder="例如：小花、球球..."
              @keyup.enter="handleAdopt"
            />
          </div>

          <div class="actions">
            <px-button color="#8f9779" textColor="#4e3629" size="large" @click="handleAdopt">
              📝 簽署領養文件
            </px-button>
          </div>
        </div>
      </div>
    </px-container>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import catService from '@/services/cat'

const router = useRouter()

const form = reactive({
  name: '',
  skin: 'benz', // 預設值
})

const getImageUrl = (filename) => {
  return new URL(`../assets/images/${filename}`, import.meta.url).href
}

const skins = [
  { label: '黑白賓士', value: 'benz', img: getImageUrl('catbenz.png') },
  { label: '全白天使', value: 'white', img: getImageUrl('catwhite.png') },
  { label: '神祕黑貓', value: 'black', img: getImageUrl('catblack.png') },
  { label: '橘貓大吉', value: 'orange', img: getImageUrl('catorange.png') },
  { label: '白底虎斑', value: 'mine', img: getImageUrl('catmine.png') },
]

const currentSkinIndex = ref(0)

const nextSkin = () => {
  currentSkinIndex.value = (currentSkinIndex.value + 1) % skins.length
  form.skin = skins[currentSkinIndex.value].value
}

const prevSkin = () => {
  // 確保索引不會變成負數
  currentSkinIndex.value = (currentSkinIndex.value - 1 + skins.length) % skins.length
  form.skin = skins[currentSkinIndex.value].value
}

// 根據當前索引，取得完整的貓咪花色資料
const currentSkinData = computed(() => {
  return skins[currentSkinIndex.value]
})

const handleAdopt = async () => {
  if (!form.name.trim()) {
    alert('請先幫小貓取個名字喔！')
    return
  }

  try {
    // 💡 修正：呼叫 Service 中定義的 newCat 方法
    await catService.newCat(form)

    $dialog.success({
      title: '領養成功！',
      content: `恭喜！${form.name} 已經在房間等你了！`,
      okText: '馬上回家',
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
      containerProps: {
        style: {
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '4px solid #000000',
        },
      },
      onOk: () => {
        router.push('/cat')
      },
    })
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || '領養手續出了點問題...')
  }
}
</script>

<style scoped>
.adopt-page {
  max-width: 600px;
  margin: 0 auto;
}

.npc-dialog {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #000;
  padding: 10px; /* 🌟 減少高度 */
  margin-bottom: 10px;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}

.npc-avatar {
  font-size: 40px;
  margin-right: 15px;
}

.form-card {
  background: #fff;
  border: 4px solid #000;
  padding: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.pixel-input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 3px solid #000;
  font-size: 1rem;
  outline: none;
  background: #f9f9f9;
  font-family: inherit;
}

.pixel-input:focus {
  background: #fff0f5;
  border-color: #ff85a1;
}

/* 🌟 新增：花色選擇器 */
.skin-selector {
  display: flex;
  justify-content: center; /* 🌟 改成置中，讓貓咪永遠在中間 */
  align-items: center;
  background: transparent; /* 🌟 移除背景讓貓咪更突出 */
  padding: 10px;
  border: none;
  position: relative; /* 🌟 讓絕對定位的按鈕可以參考這個框框 */
}

.arrow-btn {
  background: #fff;
  border: 2px solid #000;
  font-size: 24px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.1s;
  position: absolute; /* 🌟 變成絕對定位，不佔空間 */
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

/* 左邊按鈕貼左 */
.arrow-btn:first-child {
  left: 0;
}

/* 右邊按鈕貼右 */
.arrow-btn:last-child {
  right: 0;
}

.arrow-btn:active {
  transform: translateY(2px);
  background: #eee;
}

.cat-preview-wrapper {
  text-align: center;
}

.cat-preview-window {
  width: 320px; /* 🌟 放大成跟房間一樣大 */
  height: 320px;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  /* border: 2px solid #ddd; 移除邊框讓它看起來像站在那裡 */
  background: transparent;
}

.cat-preview-sheet {
  width: 640px; /* 🌟 配合放大 */
  height: 320px;
  image-rendering: pixelated;
  transform: translateX(0);
}

.skin-name-display {
  margin-top: 10px;
  font-weight: bold;
}

.actions {
  margin-top: 30px;
  text-align: center;
}

/* 📱 響應式魔法：當螢幕寬度小於 480px 時 */
@media (max-width: 480px) {
  .cat-preview-window {
    width: 240px;
    height: 240px;
  }
  .cat-preview-sheet {
    width: 480px;
    height: 240px;
  }
}
</style>
