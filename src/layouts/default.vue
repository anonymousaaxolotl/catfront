<template>
  <div class="app-container">
    <header class="navbar pixel-box">
      <div class="navbar-left">
        <span class="material-symbols-outlined icon-large desktop-icon">grid_view</span>
        <!-- 🌟 手機版的漢堡選單按鈕 -->
        <span
          class="material-symbols-outlined icon-large mobile-menu-btn"
          @click="toggleMobileMenu"
        >
          {{ isMobileMenuOpen ? 'close' : 'menu' }}
        </span>
        <router-link to="/" class="logo"
          ><span class="eng-pixel">PIXELCOZY</span> 小貓俱樂部</router-link
        >
      </div>

      <div class="navbar-right-group">
        <nav class="navbar-nav">
          <router-link class="nav-link" to="/"
            ><span class="eng-pixel">Home</span> 首頁</router-link
          >
          <router-link class="nav-link" to="/cat"
            ><span class="eng-pixel">Gallery</span> 貓咪房間</router-link
          >
          <router-link class="nav-link" to="/adopt"
            ><span class="eng-pixel">Adopt</span> 領養小貓</router-link
          >
          <router-link class="nav-link" to="/shop"
            ><span class="eng-pixel">Shop</span> 雜貨店</router-link
          >
          <router-link v-if="userStore.role === 'admin'" class="nav-link" to="/admin"
            ><span class="eng-pixel">Admin</span> 進入後台</router-link
          >
        </nav>

        <div class="navbar-auth">
          <div v-if="userStore.token" class="auth-group">
            <span class="welcome-text">Hi, 小主人</span>
            <px-button type="button" color="#a0522d" textColor="#ffffff" @click="logout"
              >登出</px-button
            >
          </div>

          <div v-else class="auth-group">
            <px-button type="button" color="#8f9779" textColor="#4e3629" @click="openLogin"
              >登入</px-button
            >
          </div>
        </div>
      </div>
    </header>

    <!-- 📱 手機版側邊抽屜選單 -->
    <div v-if="isMobileMenuOpen" class="drawer-overlay" @click="closeMobileMenu"></div>
    <div class="mobile-drawer" :class="{ 'is-open': isMobileMenuOpen }">
      <div class="drawer-header">
        <span class="material-symbols-outlined icon-large mobile-menu-btn" @click="closeMobileMenu"
          >close</span
        >
        <router-link to="/" class="logo" @click="closeMobileMenu">
          <span class="eng-pixel">PIXELCOZY</span> 小貓俱樂部
        </router-link>
      </div>
      <nav class="drawer-nav">
        <router-link class="drawer-link" to="/" @click="closeMobileMenu"
          ><span class="eng-pixel">Home</span> 首頁</router-link
        >
        <router-link class="drawer-link" to="/cat" @click="closeMobileMenu"
          ><span class="eng-pixel">Gallery</span> 貓咪房間</router-link
        >
        <router-link class="drawer-link" to="/adopt" @click="closeMobileMenu"
          ><span class="eng-pixel">Adopt</span> 領養小貓</router-link
        >
        <router-link class="drawer-link" to="/shop" @click="closeMobileMenu"
          ><span class="eng-pixel">Shop</span> 雜貨店</router-link
        >
        <router-link
          v-if="userStore.role === 'admin'"
          class="drawer-link"
          to="/admin"
          @click="closeMobileMenu"
          ><span class="eng-pixel">Admin</span> 進入後台</router-link
        >
      </nav>
    </div>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer pixel-box">
      <div class="footer-left">
        <span class="material-symbols-outlined icon-large">joystick</span>
        <p class="copyright"><span class="eng-pixel uppercase">PIXELCOZY</span> © 2026</p>
      </div>

      <div class="footer-center">
        <span class="material-symbols-outlined footer-icon match-hover">potted_plant</span>
        <span class="material-symbols-outlined footer-icon brick-hover">pets</span>
        <span class="material-symbols-outlined footer-icon cocoa-hover">coffee</span>
      </div>

      <div class="footer-right">
        <p class="made-with-love eng-pixel uppercase">MADE WITH LOVE AND PIXELS</p>
      </div>
    </footer>

    <LoginDialog ref="loginRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user.js'
import LoginDialog from '@/components/LoginDialog.vue'

const userStore = useUserStore()
const loginRef = ref(null)

// 🌟 手機選單狀態與開關
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const openLogin = () => {
  loginRef.value.open()
}

const logout = () => {
  userStore.logout()
  window.$dialog?.success({
    content: '登出成功！小貓在等你喔～',
    okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
  }) || alert('登出成功！小貓在等你喔～')
}
</script>

<style scoped>
/* 🌸 引入復古像素英文字體 */
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.eng-pixel {
  font-family: 'Pixelify Sans', cursive;
  letter-spacing: 0.05em;
  margin-right: 4px;
}

