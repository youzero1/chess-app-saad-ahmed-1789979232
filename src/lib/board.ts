import type { Board, Color, Piece, Square } from '@/types/chess';

export function inBounds(sq: Square): boolean {
  return sq.file >= 0 && sq.file < 8 && sq.rank >= 0 && sq.rank < 8;
}

export function sameSquare(a: Square | null, b: Square | null): boolean {
  if (!a || !b) return false;
  return a.file === b.file && a.rank === b.rank;
}

export function squareKey(sq: Square): string {
  return `${sq.file},${sq.rank}`;
}

export function squareName(sq: Square): string {
  return `${'abcdefgh'[sq.file]}${sq.rank + 1}`;
}

export function isLightSquare(sq: Square): boolean {
  return (sq.file + sq.rank) % 2 === 1;
}

export function pieceAt(board: Board, sq: Square): Piece | null {
  if (!inBounds(sq)) return null;
  return board[sq.rank][sq.file];
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
}

const BACK_RANK: Piece['kind'][] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

export function initialBoard(): Board {
  const board = emptyBoard();
  for (let file = 0; file < 8; file++) {
    board[0][file] = { color: 'w', kind: BACK_RANK[file] };
    board[1][file] = { color: 'w', kind: 'p' };
    board[6][file] = { color: 'b', kind: 'p' };
    board[7][file] = { color: 'b', kind: BACK_RANK[file] };
  }
  return board;
}

export function opponent(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

export function colorName(color: Color): string {
  return color === 'w' ? 'White' : 'Black';
}
