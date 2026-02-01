"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ProfilePictureEditor from "./ProfilePictureEditor";

export default function Sidebar() {
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

  return (
    <div
      style={{
        width: "300px",
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #e2e8f0",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* User Profile */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
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
              fontSize: "1.2rem",
              fontFamily: "var(--font-dancing), cursive",
              fontWeight: "600",
              color: "#2d3748",
              margin: 0,
            }}
          >
            {firstName ? `Welcome ${firstName}!` : "Welcome!"}
          </h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#4a5568",
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Quick Actions
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <button
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#d69e2e",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#c0841c";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#d69e2e";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            I need a break
          </button>
          <button
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#90cdf4",
              color: "#1a202c",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#7bb8e8";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#90cdf4";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            Help with mind planning
          </button>
          <button
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#90cdf4",
              color: "#1a202c",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#7bb8e8";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#90cdf4";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            Connect me to my village
          </button>
          <button
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#90cdf4",
              color: "#1a202c",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#7bb8e8";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#90cdf4";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            Check in
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#4a5568",
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
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
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "white",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#614051";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(97, 64, 81, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#2d3748",
                marginBottom: "0.25rem",
              }}
            >
              Chat with Support
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#718096",
              }}
            >
              2 hours ago
            </div>
          </div>
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "white",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#614051";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(97, 64, 81, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#2d3748",
                marginBottom: "0.25rem",
              }}
            >
              Daily Check-in
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#718096",
              }}
            >
              Yesterday
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#4a5568",
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Resources
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <a
            href="#"
            style={{
              fontSize: "0.875rem",
              color: "#614051",
              textDecoration: "none",
              padding: "0.5rem 0",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#4a2d3f";
              e.currentTarget.style.paddingLeft = "8px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#614051";
              e.currentTarget.style.paddingLeft = "0";
            }}
          >
            Help Center
          </a>
          <a
            href="#"
            style={{
              fontSize: "0.875rem",
              color: "#614051",
              textDecoration: "none",
              padding: "0.5rem 0",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#4a2d3f";
              e.currentTarget.style.paddingLeft = "8px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#614051";
              e.currentTarget.style.paddingLeft = "0";
            }}
          >
            Community Guidelines
          </a>
          <a
            href="#"
            style={{
              fontSize: "0.875rem",
              color: "#614051",
              textDecoration: "none",
              padding: "0.5rem 0",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#4a2d3f";
              e.currentTarget.style.paddingLeft = "8px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#614051";
              e.currentTarget.style.paddingLeft = "0";
            }}
          >
            Wellness Tips
          </a>
        </div>
      </div>
    </div>
  );
}
