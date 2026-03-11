<template>
  <div class="app-container">
    <header class="navbar pixel-box">
      <div class="navbar-left">
        <span class="material-symbols-outlined icon-large">grid_view</span>
        <div class="logo"><span class="eng-pixel">PIXELCOZY</span> 小貓俱樂部</div>
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
}

.auth-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-text {
  font-weight: bold;
  color: #4e3629;
}

/* 🖼️ 中間內容區 */
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

@media (max-width: 1024px) {
  .navbar-nav {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  .navbar-right-group {
    width: 100%;
    justify-content: center;
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
