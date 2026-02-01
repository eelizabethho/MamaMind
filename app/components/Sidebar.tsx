"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ProfilePictureEditor from "./ProfilePictureEditor";

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
  messages?: any[]; // Full conversation messages
  therapistId?: string; // Therapist ID
}

interface SidebarProps {
  onQuickActionClick?: (action: string) => void;
  selectedAction?: string | null;
  onTherapistSelect?: (therapist: Therapist | null) => void;
  selectedTherapist?: Therapist | null;
  pastChats?: PastChat[];
  onNewChat?: () => void;
  onChatSelect?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
}

export default function Sidebar({ onQuickActionClick, selectedAction, onTherapistSelect, selectedTherapist, pastChats = [], onNewChat, onChatSelect, onChatDelete }: SidebarProps) {
  const { data: session } = useSession();
  const [customProfileImage, setCustomProfileImage] = useState<string | null>(null);
  
  // Get first name from full name
  const firstName = session?.user?.name?.split(" ")[0] || null;

  // Load custom profile image from localStorage on mount
  useEffect(() => {
    if (session?.user?.email) {
      const savedImage = localStorage.getItem(`profile_image_${session.user.email}`);
      if (savedImage) {
        setCustomProfileImage(savedImage);
      }
    }
  }, [session?.user?.email]);

  // Save custom profile image to localStorage
  const handleImageChange = (imageUrl: string) => {
    setCustomProfileImage(imageUrl);
    if (session?.user?.email) {
      localStorage.setItem(`profile_image_${session.user.email}`, imageUrl);
    }
  };

  // Use custom image if available, otherwise use Google image
  const displayImage = customProfileImage || session?.user?.image || null;

  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        width: "360px",
        background: "linear-gradient(180deg, #ECE0DA 0%, #F1C8CB 100%)",
        borderRight: "2px solid rgba(126, 140, 105, 0.15)",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        height: "100%",
        overflowY: "auto",
        boxShadow: "4px 0 20px rgba(126, 140, 105, 0.08)",
      }}
    >
      {/* User Profile */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          padding: "1.5rem",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(126, 140, 105, 0.2)",
          boxShadow: "0 4px 12px rgba(126, 140, 105, 0.1)",
        }}
      >
        <ProfilePictureEditor
          currentImage={displayImage}
          onImageChange={handleImageChange}
          userName={session?.user?.name || null}
        />
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "1.75rem",
              fontFamily: "var(--font-dancing), cursive",
              fontWeight: "600",
              color: "#2d3748",
              margin: 0,
            }}
          >
            {firstName ? `Welcome ${firstName}!` : "Welcome!"}
          </h3>
        </div>
        <button
          onClick={onNewChat}
          style={{
            padding: "0.875rem 1.5rem",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)",
            color: "white",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%",
            boxShadow: "0 4px 12px rgba(126, 140, 105, 0.3)",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #9CAD8C 0%, #7E8C69 100%)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(126, 140, 105, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #7E8C69 0%, #9CAD8C 100%)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(126, 140, 105, 0.3)";
          }}
        >
          + New Chat
        </button>
      </div>

      {/* Choose Your Therapist */}
      <div>
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: "700",
            color: "#7E8C69",
            marginBottom: "1.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
          }}
        >
          Choose Your Therapist
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {therapists.map((therapist) => (
            <button
              key={therapist.id}
              onClick={() => onTherapistSelect?.(selectedTherapist?.id === therapist.id ? null : therapist)}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "50%",
                border: selectedTherapist?.id === therapist.id ? "3px solid #7E8C69" : "2px solid rgba(126, 140, 105, 0.2)",
                background: selectedTherapist?.id === therapist.id 
                  ? "linear-gradient(135deg, #F6B0BB 0%, #F1C8CB 100%)" 
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                color: "#2d3748",
                fontSize: "0.85rem",
                fontWeight: selectedTherapist?.id === therapist.id ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem",
                boxShadow: selectedTherapist?.id === therapist.id 
                  ? "0 4px 16px rgba(246, 176, 187, 0.4), 0 2px 8px rgba(126, 140, 105, 0.2)" 
                  : "0 2px 8px rgba(126, 140, 105, 0.1)",
              }}
              onMouseEnter={(e) => {
                if (selectedTherapist?.id !== therapist.id) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #F6B0BB 0%, #F1C8CB 100%)";
                  e.currentTarget.style.borderColor = "#7E8C69";
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(246, 176, 187, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTherapist?.id !== therapist.id) {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)";
                  e.currentTarget.style.borderColor = "rgba(126, 140, 105, 0.2)";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(126, 140, 105, 0.1)";
                }
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                {therapist.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#718096", textAlign: "center", lineHeight: "1.2" }}>
                {therapist.style}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: "700",
            color: "#7E8C69",
            marginBottom: "1.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
          }}
        >
          Recent Activity
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {pastChats.length > 0 ? (
            pastChats.map((chat) => {
              const timeAgo = getTimeAgo(chat.timestamp);
              return (
                <div
                  key={chat.id}
                  style={{
                    padding: "1rem",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "14px",
                    border: "1px solid rgba(126, 140, 105, 0.2)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    boxShadow: "0 2px 8px rgba(126, 140, 105, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#7E8C69";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(246, 176, 187, 0.25)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #F6B0BB 0%, #F1C8CB 100%)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(126, 140, 105, 0.2)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(126, 140, 105, 0.1)";
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onClick={() => onChatSelect && onChatSelect(chat.id)}
                >
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#2d3748",
                      marginBottom: "0.25rem",
                      paddingRight: "2rem", // Make room for delete button
                    }}
                  >
                    {chat.summary}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#718096",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{timeAgo}</span>
                    {chat.therapistName && (
                      <span style={{ fontSize: "0.7rem", color: "#7E8C69" }}>
                        with {chat.therapistName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the chat load
                      if (window.confirm("Are you sure you want to delete this chat?")) {
                        onChatDelete && onChatDelete(chat.id);
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "none",
                      border: "none",
                      color: "#F6B0BB",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      padding: "0.25rem",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      width: "24px",
                      height: "24px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F1C8CB";
                      e.currentTarget.style.color = "#F6B0BB";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    title="Delete chat"
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "white",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "0.875rem",
                color: "#718096",
                textAlign: "center",
              }}
            >
              No recent chats yet
            </div>
          )}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: "700",
            color: "#7E8C69",
            marginBottom: "1.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
          }}
        >
          🌸 Resources
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <a
            href="https://www.postpartum.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: "14px",
              border: "1px solid rgba(126, 140, 105, 0.2)",
              textDecoration: "none",
              color: "#2d3748",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "block",
              boxShadow: "0 2px 8px rgba(126, 140, 105, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#7E8C69";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(246, 176, 187, 0.25)";
              e.currentTarget.style.background = "linear-gradient(135deg, #F6B0BB 0%, #F1C8CB 100%)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(126, 140, 105, 0.2)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(126, 140, 105, 0.1)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#7E8C69",
                marginBottom: "0.25rem",
              }}
            >
              Postpartum Support International
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#718096",
                marginBottom: "0.25rem",
              }}
            >
              👉 https://www.postpartum.net
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#4a5568",
                lineHeight: "1.4",
              }}
            >
              Best all-around resource for new moms: mental health, hotlines, local support, education.
            </div>
          </a>

          <a
            href="https://www.mother.ly"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: "14px",
              border: "1px solid rgba(126, 140, 105, 0.2)",
              textDecoration: "none",
              color: "#2d3748",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "block",
              boxShadow: "0 2px 8px rgba(126, 140, 105, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#7E8C69";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(246, 176, 187, 0.25)";
              e.currentTarget.style.background = "linear-gradient(135deg, #F6B0BB 0%, #F1C8CB 100%)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(126, 140, 105, 0.2)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(126, 140, 105, 0.1)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#7E8C69",
                marginBottom: "0.25rem",
              }}
            >
              🛠️ Help Center
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#718096",
                marginBottom: "0.25rem",
              }}
            >
              Motherly – Help & Wellness Content
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#718096",
                marginBottom: "0.25rem",
              }}
            >
              👉 https://www.mother.ly
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#4a5568",
                lineHeight: "1.4",
              }}
            >
              Easy-to-read guidance, FAQs, and supportive articles for new and expecting moms.
            </div>
          </a>

          <a
            href="https://www.peanut-app.io/community-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: "14px",
              border: "1px solid rgba(126, 140, 105, 0.2)",
              textDecoration: "none",
              color: "#2d3748",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "block",
              boxShadow: "0 2px 8px rgba(126, 140, 105, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#7E8C69";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(246, 176, 187, 0.25)";
              e.currentTarget.style.background = "linear-gradient(135deg, #F6B0BB 0%, #F1C8CB 100%)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(126, 140, 105, 0.2)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(126, 140, 105, 0.1)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#7E8C69",
                marginBottom: "0.25rem",
              }}
            >
              🤍 Community Guidelines
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#718096",
                marginBottom: "0.25rem",
              }}
            >
              Peanut App – Community Guidelines
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#718096",
                marginBottom: "0.25rem",
              }}
            >
              👉 https://www.peanut-app.io/community-guidelines
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#4a5568",
                lineHeight: "1.4",
              }}
            >
              A well-known mom community with clear, kind, safety-focused rules you can model after.
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
