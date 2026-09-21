import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RealtimeChannel, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createInitialState } from '@/lib/rules';
import type { Color, GameState } from '@/types/chess';

export interface ChessRoom {
  id: string;
  code: string;
  white_id: string;
  black_id: string | null;
  game_state: GameState;
  version: number;
  room_status: 'waiting' | 'active' | 'finished' | 'abandoned';
  rematch_white: boolean;
  rematch_black: boolean;
  created_at: string;
  updated_at: string;
}

type ConnectionState = 'offline' | 'connecting' | 'connected';

function messageFromError(error: { message?: string } | null, fallback: string) {
  if (!error?.message) return fallback;
  return error.message.replace(/^.*exception:\s*/i, '').replace(/\.$/, '');
}

export function useOnlineChess() {
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<ChessRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('offline');

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session?.user) {
        setUser(data.session.user);
        setLoading(false);
        return;
      }
      const { data: signedIn, error: signInError } = await supabase.auth.signInAnonymously();
      if (!active) return;
      if (signInError) setError('Could not connect to online play. Please try again.');
      else setUser(signedIn.user);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!room) {
      setConnection('offline');
      return;
    }
    setConnection('connecting');
    const channel: RealtimeChannel = supabase
      .channel(`chess-room-${room.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chess_rooms', filter: `id=eq.${room.id}` },
        (payload) => setRoom(payload.new as ChessRoom),
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnection('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setConnection('offline');
      });
    return () => { void supabase.removeChannel(channel); };
  }, [room?.id]);

  const playerColor = useMemo<Color | null>(() => {
    if (!room || !user) return null;
    if (room.white_id === user.id) return 'w';
    if (room.black_id === user.id) return 'b';
    return null;
  }, [room, user]);

  const runRoomAction = useCallback(async (action: () => Promise<{ data: unknown; error: { message?: string } | null }>, fallback: string) => {
    setBusy(true);
    setError(null);
    const { data, error: actionError } = await action();
    if (actionError) setError(messageFromError(actionError, fallback));
    else if (data) setRoom(data as ChessRoom);
    setBusy(false);
  }, []);

  const createRoom = useCallback(async () => {
    await runRoomAction(
      async () => await supabase.rpc('create_chess_room', { p_game_state: createInitialState() }),
      'Could not create a room.',
    );
  }, [runRoomAction]);

  const joinRoom = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 6) {
      setError('Enter the 6-character room code.');
      return;
    }
    await runRoomAction(
      async () => await supabase.rpc('join_chess_room', { p_code: normalized }),
      'Could not join that room.',
    );
  }, [runRoomAction]);

  const playState = useCallback(async (nextState: GameState) => {
    if (!room) return;
    const currentRoom = room;
    setBusy(true);
    setError(null);
    const { data, error: moveError } = await supabase.rpc('play_chess_move', {
      p_room_id: currentRoom.id,
      p_expected_version: currentRoom.version,
      p_game_state: nextState,
    });
    if (moveError) {
      setError(messageFromError(moveError, 'The move could not be saved.'));
      const { data: latest } = await supabase.from('chess_rooms').select('*').eq('id', currentRoom.id).single();
      if (latest) setRoom(latest as ChessRoom);
    } else if (data) setRoom(data as ChessRoom);
    setBusy(false);
  }, [room]);

  const requestRematch = useCallback(async () => {
    if (!room) return;
    await runRoomAction(
      async () => await supabase.rpc('request_chess_rematch', { p_room_id: room.id, p_initial_state: createInitialState() }),
      'Could not request a rematch.',
    );
  }, [room, runRoomAction]);

  const leaveRoom = useCallback(async () => {
    if (!room) return;
    const id = room.id;
    setBusy(true);
    await supabase.rpc('leave_chess_room', { p_room_id: id });
    setRoom(null);
    setError(null);
    setBusy(false);
  }, [room]);

  return {
    user, room, loading, busy, error, connection, playerColor,
    clearError: () => setError(null), createRoom, joinRoom, playState, requestRematch, leaveRoom,
  };
}
