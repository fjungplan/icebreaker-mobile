import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { GameServer } from '../src/index.js';

describe('Authoritative Server', () => {
  let server: GameServer;
  const TEST_PORT = 8999;

  beforeAll(async () => {
    server = new GameServer(TEST_PORT);
  });

  afterAll(async () => {
    await server.close();
  });

  it('connects, joins match, and responds to actions', async () => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);

    await new Promise<void>((resolve) => {
      ws.on('open', () => resolve());
    });

    // Send JOIN_MATCH
    ws.send(
      JSON.stringify({
        type: 'JOIN_MATCH',
        matchId: 'test_match_1',
        role: 'corp',
      })
    );

    const response = await new Promise<any>((resolve) => {
      ws.on('message', (data) => {
        resolve(JSON.parse(data.toString()));
      });
    });

    expect(response.type).toBe('STATE_SNAPSHOT');
    expect(response.state.id).toBe('test_match_1');
    expect(response.state.corp.credits).toBe(5);

    ws.close();
  });
});
