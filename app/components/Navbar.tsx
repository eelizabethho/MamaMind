"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [customProfileImage, setCustomProfileImage] = useState<string | null>(null);

  // Load custom profile image from localStorage
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
  return (
    <nav
      style={{
        background: "#614051",
        padding: "1rem 3rem",
        boxShadow: "0 4px 20px rgba(97, 64, 81, 0.4)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          textDecoration: "none",
          flex: 1,
        }}
        onMouseEnter={(e) => {
          const text = e.currentTarget.querySelector("span");
          if (text) {
            text.style.transform = "scale(1.05)";
            text.style.color = "#ffffff";
          }
          const logo = e.currentTarget.querySelector("div");
          if (logo) {
            logo.style.transform = "scale(1.05)";
            logo.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          const text = e.currentTarget.querySelector("span");
          if (text) {
            text.style.transform = "scale(1)";
            text.style.color = "#f5f5f0";
          }
          const logo = e.currentTarget.querySelector("div");
          if (logo) {
            logo.style.transform = "scale(1)";
            logo.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            overflow: "hidden",
            width: "50px",
            height: "50px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="Avec Ma Logo"
            width={50}
            height={50}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        
        {/* Brand Name */}
        <span
          style={{
            fontSize: "1.8rem",
            fontFamily: "var(--font-dancing), cursive",
            fontWeight: "600",
            color: "#f5f5f0",
            letterSpacing: "0.02em",
            cursor: "pointer",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontStyle: "normal",
          }}
        >
          Avec Ma
        </span>
      </Link>
      
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "0.9rem",
            fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: "500",
            padding: "0.625rem 1.25rem",
            borderRadius: "12px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Home
        </Link>
        <Link
          href="/gemini"
          style={{
            textDecoration: "none",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: "600",
            padding: "0.625rem 1.25rem",
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
          }}
        >
          Chat
        </Link>
        <Link
          href="/chat"
          style={{
            textDecoration: "none",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "0.9rem",
            fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: "500",
            padding: "0.625rem 1.25rem",
            borderRadius: "12px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Messages
        </Link>
        {session ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {displayImage && (
              <Image
                src={displayImage}
                alt={session.user?.name || "User"}
                width={40}
                height={40}
                style={{
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            )}
            <button
              onClick={() => signOut()}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.15)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
