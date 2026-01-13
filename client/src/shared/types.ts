// 定義遊戲的所有階段
export enum GamePhase {
  INIT = 'INIT',         // 初始畫面
  CUSTOM = 'CUSTOM',     // 創角
  EXPLORE = 'EXPLORE',   // 探索
  EVENT = 'EVENT',       // 事件選擇
  COMBAT = 'COMBAT',     // 戰鬥
  REST = 'REST',         // 休息/下一層
  ENDED = 'ENDED',       // 通關
}

// 玩家資料結構
export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  gold: number;
  inventory: { itemId: string; name: string; qty: number }[];
}

// 事件結構
export interface GameEvent {
  eventId: string;
  title: string;
  description: string;
  options: { id: string; label: string; cost?: number }[];
}

// 完整的遊戲狀態 (State Snapshot)
export interface GameState {
  gameId: string;
  floor: number;
  phase: GamePhase;
  player: Player;
  logs: { id: string; type: 'TRUTH' | 'GM'; text: string }[];
  currentEvent?: GameEvent;
  
  // AI 狀態控制
  isAiGenerating: boolean;
  aiStatus: 'idle' | 'loading' | 'success' | 'error';
}

// 前端送往後端的行動指令 (Move)
export interface GameMove {
  action: 'START' | 'CREATE_PLAYER' | 'EXPLORE' | 'CHOOSE_OPT' | 'WIN_COMBAT' | 'NEXT_FLOOR';
  payload?: any;
}