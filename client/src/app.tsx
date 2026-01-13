import { useEffect, useState } from 'react';
import { GameState, GamePhase } from './shared/types';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [name, setName] = useState("Hero");

  // 輪詢 (Polling) 以更新 Log 和 AI 狀態
  useEffect(() => {
    const fetchState = () => fetch(`${API_URL}/state`).then(r => r.json()).then(setState);
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendMove = (action: string, payload = {}) => {
    fetch(`${API_URL}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    }).then(r => r.json()).then(setState);
  };

  if (!state) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      {/* 頂部資訊欄 */}
      <div style={{ borderBottom: '2px solid #333', marginBottom: 20 }}>
        <h2>RPG Demo | Floor: {state.floor} | Phase: {state.phase}</h2>
        <p>Name: {state.player.name} | HP: {state.player.hp} | Gold: {state.player.gold}G</p>
        <p>Inventory: {state.player.inventory.map(i => `${i.name} x${i.qty}`).join(', ') || "Empty"}</p>
      </div>

      {/* 主要遊戲區 */}
      <div style={{ minHeight: 200, border: '1px dashed #aaa', padding: 20, marginBottom: 20 }}>
        {state.phase === GamePhase.INIT && (
          <button onClick={() => sendMove('START')}>Start New Game</button>
        )}
        
        {state.phase === GamePhase.CUSTOM && (
          <div>
            Name: <input value={name} onChange={e => setName(e.target.value)} />
            <button onClick={() => sendMove('CREATE_PLAYER', { name })}>Confirm</button>
          </div>
        )}

        {state.phase === GamePhase.EXPLORE && (
          <button onClick={() => sendMove('EXPLORE')}>Explore Forward</button>
        )}

        {state.phase === GamePhase.EVENT && state.currentEvent && (
          <div>
            <h3>{state.currentEvent.title}</h3>
            <p>{state.currentEvent.description}</p>
            {state.currentEvent.options.map(opt => (
              <button key={opt.id} onClick={() => sendMove('CHOOSE_OPT', { optionId: opt.id })} style={{ marginRight: 10 }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {state.phase === GamePhase.COMBAT && (
          <div>
            <h3>戰鬥中！</h3>
            <button onClick={() => sendMove('WIN_COMBAT')}>攻擊並獲勝 (Debug Win)</button>
          </div>
        )}

        {state.phase === GamePhase.REST && (
          <button onClick={() => sendMove('NEXT_FLOOR')}>前往下一層</button>
        )}
        
        {state.phase === GamePhase.ENDED && <h1>遊戲通關！恭喜！</h1>}
      </div>

      {/* Log 區域 */}
      <div style={{ background: '#f0f0f0', padding: 10, height: 200, overflowY: 'auto' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Game Logs 
          {state.aiStatus === 'loading' && <span style={{ color: 'orange' }}> (AI Writing...)</span>}
        </div>
        {[...state.logs].reverse().map(log => (
          <div key={log.id} style={{ 
            color: log.type === 'GM' ? 'purple' : 'black',
            fontStyle: log.type === 'GM' ? 'italic' : 'normal',
            marginBottom: 4
          }}>
            [{log.type}] {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;