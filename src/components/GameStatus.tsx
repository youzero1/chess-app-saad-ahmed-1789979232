import type { GameState } from '@/types/chess';
import { colorName, opponent } from '@/lib/board';

interface GameStatusProps {
  state: GameState;
  onNewGame: () => void;
}

export function GameStatus({ state, onNewGame }: GameStatusProps) {
  const { turn, status } = state;

  let headline: string;
  let sub: string | null = null;

  switch (status) {
    case 'checkmate':
      headline = `Checkmate — ${colorName(opponent(turn))} wins`;
      break;
    case 'stalemate':
      headline = 'Stalemate — draw';
      break;
    case 'draw-fifty-move':
      headline = 'Draw — fifty-move rule';
      break;
    case 'draw-insufficient-material':
      headline = 'Draw — insufficient material';
      break;
    case 'check':
      headline = `${colorName(turn)} to move`;
      sub = 'Check!';
      break;
    default:
      headline = `${colorName(turn)} to move`;
  }

  return (
    <div className="flex w-full max-w-[36rem] flex-wrap items-center justify-between gap-3 rounded-xl bg-[#3d2415]/90 px-4 py-3 text-amber-50 ring-1 ring-black/30">
      <div className="flex items-center gap-3">
        <span
          className={`h-5 w-5 rounded-full ring-2 ring-amber-100/60 ${
            turn === 'w' ? 'bg-white' : 'bg-neutral-900'
          }`}
          aria-hidden
        />
        <div>
          <p className="font-semibold leading-tight">{headline}</p>
          {sub && <p className="text-sm font-medium text-red-300">{sub}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-[#3d2415] transition hover:bg-amber-100"
      >
        New Game
      </button>
    </div>
  );
}
