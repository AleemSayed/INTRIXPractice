
"use client";

import { useState, type FormEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm the INTRIX assistant. Ask me about registered users using their public user ID or name.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = question.trim();
    if (!text || busy) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: text },
    ]);
    setQuestion("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const result = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.ok
            ? result.answer
            : result.error || "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Unable to connect. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">INTELLIGENT ASSISTANT</p>
        <h1>INTRIX AI Chatbot</h1>
        <p className="muted">
          Ask questions about the registered users directory.
        </p>
      </div>

      <section className="chat-card">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role}`}
            >
              <span className="chat-sender">
                {message.role === "user" ? "You" : "INTRIX Assistant"}
              </span>
              <p>{message.content}</p>
            </div>
          ))}

          {busy && (
            <div className="chat-message assistant">
              <span className="chat-sender">INTRIX Assistant</span>
              <p>Searching registered users...</p>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={submit}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about a registered user..."
            disabled={busy}
          />
          <button type="submit" disabled={busy || !question.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