.uppercase {
  text-transform: uppercase;
}

/* 🌸 漂浮盒子：可可色邊框 */
.pixel-box {
  background-color: var(--theme-white, white);
  border: 4px solid #4e3629;
  box-shadow: 4px 4px 0px 0px #4e3629;
}

/* 🏠 導覽列排版 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem auto;
  padding: 1rem 2rem;
  width: 90%;
  max-width: 1400px;
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-large {
  font-size: 28px;
  color: #4e3629;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
  color: #4e3629;
  white-space: nowrap; /* 🌟 確保 Logo 也不會被折斷 */
  text-decoration: none; /* 🌟 移除超連結的預設底線 */
  transition: all 0.2s ease;
  display: inline-block; /* 🌟 確保位移動畫能正常生效 */
}

.logo:hover {
  color: #8f9779; /* 🌟 變成抹茶綠 */
  transform: translateY(-2px); /* 🌟 微微往上彈跳的互動感 */
}

.navbar-right-group {
  display: flex;
  align-items: center;
  gap: 40px;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #4a4a4a;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: bold;
  white-space: nowrap; /* 🌟 防止按鈕文字在 iPad 尺寸時被奇怪地換行 */
  transition: color 0.2s ease;
}

/* 🌟 Hover 顏色換成溫柔的抹茶綠了喔！ */
.nav-link.router-link-exact-active,
.nav-link:hover {
  color: #8f9779;
}

.navbar-auth {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 🌟 確保這整個區塊不會因為空間不夠而被擠壓到外面 */
}

.auth-group {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap; /* 🌟 讓「登出」兩個字乖乖待在同一行 */
}

.welcome-text {
  font-weight: bold;
  color: #4e3629;
  white-space: nowrap; /* 🌟 讓「Hi, 小主人」保持完整不會斷開 */
}

/* 🌟 手機版側邊選單按鈕 */
.mobile-menu-btn {
  display: none;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
}

.mobile-menu-btn:hover {
  transform: scale(1.1);
}

/* 📱 手機版側邊抽屜選單 (Drawer) */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* 半透明黑底 */
  z-index: 2000;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  left: -320px; /* 一開始藏在畫面左邊外 */
  width: 280px;
  height: 100vh;
  background-color: var(--theme-white, #fcfcfc);
  border-right: 4px solid #4e3629;
  box-shadow: 4px 0 0 0 #4e3629;
  z-index: 2001;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.mobile-drawer.is-open {
  left: 0; /* 滑入畫面 */
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 4px solid #4e3629;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
}

.drawer-link {
  color: #4a4a4a;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  transition:
    color 0.2s ease,
    padding-left 0.2s ease;
}

.drawer-link:hover,
.drawer-link.router-link-exact-active {
  color: #8f9779;
  padding-left: 10px; /* 🌟 游標滑過時會微微往右彈，增加互動感 */
}

/* �️ 中間內容區 */
.main-content {
  flex: 1;
  padding: 1rem 2rem;
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
}

/* 🧸 頁尾排版 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  width: 90%;
  max-width: 1400px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 32px;
}

.footer-icon {
  font-size: 28px;
  color: #4e3629;
  cursor: pointer;
  transition: color 0.2s;
}

.match-hover:hover {
  color: #8f9779;
}
.brick-hover:hover {
  color: #a0522d;
}
.cocoa-hover:hover {
  color: #4e3629;
}

.copyright,
.made-with-love {
  margin: 0;
  font-size: 0.9rem;
  font-weight: bold;
  color: #4e3629;
}

.made-with-love {
  opacity: 0.7;
}

/* 💻 平板橫放 / 筆電尺寸：隱藏導覽列的英文字並稍微縮小間距，避免擁擠 */
@media (max-width: 1280px) {
  .nav-link .eng-pixel {
    display: none; /* 隱藏英文 */
  }
  .navbar-nav {
    gap: 16px; /* 把間距從原本的 24px 稍微縮小 */
  }
}

@media (max-width: 1024px) {
  .navbar-nav {
    display: none;
  }
  .desktop-icon {
    display: none; /* 隱藏原本的格子圖標 */
  }
  .mobile-menu-btn {
    display: block; /* 顯示手機版漢堡按鈕 */
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px; /* 🌟 減少內距保留更多空間給按鈕 */
  }
  .navbar-left {
    gap: 8px; /* 🌟 稍微縮小圖示跟文字的間距 */
  }
  .logo {
    font-size: 1rem; /* 🌟 稍微縮小字體確保能順利塞進同一行 */
  }
  .navbar-right-group {
    gap: 16px;
  }
  .welcome-text {
    display: none; /* 🌟 手機版隱藏歡迎文字，把寶貴的空間讓給登出按鈕 */
  }
  .footer {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .footer-center {
    display: none;
  }
}
</style>
