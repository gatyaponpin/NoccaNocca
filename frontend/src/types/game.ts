export type PlayerColor = 'WHITE' | 'BLACK'


export interface Cell {
x: number
y: number
}


export interface StackPiece {
id: string
owner: PlayerColor
}


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