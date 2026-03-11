<template>
  <div v-if="visible" class="pixel-overlay" @click.self="visible = false">
    <px-container
      class="pixel-dialog-box"
      :title="isLogin ? '🐱 小貓基地門禁卡' : '✨ 新主人報到處'"
      :subtitle="isLogin ? '請輸入帳號密碼來與小貓見面' : '填寫資料，開始妳的養貓生活吧！'"
    >
      <div class="login-content">
        <div class="input-group">
          <label>帳號：</label>
          <input v-model="form.account" class="pixel-input" placeholder="小主人名字" />
        </div>

        <div class="input-group">
          <label>密碼：</label>
          <input
            v-model="form.password"
            type="password"
            class="pixel-input"
            placeholder="神祕密碼"
          />
        </div>
        <div v-if="!isLogin" class="input-group">
          <label>確認密碼：</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="pixel-input"
            placeholder="請再次輸入密碼"
          />
        </div>

        <div class="actions">
          <px-button-group :border-radius="[20, 16, 20, 16]">
            <px-button color="#8f9779" textColor="#4e3629" @click="handleSubmit">
              {{ isLogin ? '確認登入' : '立即註冊' }}
            </px-button>
            <px-button
              color="#ffb7c5"
              textColor="#4e3629"
              variant="Outline"
              @click="visible = false"
              >取消</px-button
            >
          </px-button-group>
        </div>
        <div class="toggle-mode" @click="isLogin = !isLogin">
          {{ isLogin ? '還沒有帳號？點我註冊 📝' : '已經有帳號了？點我登入 🚪' }}
        </div>
      </div>
    </px-container>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import userService from '@/services/user'

const visible = ref(false)
const isLogin = ref(true)
const form = reactive({ account: '', password: '', confirmPassword: '' })
const userStore = useUserStore()

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      // 走登入路線
      const { data } = await userService.login(form)
      userStore.login(data.result)
      $dialog.success({
        content: '登入成功！',
        okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
      })
      visible.value = false
    } else {
      // 走註冊路線
      // 💡 記得在 userService 裡面要寫一個 create(data) 功能喔
      if (form.password !== form.confirmPassword) {
        $dialog.warning('兩次密碼輸入不一致')
        return
      }
      await userService.create(form)
      $dialog.success({
        content: '註冊成功！快登入來看看小貓吧！',
        okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
      })
      isLogin.value = true // 註冊完自動切換回登入模式
    }
  } catch (error) {
    $dialog.warning(error.response?.data?.message || '操作失敗了，檢查一下喔！')
  }
}

defineExpose({
  open: () => {
    visible.value = true
    isLogin.value = true
    form.account = ''
    form.password = ''
    form.confirmPassword = ''
    form.email = ''
  },
})
</script>

<style scoped>
/* 背景遮罩：稍微加深一點，並加一點點模糊感，讓中間的視窗更跳出來 */
.pixel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px); /* 讓背景有一點點模糊效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 登入小框框本體 */
.pixel-dialog-box {
  /* 💡 解決太長的問題：設定最大寬度，並確保它是固定的 */
  width: 90%;
  max-width: 380px;
  background: white;

  /* 像素風靈魂 1：超粗黑色邊框 */
  border: 4px solid #000;

  /* 像素風靈魂 2：硬邊陰影 (不使用模糊，用純色) */
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);

  /* 讓內容不要貼邊 */
  padding: 8px;
  position: relative;
}

.login-content {
  padding: 20px;
  background: #fff;
  /* 內層再加一個細邊框更有層次感 */
  border: 2px solid #eee;
}

/* 輸入框組 */
.input-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 標籤跟輸入框的間距 */
}

.input-group label {
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

/* 像素感輸入框 */
.pixel-input {
  border: 3px solid #000;
  padding: 12px;
  font-family: inherit;
  outline: none;
  background: #f9f9f9;
  /* 讓點擊時有驚喜色 */
  transition: all 0.2s;
}

.pixel-input:focus {
  background: #fff0f5; /* 淡淡的粉紅 */
  border-color: #ff85a1; /* 妳最愛的粉紅色 */
  box-shadow: 4px 4px 0px rgba(255, 133, 161, 0.3);
}

/* 按鈕區域 */
.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
}
/* 🍼 幫切換按鈕加一點點可愛的樣式 */
.toggle-mode {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  text-decoration: underline;
  /* 讓點擊的時候有一點點像素跳動感 */
  transition: transform 0.1s;
}

.toggle-mode:hover {
  color: #ff85a1;
  transform: scale(1.05);
}
</style>
