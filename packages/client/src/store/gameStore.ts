import { applyAction, createInitialState, type GameState } from '@icebreaker/engine';
import type { GameAction, PlayerRole, ServerTarget } from '@icebreaker/protocol';
import { create } from 'zustand';

export type DrawerState = 'peek' | 'fan' | 'focus';

interface GameStoreState {
  role: PlayerRole;
  gameState: GameState;
  drawerState: DrawerState;
  focusedCardId: string | null;
  selectedServerTarget: ServerTarget;
  setRole: (role: PlayerRole) => void;
  setDrawerState: (state: DrawerState) => void;
  setFocusedCardId: (id: string | null) => void;
  setSelectedServerTarget: (target: ServerTarget) => void;
  dispatchAction: (action: GameAction) => void;
  setGameState: (state: GameState) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  role: 'runner',
  gameState: createInitialState('local_demo'),
  drawerState: 'peek',
  focusedCardId: null,
  selectedServerTarget: 'hq',

  setRole: (role) => set({ role }),
  setDrawerState: (drawerState) => set({ drawerState }),
  setFocusedCardId: (focusedCardId) => set({ focusedCardId }),
  setSelectedServerTarget: (selectedServerTarget) => set({ selectedServerTarget }),

  dispatchAction: (action) => {
    const current = get().gameState;
    try {
      const { state: nextState } = applyAction(current, action);
      set({ gameState: nextState });
    } catch (err: any) {
      console.warn('Action failed:', err.message);
    }
  },

  setGameState: (gameState) => set({ gameState }),
}));
