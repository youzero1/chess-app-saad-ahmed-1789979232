export type Color = 'w' | 'b';

export type PieceKind = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  color: Color;
  kind: PieceKind;
}

/** file = 0..7 (a..h), rank = 0..7 where 0 is rank 1 (white's back rank) */
export interface Square {
  file: number;
  rank: number;
}

export type Board = (Piece | null)[][]; // board[rank][file]

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece | null;
  promotion?: PieceKind;
  isCastle?: 'king' | 'queen';
  isEnPassant?: boolean;
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export type GameStatus =
  | 'playing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw-fifty-move'
  | 'draw-insufficient-material';

export interface GameState {
  board: Board;
  turn: Color;
  castling: CastlingRights;
  enPassant: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  status: GameStatus;
  lastMove: Move | null;
}
