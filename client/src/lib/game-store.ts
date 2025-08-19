import { create } from 'zustand';
import type { Game, GameSession } from '@shared/schema';

interface GameStore {
  // Current game flow state
  currentGame: Game | null;
  currentMode: 'individual' | 'team' | null;
  currentPlayerCount: number;
  currentTeamCount: number;
  currentSession: GameSession | null;

  // Actions
  setCurrentGame: (game: Game | null) => void;
  setCurrentMode: (mode: 'individual' | 'team' | null) => void;
  setCurrentPlayerCount: (count: number) => void;
  setCurrentTeamCount: (count: number) => void;
  setCurrentSession: (session: GameSession | null) => void;
  resetGameState: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  currentGame: null,
  currentMode: null,
  currentPlayerCount: 0,
  currentTeamCount: 0,
  currentSession: null,

  // Actions
  setCurrentGame: (game) => set({ currentGame: game }),
  setCurrentMode: (mode) => set({ currentMode: mode }),
  setCurrentPlayerCount: (count) => set({ currentPlayerCount: count }),
  setCurrentTeamCount: (count) => set({ currentTeamCount: count }),
  setCurrentSession: (session) => set({ currentSession: session }),
  resetGameState: () => set({
    currentGame: null,
    currentMode: null,
    currentPlayerCount: 0,
    currentTeamCount: 0,
    currentSession: null,
  }),
}));
