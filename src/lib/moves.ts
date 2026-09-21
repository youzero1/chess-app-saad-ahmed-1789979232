import type { Board, CastlingRights, Color, Move, Piece, Square } from '@/types/chess';
import { inBounds, opponent, pieceAt, sameSquare } from '@/lib/board';

const KNIGHT_OFFSETS = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const KING_OFFSETS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

const BISHOP_DIRS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const ROOK_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function mk(
  board: Board,
  from: Square,
  to: Square,
  extra: Partial<Move> = {},
): Move {
  const piece = pieceAt(board, from) as Piece;
  return {
    from,
    to,
    piece,
    captured: pieceAt(board, to),
    ...extra,
  };
}

function slide(board: Board, from: Square, dirs: number[][], color: Color): Move[] {
  const moves: Move[] = [];
  for (const [df, dr] of dirs) {
    let f = from.file + df;
    let r = from.rank + dr;
    while (inBounds({ file: f, rank: r })) {
      const target = board[r][f];
      if (!target) {
        moves.push(mk(board, from, { file: f, rank: r }));
      } else {
        if (target.color !== color) moves.push(mk(board, from, { file: f, rank: r }));
        break;
      }
      f += df;
      r += dr;
    }
  }
  return moves;
}

function offsetMoves(board: Board, from: Square, offsets: number[][], color: Color): Move[] {
  const moves: Move[] = [];
  for (const [df, dr] of offsets) {
    const to = { file: from.file + df, rank: from.rank + dr };
    if (!inBounds(to)) continue;
    const target = board[to.rank][to.file];
    if (target && target.color === color) continue;
    moves.push(mk(board, from, to));
  }
  return moves;
}

const PROMOTION_KINDS: Piece['kind'][] = ['q', 'r', 'b', 'n'];

function pawnMoves(board: Board, from: Square, color: Color, enPassant: Square | null): Move[] {
  const moves: Move[] = [];
  const dir = color === 'w' ? 1 : -1;
  const startRank = color === 'w' ? 1 : 6;
  const lastRank = color === 'w' ? 7 : 0;

  const push = (to: Square, extra: Partial<Move> = {}) => {
    if (to.rank === lastRank) {
      for (const kind of PROMOTION_KINDS) {
        moves.push(mk(board, from, to, { ...extra, promotion: kind }));
      }
    } else {
      moves.push(mk(board, from, to, extra));
    }
  };

  const one = { file: from.file, rank: from.rank + dir };
  if (inBounds(one) && !board[one.rank][one.file]) {
    push(one);
    const two = { file: from.file, rank: from.rank + 2 * dir };
    if (from.rank === startRank && inBounds(two) && !board[two.rank][two.file]) {
      moves.push(mk(board, from, two));
    }
  }

  for (const df of [-1, 1]) {
    const to = { file: from.file + df, rank: from.rank + dir };
    if (!inBounds(to)) continue;
    const target = board[to.rank][to.file];
    if (target && target.color !== color) {
      push(to);
    } else if (!target && enPassant && sameSquare(enPassant, to)) {
      moves.push(
        mk(board, from, to, {
          isEnPassant: true,
          captured: board[from.rank][to.file],
        }),
      );
    }
  }

  return moves;
}

/** Pseudo-legal moves for the piece on `from`, excluding castling. */
export function pseudoLegalMoves(
  board: Board,
  from: Square,
  enPassant: Square | null,
): Move[] {
  const piece = pieceAt(board, from);
  if (!piece) return [];
  switch (piece.kind) {
    case 'p':
      return pawnMoves(board, from, piece.color, enPassant);
    case 'n':
      return offsetMoves(board, from, KNIGHT_OFFSETS, piece.color);
    case 'k':
      return offsetMoves(board, from, KING_OFFSETS, piece.color);
    case 'b':
      return slide(board, from, BISHOP_DIRS, piece.color);
    case 'r':
      return slide(board, from, ROOK_DIRS, piece.color);
    case 'q':
      return slide(board, from, [...BISHOP_DIRS, ...ROOK_DIRS], piece.color);
    default:
      return [];
  }
}

