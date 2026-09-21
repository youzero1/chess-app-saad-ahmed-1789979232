import { createFileRoute } from '@tanstack/react-router';
import { Board } from '@/components/Board';
import { GameStatus } from '@/components/GameStatus';
import { PromotionDialog } from '@/components/PromotionDialog';
import { useChessGame } from '@/hooks/useChessGame';

export const Route = createFileRoute('/')({
  component: GamePage,
});

function GamePage() {
  const { state, selected, legalMoves, pendingPromotion, selectSquare, promote, newGame } =
    useChessGame();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <GameStatus state={state} onNewGame={newGame} />
      <Board
        state={state}
        selected={selected}
        legalMoves={legalMoves}
        onSelect={selectSquare}
      />
      {pendingPromotion && (
        <PromotionDialog color={state.turn} onChoose={promote} />
      )}
    </div>
  );
}
