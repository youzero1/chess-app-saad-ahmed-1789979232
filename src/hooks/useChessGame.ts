import { useCallback, useMemo, useState } from 'react';
import type { GameState, Move, PieceKind, Square } from '@/types/chess';
import { pieceAt, sameSquare } from '@/lib/board';
import { applyMove, createInitialState, getLegalMoves, isGameOver } from '@/lib/rules';

export interface PendingPromotion {
  moves: Move[]; // the four promotion variants of the same from/to
  from: Square;
  to: Square;
}

export function useChessGame() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  const legalMoves = useMemo<Move[]>(
    () => (selected ? getLegalMoves(state, selected) : []),
    [state, selected],
  );

  const gameOver = isGameOver(state.status);

  const commit = useCallback((move: Move) => {
    setState((prev) => applyMove(prev, move));
    setSelected(null);
    setPendingPromotion(null);
  }, []);

  const selectSquare = useCallback(
    (square: Square) => {
      if (gameOver || pendingPromotion) return;

      if (selected) {
        const matching = legalMoves.filter((m) => sameSquare(m.to, square));
        if (matching.length > 0) {
          if (matching[0].promotion) {
            setPendingPromotion({ moves: matching, from: selected, to: square });
          } else {
            commit(matching[0]);
          }
          return;
        }
        if (sameSquare(selected, square)) {
          setSelected(null);
          return;
        }
      }

      const piece = pieceAt(state.board, square);
      if (piece && piece.color === state.turn) {
        setSelected(square);
      } else {
        setSelected(null);
      }
    },
    [commit, gameOver, legalMoves, pendingPromotion, selected, state.board, state.turn],
  );

  const promote = useCallback(
    (kind: PieceKind) => {
      if (!pendingPromotion) return;
      const move = pendingPromotion.moves.find((m) => m.promotion === kind);
      if (move) commit(move);
    },
    [commit, pendingPromotion],
  );

  const newGame = useCallback(() => {
    setState(createInitialState());
    setSelected(null);
    setPendingPromotion(null);
  }, []);

  return {
    state,
    selected,
    legalMoves,
    pendingPromotion,
    gameOver,
    selectSquare,
    promote,
    newGame,
  };
}
