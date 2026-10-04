import { WebSocketServer, WebSocket } from 'ws';
import { ClientEnvelopeSchema, ServerEnvelope } from '@icebreaker/protocol';
import { createInitialState, applyAction, GameState } from '@icebreaker/engine';

interface Session {
  ws: WebSocket;
  role: 'corp' | 'runner';
  matchId: string;
}

export class GameServer {
  public wss: WebSocketServer;
  private matches = new Map<string, { state: GameState; sessions: Session[]; sequence: number }>();

  constructor(port = 8080) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();
  }

  private setupServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      let currentSession: Session | null = null;

      ws.on('message', (data: Buffer | string) => {
        try {
          const raw = JSON.parse(data.toString());
          const parsed = ClientEnvelopeSchema.safeParse(raw);

          if (!parsed.success) {
            ws.send(JSON.stringify({ type: 'ACTION_REJECTED', reason: 'Invalid envelope format', clientSequence: 0 }));
            return;
          }

          const msg = parsed.data;

          if (msg.type === 'PING') {
            const pong: ServerEnvelope = { type: 'PONG', timestamp: Date.now() };
            ws.send(JSON.stringify(pong));
            return;
          }

          if (msg.type === 'JOIN_MATCH') {
            let match = this.matches.get(msg.matchId);
            if (!match) {
              match = {
                state: createInitialState(msg.matchId),
                sessions: [],
                sequence: 1,
              };
              this.matches.set(msg.matchId, match);
            }

            currentSession = { ws, role: msg.role, matchId: msg.matchId };
            match.sessions.push(currentSession);

            const snapshot: ServerEnvelope = {
              type: 'STATE_SNAPSHOT',
              state: match.state,
              serverSequence: match.sequence,
            };
            ws.send(JSON.stringify(snapshot));
            return;
          }

          if (msg.type === 'SUBMIT_ACTION') {
            if (!currentSession) {
              ws.send(JSON.stringify({ type: 'ACTION_REJECTED', reason: 'Not joined to any match', clientSequence: msg.clientSequence }));
              return;
            }

            const match = this.matches.get(currentSession.matchId);
            if (!match) {
              ws.send(JSON.stringify({ type: 'ACTION_REJECTED', reason: 'Match not found', clientSequence: msg.clientSequence }));
              return;
            }

            try {
              const { state: nextState, events } = applyAction(match.state, msg.action);
              match.state = nextState;
              match.sequence += 1;

              // Broadcast events to all sessions in the match
              const eventMsg: ServerEnvelope = {
                type: 'EVENTS_EMITTED',
                events,
                serverSequence: match.sequence,
              };

              const snapshotMsg: ServerEnvelope = {
                type: 'STATE_SNAPSHOT',
                state: match.state,
                serverSequence: match.sequence,
              };

              for (const session of match.sessions) {
                if (session.ws.readyState === WebSocket.OPEN) {
                  session.ws.send(JSON.stringify(eventMsg));
                  session.ws.send(JSON.stringify(snapshotMsg));
                }
              }
            } catch (err: any) {
              ws.send(JSON.stringify({
                type: 'ACTION_REJECTED',
                reason: err.message || 'Action failed',
                clientSequence: msg.clientSequence,
              }));
            }
          }
        } catch (e: any) {
          ws.send(JSON.stringify({ type: 'ACTION_REJECTED', reason: 'Malformed JSON', clientSequence: 0 }));
        }
      });

      ws.on('close', () => {
        if (currentSession) {
          const match = this.matches.get(currentSession.matchId);
          if (match) {
            match.sessions = match.sessions.filter((s) => s.ws !== ws);
          }
        }
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve) => this.wss.close(() => resolve()));
  }
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT) || 8080;
  new GameServer(PORT);
  console.log(`[Icebreaker Server] Authoritative WebSocket server listening on port ${PORT}`);
}
