import type { Piece, Square as Sq } from '@/types/chess';
import { isLightSquare, squareName } from '@/lib/board';
import { pieceGlyph, pieceLabel } from '@/lib/pieces';

interface SquareProps {
  square: Sq;
  piece: Piece | null;
  selected: boolean;
  isLegalTarget: boolean;
  isCaptureTarget: boolean;
  isLastMove: boolean;
  inCheck: boolean;
  onSelect: (square: Sq) => void;
}

export function Square({
  square,
  piece,
  selected,
  isLegalTarget,
  isCaptureTarget,
  isLastMove,
  inCheck,
  onSelect,
}: SquareProps) {
  const light = isLightSquare(square);
  const base = light ? 'bg-[#e8cfa3]' : 'bg-[#8b5a33]';

  const label = piece
    ? `${squareName(square)}, ${pieceLabel(piece)}`
    : `${squareName(square)}, empty`;

  return (
    <button
      type="button"
      onClick={() => onSelect(square)}
      aria-label={label}
      className={`relative flex aspect-square w-full items-center justify-center ${base} transition-colors`}
    >
      {isLastMove && <span className="absolute inset-0 bg-amber-300/25" />}
      {selected && <span className="absolute inset-0 bg-emerald-400/45" />}
      {inCheck && (
        <span className="absolute inset-0 bg-red-500/45" />
      )}
      {isLegalTarget && !isCaptureTarget && (
        <span className="absolute h-[22%] w-[22%] rounded-full bg-emerald-900/45" />
      )}
      {isCaptureTarget && (
        <span className="absolute inset-[6%] rounded-full border-4 border-emerald-900/50" />
      )}
      {piece && (
        <span
          className={`relative select-none text-[clamp(1.6rem,7vw,3.2rem)] leading-none ${
            piece.color === 'w' ? 'text-white' : 'text-neutral-900'
          }`}
          style={{
            textShadow:
              piece.color === 'w'
                ? '0 1px 2px rgba(0,0,0,0.55)'
                : '0 1px 2px rgba(255,255,255,0.25)',
          }}
        >
          {pieceGlyph(piece)}
        </span>
      )}
    </button>
  );
}
