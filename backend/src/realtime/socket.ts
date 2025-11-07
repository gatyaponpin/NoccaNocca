// src/realtime/socket.ts
import { Server, Socket } from 'socket.io'
import { EV } from './events'
import { joinRoom, leaveRoom, findRoomBySocket, getOrCreateRoom } from '../rooms'

type RoomJoinPayload = { roomId: string; name: string }

export function initSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('[io] connect', socket.id)

    socket.on(EV.ROOM_JOIN, (payload: RoomJoinPayload) =>
      handleRoomJoin(io, socket, payload)
    )

    socket.on(EV.ROOM_LEAVE, (payload: { roomId: string }) =>
      handleRoomLeave(socket, payload)
    )

    socket.on('disconnect', () => handleDisconnect(socket))
  })
}

/* ============ ハンドラ群 ============ */

function handleRoomJoin(io: Server, socket: Socket, payload: RoomJoinPayload) {
  const roomId = (payload?.roomId || '').toUpperCase().trim()
  const name = (payload?.name || '').trim()

  if (!roomId || !/^[A-Z0-9]{4,12}$/.test(roomId)) {
    socket.emit(EV.ROOM_ERROR, { message: '不正なルームIDです' })
    return
  }
  if (!name) {
    socket.emit(EV.ROOM_ERROR, { message: 'プレイヤー名を入力してください' })
    return
  }

  const result = joinRoom(roomId, { id: socket.id, name })
  if (!result.ok) {
    socket.emit(EV.ROOM_ERROR, { message: result.message })
    return
  }

  socket.join(roomId)

  const room = getOrCreateRoom(roomId)
  const state = {
    roomId,
    players: room.players.map((p) => ({ id: p.id, name: p.name })),
  }

  socket.emit(EV.ROOM_JOINED, state)
  socket.to(roomId).emit(EV.ROOM_JOINED, state)

  console.log(`[io] ${socket.id} joined ${roomId}`)
}

function handleRoomLeave(socket: Socket, payload: { roomId: string }) {
  const roomId = (payload?.roomId || '').toUpperCase().trim()
  if (!roomId) return
  leaveRoom(roomId, socket.id)
  socket.leave(roomId)
  console.log(`[io] ${socket.id} left ${roomId}`)
}

function handleDisconnect(socket: Socket) {
  const r = findRoomBySocket(socket.id)
  if (r) {
    leaveRoom(r.id, socket.id)
    socket.leave(r.id)
    console.log(`[io] ${socket.id} disconnected and removed from ${r.id}`)
  } else {
    console.log('[io] disconnect', socket.id)
  }
}
