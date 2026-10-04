import { PlayerRole, ServerTarget } from '@icebreaker/protocol';

export type CardType = 'agenda' | 'asset' | 'operation' | 'upgrade' | 'ice' | 'event' | 'hardware' | 'resource' | 'program';
export type Subtype = 'fracter' | 'decoder' | 'killer' | 'ai' | 'barrier' | 'code_gate' | 'sentry' | string;

export interface CardDefinition {
  id: string;
  code: string;
  title: string;
  side: PlayerRole;
  type: CardType;
  subtypes: Subtype[];
  cost: number;
  strength?: number;
  memoryUnits?: number;
  trashCost?: number;
  agendaPoints?: number;
  text: string;
}

export interface CardInstance {
  instanceId: string;
  cardCode: string;
  faceUp: boolean;
  counters: number;
  hostedOnId?: string;
  currentStrength?: number;
}

export interface ServerState {
  id: string;
  name: string;
  targetKey: ServerTarget;
  isCentral: boolean;
  ice: CardInstance[];
  root: CardInstance[];
}

export interface CorpPlayerState {
  credits: number;
  clicks: number;
  badPublicity: number;
  hand: CardInstance[]; // HQ
  deck: CardInstance[]; // R&D
  discard: CardInstance[]; // Archives
  servers: Record<string, ServerState>;
  scoredAgendas: CardInstance[];
}

export interface RunnerPlayerState {
  credits: number;
  clicks: number;
  tags: number;
  link: number;
  maxMU: number;
  usedMU: number;
  hand: CardInstance[]; // Grip
  deck: CardInstance[]; // Stack
  discard: CardInstance[]; // Heap
  rig: {
    breakers: CardInstance[];
    hardware: CardInstance[];
    resources: CardInstance[];
  };
  scoredAgendas: CardInstance[];
}

export interface RunState {
  serverTarget: ServerTarget;
  currentIceIndex: number | null; // null when at root or outside
  phase: 'approach_ice' | 'encounter_ice' | 'pass_ice' | 'approach_server' | 'breach';
  activeSubroutines: Array<{ text: string; broken: boolean }>;
  canJackOut: boolean;
}

export interface GameState {
  id: string;
  turn: number;
  activePlayer: PlayerRole;
  phase: 'corp_draw' | 'corp_actions' | 'corp_discard' | 'runner_actions' | 'runner_discard';
  corp: CorpPlayerState;
  runner: RunnerPlayerState;
  currentRun: RunState | null;
  log: string[];
}
