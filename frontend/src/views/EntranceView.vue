<template>
  <v-container class="py-10 px-2 bg-white" fluid>
    <div class="text-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">NOCCA × NOCCA</h1>
      <div class="text-subtitle-2 text-grey-darken-1">
        オンライン対戦ロビー
      </div>
    </div>

    <v-card flat color="white" class="pa-6">
      <v-form v-model="valid" ref="formRef">
        <v-text-field
          v-model.trim="playerName"
          label="プレイヤー名"
          :rules="nameRules"
          variant="outlined"
          color="primary"
          density="comfortable"
          autocomplete="username"
          prepend-inner-icon="mdi-account"
          @change="saveName"
          autofocus
        />

        <v-text-field
          v-model="uppercaseRoomId"
          label="ルームID"
          :rules="roomRules"
          variant="outlined"
          color="primary"
          density="comfortable"
          autocomplete="off"
          inputmode="latin"
          maxlength="12"
          prepend-inner-icon="mdi-pound"
          class="mt-3"
        />

        <div class="d-flex flex-column ga-3 mt-6">
          <v-btn
            color="blue-grey-lighten-4"
            variant="outlined"
            class="flex-1-1 text-grey-darken-3"
            :loading="connecting"
            :disabled="connecting"
            @click="createRoom"
          >
            部屋作成
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            class="flex-1-1"
            :loading="connecting"
            :disabled="connecting"
            @click="join"
          >
            入室
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { joinRoom, onRoomJoined, onRoomError } from '../services/socket'

const emit = defineEmits<{ (e: 'enter'): void }>()

const playerName = ref('')
const roomId = ref('')
const connecting = ref(false)
const valid = ref(false)
const formRef = ref<HTMLFormElement | null>(null)

const STORAGE_KEY = 'nocca.playerName'

// イベント解除関数を保持
let offJoined: (() => void) | null = null
let offError: (() => void) | null = null

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) playerName.value = saved

  offJoined = onRoomJoined(() => {
    connecting.value = false
    emit('enter')
  })

  offError = onRoomError((msg) => {
    connecting.value = false
    alert(typeof msg === 'string' ? msg : msg?.message || '入室に失敗しました')
  })
})

onUnmounted(() => {
  offJoined?.()
  offError?.()
})

function saveName() {
  localStorage.setItem(STORAGE_KEY, playerName.value.trim())
}

function randomRoomId(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

const nameRules = [
  (v: string) => !!v?.trim() || 'プレイヤー名を入力してください',
  (v: string) => v.trim().length <= 16 || '16文字以内で入力してください',
]
const roomRules = [
  (v: string) => !!v?.trim() || 'ルームIDを入力してください',
  (v: string) => /^[A-Z0-9]{4,12}$/.test(v.trim()) || 'A-Z/0-9で4〜12文字',
]

const uppercaseRoomId = computed({
  get: () => roomId.value,
  set: (v: string) => (roomId.value = (v || '').toUpperCase()),
})

async function createRoom() {
  playerName.value = playerName.value.trim()
  if (!playerName.value) return alert('プレイヤー名を入力してください')
  roomId.value = randomRoomId()
  await join()
}

async function join() {
  // Vuetify の v-form validate を使用
  const ok = await formRef.value?.validate()
  if (!ok?.valid) return

  saveName()
  connecting.value = true

  joinRoom({
    roomId: roomId.value,
    name: playerName.value,
  })
}
</script>
