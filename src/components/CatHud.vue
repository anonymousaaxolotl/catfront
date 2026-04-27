<template>
  <div class="cat-hud">
    <div class="hud-name">
      {{ cat.name }} <span class="lv-tag">LV.{{ cat.level }}</span>
    </div>
    <div class="hud-stats">
      <div class="hud-row">
        <span class="icon">🍖</span>
        <px-progress
          :percentage="cat.satiety"
          theme="warning"
          track-color="#e0d8c8"
          style="flex: 1"
        />
      </div>

      <div class="hud-row">
        <span class="icon">❤️</span>
        <px-progress :percentage="cat.mood" theme="danger" track-color="#e0d8c8" style="flex: 1" />
      </div>

      <div class="hud-row">
        <span class="icon">🛁</span>
        <px-progress
          :percentage="cat.hygiene"
          theme="notice"
          track-color="#e0d8c8"
          style="flex: 1"
        />
      </div>

      <div class="hud-exp">✨ EXP: {{ cat.experience }} / {{ cat.level * 100 }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cat: { type: Object, required: true },
})
</script>

<style scoped>
.cat-hud {
  position: absolute;
  bottom: 24px;
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

@media (max-width: 768px) {
  .cat-hud {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 12px;
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
