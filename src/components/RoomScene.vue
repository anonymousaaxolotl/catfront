<template>
  <div class="roaming-area" :style="[wallStyle, { transform: `scale(${roomScale})` }]">
    <!-- 🌟 地板層 -->
    <div class="room-floor" :style="floorStyle"></div>

    <!-- 🌟 窗戶層 -->
    <div
      v-if="currentWindow"
      class="room-window"
      :style="{ backgroundImage: `url(${currentWindow})` }"
    ></div>

    <!-- 🌟 時鐘層 -->
    <div
      v-if="currentClock"
      class="room-clock"
      :style="{ backgroundImage: `url(${currentClock})` }"
    ></div>

    <!-- 🌟 貓跳台層 -->
    <div
      v-if="currentTower"
      class="room-tower"
      :style="{ backgroundImage: `url(${currentTower})` }"
    ></div>

    <!-- 🌟 植物層 -->
    <div
      v-if="currentPlant"
      class="room-plant"
      :style="{ backgroundImage: `url(${currentPlant})` }"
    ></div>

    <!-- 🌟 床層 -->
    <div
      v-if="currentBed"
      class="room-bed"
      :style="{ backgroundImage: `url(${currentBed})` }"
    ></div>

    <!-- 🌟 書架層 -->
    <div
      v-if="currentBookshelf"
      class="room-bookshelf"
      :style="{ backgroundImage: `url(${currentBookshelf})` }"
    ></div>

    <!-- 🌟 讓外部把小貓丟進這個插槽裡 -->
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  roomScale: Number,
  wallStyle: Object,
  floorStyle: Object,
  currentWindow: String,
  currentClock: String,
  currentTower: String,
  currentPlant: String,
  currentBed: String,
  currentBookshelf: String,
})
</script>

<style scoped>
.roaming-area {
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -720px;
  height: 750px;
  width: 1440px;
  transform-origin: center top;
  overflow: hidden;
  border-bottom: 4px solid #000;
  background-color: #fcfcfc;
  background-repeat: repeat;
  background-size: auto;
  image-rendering: pixelated;
}

.room-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 320px;
  background-repeat: repeat-x;
  background-position: bottom;
  background-size: 320px 320px;
  image-rendering: pixelated;
  z-index: 0;
}

.room-window,
.room-clock {
  position: absolute;
  width: 320px;
  height: 320px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  z-index: 0;
}
.room-window {
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
}
.room-clock {
  top: -10px;
  right: calc(50% + 400px);
}

.room-tower,
.room-plant,
.room-bed,
.room-bookshelf {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  image-rendering: pixelated;
}
.room-tower {
  bottom: 0px;
  left: 0;
  width: 640px;
  height: 640px;
  background-position: bottom left;
  z-index: 1;
}
.room-plant {
  bottom: 20px;
  left: 550px;
  width: 320px;
  height: 320px;
  background-position: bottom center;
  z-index: 1;
}
.room-bed {
  bottom: 20px;
  left: 800px;
  width: 320px;
  height: 320px;
  background-position: bottom center;
  z-index: 1;
}
.room-bookshelf {
  bottom: 30px;
  right: -100px;
  width: 640px;
  height: 640px;
  background-position: bottom right;
  z-index: 0;
}
</style>
