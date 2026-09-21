import type { Color, PieceKind } from '@/types/chess';
import { glyphFor, kindName } from '@/lib/pieces';

interface PromotionDialogProps {
  color: Color;
  onChoose: (kind: PieceKind) => void;
}

const CHOICES: PieceKind[] = ['q', 'r', 'b', 'n'];

export function PromotionDialog({ color, onChoose }: PromotionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--theme-dialog)] p-6 text-[var(--theme-dialog-text)] shadow-2xl ring-1 ring-black/20">
        <h2 className="mb-4 text-center text-lg font-semibold">
          Promote your pawn
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {CHOICES.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onChoose(kind)}
              aria-label={`Promote to ${kindName(kind)}`}
              className="flex aspect-square items-center justify-center rounded-xl bg-[var(--theme-dark-square)] text-4xl ring-1 ring-black/30 transition hover:brightness-110"
            >
              <span className={color === 'w' ? 'text-white' : 'text-neutral-900'}
                style={{
                  textShadow:
                    color === 'w' ? '0 1px 2px rgba(0,0,0,0.55)' : '0 1px 2px rgba(255,255,255,0.25)',
                }}
              >
                {glyphFor(color, kind)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
