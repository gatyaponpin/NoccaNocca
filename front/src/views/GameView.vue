<template>
  <div ref="mountRef" class="stage"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { createGame, type GameController } from '@/services/game'

const mountRef = ref<HTMLDivElement | null>(null)
let game: GameController | null = null

function onResize() {
  game?.resize()
}

onMounted(() => {
  if (mountRef.value) {
    game = createGame(mountRef.value)
    window.addEventListener('resize', onResize)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  game?.destroy()
  game = null
})
</script>

<style scoped>
.stage {
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
}
</style>
