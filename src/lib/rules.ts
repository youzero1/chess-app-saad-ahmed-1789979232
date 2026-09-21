import type { Board, Color, GameState, GameStatus, Move, Piece, Square } from '@/types/chess';
import { cloneBoard, initialBoard, opponent, pieceAt } from '@/lib/board';
import { castlingMoves, isInCheck, pseudoLegalMoves } from '@/lib/moves';

export function createInitialState(): GameState {
  return {
    board: initialBoard(),
    turn: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    status: 'playing',
    lastMove: null,
    history: [],
  };
}

/** Apply a move to a board (no legality checks) and return the new board. */
function applyToBoard(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const { from, to, piece } = move;
  next[from.rank][from.file] = null;

  if (move.isEnPassant) {
    next[from.rank][to.file] = null;
  }

  const placed: Piece = move.promotion
    ? { color: piece.color, kind: move.promotion }
    : piece;
  next[to.rank][to.file] = placed;

  if (move.isCastle) {
    const rank = from.rank;
    if (move.isCastle === 'king') {
      next[rank][5] = next[rank][7];
      next[rank][7] = null;
    } else {
      next[rank][3] = next[rank][0];
      next[rank][0] = null;
    }
  }

  return next;
}

/** All legal moves for `color` in the given state. */
export function getAllLegalMoves(state: GameState, color: Color): Move[] {
  const result: Move[] = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = state.board[rank][file];
      if (!p || p.color !== color) continue;
      result.push(...legalMovesFrom(state, { file, rank }));
    }
  }
  return result;
}

export function legalMovesFrom(state: GameState, from: Square): Move[] {
  const piece = pieceAt(state.board, from);
  if (!piece) return [];
  const candidates = pseudoLegalMoves(state.board, from, state.enPassant);
  if (piece.kind === 'k') {
    candidates.push(...castlingMoves(state.board, piece.color, state.castling));
  }
  return candidates.filter((move) => {
    const next = applyToBoard(state.board, move);
    return !isInCheck(next, piece.color);
  });
}

/** Legal moves for the side to move from a square (empty if not their piece). */
export function getLegalMoves(state: GameState, from: Square): Move[] {
  const piece = pieceAt(state.board, from);
  if (!piece || piece.color !== state.turn) return [];
  if (isGameOver(state.status)) return [];
  return legalMovesFrom(state, from);
}

export function isGameOver(status: GameStatus): boolean {
  return (
    status === 'checkmate' ||
    status === 'stalemate' ||
    status === 'draw-fifty-move' ||
    status === 'draw-insufficient-material'
  );
}

function updateCastlingRights(state: GameState, move: Move) {
  const rights = { ...state.castling };
  const { from, to, piece } = move;
  if (piece.kind === 'k') {
    if (piece.color === 'w') {
      rights.wK = false;
      rights.wQ = false;
    } else {
      rights.bK = false;
      rights.bQ = false;
    }
  }
  if (piece.kind === 'r') {
    if (from.rank === 0 && from.file === 0) rights.wQ = false;
    if (from.rank === 0 && from.file === 7) rights.wK = false;
    if (from.rank === 7 && from.file === 0) rights.bQ = false;
    if (from.rank === 7 && from.file === 7) rights.bK = false;
  }
  // rook captured on its home square
  if (to.rank === 0 && to.file === 0) rights.wQ = false;
  if (to.rank === 0 && to.file === 7) rights.wK = false;
  if (to.rank === 7 && to.file === 0) rights.bQ = false;
  if (to.rank === 7 && to.file === 7) rights.bK = false;
  return rights;
}

export function hasInsufficientMaterial(board: Board): boolean {
  const pieces: { piece: Piece; square: Square }[] = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = board[rank][file];
      if (p) pieces.push({ piece: p, square: { file, rank } });
    }
  }
  if (pieces.some((e) => e.piece.kind === 'p' || e.piece.kind === 'q' || e.piece.kind === 'r')) {
    return false;
  }
  const minors = pieces.filter((e) => e.piece.kind !== 'k');
  if (minors.length === 0) return true; // K vs K
  if (minors.length === 1) return true; // K+minor vs K
  if (minors.length === 2) {
    const [a, b] = minors;
    if (
      a.piece.kind === 'b' &&
      b.piece.kind === 'b' &&
      a.piece.color !== b.piece.color &&
      (a.square.file + a.square.rank) % 2 === (b.square.file + b.square.rank) % 2
    ) {
      return true;
    }
  }
  return false;
}

function evaluateStatus(state: GameState): GameStatus {
  const color = state.turn;
  const inCheck = isInCheck(state.board, color);
  const hasMoves = getAllLegalMoves(state, color).length > 0;
  if (!hasMoves) return inCheck ? 'checkmate' : 'stalemate';
  if (hasInsufficientMaterial(state.board)) return 'draw-insufficient-material';
  if (state.halfmoveClock >= 100) return 'draw-fifty-move';
  return inCheck ? 'check' : 'playing';
}

export function applyMove(state: GameState, move: Move): GameState {
  const board = applyToBoard(state.board, move);
  const isPawn = move.piece.kind === 'p';
  const isCapture = Boolean(move.captured) || Boolean(move.isEnPassant);

  let enPassant: Square | null = null;
  if (isPawn && Math.abs(move.to.rank - move.from.rank) === 2) {
    enPassant = { file: move.from.file, rank: (move.from.rank + move.to.rank) / 2 };
  }

  const next: GameState = {
    board,
    turn: opponent(state.turn),
    castling: updateCastlingRights(state, move),
    enPassant,
    halfmoveClock: isPawn || isCapture ? 0 : state.halfmoveClock + 1,
    fullmoveNumber: state.turn === 'b' ? state.fullmoveNumber + 1 : state.fullmoveNumber,
    status: 'playing',
    lastMove: move,
    history: [...(state.history ?? []), move],
  };

  next.status = evaluateStatus(next);
  return next;
}
