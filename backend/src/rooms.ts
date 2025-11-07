export type Player = {
  id: string;      // socket.id
  name: string;
}
export type Room = {
  id: string;
  players: Player[]; // max 2
}

const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string): Room {
  let r = rooms.get(roomId);
  if (!r) {
    r = { id: roomId, players: [] };
    rooms.set(roomId, r);
  }
  return r;
}

export function joinRoom(roomId: string, player: Player): { ok: true; room: Room } | { ok: false; message: string } {
  const room = getOrCreateRoom(roomId);

  // すでに同じsocket.idがいたら弾く（再入室はクライアント側で再接続ハンドリング）
  if (room.players.some(p => p.id === player.id)) {
    return { ok: false, message: 'すでに入室済みです' };
  }
  // 同名禁止（任意仕様：必要なければ外してOK）
  if (room.players.some(p => p.name === player.name)) {
    return { ok: false, message: '同じ名前のプレイヤーが入室中です' };
  }
  if (room.players.length >= 2) {
    return { ok: false, message: 'この部屋は満室です' };
  }

  room.players.push(player);
  return { ok: true, room };
}

export function leaveRoom(roomId: string, socketId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.players = room.players.filter(p => p.id !== socketId);
  if (room.players.length === 0) {
    rooms.delete(roomId);
  }
}

export function findRoomBySocket(socketId: string): Room | undefined {
  for (const r of rooms.values()) {
    if (r.players.some(p => p.id === socketId)) return r;
  }
  return undefined;
}