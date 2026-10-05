import { describe, expect, it } from 'vitest';
import { applyAction, calculateInstallTax, createInitialState } from '../src/index.js';

describe('Rules Engine', () => {
  it('creates a deterministic initial state with correct click/credit baselines', () => {
    const state = createInitialState('test_001');
    expect(state.id).toBe('test_001');
    expect(state.corp.credits).toBe(5);
    expect(state.corp.clicks).toBe(3);
    expect(state.runner.credits).toBe(5);
    expect(state.runner.clicks).toBe(4);
    expect(state.activePlayer).toBe('corp');
    expect(state.currentRun).toBeNull();
  });

  it('allows corp to spend click to gain credit and emits event', () => {
    const state = createInitialState('test_002');
    const { state: nextState, events } = applyAction(state, {
      type: 'GAIN_CREDIT',
      player: 'corp',
    });

    expect(nextState.corp.credits).toBe(6);
    expect(nextState.corp.clicks).toBe(2);
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('CREDIT_GAINED');
    expect(events[0].payload.amount).toBe(1);
  });

  it('transitions turns cleanly when clicks are exhausted', () => {
    const state = createInitialState('test_003');
    state.corp.clicks = 0;

    const { state: nextState, events } = applyAction(state, {
      type: 'END_TURN',
      player: 'corp',
    });

    expect(nextState.activePlayer).toBe('runner');
    expect(nextState.runner.clicks).toBe(4);
    expect(events[0].type).toBe('TURN_ENDED');
  });

  it('handles run initiation and jacking out', () => {
    const state = createInitialState('test_004');
    state.activePlayer = 'runner';

    const { state: runState, events: runEvents } = applyAction(state, {
      type: 'INITIATE_RUN',
      player: 'runner',
      targetServer: 'hq',
    });

    expect(runState.currentRun).not.toBeNull();
    expect(runState.currentRun?.serverTarget).toBe('hq');
    expect(runState.runner.clicks).toBe(3);
    expect(runEvents[0].type).toBe('RUN_INITIATED');

    const { state: jackState, events: jackEvents } = applyAction(runState, {
      type: 'JACK_OUT',
      player: 'runner',
    });

    expect(jackState.currentRun).toBeNull();
    expect(jackEvents.some((e) => e.type === 'JACKED_OUT')).toBe(true);
  });

  it('calculates correct install tax based on existing ICE count', () => {
    const server = {
      id: 'srv_rem1',
      name: 'Remote 1',
      targetKey: 'remote1' as const,
      isCentral: false,
      ice: [
        { instanceId: 'ice_1', cardCode: 'enigma', faceUp: true, counters: 0 },
        { instanceId: 'ice_2', cardCode: 'rototurret', faceUp: false, counters: 0 },
      ],
      root: [],
    };

    expect(calculateInstallTax(server)).toBe(2);
  });
});
