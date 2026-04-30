'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS, DEFAULT_PLAYERS } from '../lib/gameLogic';

const STORAGE_KEY = 'tienlen_game_v1';

const defaultState = () => ({
  phase: 'setup',       // 'setup' | 'playing'
  players: [...DEFAULT_PLAYERS],
  scores: [0, 0, 0, 0],
  rounds: [],
  settings: { ...DEFAULT_SETTINGS },
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useGameState() {
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  // Persist on every change after hydration
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const startGame = useCallback((players) => {
    setState((s) => ({
      ...s,
      phase: 'playing',
      players,
      scores: [0, 0, 0, 0],
      rounds: [],
    }));
  }, []);

  const addRound = useCallback((round) => {
    setState((s) => {
      const newScores = s.scores.map((sc, i) => sc + round.deltas[i]);
      return {
        ...s,
        scores: newScores,
        rounds: [...s.rounds, round],
      };
    });
  }, []);

  const undoLastRound = useCallback(() => {
    setState((s) => {
      if (s.rounds.length === 0) return s;
      const last = s.rounds[s.rounds.length - 1];
      const newScores = s.scores.map((sc, i) => sc - last.deltas[i]);
      return {
        ...s,
        scores: newScores,
        rounds: s.rounds.slice(0, -1),
      };
    });
  }, []);

  const updatePlayers = useCallback((players) => {
    setState((s) => ({ ...s, players }));
  }, []);

  const updateSettings = useCallback((settings) => {
    setState((s) => ({ ...s, settings }));
  }, []);

  const resetGame = useCallback(() => {
    setState((s) => ({
      ...defaultState(),
      players: s.players,
      settings: s.settings,
    }));
  }, []);

  const fullReset = useCallback(() => {
    setState(defaultState());
  }, []);

  return {
    state,
    hydrated,
    startGame,
    addRound,
    undoLastRound,
    updatePlayers,
    updateSettings,
    resetGame,
    fullReset,
  };
}
