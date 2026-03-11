<template>
  <div class="hero-section">
    <div class="hero-content">
      <div class="plant-decoration">🌿🌱🌿</div>
      <h1 class="pixel-title">
        歡迎來到<br />
        <span class="highlight">像素小貓</span>祕密基地
      </h1>
      <p class="pixel-subtitle">
        這裡有溫暖的陽光、綠色的植物，<br />還有一群等待被愛的像素小夥伴。
      </p>
      <div class="action-button">
        <px-button size="large" color="#8f9779" textColor="#4e3629" @click="startJourney">
          開始探索 ➔
        </px-button>
      </div>
    </div>

    <div class="hero-visual">
      <div class="floating-cat-window">
        <img v-if="currentCatImage" :src="currentCatImage" class="cat-sprite" alt="Floating Cat" />
      </div>
      <div class="cat-shadow"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentCatImage = ref('')

const startJourney = () => {
  router.push('/cat')
}

const getImageUrl = (filename) => {
  return new URL(`../assets/images/${filename}`, import.meta.url).href
}

onMounted(() => {
  const cats = ['catbenz.png', 'catwhite.png', 'catblack.png', 'catorange.png', 'catmine.png']
  const randomCat = cats[Math.floor(Math.random() * cats.length)]
  currentCatImage.value = getImageUrl(randomCat)
})
</script>

<style scoped>
/* --- 版面設定 --- */
.hero-section {
  display: flex; /* 讓左右兩塊並排 */
  align-items: center; /* 垂直置中 */
  justify-content: center; /* 🌟 改成置中，讓內容往中間靠 */
  gap: 10rem; /* 🌟 增加間距，讓小貓往右邊跑 */
  min-height: 70vh; /* 讓這個區塊很高，佔據大部分畫面 */
  padding: 2rem;
  /* 加一點點復古遊戲的背景紋理感 (可選) */
  background-image: radial-gradient(var(--theme-border) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.9;
}

/* --- 左邊文字區 --- */
.hero-content {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 讓內容靠左對齊 */
  text-align: left;
}

.pixel-title {
  font-size: 3rem;
  line-height: 1.4;
  margin-bottom: 1.5rem;
  color: var(--theme-border);
}

.highlight {
  color: var(--theme-pink); /* 強調色用粉紅！ */
  text-shadow: 2px 2px 0px var(--theme-border); /* 像素風陰影 */
}

.pixel-subtitle {
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  line-height: 1.8;
  color: var(--theme-text);
}

.plant-decoration {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  letter-spacing: 0.5rem;
}

/* --- 右邊動畫區 --- */
.hero-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* ★ 核心魔法：漂浮的貓咪 ★ */
.floating-cat-window {
  width: 320px;
  height: 320px;
  overflow: hidden;
  position: relative;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0px 10px 0px rgba(0, 0, 0, 0.2)); /* 像素感陰影 */
}

.cat-sprite {
  width: 640px; /* 兩倍寬度，因為圖裡面有兩格動作，我們只顯示第一格 */
  height: 320px;
  position: absolute;
  left: 0;
  top: 0;
  image-rendering: pixelated;
}

/* 地板上的影子 */
.cat-shadow {
  width: 240px; /* 配合圖片變大，影子也拉長一點 */
  height: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  margin-top: -20px;
  /* 影子也要跟著縮放 */
  animation: shadow-scale 3s ease-in-out infinite;
}

/* --- CSS 動畫定義區 --- */
/* 定義一個叫 float 的動畫：上下輕輕飄動 */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  } /* 往上飄 20px */
  100% {
    transform: translateY(0px);
  }
}

/* 定義影子的動畫：貓咪浮起來時，影子變小 */
@keyframes shadow-scale {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

/* --- 手機版響應式 --- */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column-reverse; /* 手機版把貓咪放在上面 */
    text-align: center;
    gap: 2rem; /* 手機版間距縮小 */
    padding-right: 2rem; /* 🌟 手機版還原右邊距，保持置中 */
  }
  .floating-cat-window {
    transform: scale(0.8); /* 手機版稍微縮小一點 */
  }
}
</style>
