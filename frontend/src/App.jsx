import { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  async function sendMessage() {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChat((prev) => [...prev, userMsg]);

    setMessage("");

    const res = await fetch(
      `http://localhost:8080/api/leeai/chat?message=${encodeURIComponent(
        message
      )}`
    );

    const data = await res.text();

    const aiMsg = { role: "ai", text: data };
    setChat((prev) => [...prev, aiMsg]);
  }

  // Enter key sends message
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        LeeAI Tutor Chat
      </h1>

      {/* Chat Box */}
      <div
        ref={chatBoxRef}
        style={{
          width: "90%",
          maxWidth: "700px",
          height: "500px",
          background: "#1e293b",
          borderRadius: "15px",
          padding: "15px",
          overflowY: "auto",
          boxShadow: "0 0 15px rgba(0,0,0,0.4)",
        }}
      >
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                background:
                  msg.role === "user" ? "#2563eb" : "#334155",
                padding: "12px 15px",
                borderRadius: "15px",
                maxWidth: "75%",
                fontSize: "16px",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div
        style={{
          marginTop: "15px",
          display: "flex",
          width: "90%",
          maxWidth: "700px",
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask LeeAI something..."
          style={{
            flex: 1,
            padding: "15px",
            borderRadius: "12px",
            border: "none",
            fontSize: "16px",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "15px 25px",
            borderRadius: "12px",
            border: "none",
            background: "#22c55e",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;