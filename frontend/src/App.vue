<template>
  <v-app>
    <!-- 画面全体をセンター配置し、中央にスマホ幅のフレームを固定表示 -->
    <div class="app-root">
      <div class="mobile-frame">
        <v-main class="pa-0">
          <component
            :is="current === 'entrance' ? EntranceView : GameView"
            @enter="handleEnter"
          />
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import EntranceView from './views/EntranceView.vue'
  import GameView from './views/GameView.vue'

  const current = ref<'entrance' | 'game'>('game')
  function handleEnter() {
    current.value = 'game'
  }
</script>


<style scoped>
  .app-root {
    width: 100vw;
    height: 100dvh;
    display: grid;
    place-items: center;
    background: #b6b6bd;
  }

  /* 常にスマホ相当の幅を中央に固定表示 */
  .mobile-frame {
    width: min(390px, 100vw);
    height: min(780px, 100dvh);
    background: #ffffff;
    color: #fff;
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr;
  }

  .fill-area {
    width: 100%;
    height: 100%;
    padding: 16px;
  }

  .opacity-70 { opacity: .7; }
</style>
