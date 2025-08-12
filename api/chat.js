// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { question } = req.body || {};
  if (!question) {
    res.status(400).json({ message: "Missing question" });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ message: "Missing OPENAI_API_KEY in env" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是一個專門回答台灣勞資問題的客服助理。" },
          { role: "user", content: question }
        ],
        max_tokens: 800,
        temperature: 0.2
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ message: errText });
    }

    const data = await r.json();
    res.status(200).json({ answer: data.choices[0]?.message?.content || "" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: String(e) });
  }
}
