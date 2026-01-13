import { GameState, GameMove, GamePhase } from './shared/types';
import { v4 as uuidv4 } from 'uuid';

const MAX_FLOOR = 20;

export const createInitialState = (): GameState => ({
  gameId: uuidv4(),
  floor: 1,
  phase: GamePhase.INIT,
  player: { name: "", hp: 100, maxHp: 100, gold: 0, inventory: [] },
  logs: [],
  isAiGenerating: false,
  aiStatus: 'idle'
});

export const processMove = (state: GameState, move: GameMove) => {
  // Deep Copy 確保不變性
  const next = JSON.parse(JSON.stringify(state));
  let triggerAI = false;
  let hint = "";

  const addLog = (text: string) => next.logs.push({ id: uuidv4(), type: 'TRUTH', text });

  switch (next.phase) {
    case GamePhase.INIT:
      if (move.action === 'START') next.phase = GamePhase.CUSTOM;
      break;

    case GamePhase.CUSTOM:
      if (move.action === 'CREATE_PLAYER') {
        next.player.name = move.payload.name || "Hero";
        next.player.gold = 10;
        next.phase = GamePhase.EXPLORE;
        addLog(`角色 ${next.player.name} 建立完成。`);
        triggerAI = true; hint = "冒險者剛進入地牢第一層。";
      }
      break;

    case GamePhase.EXPLORE:
      if (move.action === 'EXPLORE') {
        const rng = Math.random();
        if (rng > 0.5) {
          next.phase = GamePhase.COMBAT;
          addLog("遭遇敵人！");
          triggerAI = true; hint = "遭遇了一隻兇猛的怪物。";
        } else {
          next.phase = GamePhase.EVENT;
          next.currentEvent = {
            eventId: 'merchant', title: '流浪商人', description: '一位商人坐在角落。',
            options: [{ id: 'buy', label: '買藥水 (-10G)', cost: 10 }, { id: 'leave', label: '離開' }]
          };
          addLog("遇到商人。");
          triggerAI = true; hint = "在陰暗的角落遇到一位神祕商人。";
        }
      }
      break;

    case GamePhase.EVENT:
      if (move.action === 'CHOOSE_OPT') {
        if (move.payload.optionId === 'buy' && next.player.gold >= 10) {
          next.player.gold -= 10;
          next.player.inventory.push({ itemId: 'potion', name: 'Potion', qty: 1 });
          addLog("購買了藥水。");
        } else {
          addLog("什麼也沒做並離開了。");
        }
        next.phase = GamePhase.EXPLORE;
        next.currentEvent = undefined;
      }
      break;

    case GamePhase.COMBAT:
      if (move.action === 'WIN_COMBAT') {
        next.player.gold += 5;
        addLog("戰鬥勝利！獲得 5G。");
        next.phase = GamePhase.REST;
        triggerAI = true; hint = "戰鬥結束，冒險者勝利並搜刮戰利品。";
      }
      break;

    case GamePhase.REST:
      if (move.action === 'NEXT_FLOOR') {
        if (next.floor >= MAX_FLOOR) {
          next.phase = GamePhase.ENDED;
          addLog("通關！");
          triggerAI = true; hint = "冒險者到達了塔頂，發現了終極寶藏。";
        } else {
          next.floor++;
          next.phase = GamePhase.EXPLORE;
          addLog(`進入第 ${next.floor} 層。`);
          triggerAI = true; hint = `進入了第 ${next.floor} 層，環境變得更險惡。`;
        }
      }
      break;
  }
  return { newState: next, triggerAI, hint };
};