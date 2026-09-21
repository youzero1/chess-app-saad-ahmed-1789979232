import type { Color, Piece, PieceKind } from '@/types/chess';

const GLYPHS: Record<Color, Record<PieceKind, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const KIND_NAMES: Record<PieceKind, string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
};

export function pieceGlyph(piece: Piece): string {
  return GLYPHS[piece.color][piece.kind];
}

export function glyphFor(color: Color, kind: PieceKind): string {
  return GLYPHS[color][kind];
}

export function pieceLabel(piece: Piece): string {
  return `${piece.color === 'w' ? 'white' : 'black'} ${KIND_NAMES[piece.kind]}`;
}

export function kindName(kind: PieceKind): string {
  return KIND_NAMES[kind];
}
