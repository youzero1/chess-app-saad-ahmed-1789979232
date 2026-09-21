import type { GameState, Move, Square as Sq } from '@/types/chess';
import { findKing } from '@/lib/moves';
import { sameSquare, squareKey } from '@/lib/board';
import { Square } from '@/components/Square';

interface BoardProps {
  state: GameState;
  selected: Sq | null;
  legalMoves: Move[];
  onSelect: (square: Sq) => void;
  orientation?: 'w' | 'b';
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function Board({ state, selected, legalMoves, onSelect, orientation = 'w' }: BoardProps) {
  const checkedKing =
    state.status === 'check' || state.status === 'checkmate'
      ? findKing(state.board, state.turn)
      : null;

  const ranks = orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="w-full max-w-[36rem] rounded-2xl bg-[var(--theme-frame)] p-3 shadow-2xl shadow-black/40 ring-1 ring-black/30 transition-colors duration-300 sm:p-4">
      <div className="flex">
        <div className="mr-1 flex w-4 flex-col justify-around text-center text-xs font-semibold text-[var(--theme-label)]/85">
          {ranks.map((r) => (
            <span key={r}>{r + 1}</span>
          ))}
        </div>
        <div className="grid w-full grid-cols-8 overflow-hidden rounded-sm ring-2 ring-[var(--theme-frame-ring)]">
          {ranks.map((rank) =>
            files.map((file) => {
              const square: Sq = { file, rank };
              const piece = state.board[rank][file];
              const move = legalMoves.find((m) => sameSquare(m.to, square));
              return (
                <Square
                  key={squareKey(square)}
                  square={square}
                  piece={piece}
                  selected={sameSquare(selected, square)}
                  isLegalTarget={Boolean(move)}
                  isCaptureTarget={Boolean(move && (move.captured || move.isEnPassant))}
                  isLastMove={
                    Boolean(state.lastMove) &&
                    (sameSquare(state.lastMove!.from, square) ||
                      sameSquare(state.lastMove!.to, square))
                  }
                  inCheck={sameSquare(checkedKing, square)}
                  onSelect={onSelect}
                />
              );
            }),
          )}
        </div>
      </div>
      <div className="mt-1 flex pl-5">
        <div className="grid w-full grid-cols-8 text-center text-xs font-semibold text-[var(--theme-label)]/85">
          {files.map((file) => (
            <span key={file}>{FILES[file]}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
