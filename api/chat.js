// api/chat.js
// Node / Vercel serverless function


export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { question } = req.body || {};
  if (!question || typeof question !== "string") {
    res.status(400).json({ message: "Missing question in request body." });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ message: "Server misconfigured: missing OPENAI_API_KEY" });
    return;
  }

  try {
    const payload = {
      model: "gpt-4o-mini", // 若你想改成別的 model，可以在此替換
      messages: [
        { role: "system", content: "你是一個友善且準確的台灣勞資議題助理，回答時盡量舉例並引用相關法律條文要說明為一般性資訊，不構成法律建議。" },
        { role: "user", content: question }
      ],
      max_tokens: 800,
      temperature: 0.1
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text();
      res.status(502).json({ message: `OpenAI API error: ${txt}` });
      return;
    }

    const data = await r.json();
    const answer = data.choices?.[0]?.message?.content ?? "";

    res.status(200).json({ answer });
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

