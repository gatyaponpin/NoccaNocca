import { type Cell }  from './game'

export interface MoveMessage {
type: 'move'
from: Cell
to: Cell
}


export interface JoinMessage {
type: 'join'
roomId: string
}


export type ServerEvent =
| { type: 'state'; board: string } // まずは雑に文字列、後で詳細化
| { type: 'joined'; roomId: string }