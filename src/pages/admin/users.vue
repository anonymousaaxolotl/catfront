<template>
  <div class="admin-users-page">
    <px-container title="👥 帳號管理中心">
      <div class="user-table">
        <div class="table-header">
          <div>帳號</div>
          <div>角色</div>
          <div>金幣</div>
          <div>道具</div>
          <div>操作</div>
        </div>
        <div v-if="users.length === 0" class="empty-row">目前沒有使用者</div>
        <div v-for="item in users" :key="item._id" class="table-row">
          <div class="col-account">{{ item.account }}</div>
          <div class="col-role">
            <span :class="['role-tag', item.role]">{{
              item.role === 'admin' ? '👑 管理員' : '🌱 一般用戶'
            }}</span>
          </div>
          <div class="col-coins">💰 {{ item.coins }}</div>
          <div class="col-inventory">🎒 {{ item.inventory?.length || 0 }}</div>
          <div class="col-actions">
            <px-button
              size="small"
              color="#8f9779"
              textColor="#4e3629"
              @click="openEditDialog(item)"
              >編輯</px-button
            >
            <px-button
              size="small"
              color="#a0522d"
              textColor="#ffffff"
              @click="handleDelete(item._id)"
              >刪除</px-button
            >
          </div>
        </div>
      </div>
    </px-container>

    <!-- ✏️ 編輯對話框 -->
    <px-dialog
      v-model:visible="dialogVisible"
      title="✏️ 編輯使用者"
      width="500px"
      :show-footer="false"
    >
      <div class="form-content">
        <div class="form-group">
          <label>帳號 (唯讀)</label>
          <input v-model="editForm.account" class="pixel-input" disabled style="background: #eee" />
        </div>
        <div class="form-group">
          <label>角色權限</label>
          <select v-model="editForm.role" class="pixel-input">
            <option value="user">一般用戶</option>
            <option value="admin">管理員</option>
          </select>
        </div>
        <div class="form-group">
          <label>金幣數量</label>
          <input v-model.number="editForm.coins" type="number" class="pixel-input" />
        </div>
        <div class="form-group">
          <label>🎒 背包道具管理</label>
          <div v-if="editForm.inventory.length > 0" class="inventory-list">
            <div v-for="(item, index) in editForm.inventory" :key="index" class="inventory-row">
              <span class="item-name">{{
                productMap[item.product] ? productMap[item.product].name : '未知道具'
              }}</span>
              <input
                v-model.number="item.quantity"
                type="number"
                class="pixel-input qty-input"
                min="0"
              />
              <px-button size="small" color="#a0522d" textColor="#ffffff" @click="removeItem(index)"
                >刪</px-button
              >
            </div>
          </div>
          <div v-else class="empty-text">背包空空的</div>
        </div>
        <div class="dialog-footer">
          <px-button color="#8f9779" textColor="#4e3629" @click="handleUpdate">儲存修改</px-button>
          <px-button
            color="#ffb7c5"
            textColor="#4e3629"
            variant="outline"
            @click="dialogVisible = false"
            >取消</px-button
          >
        </div>
      </div>
    </px-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import userService from '@/services/user'
import productService from '@/services/product'

const users = ref([])
const products = ref([])
const dialogVisible = ref(false)
const editId = ref('')
const editForm = reactive({
  account: '',
  role: 'user',
  coins: 0,
  inventory: [],
})

const productMap = computed(() => {
  return products.value.reduce((map, product) => {
    map[product._id] = product
    return map
  }, {})
})

const fetchUsers = async () => {
  try {
    const { data } = await userService.getAll()
    users.value = data.result
  } catch (error) {
    console.error(error)
    $dialog.warning('無法取得使用者列表')
  }
}

const fetchProducts = async () => {
  try {
    const { data } = await productService.getAll()
    products.value = data.result
  } catch (error) {
    console.error('無法取得商品列表', error)
  }
}

const openEditDialog = (user) => {
  editId.value = user._id
  editForm.account = user.account
  editForm.role = user.role
  editForm.coins = user.coins
  // 深拷貝 inventory，避免直接修改原資料
  editForm.inventory = user.inventory ? JSON.parse(JSON.stringify(user.inventory)) : []
  dialogVisible.value = true
}

const removeItem = (index) => {
  editForm.inventory.splice(index, 1)
}

const handleUpdate = async () => {
  try {
    // 整理資料：確保 product 只傳 ID 回去 (如果後端 populate 了的話)
    const submitData = {
      ...editForm,
      inventory: editForm.inventory.map((item) => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
      })),
    }
    await userService.updateUser(editId.value, submitData)
    $dialog.success({
      content: '更新成功',
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    $dialog.warning('更新失敗')
  }
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除這個帳號嗎？此動作無法復原！')) return
  try {
    await userService.deleteUser(id)
    $dialog.success({
      content: '刪除成功',
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    fetchUsers()
  } catch (error) {
    $dialog.warning('刪除失敗')
  }
}

onMounted(() => {
  fetchUsers()
  fetchProducts()
})
</script>

<style scoped>
.user-table {
  border: 2px solid #000;
  background: #fff;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.8fr 1.5fr;
  gap: 10px;
  padding: 10px;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.table-header {
  background: #f0f0f0;
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.role-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9rem;
}
.role-tag.admin {
  background: #ffd700;
  color: #000;
}
.role-tag.user {
  background: #eee;
  color: #666;
}

.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.pixel-input {
  width: 100%;
  padding: 8px;
  border: 2px solid #000;
  font-family: inherit;
  box-sizing: border-box;
}
.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.empty-row {
  padding: 20px;
  text-align: center;
  color: #888;
}

.inventory-list {
  border: 2px solid #eee;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.inventory-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 4px;
}

.item-name {
  flex: 1;
  font-size: 0.9rem;
}

.qty-input {
  width: 60px;
  padding: 4px;
}

.empty-text {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 10px;
}
</style>
