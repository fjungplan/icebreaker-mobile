import React from 'react';
import { useGameStore } from './store/gameStore.js';
import { ServerTarget } from '@icebreaker/protocol';

export const App: React.FC = () => {
  const {
    role,
    setRole,
    gameState,
    drawerState,
    setDrawerState,
    focusedCardId,
    setFocusedCardId,
    selectedServerTarget,
    setSelectedServerTarget,
    dispatchAction,
  } = useGameStore();

  const isRunner = role === 'runner';
  const myState = isRunner ? gameState.runner : gameState.corp;
  const oppState = isRunner ? gameState.corp : gameState.runner;
  const isMyTurn = gameState.activePlayer === role;

  const currentRun = gameState.currentRun;
  const hand = myState.hand;
  const focusedCard = hand.find((c) => c.instanceId === focusedCardId);

  return (
    <div className="flex flex-col h-full w-full bg-cyber-bg text-gray-200 select-none overflow-hidden relative font-sans">
      {/* Top HUD: Opponent & System Telemetry */}
      <header className="flex items-center justify-between px-3 py-2 bg-cyber-panel/90 border-b border-cyber-border text-xs z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRole(isRunner ? 'corp' : 'runner')}
            className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cyber-border hover:bg-cyber-neonCyan/20 text-cyber-neonCyan border border-cyber-neonCyan/40 transition-colors"
          >
            {role} POV
          </button>
          <span className="text-gray-400">Turn {gameState.turn} ({gameState.activePlayer})</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="text-cyber-neonYellow">¢ {myState.credits}</span>
          <span className="text-cyber-neonCyan">⚡ {myState.clicks}</span>
          {isRunner && (
            <>
              <span className="text-cyber-neonPink">🏷️ {(myState as any).tags}</span>
              <span className="text-cyber-neonGreen">💾 {(myState as any).maxMU - (myState as any).usedMU} MU</span>
            </>
          )}
        </div>
      </header>

      {/* Mini-Map Strip: Server Status */}
      <section className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border-b border-cyber-border/40 overflow-x-auto text-[11px] z-10">
        <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide">Servers:</span>
        {Object.entries(gameState.corp.servers).map(([key, srv]) => {
          const isSelected = selectedServerTarget === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedServerTarget(key as ServerTarget)}
              className={`px-2 py-1 rounded flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyber-neonCyan/20 border border-cyber-neonCyan text-white shadow-sm shadow-cyber-neonCyan/40'
                  : 'bg-cyber-panel/60 border border-cyber-border text-gray-300 hover:border-gray-500'
              }`}
            >
              <span className="font-bold">{srv.name}</span>
              <span className="text-[10px] px-1 rounded bg-black/60 text-gray-300">
                🛡️ {srv.ice.length}
              </span>
            </button>
          );
        })}
      </section>

      {/* Center Tactical View / Board */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden">
        {currentRun ? (
          /* Run Mode Tactical HUD */
          <div className="w-full max-w-sm bg-cyber-panel/90 border border-cyber-neonPink/60 rounded-xl p-4 shadow-xl shadow-cyber-neonPink/20 flex flex-col items-center gap-3 text-center animate-fade-in">
            <div className="text-xs uppercase tracking-widest text-cyber-neonPink font-mono font-bold">
              [ Tactical Run Breach ]
            </div>
            <div className="text-base font-bold text-white">
              Target: <span className="text-cyber-neonCyan uppercase">{currentRun.serverTarget}</span>
            </div>
            <div className="text-xs text-gray-300 font-mono">
              Depth: {currentRun.phase.replace('_', ' ')}
            </div>

            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => dispatchAction({ type: 'JACK_OUT', player: 'runner' })}
                className="flex-1 py-2 rounded bg-cyber-neonPink/20 border border-cyber-neonPink text-cyber-neonPink font-bold text-xs uppercase tracking-wider hover:bg-cyber-neonPink/40 transition-colors"
              >
                Jack Out
              </button>
            </div>
          </div>
        ) : (
          /* Normal Field View */
          <div className="flex flex-col items-center text-center gap-3">
            <div className="text-sm text-gray-400">
              Selected Server: <span className="font-bold text-cyber-neonCyan">{selectedServerTarget.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatchAction({ type: 'GAIN_CREDIT', player: role })}
                disabled={!isMyTurn || myState.clicks === 0}
                className="px-3 py-2 rounded-lg bg-cyber-panel border border-cyber-neonYellow/50 text-cyber-neonYellow text-xs font-bold hover:bg-cyber-neonYellow/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                +1 Credit (1 Click)
              </button>
              {isRunner && (
                <button
                  onClick={() => dispatchAction({ type: 'INITIATE_RUN', player: 'runner', targetServer: selectedServerTarget })}
                  disabled={!isMyTurn || myState.clicks === 0}
                  className="px-3 py-2 rounded-lg bg-cyber-panel border border-cyber-neonPink/60 text-cyber-neonPink text-xs font-bold hover:bg-cyber-neonPink/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Run {selectedServerTarget} (1 Click)
                </button>
              )}
              {isMyTurn && myState.clicks === 0 && (
                <button
                  onClick={() => dispatchAction({ type: 'END_TURN', player: role })}
                  className="px-3 py-2 rounded-lg bg-cyber-neonGreen/20 border border-cyber-neonGreen text-cyber-neonGreen text-xs font-bold hover:bg-cyber-neonGreen/40 transition-colors"
                >
                  End Turn
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3-State Hand Drawer */}
      <div
        className={`fixed left-0 right-0 bottom-0 bg-cyber-panel/95 border-t border-cyber-border backdrop-blur-xl transition-all duration-300 z-30 flex flex-col ${
          drawerState === 'peek'
            ? 'h-20'
            : drawerState === 'fan'
            ? 'h-[50vh]'
            : 'h-[75vh]'
        }`}
      >
        {/* Drawer Header Handle */}
        <div
          onClick={() => {
            if (drawerState === 'peek') setDrawerState('fan');
            else if (drawerState === 'fan') setDrawerState('peek');
            else setDrawerState('fan');
          }}
          className="flex items-center justify-between px-4 py-2 border-b border-cyber-border/40 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {isRunner ? 'Grip' : 'HQ'} ({hand.length} Cards)
            </span>
          </div>
          <div className="w-8 h-1 bg-gray-600 rounded-full mx-auto" />
          <span className="text-[10px] text-gray-400">
            {drawerState === 'peek' ? '▲ Fan' : '▼ Minimize'}
          </span>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-x-auto p-3 flex gap-3 items-center">
          {hand.map((card) => {
            const isFocused = focusedCardId === card.instanceId;
            return (
              <div
                key={card.instanceId}
                onClick={() => {
                  setFocusedCardId(card.instanceId);
                  setDrawerState('focus');
                }}
                className={`min-w-[100px] h-[140px] rounded-lg p-2.5 flex flex-col justify-between cursor-pointer border transition-all ${
                  isFocused
                    ? 'border-cyber-neonCyan bg-cyber-neonCyan/10 scale-105 shadow-md shadow-cyber-neonCyan/40'
                    : 'border-cyber-border bg-black/40 hover:border-gray-400'
                }`}
              >
                <div className="text-[11px] font-bold text-white truncate">{card.cardCode}</div>
                <div className="text-[10px] text-gray-400 font-mono">Cost: 2¢</div>
                <div className="text-[9px] text-cyber-neonCyan uppercase font-mono">Tap to Inspect</div>
              </div>
            );
          })}
        </div>

        {/* Focus Sheet Inspector Mode */}
        {drawerState === 'focus' && focusedCard && (
          <div className="p-4 border-t border-cyber-border bg-black/60 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-cyber-neonCyan">{focusedCard.cardCode}</span>
              <button
                onClick={() => setDrawerState('fan')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-gray-300">
              Target server: <span className="font-bold text-white">{selectedServerTarget}</span>
            </p>
            <button
              onClick={() => {
                alert(`Action initiated for ${focusedCard.cardCode}`);
                setDrawerState('peek');
              }}
              className="w-full py-2.5 rounded-lg bg-cyber-neonCyan/20 border border-cyber-neonCyan text-cyber-neonCyan font-bold text-xs uppercase tracking-wider hover:bg-cyber-neonCyan/40 transition-colors"
            >
              Install / Play to {selectedServerTarget}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
