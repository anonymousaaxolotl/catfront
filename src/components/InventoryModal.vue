<template>
  <px-dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
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
          @click="$emit('use-item', item)"
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
        @click="$emit('update:visible', false)"
        >關閉</px-button
      >
    </div>
  </px-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  inventory: { type: Array, default: () => [] },
  currentEquipment: { type: Object, default: () => ({}) },
})

defineEmits(['update:visible', 'use-item'])

const inventoryFilter = ref('all')
const filters = [
  { label: '全部', value: 'all' },
  { label: '食物', value: 'food' },
  { label: '玩具', value: 'toy' },
  { label: '家具', value: 'furniture' },
  { label: '特殊', value: 'cat' },
]

const filteredInventory = computed(() => {
  if (inventoryFilter.value === 'all') return props.inventory
  return props.inventory.filter((item) => item.product.category === inventoryFilter.value)
})

const isEquipped = (item) => {
  if (item.product.category !== 'furniture') return false
  const slot = item.product.effectValue || 'floor'
  return props.currentEquipment[slot] === item.product.image
}
</script>

<style scoped>
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
</style>
