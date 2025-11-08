import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ChatBox.css";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (userEmail) {
      loadHistory();
    } else {
      setMessages([
        "🌿 Welcome to the PlantBot! Ask me anything about plants or gardening.",
      ]);
    }
  }, [userEmail]);

  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // ✅ Only auto-scroll if fullscreen
    if (isFullscreen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isFullscreen]);



  const loadHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/chat-history", {
        params: { email: userEmail },
      });

      const convs = res.data.conversations || [];
      setConversations(convs);
      if (convs.length === 0) {
        setMessages([
          "🌿 Welcome back! You have no previous conversations. Start a new one below.",
        ]);
      } else {
        // Load the most recent conversation's messages by default
        const latestConv = convs[0];
        const formatted = latestConv.messages.flatMap((msg) => [
          `👤 ${msg.user_message}`,
          `🤖 ${msg.bot_reply}`,
        ]);
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setMessages([
        "⚠️ Error loading conversation history. You can still start a new chat.",
      ]);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const scrollPosition = window.scrollY;
    setMessages((prev) => [...prev, `👤 ${trimmed}`]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/chatbot",
        {
          message: trimmed,
          email: userEmail || undefined,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const botReply = res.data.response || "🌿 Sorry, I didn't understand that.";
      setMessages((prev) => [...prev, `🤖 ${botReply}`]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [...prev, "⚠️ Sorry, something went wrong."]);
    } finally {
      setLoading(false);
      window.scrollTo({ top: scrollPosition, behavior: "instant" });
    }
  };

  const handleStartNewChat = async () => {
    if (userEmail && messages.length > 1) { // Only save if there are actual messages
      try {
        await axios.post(
          "http://localhost:5000/save-conversation",
          { email: userEmail },
          { headers: { "Content-Type": "application/json" } }
        );
        await loadHistory(); // Refresh history after saving
      } catch (err) {
        console.error("Error saving conversation:", err);
      }
    }

    setMessages([
      "🌿 You started a new chat. Ask me anything about plants or gardening.",
    ]);
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const selectConversation = (conv) => {
    const formatted = conv.messages.flatMap((msg) => [
      `👤 ${msg.user_message}`,
      `🤖 ${msg.bot_reply}`,
    ]);
    setMessages(formatted);
  };

  return (
    <div className={`chatbox ${isFullscreen ? "fullscreen" : ""}`}>
      {isFullscreen && userEmail && (
        <div className={`chatbox-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="chatbox-sidebar-content">
            <button className="chatbox-sidebar-button" onClick={handleStartNewChat}>
              ➕ New Chat
            </button>
            <div className="chatbox-history-list">
              {conversations.length > 0 ? (
                conversations.map((conv, idx) => (
                  <div
                    key={idx}
                    className="chatbox-history-item"
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="chatbox-history-title">
                      {conv.title}
                    </div>
                    <div className="chatbox-history-description">
                      {conv.messages[0]?.bot_reply.slice(0, 50) + "..."}
                    </div>
                  </div>
                ))
              ) : (
                <div className="chatbox-history-empty">
                  No previous conversations
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isFullscreen && !userEmail && (
        <div className={`chatbox-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="chatbox-sidebar-content">
            <button className="chatbox-sidebar-button" onClick={handleStartNewChat}>
              ➕ New Chat
            </button>
          </div>
        </div>
      )}
      <div className="chatbox-main">
        <div className="chatbox-header">
          <div className="chatbox-header-left">
            {isFullscreen && (
              <button
                className="chatbox-sidebar-toggle"
                onClick={toggleSidebar}
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                ☰
              </button>
            )}
            <span>💬 PlantBot Assistant</span>
          </div>
          <div className="chatbox-header-buttons">
            {isFullscreen ? (
              <button onClick={toggleFullscreen} title="Minimize">
                🗕
              </button>
            ) : (
              <button onClick={toggleFullscreen} title="Maximize">
                🗖
              </button>
            )}
          </div>
        </div>

        {!isFullscreen && (
          <div className="chatbox-history-buttons">
            <button onClick={handleStartNewChat}>➕ Start New Chat</button>
          </div>
        )}

        <div className="chatbox-messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className="chatbox-message">
              {msg}
            </div>
          ))}
          {loading && <div className="chatbox-message">🤖 Typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbox-input">
          <textarea
            rows={1}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}