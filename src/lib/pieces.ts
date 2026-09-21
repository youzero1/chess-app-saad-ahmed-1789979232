import type { Piece, PieceKind } from '@/types/chess';

const KIND_NAMES: Record<PieceKind, string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
};

export function pieceLabel(piece: Piece): string {
  return `${piece.color === 'w' ? 'white' : 'black'} ${KIND_NAMES[piece.kind]}`;
}

export function kindName(kind: PieceKind): string {
  return KIND_NAMES[kind];
}
