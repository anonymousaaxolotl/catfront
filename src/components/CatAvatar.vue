<template>
  <div
    class="cat-avatar-stage"
    :style="{
      left: cat.x + 'px',
      bottom: (cat.y || 10) + 'px',
      zIndex: isSelected ? 9 : 1,
      cursor: 'pointer',
    }"
    @click="$emit('select')"
  >
    <div v-if="cat.activeEffect" class="floating-effect">
      {{ cat.activeEffect }}
    </div>
    <div class="cat-flip-wrapper" :style="{ transform: `scaleX(${-cat.dir})` }">
      <div class="cat-window">
        <img
          :src="cat.isMoving ? catConfig.walkUrl : catConfig.idleUrl"
          class="cat-sheet"
          :class="{
            'cat-mutated': cat.form === 'mutated',
            'cat-dirty': cat.form === 'dirty',
          }"
          :style="{
            transform: isBreathing ? `translateX(${catConfig.offset})` : 'translateX(0px)',
          }"
          alt="小貓的像素化身"
        />
      </div>

      <div class="pixel-shadow"></div>
      <div v-if="isSelected" class="selection-arrow">▼</div>

      <!-- 狀態 Emoji 特效 -->
      <div class="status-emoji-container">
        <div
          v-for="(emoji, index) in statusEmojis"
          :key="index"
          class="status-emoji"
          :style="getEmojiStyle(index)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cat: { type: Object, required: true },
  isBreathing: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
})

defineEmits(['select'])

const getImageUrl = (filename) => {
  return new URL(`../assets/images/${filename}`, import.meta.url).href
}

const catConfigs = {
  benz: {
    idleUrl: getImageUrl('catbenz.png'),
    walkUrl: getImageUrl('benzjump.png'),
    offset: '-310px',
  },
  white: {
    idleUrl: getImageUrl('catwhite.png'),
    walkUrl: getImageUrl('whitejump.png'),
    offset: '-310px',
  },
  black: {
    idleUrl: getImageUrl('catblack.png'),
    walkUrl: getImageUrl('blackjump.png'),
    offset: '-310px',
  },
  orange: {
    idleUrl: getImageUrl('catorange.png'),
    walkUrl: getImageUrl('orangejump.png'),
    offset: '-310px',
  },
  mine: {
    idleUrl: getImageUrl('catmine.png'),
    walkUrl: getImageUrl('minejump.png'),
    offset: '-310px',
  },
}

const catConfig = computed(() => catConfigs[props.cat.skin] || catConfigs.benz)

const statusEmojis = computed(() => {
  const emojis = []
  if (props.cat.form === 'mutated') emojis.push('💀')
  if (props.cat.form === 'dirty') emojis.push('🤢')
  if (props.cat.form === 'hungry') emojis.push('🤤')
  if (props.cat.mood < 30) emojis.push('💢')
  return emojis
})

const getEmojiStyle = (index) => {
  const positions = [
    { left: '0px', top: '-5px' },
    { left: '-25px', top: '10px' },
    { left: '25px', top: '0px' },
    { left: '-10px', top: '-20px' },
    { left: '15px', top: '15px' },
  ]
  const pos = positions[index % positions.length]
  return {
    animationDelay: index * 0.3 + 's',
    left: pos.left,
    top: pos.top,
  }
}
</script>

<style scoped>
.cat-avatar-stage {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cat-flip-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cat-window {
  width: 320px;
  height: 320px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  z-index: 2;
}

.cat-sheet {
  width: 640px;
  height: 320px;
  position: absolute;
  top: 0;
  left: 0;
  image-rendering: pixelated;
}

.cat-mutated {
  filter: invert(0.8) hue-rotate(180deg) saturate(2);
  transition: filter 0.5s ease;
}
.cat-dirty {
  filter: grayscale(50%) sepia(40%) brightness(0.9);
  transition: filter 0.5s ease;
}

.pixel-shadow {
  position: absolute;
  bottom: -8px;
  left: 115px;
  width: 140px;
  height: 16px;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 1;
  clip-path: polygon(
    8px 0%,
    calc(100% - 8px) 0%,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    8px 100%,
    0% calc(100% - 8px),
    0% 8px
  );
}

.floating-effect {
  position: absolute;
  top: 0px;
  font-size: 40px;
  z-index: 20;
  animation: float-up 1s ease-out forwards;
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-40px) scale(1.3);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(1);
  }
}

.selection-arrow {
  position: absolute;
  top: -30px;
  font-size: 20px;
  color: #ff85a1;
  animation: float-arrow 0.5s infinite alternate;
  z-index: 20;
}
@keyframes float-arrow {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}

.status-emoji-container {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}
.status-emoji {
  position: absolute;
  font-size: 24px;
  opacity: 0;
  animation: float-fade 2s infinite;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
}

@keyframes float-fade {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(-30px) scale(1);
    opacity: 0;
  }
}
</style>
