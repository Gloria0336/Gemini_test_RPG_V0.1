import express from 'express';
import cors from 'cors';
import { createInitialState, processMove } from './gameEngine';
import { generateNarrative } from './aiService';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

let state = createInitialState();

app.get('/api/state', (req, res) => res.json(state));

app.post('/api/move', async (req, res) => {
  const { newState, triggerAI, hint } = processMove(state, req.body);
  state = newState;
  
  // 先回傳狀態給前端 (Non-blocking)
  if (triggerAI) {
    state.isAiGenerating = true;
    state.aiStatus = 'loading';
  }
  res.json(state);

  // 背景執行 AI
  if (triggerAI) {
    const text = await generateNarrative(hint);
    state.logs.push({ id: uuidv4(), type: 'GM', text });
    state.isAiGenerating = false;
    state.aiStatus = 'success';
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));