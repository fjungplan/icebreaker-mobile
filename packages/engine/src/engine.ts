import type { GameAction, GameEvent, PlayerRole, ServerTarget } from '@icebreaker/protocol';
import type { CardInstance, GameState, ServerState } from './types.js';

let eventCounter = 0;
function createEvent(type: GameEvent['type'], payload: Record<string, any>): GameEvent {
  eventCounter += 1;
  return {
    id: `evt_${Date.now()}_${eventCounter}`,
    type,
    timestamp: Date.now(),
    payload,
  };
}

export function createInitialState(gameId = 'game_001'): GameState {
  const initialServers: Record<string, ServerState> = {
    hq: { id: 'srv_hq', name: 'HQ', targetKey: 'hq', isCentral: true, ice: [], root: [] },
    rd: { id: 'srv_rd', name: 'R&D', targetKey: 'rd', isCentral: true, ice: [], root: [] },
    archives: {
      id: 'srv_archives',
      name: 'Archives',
      targetKey: 'archives',
      isCentral: true,
      ice: [],
      root: [],
    },
    remote1: {
      id: 'srv_remote1',
      name: 'Remote 1',
      targetKey: 'remote1',
      isCentral: false,
      ice: [],
      root: [],
    },
  };

  const sampleCorpHand: CardInstance[] = [
    { instanceId: 'c_hedge_fund_1', cardCode: 'hedge_fund', faceUp: false, counters: 0 },
    { instanceId: 'c_ice_wall_1', cardCode: 'ice_wall', faceUp: false, counters: 0 },
    {
      instanceId: 'c_hostile_takeover_1',
      cardCode: 'hostile_takeover',
      faceUp: false,
      counters: 0,
    },
  ];

  const sampleRunnerHand: CardInstance[] = [
    { instanceId: 'r_sure_gamble_1', cardCode: 'sure_gamble', faceUp: false, counters: 0 },
    { instanceId: 'r_corroder_1', cardCode: 'corroder', faceUp: false, counters: 0 },
  ];

  return {
    id: gameId,
    turn: 1,
    activePlayer: 'corp',
    phase: 'corp_actions',
    corp: {
      credits: 5,
      clicks: 3,
      badPublicity: 0,
      hand: sampleCorpHand,
      deck: [],
      discard: [],
      servers: initialServers,
      scoredAgendas: [],
    },
    runner: {
      credits: 5,
      clicks: 4,
      tags: 0,
      link: 0,
      maxMU: 4,
      usedMU: 0,
      hand: sampleRunnerHand,
      deck: [],
      discard: [],
      rig: {
        breakers: [],
        hardware: [],
        resources: [],
      },
      scoredAgendas: [],
    },
    currentRun: null,
    log: ['Game initialized.'],
  };
}

export function calculateInstallTax(server: ServerState): number {
  return server.ice.length;
}

export function getLegalActions(state: GameState, player: PlayerRole): GameAction[] {
  const actions: GameAction[] = [];

  // Check if player has clicks and is the active player
  if (state.activePlayer !== player) {
    return actions;
  }

  const pState = player === 'corp' ? state.corp : state.runner;

  if (pState.clicks > 0) {
    // Basic actions: Gain credit
    actions.push({ type: 'GAIN_CREDIT', player });

    // Basic actions: Draw card
    if (pState.deck.length > 0) {
      actions.push({ type: 'DRAW_CARD', player });
    }

    // Runner actions: Initiate run
    if (player === 'runner' && !state.currentRun) {
      const serverKeys = Object.keys(state.corp.servers) as ServerTarget[];
      for (const target of serverKeys) {
        actions.push({ type: 'INITIATE_RUN', player: 'runner', targetServer: target });
      }
    }
  }

  // End turn if out of clicks
  if (pState.clicks === 0) {
    actions.push({ type: 'END_TURN', player });
  }

  return actions;
}

export function applyAction(
  state: GameState,
  action: GameAction
): { state: GameState; events: GameEvent[] } {
  const events: GameEvent[] = [];
  const nextState: GameState = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case 'GAIN_CREDIT': {
      const player = action.player;
      const p = player === 'corp' ? nextState.corp : nextState.runner;
      if (p.clicks <= 0) {
        throw new Error(`Player ${player} has no clicks remaining to gain a credit.`);
      }
      p.clicks -= 1;
      p.credits += 1;
      nextState.log.push(`${player} spent 1 click to gain 1 credit.`);
      events.push(createEvent('CREDIT_GAINED', { player, amount: 1, currentTotal: p.credits }));
      break;
    }

    case 'DRAW_CARD': {
      const player = action.player;
      const p = player === 'corp' ? nextState.corp : nextState.runner;
      if (p.clicks <= 0) {
        throw new Error(`Player ${player} has no clicks remaining to draw a card.`);
      }
      if (p.deck.length === 0) {
        throw new Error(`Player ${player} deck is empty.`);
      }
      p.clicks -= 1;
      const drawnCard = p.deck.shift();
      if (!drawnCard) {
        throw new Error(`Player ${player} deck is empty.`);
      }
      p.hand.push(drawnCard);
      nextState.log.push(`${player} spent 1 click to draw a card.`);
      events.push(createEvent('CARD_DRAWN', { player, cardId: drawnCard.instanceId }));
      break;
    }

    case 'INITIATE_RUN': {
      if (action.player !== 'runner') {
        throw new Error('Only Runner can initiate runs.');
      }
      if (nextState.runner.clicks <= 0) {
        throw new Error('Runner has no clicks left to run.');
      }
      if (nextState.currentRun) {
        throw new Error('A run is already in progress.');
      }
      nextState.runner.clicks -= 1;
      const server = nextState.corp.servers[action.targetServer];
      if (!server) {
        throw new Error(`Target server ${action.targetServer} does not exist.`);
      }

      nextState.currentRun = {
        serverTarget: action.targetServer,
        currentIceIndex: server.ice.length > 0 ? server.ice.length - 1 : null,
        phase: server.ice.length > 0 ? 'approach_ice' : 'approach_server',
        activeSubroutines: [],
        canJackOut: true,
      };

      nextState.log.push(`Runner initiated a run on ${server.name}.`);
      events.push(createEvent('RUN_INITIATED', { targetServer: action.targetServer }));
      break;
    }

    case 'JACK_OUT': {
      if (!nextState.currentRun) {
        throw new Error('No run to jack out from.');
      }
      if (!nextState.currentRun.canJackOut) {
        throw new Error('Cannot jack out at this timing window.');
      }
      const target = nextState.currentRun.serverTarget;
      nextState.currentRun = null;
      nextState.log.push(`Runner jacked out of run on ${target}.`);
      events.push(createEvent('JACKED_OUT', { targetServer: target }));
      events.push(createEvent('RUN_ENDED', { success: false }));
      break;
    }

    case 'END_TURN': {
      const active = nextState.activePlayer;
      if (active === 'corp') {
        nextState.activePlayer = 'runner';
        nextState.phase = 'runner_actions';
        nextState.runner.clicks = 4;
        nextState.log.push('Corp ended turn. Runner turn begins.');
      } else {
        nextState.turn += 1;
        nextState.activePlayer = 'corp';
        nextState.phase = 'corp_actions';
        nextState.corp.clicks = 3;
        nextState.log.push(`Runner ended turn. Turn ${nextState.turn} Corp begins.`);
      }
      events.push(
        createEvent('TURN_ENDED', {
          previousPlayer: active,
          nextPlayer: nextState.activePlayer,
          turn: nextState.turn,
        })
      );
      break;
    }

    default:
      throw new Error(`Unhandled action type`);
  }

  return { state: nextState, events };
}
