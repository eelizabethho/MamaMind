"use client";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! Your village is here to help. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      } else {
        // Show the detailed error from the API
        const errorMsg = data.message || data.details || data.error || "Failed to get response";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f0",
      }}
    >
      <Navbar />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          height: "calc(100vh - 80px)",
        }}
      >
        <Sidebar />

        {/* Chat Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-end",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              backgroundColor: "#fefefe",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: "80vh",
              marginLeft: "auto",
            }}
          >
            {/* Welcome Header */}
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#2d3748",
                  margin: 0,
                }}
              >
                Welcome, Your Village Is Here To Help
              </h1>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                backgroundColor: "#fefefe",
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {message.role === "assistant" && (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#cbd5e0",
                        backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2394a3b8%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E')",
                        backgroundSize: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      backgroundColor: message.role === "user" ? "#90cdf4" : "#e2e8f0",
                      padding: "0.75rem 1rem",
                      borderRadius: "16px",
                      maxWidth: "70%",
                      color: message.role === "user" ? "#1a202c" : "#2d3748",
                      fontSize: "0.9rem",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#cbd5e0",
                      backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2394a3b8%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E')",
                      backgroundSize: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: "#e2e8f0",
                      padding: "0.75rem 1rem",
                      borderRadius: "16px",
                      color: "#2d3748",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span style={{ animation: "bounce 1s infinite" }}>●</span>
                      <span style={{ animation: "bounce 1s infinite 0.2s" }}>●</span>
                      <span style={{ animation: "bounce 1s infinite 0.4s" }}>●</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                padding: "1rem 1.5rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => sendMessage("I need a break")}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#d69e2e",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#c0841c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#d69e2e";
                  }
                }}
              >
                I need a break
              </button>
              <button
                onClick={() => sendMessage("Help with mind planning")}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#90cdf4",
                  color: "#1a202c",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#7bb8e8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#90cdf4";
                  }
                }}
              >
                Help with mind planning
              </button>
              <button
                onClick={() => sendMessage("Connect me to my village")}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#90cdf4",
                  color: "#1a202c",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#7bb8e8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#90cdf4";
                  }
                }}
              >
                Connect me to my village
              </button>
              <button
                onClick={() => sendMessage("Check in")}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#90cdf4",
                  color: "#1a202c",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#7bb8e8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#90cdf4";
                  }
                }}
              >
                Check in
              </button>
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "1rem 1.5rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                backgroundColor: "#f7fafc",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              {/* Microphone Icon */}
              <button
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#718096",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {/* Input Field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderRadius: "24px",
                  outline: "none",
                  fontSize: "0.9rem",
                  backgroundColor: "white",
                  color: "#2d3748",
                  opacity: isLoading ? 0.6 : 1,
                }}
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: isLoading || !input.trim() ? "#cbd5e0" : "#9f7aea",
                  color: "white",
                  border: "none",
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.backgroundColor = "#8b6bb1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.backgroundColor = "#9f7aea";
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
