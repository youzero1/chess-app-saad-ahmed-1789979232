import type { Move, Piece, PieceKind } from '@/types/chess';

export const PIECE_VALUES: Record<PieceKind, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

// Display order: most valuable first (queen … pawn); bishop before knight on ties.
const KIND_ORDER: Record<PieceKind, number> = { q: 0, r: 1, b: 2, n: 3, p: 4, k: 5 };

export interface CapturedPieces {
  /** Black pieces White has taken. */
  byWhite: Piece[];
  /** White pieces Black has taken. */
  byBlack: Piece[];
  /** Positive = White is ahead on material, negative = Black. */
  advantage: number;
}

/**
 * Captured pieces, derived from the move history. `move.captured` always holds the
 * piece actually removed from the board on that move (including en passant and the
 * taken piece on a promotion-capture), so promotions are handled correctly.
 */
export function capturedFromHistory(history: Move[] | undefined): CapturedPieces {
  const byWhite: Piece[] = [];
  const byBlack: Piece[] = [];
  for (const move of history ?? []) {
    const captured = move.captured;
    if (!captured) continue;
    if (captured.color === 'b') byWhite.push(captured);
    else byBlack.push(captured);
  }
  const sortByValue = (pieces: Piece[]) =>
    pieces.sort(
      (a, b) => PIECE_VALUES[b.kind] - PIECE_VALUES[a.kind] || KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
    );
  sortByValue(byWhite);
  sortByValue(byBlack);
  const total = (pieces: Piece[]) => pieces.reduce((sum, p) => sum + PIECE_VALUES[p.kind], 0);
  return { byWhite, byBlack, advantage: total(byWhite) - total(byBlack) };
}
