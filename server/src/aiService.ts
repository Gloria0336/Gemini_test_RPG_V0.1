import dotenv from 'dotenv';
dotenv.config();

export async function generateNarrative(hint: string): Promise<string> {
  // 檢查 API Key 是否存在
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("⚠️ Warning: OPENROUTER_API_KEY is missing in .env");
    return "（AI 未設定，無法生成敘事...）";
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { 
            role: "system", 
            content: "你是TRPG的地下城主(GM)。請用繁體中文，以生動、簡短的一句話(50字內)描述當前發生的事情。" 
          },
          { 
            role: "user", 
            content: `情況：${hint}` 
          }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`AI API Error: ${res.statusText}`);
    }

    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || "（沈默...）";
  } catch (e) {
    console.error("AI Service Failed:", e);
    return "（一陣神祕的干擾，你聽不清楚 GM 的聲音...）";
  }
}