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

interface Therapist {
  id: string;
  name: string;
  gender: "male" | "female";
  style: string;
  personality: string;
}

const therapists: Therapist[] = [
  {
    id: "sarah",
    name: "Sarah",
    gender: "female",
    style: "Warm and nurturing",
    personality: "You are Sarah, a warm and nurturing therapist. You're empathetic, gentle, and create a safe space. You use lots of validation and encouragement. You're like a caring friend who always knows the right thing to say."
  },
  {
    id: "maya",
    name: "Maya",
    gender: "female",
    style: "Direct and empowering",
    personality: "You are Maya, a direct and empowering therapist. You're honest, practical, and help people find their strength. You give actionable advice and challenge people gently. You're confident and help people feel capable."
  },
  {
    id: "james",
    name: "James",
    gender: "male",
    style: "Calm and analytical",
    personality: "You are James, a calm and analytical therapist. You're thoughtful, logical, and help people process their thoughts. You ask insightful questions and help people see things from different angles. You're steady and reassuring."
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    style: "Supportive and encouraging",
    personality: "You are David, a supportive and encouraging therapist. You're positive, uplifting, and help people see possibilities. You celebrate small wins and help people build confidence. You're like a supportive coach who believes in people."
  }
];

interface PastChat {
  id: string;
  summary: string;
  timestamp: Date;
  therapistName?: string;
  messageCount: number;
  messages: Message[]; // Store full conversation
  therapistId?: string; // Store therapist ID to restore selection
}

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
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [customProfileImage, setCustomProfileImage] = useState<string | null>(null);
  const [pastChats, setPastChats] = useState<PastChat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationStartTime = useRef<Date>(new Date());

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

  // Load past chats from localStorage
  useEffect(() => {
    if (session?.user?.email) {
      const savedChats = localStorage.getItem(`past_chats_${session.user.email}`);
      if (savedChats) {
        try {
          const chats = JSON.parse(savedChats);
          setPastChats(chats.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages || [], // Ensure messages array exists
          })));
        } catch (e) {
          console.error("Error loading past chats:", e);
        }
      }
    }
  }, [session?.user?.email]);

  // Save conversation when therapist changes or conversation ends
  const saveConversation = (messages: Message[]) => {
    if (messages.length <= 1 || !session?.user?.email) return; // Don't save if only welcome message
    
    // Generate summary from first user message
    const firstUserMessage = messages.find(m => m.role === "user");
    const summary = firstUserMessage 
      ? (firstUserMessage.content.length > 60 
          ? firstUserMessage.content.substring(0, 60) + "..." 
          : firstUserMessage.content)
      : "Chat conversation";

    const newChat: PastChat = {
      id: Date.now().toString(),
      summary,
      timestamp: conversationStartTime.current,
      therapistName: selectedTherapist?.name,
      messageCount: messages.filter(m => m.role !== "assistant" || !m.content.includes("Welcome")).length,
      messages: messages, // Store full conversation
      therapistId: selectedTherapist?.id, // Store therapist ID
    };

    const updatedChats = [newChat, ...pastChats].slice(0, 10); // Keep last 10 chats
    setPastChats(updatedChats);
    
    // Save to localStorage
    localStorage.setItem(`past_chats_${session.user.email}`, JSON.stringify(updatedChats));
  };

  // Load a past chat conversation
  const loadChat = (chatId: string) => {
    const chat = pastChats.find(c => c.id === chatId);
    if (!chat) return;

    // Restore messages
    setMessages(chat.messages);
    
    // Restore therapist selection if applicable
    if (chat.therapistId) {
      const therapist = therapists.find((t: Therapist) => t.id === chat.therapistId);
      if (therapist) {
        setSelectedTherapist(therapist);
      }
    } else {
      setSelectedTherapist(null);
    }
    
    // Reset conversation start time
    conversationStartTime.current = chat.timestamp;
    setSelectedQuickAction(null);
  };

  // Delete a past chat
  const deleteChat = (chatId: string) => {
    if (!session?.user?.email) return;
    
    const updatedChats = pastChats.filter(c => c.id !== chatId);
    setPastChats(updatedChats);
    
    // Save to localStorage
    localStorage.setItem(`past_chats_${session.user.email}`, JSON.stringify(updatedChats));
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll the messages container when new assistant message arrives
    // This only scrolls within the chat container, not the whole page
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
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

    // Update selected quick action if it's a prompt message
    const prompts = [
      "How are you feeling today?",
      "What's on your mind?",
      "I'm feeling overwhelmed",
      "I need help processing something",
      "Let's talk about my day",
      "I need a break",
      "Help with mind planning",
      "Connect me to my village",
      "Check in"
    ];
    if (prompts.includes(messageContent)) {
      setSelectedQuickAction(messageContent);
    } else {
      setSelectedQuickAction(null);
    }

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
          therapist: selectedTherapist ? {
            id: selectedTherapist.id,
            name: selectedTherapist.name,
            personality: selectedTherapist.personality,
          } : null,
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
          background: "linear-gradient(180deg, #ECE0DA 0%, #F1C8CB 50%, #ECE0DA 100%)",
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
        <Sidebar 
          onQuickActionClick={(action) => sendMessage(action)} 
          selectedAction={selectedQuickAction}
          onTherapistSelect={(therapist) => {
            // Save current conversation before switching
            if (messages.length > 1) {
              saveConversation(messages);
            }
            
            setSelectedTherapist(therapist);
            conversationStartTime.current = new Date();
            
            // Reset messages when therapist changes
            if (therapist) {
              setMessages([{
                role: "assistant",
                content: `Hi! I'm ${therapist.name}, ${therapist.style.toLowerCase()}. I'm here to support you. What would you like to talk about today?`,
              }]);
            } else {
              setMessages([{
                role: "assistant",
                content: "Welcome! Your village is here to help. How can I assist you today?",
              }]);
            }
          }}
          selectedTherapist={selectedTherapist}
          pastChats={pastChats}
          onNewChat={() => {
            // Save current conversation before starting new one
            if (messages.length > 1) {
              saveConversation(messages);
            }
            
            // Start fresh chat
            conversationStartTime.current = new Date();
            setSelectedQuickAction(null);
            
            if (selectedTherapist) {
              setMessages([{
                role: "assistant",
                content: `Hi! I'm ${selectedTherapist.name}, ${selectedTherapist.style.toLowerCase()}. I'm here to support you. What would you like to talk about today?`,
              }]);
            } else {
              setMessages([{
                role: "assistant",
                content: "Welcome! Your village is here to help. How can I assist you today?",
              }]);
            }
          }}
          onChatSelect={loadChat}
          onChatDelete={deleteChat}
        />

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
              backgroundColor: "#ECE0DA",
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: "80vh",
              border: "1px solid rgba(126, 140, 105, 0.1)",
            }}
          >
            {/* Welcome Header */}
            <div
              style={{
                padding: "2.5rem 1.5rem",
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(246, 176, 187, 0.3) 0%, rgba(241, 200, 203, 0.2) 50%, rgba(236, 224, 218, 0.3) 100%)",
                borderBottom: "2px solid rgba(126, 140, 105, 0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "600",
                  color: "#2d3748",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  lineHeight: "1.4",
                }}
              >
                {session?.user?.name 
                  ? `Welcome ${session.user.name.split(" ")[0]}, how are you today?`
                  : "Welcome, how are you today?"}
              </h1>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "2rem 1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                background: "linear-gradient(180deg, rgba(236, 224, 218, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)",
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
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "#7E8C69",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(126, 140, 105, 0.25)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
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
                        background: message.role === "user" 
                          ? "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)" 
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
                      padding: "1.25rem 1.5rem",
                      borderRadius: message.role === "user" ? "24px 24px 8px 24px" : "24px 24px 24px 8px",
                      backdropFilter: "blur(10px)",
                      maxWidth: "75%",
                      color: message.role === "user" ? "white" : "#2d3748",
                      fontSize: "1rem",
                      lineHeight: "1.65",
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      boxShadow: message.role === "user" 
                        ? "0 4px 12px rgba(126, 140, 105, 0.2)" 
                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                      transition: "all 0.2s ease",
                      border: message.role === "assistant" ? "1px solid rgba(126, 140, 105, 0.1)" : "none",
                    }}
                  >
                    {renderMarkdown(message.content)}
                  </div>
                  {message.role === "user" && (
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "#7E8C69",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(126, 140, 105, 0.25)",
                        overflow: "hidden",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
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
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "#7E8C69",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(126, 140, 105, 0.25)",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
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
                      backgroundColor: "#ffffff",
                      padding: "1rem 1.25rem",
                      borderRadius: "20px 20px 20px 6px",
                      color: "#2d3748",
                      fontSize: "1rem",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      border: "1px solid rgba(126, 140, 105, 0.1)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ 
                        width: "10px", 
                        height: "10px", 
                        borderRadius: "50%", 
                        backgroundColor: "#7E8C69",
                        animation: "pulse 1.4s ease-in-out infinite",
                        display: "inline-block",
                      }} />
                      <span style={{ 
                        width: "10px", 
                        height: "10px", 
                        borderRadius: "50%", 
                        backgroundColor: "#7E8C69",
                        animation: "pulse 1.4s ease-in-out infinite 0.2s",
                        display: "inline-block",
                      }} />
                      <span style={{ 
                        width: "10px", 
                        height: "10px", 
                        borderRadius: "50%", 
                        backgroundColor: "#7E8C69",
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
                padding: "1.25rem 1.5rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.875rem",
                background: "linear-gradient(180deg, rgba(236, 224, 218, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)",
                borderTop: "2px solid rgba(126, 140, 105, 0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <button
                onClick={() => sendMessage("I need a break")}
                disabled={isLoading}
                style={{
                  padding: "0.875rem 1.625rem",
                  borderRadius: "14px",
                  border: "none",
                  background: selectedQuickAction === "I need a break" 
                    ? "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)" 
                    : "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)",
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: selectedQuickAction === "I need a break" 
                    ? "0 4px 16px rgba(126, 140, 105, 0.4)" 
                    : "0 2px 8px rgba(126, 140, 105, 0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && selectedQuickAction !== "I need a break") {
                    e.currentTarget.style.background = "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(126, 140, 105, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && selectedQuickAction !== "I need a break") {
                    e.currentTarget.style.background = "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(126, 140, 105, 0.25)";
                  }
                }}
              >
                I need a break
              </button>
              <button
                onClick={() => sendMessage("Help with mind planning")}
                disabled={isLoading}
                style={{
                  padding: "0.875rem 1.625rem",
                  borderRadius: "14px",
                  border: "none",
                  background: selectedQuickAction === "Help with mind planning" 
                    ? "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)" 
                    : "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)",
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: selectedQuickAction === "Help with mind planning" ? "0 4px 12px rgba(126, 140, 105, 0.3)" : "0 2px 6px rgba(126, 140, 105, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && selectedQuickAction !== "Help with mind planning") {
                    e.currentTarget.style.backgroundColor = "#9CAD8C";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(126, 140, 105, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && selectedQuickAction !== "Help with mind planning") {
                    e.currentTarget.style.backgroundColor = "#7E8C69";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(126, 140, 105, 0.2)";
                  }
                }}
              >
                Help with mind planning
              </button>
              <button
                onClick={() => sendMessage("Connect me to my village")}
                disabled={isLoading}
                style={{
                  padding: "0.875rem 1.625rem",
                  borderRadius: "14px",
                  border: "none",
                  background: selectedQuickAction === "Connect me to my village" 
                    ? "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)" 
                    : "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)",
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: selectedQuickAction === "Connect me to my village" ? "0 4px 12px rgba(126, 140, 105, 0.3)" : "0 2px 6px rgba(126, 140, 105, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && selectedQuickAction !== "Connect me to my village") {
                    e.currentTarget.style.backgroundColor = "#9CAD8C";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(126, 140, 105, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && selectedQuickAction !== "Connect me to my village") {
                    e.currentTarget.style.backgroundColor = "#7E8C69";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(126, 140, 105, 0.2)";
                  }
                }}
              >
                Connect me to my village
              </button>
              <button
                onClick={() => sendMessage("Check in")}
                disabled={isLoading}
                style={{
                  padding: "0.875rem 1.625rem",
                  borderRadius: "14px",
                  border: "none",
                  background: selectedQuickAction === "Check in" 
                    ? "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)" 
                    : "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)",
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: selectedQuickAction === "Check in" ? "0 4px 12px rgba(126, 140, 105, 0.3)" : "0 2px 6px rgba(126, 140, 105, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && selectedQuickAction !== "Check in") {
                    e.currentTarget.style.backgroundColor = "#9CAD8C";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(126, 140, 105, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && selectedQuickAction !== "Check in") {
                    e.currentTarget.style.backgroundColor = "#7E8C69";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(126, 140, 105, 0.2)";
                  }
                }}
              >
                Check in
              </button>
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                background: "linear-gradient(180deg, rgba(236, 224, 218, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
                borderTop: "2px solid rgba(126, 140, 105, 0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
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
                  padding: "1rem 1.5rem",
                  border: "2px solid rgba(126, 140, 105, 0.2)",
                  borderRadius: "28px",
                  outline: "none",
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
                  backdropFilter: "blur(10px)",
                  color: "#2d3748",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 8px rgba(126, 140, 105, 0.1)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7E8C69";
                  e.target.style.boxShadow = "0 0 0 4px rgba(126, 140, 105, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(126, 140, 105, 0.15)";
                  e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.04)";
                }}
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: isLoading || !input.trim() 
                    ? "linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)" 
                    : "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)",
                  color: "white",
                  border: "none",
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isLoading || !input.trim() 
                    ? "none" 
                    : "0 4px 16px rgba(126, 140, 105, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(126, 140, 105, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(126, 140, 105, 0.3)";
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
