"use client";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Simple markdown renderer for bold, italic, and lists
const renderMarkdown = (text: string) => {
  let key = 0;

  // First, handle bold text
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  let currentIndex = 0;
  const elements: (string | React.ReactElement)[] = [];

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      const beforeText = text.substring(currentIndex, match.index);
      if (beforeText) {
        elements.push(beforeText);
      }
    }
    
    // Add bold element
    elements.push(
      <strong key={`bold-${key++}`} style={{ fontWeight: 600 }}>
        {match[1]}
      </strong>
    );
    
    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    elements.push(text.substring(currentIndex));
  }

  // Now process italic in the result
  const result: (string | React.ReactElement)[] = [];
  elements.forEach((element, idx) => {
    if (typeof element === 'string') {
      const italicRegex = /\*([^*]+)\*/g;
      let italicMatch;
      let italicIndex = 0;
      let italicKey = 0;

      while ((italicMatch = italicRegex.exec(element)) !== null) {
        if (italicMatch.index > italicIndex) {
          const beforeText = element.substring(italicIndex, italicMatch.index);
          if (beforeText) {
            result.push(beforeText);
          }
        }
        
        result.push(
          <em key={`italic-${idx}-${italicKey++}`} style={{ fontStyle: 'italic' }}>
            {italicMatch[1]}
          </em>
        );
        
        italicIndex = italicMatch.index + italicMatch[0].length;
      }

      if (italicIndex < element.length) {
        result.push(element.substring(italicIndex));
      }
    } else {
      result.push(element);
    }
  });

  // Handle line breaks and bullet points
  const finalResult: (string | React.ReactElement)[] = [];
  result.forEach((element, idx) => {
    if (typeof element === 'string') {
      const lines = element.split('\n');
      lines.forEach((line, lineIdx) => {
        if (lineIdx > 0) {
          finalResult.push(<br key={`br-${idx}-${lineIdx}`} />);
        }
        
        // Check if line starts with bullet point
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const bulletContent = line.trim().substring(2);
          // Process markdown in bullet content
          const bulletParts: (string | React.ReactElement)[] = [];
          const boldParts = bulletContent.split(/(\*\*[^*]+\*\*)/g);
          boldParts.forEach((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              bulletParts.push(
                <strong key={`bullet-bold-${idx}-${lineIdx}-${partIdx}`} style={{ fontWeight: 600 }}>
                  {part.slice(2, -2)}
                </strong>
              );
            } else if (part) {
              bulletParts.push(part);
            }
          });
          finalResult.push(
            <span key={`bullet-${idx}-${lineIdx}`} style={{ display: 'block', marginLeft: '1rem', marginTop: '0.25rem' }}>
              • {bulletParts}
            </span>
          );
        } else {
          finalResult.push(line);
        }
      });
    } else {
      finalResult.push(element);
    }
  });

  return finalResult.length > 0 ? finalResult : [text];
};

export default function Page() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! Your village is here to help. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customProfileImage, setCustomProfileImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load custom profile image from localStorage (same as Sidebar)
  useEffect(() => {
    if (session?.user?.email) {
      const savedImage = localStorage.getItem(`profile_image_${session.user.email}`);
      if (savedImage) {
        setCustomProfileImage(savedImage);
      }
    }
  }, [session?.user?.email]);

  // Use custom image if available, otherwise use Google image
  const displayImage = customProfileImage || session?.user?.image || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus input when not loading
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

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
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(10px);
          }
          50% {
            transform: scale(1.1) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
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
            alignItems: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              backgroundColor: "#ece8d5",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: "80vh",
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
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                backgroundColor: "#ece8d5",
                scrollBehavior: "smooth",
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
                    animation: "fadeIn 0.3s ease-in",
                  }}
                >
                  {message.role === "assistant" && (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#9f7aea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 4px rgba(159, 122, 234, 0.2)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  )}
                  <div
                    style={{
                      backgroundColor: message.role === "user" ? "#9f7aea" : "#f7fafc",
                      padding: "0.875rem 1.125rem",
                      borderRadius: message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      maxWidth: "75%",
                      color: message.role === "user" ? "white" : "#2d3748",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      boxShadow: message.role === "user" 
                        ? "0 2px 8px rgba(159, 122, 234, 0.15)" 
                        : "0 1px 3px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {renderMarkdown(message.content)}
                  </div>
                  {message.role === "user" && (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#90cdf4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 4px rgba(144, 205, 244, 0.2)",
                        overflow: "hidden",
                      }}
                    >
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={session?.user?.name || "User"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    animation: "fadeIn 0.3s ease-in",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#9f7aea",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 4px rgba(159, 122, 234, 0.2)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#f7fafc",
                      padding: "0.875rem 1.125rem",
                      borderRadius: "18px 18px 18px 4px",
                      color: "#2d3748",
                      fontSize: "0.95rem",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ 
                        width: "8px", 
                        height: "8px", 
                        borderRadius: "50%", 
                        backgroundColor: "#9f7aea",
                        animation: "pulse 1.4s ease-in-out infinite",
                        display: "inline-block",
                      }} />
                      <span style={{ 
                        width: "8px", 
                        height: "8px", 
                        borderRadius: "50%", 
                        backgroundColor: "#9f7aea",
                        animation: "pulse 1.4s ease-in-out infinite 0.2s",
                        display: "inline-block",
                      }} />
                      <span style={{ 
                        width: "8px", 
                        height: "8px", 
                        borderRadius: "50%", 
                        backgroundColor: "#9f7aea",
                        animation: "pulse 1.4s ease-in-out infinite 0.4s",
                        display: "inline-block",
                      }} />
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
                  backgroundColor: "#E69B97",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(230, 155, 151, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#EFC0BC";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(230, 155, 151, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#E69B97";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(230, 155, 151, 0.2)";
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
                  backgroundColor: "#828C6A",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(130, 140, 106, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#A0AB89";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(130, 140, 106, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#828C6A";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(130, 140, 106, 0.2)";
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
                  backgroundColor: "#828C6A",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(130, 140, 106, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#A0AB89";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(130, 140, 106, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#828C6A";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(130, 140, 106, 0.2)";
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
                  backgroundColor: "#828C6A",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(130, 140, 106, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#A0AB89";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(130, 140, 106, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "#828C6A";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(130, 140, 106, 0.2)";
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
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#edf2f7";
                  e.currentTarget.style.color = "#4a5568";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#718096";
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
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "0.875rem 1.25rem",
                  border: "2px solid transparent",
                  borderRadius: "24px",
                  outline: "none",
                  fontSize: "0.95rem",
                  backgroundColor: "white",
                  color: "#2d3748",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#828C6A";
                  e.target.style.boxShadow = "0 0 0 3px rgba(130, 140, 106, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "transparent";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: isLoading || !input.trim() ? "#cbd5e0" : "#828C6A",
                  color: "white",
                  border: "none",
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  boxShadow: isLoading || !input.trim() 
                    ? "none" 
                    : "0 2px 6px rgba(130, 140, 106, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.backgroundColor = "#A0AB89";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(130, 140, 106, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.backgroundColor = "#828C6A";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(130, 140, 106, 0.3)";
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
    </>
  );
}
