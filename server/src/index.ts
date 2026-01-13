import express from 'express';
import cors from 'cors';
import { createInitialState, processMove } from './gameEngine';
import { generateNarrative } from './aiService';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// 初始化遊戲狀態 (In-Memory)
let state = createInitialState();

// API 1: 取得當前狀態
app.get('/api/state', (req, res) => {
  res.json(state);
});

// API 2: 玩家行動
app.post('/api/move', async (req, res) => {
  const move = req.body;
  
  // 1. 執行核心邏輯
  const outcome = processMove(state, move);
  state = outcome.newState;
  
  // 2. 判斷是否觸發 AI (如果 outcome 說需要 triggerAI)
  if (outcome.triggerAI) {
    // 標記狀態為 Loading，讓前端顯示 "AI Writing..."
    state.isAiGenerating = true;
    state.aiStatus = 'loading';
    
    // 立即回應前端 (不讓 UI 卡住)
    res.json(state);

    // 3. 背景執行 AI 請求
    try {
      const narrative = await generateNarrative(outcome.hint || "發生了神祕的事");
      
      // AI 完成，寫入 GM Log
      state.logs.push({
        id: uuidv4(),
        type: 'GM',
        text: narrative
      });
      state.aiStatus = 'success';
    } catch (error) {
      state.aiStatus = 'error';
      state.logs.push({ id: uuidv4(), type: 'GM', text: "(GM 斷線了...)" });
    } finally {
      state.isAiGenerating = false;
    }
  } else {
    // 不需要 AI，直接回傳
    res.json(state);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});