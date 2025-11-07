export type Color = 'WHITE' | 'BLACK';

export interface Cell { col: number; row: number; }

export interface Piece {
  id: string;
  color: Color;
  col: number;
  row: number;
  level?: number;
}

export interface BoardState {
  pieces: Piece[];
}

export interface MoveAnim {
  id: string;
  from: { x: number; y: number; z: number };
  to:   { x: number; y: number; z: number };
}