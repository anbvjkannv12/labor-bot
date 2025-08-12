// script.js - 前端互動邏輯
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const form = document.getElementById("chat-form");

function appendMessage(text, role = "bot") {
  const p = document.createElement("div");
  p.className = "message " + (role === "user" ? "msg-user" : "msg-bot");
  p.innerHTML = text.replace(/\n/g, "<br>");
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendQuestion(question) {
  appendMessage(`<b>你：</b> ${escapeHtml(question)}`, "user");
  appendMessage(`<i>思考中…</i>`, "bot");
  const botPlaceholder = chatBox.lastChild;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      const err = await res.text();
      botPlaceholder.innerHTML = `<b>機器人（錯誤）：</b> ${escapeHtml(err)}`;
      return;
    }

    const data = await res.json();
    // 將最後一個機器人占位內容替換為真實回覆
    botPlaceholder.innerHTML = `<b>機器人：</b> ${escapeHtml(data.answer || "（沒有回應）")}`;
  } catch (e) {
    botPlaceholder.innerHTML = `<b>機器人（例外）：</b> ${escapeHtml(String(e))}`;
  }
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

form.addEventListener("submit", () => {
  const q = input.value.trim();
  if (!q) return;
  input.value = "";
  sendQuestion(q);
});

sendBtn.addEventListener("click", () => form.dispatchEvent(new Event("submit")));
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") form.dispatchEvent(new Event("submit"));
});
