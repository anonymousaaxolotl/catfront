<template>
  <div class="admin-product-page">
    <px-container title="📦 商品管理中心">
      <div class="toolbar">
        <px-button color="#8f9779" textColor="#4e3629" @click="openDialog(null)"
          >➕ 上架新商品</px-button
        >
      </div>

      <div class="product-table">
        <div class="table-header">
          <div>圖片</div>
          <div>名稱</div>
          <div>價格</div>
          <div>分類</div>
          <div>效果值</div>
          <div>操作</div>
        </div>
        <div v-if="products.length === 0" class="empty-row">目前沒有商品</div>
        <div v-for="item in products" :key="item._id" class="table-row">
          <div class="col-img">
            <img v-if="item.image" :src="item.image" class="thumb" />
            <span v-else>📦</span>
          </div>
          <div class="col-name">{{ item.name }}</div>
          <div class="col-price">💰 {{ item.price }}</div>
          <div class="col-category">
            <span class="tag">{{ categoryMap[item.category] }}</span>
          </div>
          <div class="col-effect">{{ item.effectValue }}</div>
          <div class="col-actions">
            <px-button size="small" color="#8f9779" textColor="#4e3629" @click="openDialog(item)"
              >編輯</px-button
            >
            <px-button
              size="small"
              color="#a0522d"
              textColor="#ffffff"
              @click="handleDelete(item._id)"
              >下架</px-button
            >
          </div>
        </div>
      </div>
    </px-container>

    <!-- 新增/編輯對話框 -->
    <px-dialog
      v-model:visible="dialogVisible"
      :title="isEdit ? '✏️ 編輯商品' : '✨ 上架新商品'"
      width="500px"
      :show-footer="false"
    >
      <div class="form-content">
        <div class="form-group">
          <label>商品圖片</label>
          <div class="image-upload-box">
            <img v-if="previewImage" :src="previewImage" class="preview" />
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" />
          </div>
        </div>

        <div class="form-group">
          <label>商品名稱</label>
          <input v-model="form.name" class="pixel-input" placeholder="例如：超級罐罐" />
        </div>

        <div class="form-group">
          <label>價格</label>
          <input v-model="form.price" type="number" class="pixel-input" />
        </div>

        <div class="form-group">
          <label>分類</label>
          <select v-model="form.category" class="pixel-input">
            <option value="food">🥫 食物 (增加飽食度)</option>
            <option value="toy">🪀 玩具 (增加心情)</option>
            <option value="furniture">🛋️ 家具 (裝飾)</option>
            <option value="cat">🐱 特殊貓 (解鎖外觀)</option>
          </select>
        </div>

        <div class="form-group">
          <label>效果值 / 外觀代號</label>
          <input
            v-model="form.effectValue"
            class="pixel-input"
            placeholder="數字(數值) 或 字串(skin代號)"
          />
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" class="pixel-input" rows="3"></textarea>
        </div>

        <div class="dialog-footer">
          <px-button color="#8f9779" textColor="#4e3629" @click="handleSubmit">確認儲存</px-button>
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
import { ref, reactive, onMounted } from 'vue'
import productService from '@/services/product'

const products = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const previewImage = ref('')
const uploadFile = ref(null)
const fileInput = ref(null)

const form = reactive({
  name: '',
  price: 0,
  category: 'food',
  effectValue: '',
  description: '',
})

const categoryMap = {
  food: '食物',
  toy: '玩具',
  furniture: '家具',
  cat: '特殊貓',
}

const fetchProducts = async () => {
  try {
    const { data } = await productService.getAll()
    products.value = data.result
  } catch (error) {
    console.error(error)
  }
}

const openDialog = (item) => {
  if (item) {
    isEdit.value = true
    editId.value = item._id
    form.name = item.name
    form.price = item.price
    form.category = item.category
    form.effectValue = item.effectValue
    form.description = item.description
    previewImage.value = item.image
  } else {
    isEdit.value = false
    editId.value = ''
    form.name = ''
    form.price = 0
    form.category = 'food'
    form.effectValue = ''
    form.description = ''
    previewImage.value = ''
  }
  uploadFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  dialogVisible.value = true
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async () => {
  try {
    // 使用 FormData 來傳送檔案
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('price', form.price)
    formData.append('category', form.category)
    formData.append('effectValue', form.effectValue)
    formData.append('description', form.description)
    if (uploadFile.value) {
      formData.append('image', uploadFile.value)
    }

    if (isEdit.value) {
      await productService.update(editId.value, formData)
      $dialog.success({
        content: '更新成功',
        okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
      })
    } else {
      await productService.create(formData)
      $dialog.success({
        content: '上架成功',
        okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
      })
    }
    dialogVisible.value = false
    fetchProducts()
  } catch (error) {
    $dialog.warning(error.response?.data?.message || '操作失敗')
  }
}

const handleDelete = async (id) => {
  if (!confirm('確定要下架這個商品嗎？')) return
  try {
    await productService.remove(id)
    $dialog.success({
      content: '已下架',
      okButtonProps: { color: '#8f9779', textColor: '#4e3629' },
    })
    fetchProducts()
  } catch (error) {
    $dialog.warning('刪除失敗')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
  text-align: right;
}

.product-table {
  border: 2px solid #000;
  background: #fff;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr 1.5fr;
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

.thumb {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border: 1px solid #ddd;
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
}

.image-upload-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview {
  width: 60px;
  height: 60px;
  border: 2px solid #000;
  object-fit: contain;
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
</style>
