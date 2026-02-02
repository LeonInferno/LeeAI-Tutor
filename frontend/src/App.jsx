import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const STORAGE_KEY = "leeai_chat_history_v2";

function nowTs() {
  return Date.now();
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function MessageContent({ content }) {
  const [copied, setCopied] = useState("");

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(text);
      setTimeout(() => setCopied(""), 1200);
    }
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ inline, className, children, ...props }) {
          const codeText = String(children).replace(/\n$/, "");

          if (inline) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }

          return (
            <div className="codeblock">
              <div className="codeblock-bar">
                <span className="codeblock-lang">
                  {(className || "").replace("language-", "") || "code"}
                </span>

                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(codeText)}
                  type="button"
                >
                  {copied === codeText ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className={className}>
                <code className={className} {...props}>
                  {codeText}
                </code>
              </pre>
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    return [
      {
        role: "assistant",
        content: "Hi! I’m LeeAI Tutor 🤖📚 What are we learning today?",
        ts: nowTs(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const lastMsgTime = useMemo(() => {
    if (!messages.length) return "";
    const last = messages[messages.length - 1];
    return last?.ts ? formatTime(last.ts) : "";
  }, [messages]);

  function clearChat() {
    const starter = [
      { role: "assistant", content: "Chat cleared ✅ What do you want to study now?", ts: nowTs() },
    ];
    setMessages(starter);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starter));
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setError("");
    setIsLoading(true);

    const userMsg = { role: "user", content: text, ts: nowTs() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const url = `http://localhost:8080/api/leeai/chat?message=${encodeURIComponent(text)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Request failed: ${res.status}`);
      }

      const replyText = await res.text();

      const aiMsg = { role: "assistant", content: replyText, ts: nowTs() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setError("Backend/API error. Is your Spring Boot server running and key set?");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I couldn’t reach the server. Try again in a moment.",
          ts: nowTs(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logoRing">
            <div className="logo">🤖</div>
          </div>

          <div className="brandText">
            <div className="brandTitleRow">
              <h1 className="title">LeeAI Tutor</h1>
              <span className="pill">Beta</span>
            </div>
            <p className="subtitle">
              Ask anything. Learn faster.
              {lastMsgTime ? <span className="subDot"> • </span> : null}
              {lastMsgTime ? <span className="subMuted">Last: {lastMsgTime}</span> : null}
            </p>
          </div>
        </div>

        <div className="actions">
          <span className={`status ${isLoading ? "busy" : "ready"}`}>
            <span className="statusDot" />
            {isLoading ? "Thinking…" : "Ready"}
          </span>

          <button className="ghost" onClick={clearChat} disabled={isLoading} title="Clear chat">
            Clear
          </button>
        </div>
      </header>

      <main className="card">
        {error && <div className="error">{error}</div>}

        <div className="chat">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} className={`row ${isUser ? "right" : "left"}`}>
                {!isUser && (
                  <div className="avatar" aria-hidden="true">
                    🤖
                  </div>
                )}

                <div className="message">
                  <div className="meta">
                    <span className="name">{isUser ? "You" : "LeeAI Tutor"}</span>
                    <span className="time">{m.ts ? formatTime(m.ts) : ""}</span>
                  </div>

                  <div className={`bubble ${m.role}`}>
                    <MessageContent content={m.content} />
                  </div>
                </div>

                {isUser && (
                  <div className="avatar userAvatar" aria-hidden="true">
                    🙂
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="row left">
              <div className="avatar" aria-hidden="true">
                🤖
              </div>
              <div className="message">
                <div className="meta">
                  <span className="name">LeeAI Tutor</span>
                  <span className="time">…</span>
                </div>
                <div className="bubble assistant typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="composer">
          <textarea
            className="input"
            placeholder="Ask LeeAI something…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send" onClick={sendMessage} disabled={isLoading}>
            {isLoading ? "…" : "Send"}
          </button>
        </div>

        <div className="hint">
          Tip: Press <b>Enter</b> to send • <b>Shift+Enter</b> for a new line
        </div>
      </main>
    </div>
  );
}