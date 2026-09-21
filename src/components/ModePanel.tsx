import { useState } from 'react';
import type { ChessRoom } from '@/hooks/useOnlineChess';
import type { Color } from '@/types/chess';

export type GameMode = 'local' | 'online';

interface ModePanelProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  room: ChessRoom | null;
  playerColor: Color | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  connection: 'offline' | 'connecting' | 'connected';
  onCreate: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onRematch: () => void;
}

export function ModePanel(props: ModePanelProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { room, playerColor } = props;

  const copyCode = async () => {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="w-full max-w-[36rem] rounded-2xl bg-[var(--theme-dialog)] p-3 shadow-md ring-1 ring-black/10 transition-colors duration-300">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/5 p-1" aria-label="Game mode">
        {(['local', 'online'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => props.onModeChange(option)}
            aria-pressed={props.mode === option}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${props.mode === option
              ? 'bg-[var(--theme-panel)] text-[var(--theme-panel-text)] shadow-sm'
              : 'text-[var(--theme-muted)] hover:bg-black/5'}`}
          >
            {option === 'local' ? 'Local game' : 'Online room'}
          </button>
        ))}
      </div>

      {props.mode === 'local' ? (
        <p className="px-2 pt-3 text-center text-sm text-[var(--theme-muted)]">
          Two players share this device and take turns on the same board.
        </p>
      ) : props.loading ? (
        <div className="flex items-center justify-center gap-2 py-5 text-sm text-[var(--theme-muted)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Preparing secure online play…
        </div>
      ) : !room ? (
        <div className="grid gap-3 pt-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <button
            type="button"
            onClick={props.onCreate}
            disabled={props.busy}
            className="rounded-xl bg-[var(--theme-accent)] px-4 py-3 text-sm font-bold text-[var(--theme-accent-text)] transition hover:bg-[var(--theme-accent-hover)] disabled:cursor-wait disabled:opacity-60"
          >
            {props.busy ? 'Creating…' : 'Create private room'}
          </button>
          <span className="text-center text-xs font-bold uppercase tracking-widest text-[var(--theme-muted)]">or</span>
          <form
            className="flex gap-2"
            onSubmit={(event) => { event.preventDefault(); props.onJoin(code); }}
          >
            <label className="sr-only" htmlFor="room-code">Room code</label>
            <input
              id="room-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="ABC123"
              autoCapitalize="characters"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white/60 px-3 py-3 text-center font-mono text-base font-bold uppercase tracking-[0.18em] text-[var(--theme-text)] outline-none transition focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/30"
            />
            <button
              type="submit"
              disabled={props.busy || code.length !== 6}
              className="rounded-xl bg-[var(--theme-panel)] px-4 py-3 text-sm font-bold text-[var(--theme-panel-text)] transition disabled:opacity-40"
            >
              Join
            </button>
          </form>
        </div>
      ) : (
        <div className="pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--theme-muted)]">Private room</p>
              <button type="button" onClick={copyCode} className="mt-0.5 flex items-center gap-2 rounded-lg font-mono text-xl font-black tracking-[0.2em] text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]">
                {room.code}
                <span className="font-sans text-xs font-semibold tracking-normal text-[var(--theme-muted)]">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-[var(--theme-text)]">You play {playerColor === 'w' ? 'White' : 'Black'}</p>
              <p className="flex items-center justify-end gap-1.5 text-xs text-[var(--theme-muted)]">
                <span className={`h-2 w-2 rounded-full ${props.connection === 'connected' ? 'bg-emerald-500' : props.connection === 'connecting' ? 'animate-pulse bg-amber-400' : 'bg-red-400'}`} />
                {props.connection === 'connected' ? 'Live connection' : props.connection === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/5 px-3 py-2.5 text-sm">
            <p className="font-medium text-[var(--theme-text)]">
              {room.room_status === 'waiting' ? 'Waiting for a friend to join with the code…' :
                room.room_status === 'abandoned' ? 'Your opponent left the room.' :
                room.room_status === 'finished' ? 'Game finished — ready for a rematch?' :
                room.game_state.turn === playerColor ? 'Your turn' : "Opponent's turn"}
            </p>
            <div className="flex gap-2">
              {room.room_status === 'finished' && (
                <button type="button" onClick={props.onRematch} disabled={props.busy} className="rounded-lg bg-[var(--theme-accent)] px-3 py-1.5 text-xs font-bold text-[var(--theme-accent-text)] disabled:opacity-50">
                  {(playerColor === 'w' ? room.rematch_white : room.rematch_black) ? 'Rematch requested' : 'Request rematch'}
                </button>
              )}
              <button type="button" onClick={props.onLeave} disabled={props.busy} className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-bold text-[var(--theme-muted)] transition hover:bg-black/5 disabled:opacity-50">
                Leave room
              </button>
            </div>
          </div>
        </div>
      )}

      {props.mode === 'online' && props.error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300">{props.error}</p>
      )}
    </section>
  );
}
