// src/services/socket.ts
import { io, Socket } from 'socket.io-client'

/** ====== 型 (必要に応じて拡張) ====== */
export type PlayerColor = 'WHITE' | 'BLACK'

export interface Cell { x: number; y: number }

export interface RoomJoinPayload {
  roomId: string
  name: string
}

export interface MovePayload {
  from: Cell
  to: Cell
}

export interface ServerState {
  // 盤面やターン情報など（後で詳細化）
  board: unknown
  turn: PlayerColor
  roomId: string
}

export type RoomError = { code?: string; message: string }

/** ====== イベント名（サーバと揃える） ====== */
export const EV = {
  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',
  ROOM_ERROR: 'room:error',
  ROOM_LEAVE: 'room:leave',

  GAME_STATE: 'game:state',
  GAME_MOVE: 'game:move',
} as const

/** ====== ソケット（シングルトン） ====== */
let socket: Socket | null = null

function createSocket(): Socket {
  const url = import.meta.env.VITE_SOCKET_URL as string
  const socket = io(url, {
    transports: ['websocket'],
    autoConnect: true,
    // 必要に応じて:
    // reconnection: true,
    // reconnectionAttempts: 10,
    // reconnectionDelay: 500,
  })

  return socket
}

export function getSocket(): Socket {
  if (!socket) socket = createSocket()
  return socket
}

/** ====== 高レベルAPI ====== */

/** 入室（成功: ROOM_JOINED / 失敗: ROOM_ERROR） */
export function joinRoom(payload: RoomJoinPayload) {
  getSocket().emit(EV.ROOM_JOIN, payload)
}

/** 退室 */
export function leaveRoom(roomId: string) {
  getSocket().emit(EV.ROOM_LEAVE, { roomId })
}

/** 手の送信 */
export function sendMove(payload: MovePayload) {
  getSocket().emit(EV.GAME_MOVE, payload)
}

/** ====== サブスクユーティリティ ======
 *  onXxx は解除用の関数（unsubscribe）を返します
 */
type Unsubscribe = () => void

export function onRoomJoined(cb: () => void): Unsubscribe {
  const h = () => cb()
  getSocket().on(EV.ROOM_JOINED, h)
  return () => getSocket().off(EV.ROOM_JOINED, h)
}

export function onRoomError(cb: (err: RoomError | string) => void): Unsubscribe {
  const h = (e: RoomError | string) => cb(e)
  getSocket().on(EV.ROOM_ERROR, h)
  return () => getSocket().off(EV.ROOM_ERROR, h)
}

export function onGameState(cb: (state: ServerState) => void): Unsubscribe {
  const h = (state: ServerState) => cb(state)
  getSocket().on(EV.GAME_STATE, h)
  return () => getSocket().off(EV.GAME_STATE, h)
}

/** 必要に応じて汎用 emit / on も公開 */
export function emit<T = unknown>(event: string, payload?: T) {
  getSocket().emit(event, payload)
}

export function on<T = unknown>(event: string, cb: (data: T) => void): Unsubscribe {
  const h = (d: T) => cb(d)
  getSocket().on(event, h)
  return () => getSocket().off(event, h)
}
