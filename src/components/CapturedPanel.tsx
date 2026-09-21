import type { GameState, Piece } from '@/types/chess';
import { capturedFromHistory } from '@/lib/captured';
import { pieceLabel } from '@/lib/pieces';
import { PieceIcon } from '@/components/PieceIcon';

interface CapturedPanelProps {
  state: GameState;
}

function CapturedGroup({
  label,
  pieces,
  advantage,
}: {
  label: string;
  pieces: Piece[];
  advantage: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-5 items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">{label}</p>
        {advantage > 0 && (
          <span
            className="rounded-full bg-[var(--theme-accent)] px-2 py-0.5 text-xs font-bold leading-none text-[var(--theme-accent-text)]"
            aria-label={`Ahead on material by ${advantage}`}
          >
            +{advantage}
          </span>
        )}
      </div>
      {pieces.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 px-2 py-1.5 text-center text-xs italic opacity-50">
          No captures yet
        </p>
      ) : (
        <div className="flex min-h-8 flex-wrap items-center gap-1">
          {pieces.map((piece, i) => (
            <span
              key={`${piece.color}${piece.kind}-${i}`}
              title={pieceLabel(piece)}
              aria-label={pieceLabel(piece)}
              className="rounded-md bg-white/10 p-0.5 ring-1 ring-white/15"
            >
              <PieceIcon color={piece.color} kind={piece.kind} className="h-7 w-7" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CapturedPanel({ state }: CapturedPanelProps) {
  const { byWhite, byBlack, advantage } = capturedFromHistory(state.history);

  return (
    <section
      aria-label="Captured pieces"
      className="flex w-full max-w-[36rem] flex-col gap-3 rounded-xl bg-[var(--theme-panel)] px-4 py-3 text-[var(--theme-panel-text)] shadow-lg ring-1 ring-black/30 transition-colors duration-300 lg:w-64 lg:max-w-none lg:flex-none"
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">Captured pieces</h2>
      <CapturedGroup label="White captured" pieces={byWhite} advantage={Math.max(0, advantage)} />
      <div className="h-px bg-white/10" aria-hidden />
      <CapturedGroup label="Black captured" pieces={byBlack} advantage={Math.max(0, -advantage)} />
    </section>
  );
}
