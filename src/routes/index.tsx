import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Board } from '@/components/Board';
import { GameStatus } from '@/components/GameStatus';
import { ModePanel, type GameMode } from '@/components/ModePanel';
import { PromotionDialog } from '@/components/PromotionDialog';
import { useChessGame } from '@/hooks/useChessGame';
import { useOnlineChess } from '@/hooks/useOnlineChess';

export const Route = createFileRoute('/')({
  component: GamePage,
});

function GamePage() {
  const [mode, setMode] = useState<GameMode>('local');
  const online = useOnlineChess();
  const localGame = useChessGame();
  const onlineGame = useChessGame({
    state: online.room?.game_state,
    canMove: Boolean(
      online.room &&
      online.room.room_status === 'active' &&
      online.playerColor === online.room.game_state.turn &&
      !online.busy,
    ),
    onMove: online.playState,
    onNewGame: online.requestRematch,
  });

  const isOnlineRoom = mode === 'online' && Boolean(online.room);
  const game = isOnlineRoom ? onlineGame : localGame;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ModePanel
        mode={mode}
        onModeChange={setMode}
        room={online.room}
        playerColor={online.playerColor}
        loading={online.loading}
        busy={online.busy}
        error={online.error}
        connection={online.connection}
        onCreate={online.createRoom}
        onJoin={online.joinRoom}
        onLeave={online.leaveRoom}
        onRematch={online.requestRematch}
      />

      {mode === 'local' || online.room ? (
        <>
          <GameStatus
            state={game.state}
            onNewGame={game.newGame}
            actionLabel="New game"
            showAction={!isOnlineRoom}
          />
          <Board
            state={game.state}
            selected={game.selected}
            legalMoves={game.legalMoves}
            onSelect={game.selectSquare}
            orientation={isOnlineRoom && online.playerColor === 'b' ? 'b' : 'w'}
          />
          {game.pendingPromotion && (
            <PromotionDialog color={game.state.turn} onChoose={game.promote} />
          )}
        </>
      ) : (
        <div className="flex min-h-64 w-full max-w-[36rem] items-center justify-center rounded-2xl border-2 border-dashed border-black/10 text-center text-sm text-[var(--theme-muted)]">
          Create a private room or enter a friend’s code to start playing online.
        </div>
      )}
    </div>
  );
}
