"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  label: "Home" | "Chat" | "Calendar" | "Mood" | "Finance";
  href: string;
};

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [customProfileImage, setCustomProfileImage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (session?.user?.email) {
      const savedImage = localStorage.getItem(
        `profile_image_${session.user.email}`,
      );
      if (savedImage) setCustomProfileImage(savedImage);
    } else {
      setCustomProfileImage(null);
    }
  }, [session?.user?.email]);

  const displayImage = customProfileImage || session?.user?.image || null;

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Chat", href: "/gemini" },
      { label: "Calendar", href: "/calendar" },
      { label: "Mood", href: "/mood" },
      { label: "Finance", href: "/finance" },
    ],
    [],
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const baseLinkStyle: React.CSSProperties = {
    textDecoration: "none",
    fontSize: "0.9rem",
    fontFamily:
      "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 500,
    padding: "0.625rem 1.25rem",
    borderRadius: "12px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.85)",
  };

  const activeLinkStyle: React.CSSProperties = {
    ...baseLinkStyle,
    color: "white",
    fontWeight: 600,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow:
      "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  };

  const handleHoverIn = (el: HTMLElement, active: boolean) => {
    if (active) {
      el.style.background =
        "linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.20) 100%)";
      el.style.borderColor = "rgba(255, 255, 255, 0.4)";
      el.style.transform = "translateY(-2px)";
      el.style.boxShadow =
        "0 6px 18px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
    } else {
      el.style.color = "white";
      el.style.background = "rgba(255, 255, 255, 0.18)";
      el.style.borderColor = "rgba(255, 255, 255, 0.25)";
      el.style.transform = "translateY(-2px)";
      el.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
    }
  };

  const handleHoverOut = (el: HTMLElement, active: boolean) => {
    if (active) {
      el.style.background =
        "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)";
      el.style.borderColor = "rgba(255, 255, 255, 0.3)";
      el.style.transform = "translateY(0)";
      el.style.boxShadow =
        "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
    } else {
      el.style.color = "rgba(255, 255, 255, 0.85)";
      el.style.background = "rgba(255, 255, 255, 0.08)";
      el.style.borderColor = "rgba(255, 255, 255, 0.12)";
      el.style.transform = "translateY(0)";
      el.style.boxShadow = "none";
    }
  };

  const handleSignOut = async () => {
    const email = session?.user?.email;

    // ✅ Reset user-scoped local data on sign-out
    if (email) {
      try {
        localStorage.removeItem(`profile_image_${email}`);
        localStorage.removeItem(`past_chats_${email}`);
        localStorage.removeItem(`avecma_calendar_events_v1_${email}`);
      } catch {}
    }

    await signOut();
  };

  return (
    <nav
      style={{
        background: "#51295b",
        padding: "0.5rem 3rem",
        boxShadow: "0 4px 20px rgba(97, 64, 81, 0.4)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        minHeight: "70px",
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
            (text as HTMLElement).style.transform = "scale(1.05)";
            (text as HTMLElement).style.color = "#ffffff";
          }
          const logo = e.currentTarget.querySelector("div");
          if (logo) {
            (logo as HTMLElement).style.transform = "scale(1.05)";
            (logo as HTMLElement).style.borderColor =
              "rgba(255, 255, 255, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          const text = e.currentTarget.querySelector("span");
          if (text) {
            (text as HTMLElement).style.transform = "scale(1)";
            (text as HTMLElement).style.color = "#f5f5f0";
          }
          const logo = e.currentTarget.querySelector("div");
          if (logo) {
            (logo as HTMLElement).style.transform = "scale(1)";
            (logo as HTMLElement).style.borderColor =
              "rgba(255, 255, 255, 0.2)";
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            overflow: "hidden",
            width: "70px",
            height: "70px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="Avec Ma Logo"
            width={70}
            height={70}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>

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
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={active ? activeLinkStyle : baseLinkStyle}
              onMouseEnter={(e) =>
                handleHoverIn(e.currentTarget as unknown as HTMLElement, active)
              }
              onMouseLeave={(e) =>
                handleHoverOut(
                  e.currentTarget as unknown as HTMLElement,
                  active,
                )
              }
            >
              {item.label}
            </Link>
          );
        })}

        {session ? (
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {displayImage && (
              <Image
                src={displayImage}
                alt={session.user?.name || "User"}
                width={55}
                height={55}
                style={{
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            )}
            <button
              onClick={handleSignOut}
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