export function findKing(board: Board, color: Color): Square | null {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = board[rank][file];
      if (p && p.color === color && p.kind === 'k') return { file, rank };
    }
  }
  return null;
}

/** Is `target` attacked by any piece of `by`? */
export function isSquareAttacked(board: Board, target: Square, by: Color): boolean {
  // pawns
  const dir = by === 'w' ? 1 : -1;
  for (const df of [-1, 1]) {
    const sq = { file: target.file - df, rank: target.rank - dir };
    if (inBounds(sq)) {
      const p = board[sq.rank][sq.file];
      if (p && p.color === by && p.kind === 'p') return true;
    }
  }
  // knights
  for (const [df, dr] of KNIGHT_OFFSETS) {
    const sq = { file: target.file + df, rank: target.rank + dr };
    if (!inBounds(sq)) continue;
    const p = board[sq.rank][sq.file];
    if (p && p.color === by && p.kind === 'n') return true;
  }
  // king
  for (const [df, dr] of KING_OFFSETS) {
    const sq = { file: target.file + df, rank: target.rank + dr };
    if (!inBounds(sq)) continue;
    const p = board[sq.rank][sq.file];
    if (p && p.color === by && p.kind === 'k') return true;
  }
  // sliding
  const rays: [number[][], Piece['kind'][]] [] = [
    [BISHOP_DIRS, ['b', 'q']],
    [ROOK_DIRS, ['r', 'q']],
  ];
  for (const [dirs, kinds] of rays) {
    for (const [df, dr] of dirs) {
      let f = target.file + df;
      let r = target.rank + dr;
      while (inBounds({ file: f, rank: r })) {
        const p = board[r][f];
        if (p) {
          if (p.color === by && kinds.includes(p.kind)) return true;
          break;
        }
        f += df;
        r += dr;
      }
    }
  }
  return false;
}

export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  return isSquareAttacked(board, king, opponent(color));
}

/** Castling candidates for `color` — squares empty + rights present + no passing through check. */
export function castlingMoves(
  board: Board,
  color: Color,
  castling: CastlingRights,
): Move[] {
  const moves: Move[] = [];
  const rank = color === 'w' ? 0 : 7;
  const king = board[rank][4];
  if (!king || king.kind !== 'k' || king.color !== color) return moves;
  const enemy = opponent(color);
  if (isSquareAttacked(board, { file: 4, rank }, enemy)) return moves;

  const kingSide = color === 'w' ? castling.wK : castling.bK;
  const queenSide = color === 'w' ? castling.wQ : castling.bQ;

  if (kingSide) {
    const rook = board[rank][7];
    if (
      rook &&
      rook.kind === 'r' &&
      rook.color === color &&
      !board[rank][5] &&
      !board[rank][6] &&
      !isSquareAttacked(board, { file: 5, rank }, enemy) &&
      !isSquareAttacked(board, { file: 6, rank }, enemy)
    ) {
      moves.push({
        from: { file: 4, rank },
        to: { file: 6, rank },
        piece: king,
        captured: null,
        isCastle: 'king',
      });
    }
  }

  if (queenSide) {
    const rook = board[rank][0];
    if (
      rook &&
      rook.kind === 'r' &&
      rook.color === color &&
      !board[rank][1] &&
      !board[rank][2] &&
      !board[rank][3] &&
      !isSquareAttacked(board, { file: 3, rank }, enemy) &&
      !isSquareAttacked(board, { file: 2, rank }, enemy)
    ) {
      moves.push({
        from: { file: 4, rank },
        to: { file: 2, rank },
        piece: king,
        captured: null,
        isCastle: 'queen',
      });
    }
  }

  return moves;
}
