import type { Piece, Square as Sq } from '@/types/chess';
import { isLightSquare, squareName } from '@/lib/board';
import { pieceLabel } from '@/lib/pieces';
import { PieceIcon } from '@/components/PieceIcon';

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
  const base = light ? 'bg-[var(--theme-light-square)]' : 'bg-[var(--theme-dark-square)]';

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
      {isLastMove && <span className="absolute inset-0 bg-[var(--theme-last-move)]/45" />}
      {selected && <span className="absolute inset-0 bg-[var(--theme-selected)]/75" />}
      {inCheck && (
        <span className="absolute inset-0 bg-red-500/55" />
      )}
      {isLegalTarget && !isCaptureTarget && (
        <span className="absolute h-[22%] w-[22%] rounded-full bg-[var(--theme-move)]/45" />
      )}
      {isCaptureTarget && (
        <span className="absolute inset-[6%] rounded-full border-4 border-[var(--theme-move)]/50" />
      )}
      {piece && (
        <PieceIcon
          color={piece.color}
          kind={piece.kind}
          className="relative h-[84%] w-[84%] select-none"
        />
      )}
    </button>
  );
}
