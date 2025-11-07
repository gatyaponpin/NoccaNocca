import { COLS, ROWS, STACK_MAX } from './constants';
import type { BoardState, Piece, Cell } from '../../types/game';
    
export function inBoard(col: number, row: number) {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

export function createInitialState(): BoardState {
  const pieces: Piece[] = [];
  for (let c = 0; c < COLS; c++) {
    pieces.push({ id: `W${c}`, color: 'WHITE', col: c, row: 0, level: 0 });
    pieces.push({ id: `B${c}`, color: 'BLACK', col: c, row: ROWS - 1, level: 0 });
  }
  // 初期は各セル1個なので normalize は不要だが、呼んでおく
  return normalizeAll({ pieces });
}

/** セル内のスタックを level 昇順で取得 */
export function getStackAt(state: BoardState, c: number, r: number): Piece[] {
  return state.pieces
    .filter(p => p.col === c && p.row === r)
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
}

/** そのセルの最上段の駒（なければ undefined） */
export function topPieceAt(state: BoardState, c: number, r: number): Piece | undefined {
  const stack = getStackAt(state, c, r);
  return stack[stack.length - 1];
}

/** ボード全体の level を各セルで 0..n-1 に再割り当て */
export function normalizeAll(state: BoardState): BoardState {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const stack = getStackAt(state, c, r);
      stack.forEach((p, idx) => (p.level = idx));
    }
  }
  return state;
}

/** 合法手：上下左右1マス。先のセルのスタック数 < STACK_MAX ならOK */
export function legalMoves(state: BoardState, piece: Piece): Cell[] {
  const out: Cell[] = [];
  // 移動先への移動量
  const directions: [number, number][] = [[1,  0], [-1,  0], [0,  1], [0, -1], [1,  1], [1, -1], [-1,  1], [-1, -1]];

  for (const [deltaCol, deltaRow] of directions) {
    const nextCol = piece.col + deltaCol;
    const nextRow = piece.row + deltaRow;

    if (!inBoard(nextCol, nextRow)) continue;
    const stackLen = getStackAt(state, nextCol, nextRow).length;
    if (stackLen >= STACK_MAX) continue;

    out.push({ col: nextCol, row: nextRow });
  }

  return out;
}

/** 移動：目的セルが許容量以内なら移動し、元/先セルの level を再計算 */
export function movePiece(state: BoardState, pieceId: string, to: Cell) {
  const p = state.pieces.find(x => x.id === pieceId);
  if (!p) return false;
  if (!inBoard(to.col, to.row)) return false;

  const destLen = getStackAt(state, to.col, to.row).length;
  if (destLen >= STACK_MAX) return false;

  const from = { col: p.col, row: p.row };

  // 位置更新（level は一旦末尾として置く）
  p.col = to.col;
  p.row = to.row;
  p.level = destLen; // 先セルの上に乗る

  // 元セル/先セルを正規化
  normalizeCell(state, from.col, from.row);
  normalizeCell(state, to.col, to.row);
  return true;
}

/** 対象セルだけ level を再割り当て */
function normalizeCell(state: BoardState, c: number, r: number) {
  const stack = getStackAt(state, c, r);
  stack.forEach((p, idx) => (p.level = idx));
}
