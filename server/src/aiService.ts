import dotenv from 'dotenv';
dotenv.config();

export async function generateNarrative(hint: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) return "AI 未設定。";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [{ role: "user", content: `作為TRPG主持人，請用繁體中文一句話描述：${hint}` }]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "...";
  } catch (e) {
    console.error(e);
    return "(AI 連線錯誤)";
  }
}