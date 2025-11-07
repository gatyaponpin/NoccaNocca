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
          <template v-if="current === 'game'">
            <div class="d-flex flex-column align-center justify-center fill-area">
              <h2 class="text-h6 font-weight-bold mb-2">ゲーム画面（準備中）</h2>
              <div class="text-body-2 opacity-70">次のステップでThree.jsの盤面を表示します</div>
            </div>
          </template>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import EntranceView from '@/views/EntranceView.vue'
  import GameView from '@/views/GameView.vue'

  const current = ref<'entrance' | 'game'>('game')
  function handleEnter() {
    current.value = 'game'
  }
</script>


<style scoped>
  .app-root {
    width: 100vw;
    height: 100dvh;           /* モバイルのアドレスバー高変動に強い */
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
