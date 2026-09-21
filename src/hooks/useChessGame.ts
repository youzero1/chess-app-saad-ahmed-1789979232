import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameState, Move, PieceKind, Square } from '@/types/chess';
import { pieceAt, sameSquare } from '@/lib/board';
import { applyMove, createInitialState, getLegalMoves, isGameOver } from '@/lib/rules';

export interface PendingPromotion {
  moves: Move[];
  from: Square;
  to: Square;
}

interface ChessGameOptions {
  state?: GameState;
  canMove?: boolean;
  onMove?: (nextState: GameState) => void | Promise<void>;
  onNewGame?: () => void | Promise<void>;
}

export function useChessGame(options: ChessGameOptions = {}) {
  const [localState, setLocalState] = useState<GameState>(() => createInitialState());
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const state = options.state ?? localState;
  const canMove = options.canMove ?? true;

  const legalMoves = useMemo<Move[]>(
    () => (selected ? getLegalMoves(state, selected) : []),
    [state, selected],
  );

  const gameOver = isGameOver(state.status);

  useEffect(() => {
    setSelected(null);
    setPendingPromotion(null);
  }, [state]);

  const commit = useCallback(
    (move: Move) => {
      const next = applyMove(state, move);
      setSelected(null);
      setPendingPromotion(null);
      if (options.onMove) void options.onMove(next);
      else setLocalState(next);
    },
    [options, state],
  );

  const selectSquare = useCallback(
    (square: Square) => {
      if (!canMove || gameOver || pendingPromotion) return;

      if (selected) {
        const matching = legalMoves.filter((move) => sameSquare(move.to, square));
        if (matching.length > 0) {
          if (matching[0].promotion) setPendingPromotion({ moves: matching, from: selected, to: square });
          else commit(matching[0]);
          return;
        }
        if (sameSquare(selected, square)) {
          setSelected(null);
          return;
        }
      }

      const piece = pieceAt(state.board, square);
      setSelected(piece && piece.color === state.turn ? square : null);
    },
    [canMove, commit, gameOver, legalMoves, pendingPromotion, selected, state.board, state.turn],
  );

  const promote = useCallback(
    (kind: PieceKind) => {
      if (!pendingPromotion) return;
      const move = pendingPromotion.moves.find((candidate) => candidate.promotion === kind);
      if (move) commit(move);
    },
    [commit, pendingPromotion],
  );

  const newGame = useCallback(() => {
    setSelected(null);
    setPendingPromotion(null);
    if (options.onNewGame) void options.onNewGame();
    else setLocalState(createInitialState());
  }, [options]);

  return { state, selected, legalMoves, pendingPromotion, gameOver, selectSquare, promote, newGame };
}
