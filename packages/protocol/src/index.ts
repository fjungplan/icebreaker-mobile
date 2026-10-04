import { z } from 'zod';

export const PlayerRoleSchema = z.enum(['corp', 'runner']);
export type PlayerRole = z.infer<typeof PlayerRoleSchema>;

export const ServerTargetSchema = z.enum(['hq', 'rd', 'archives', 'remote1', 'remote2', 'remote3', 'remote4', 'new_remote']);
export type ServerTarget = z.infer<typeof ServerTargetSchema>;

// Game Actions
export const GainCreditActionSchema = z.object({
  type: z.literal('GAIN_CREDIT'),
  player: PlayerRoleSchema,
});

export const DrawCardActionSchema = z.object({
  type: z.literal('DRAW_CARD'),
  player: PlayerRoleSchema,
});

export const InstallCardActionSchema = z.object({
  type: z.literal('INSTALL_CARD'),
  player: PlayerRoleSchema,
  cardId: z.string(),
  targetServer: ServerTargetSchema,
  installHostId: z.string().optional(),
});

export const RezIceActionSchema = z.object({
  type: z.literal('REZ_ICE'),
  player: z.literal('corp'),
  iceCardId: z.string(),
});

export const InitiateRunActionSchema = z.object({
  type: z.literal('INITIATE_RUN'),
  player: z.literal('runner'),
  targetServer: ServerTargetSchema,
});

export const JackOutActionSchema = z.object({
  type: z.literal('JACK_OUT'),
  player: z.literal('runner'),
});

export const BreakSubroutineActionSchema = z.object({
  type: z.literal('BREAK_SUBROUTINE'),
  player: z.literal('runner'),
  breakerId: z.string(),
  subroutineIndex: z.number(),
});

export const EndTurnActionSchema = z.object({
  type: z.literal('END_TURN'),
  player: PlayerRoleSchema,
});

export const GameActionSchema = z.discriminatedUnion('type', [
  GainCreditActionSchema,
  DrawCardActionSchema,
  InstallCardActionSchema,
  RezIceActionSchema,
  InitiateRunActionSchema,
  JackOutActionSchema,
  BreakSubroutineActionSchema,
  EndTurnActionSchema,
]);

export type GameAction = z.infer<typeof GameActionSchema>;

// Game Events
export const GameEventTypeSchema = z.enum([
  'GAME_STARTED',
  'CREDIT_GAINED',
  'CARD_DRAWN',
  'CARD_INSTALLED',
  'RUN_INITIATED',
  'ICE_APPROACHED',
  'ICE_REZZED',
  'SUBROUTINE_BROKEN',
  'JACKED_OUT',
  'BREACH_SUCCESSFUL',
  'RUN_ENDED',
  'TURN_ENDED',
]);
export type GameEventType = z.infer<typeof GameEventTypeSchema>;

export const GameEventSchema = z.object({
  id: z.string(),
  type: GameEventTypeSchema,
  timestamp: z.number(),
  payload: z.record(z.any()),
});
export type GameEvent = z.infer<typeof GameEventSchema>;

// WebSocket Network Envelopes
export const ClientEnvelopeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('JOIN_MATCH'),
    matchId: z.string(),
    role: PlayerRoleSchema,
    deckId: z.string().optional(),
  }),
  z.object({
    type: z.literal('SUBMIT_ACTION'),
    action: GameActionSchema,
    clientSequence: z.number(),
  }),
  z.object({
    type: z.literal('PING'),
    timestamp: z.number(),
  }),
]);
export type ClientEnvelope = z.infer<typeof ClientEnvelopeSchema>;

export const ServerEnvelopeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('STATE_SNAPSHOT'),
    state: z.record(z.any()),
    serverSequence: z.number(),
  }),
  z.object({
    type: z.literal('EVENTS_EMITTED'),
    events: z.array(GameEventSchema),
    serverSequence: z.number(),
  }),
  z.object({
    type: z.literal('ACTION_REJECTED'),
    reason: z.string(),
    clientSequence: z.number(),
  }),
  z.object({
    type: z.literal('PONG'),
    timestamp: z.number(),
  }),
]);
export type ServerEnvelope = z.infer<typeof ServerEnvelopeSchema>;
