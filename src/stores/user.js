import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const account = ref('')
    const role = ref('user') // 預設角色是普通用戶
    const coins = ref(0)

    function login(data) {
      token.value = data.token
      account.value = data.account
      role.value = data.role
      coins.value = data.coins
    }

    function logout() {
      token.value = ''
      account.value = ''
      role.value = 'user'
      coins.value = 0
    }

    return { token, account, login, logout, role, coins }
  },
  {
    persist: true,
  },
)
