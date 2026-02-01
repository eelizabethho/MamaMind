"use client";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Page() {
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
          {/* Incoming Message 1 */}
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
                maxWidth: "70%",
                color: "#2d3748",
                fontSize: "0.9rem",
              }}
            >
              It's okay to feel overwhelmed. Your village is here to support you.
            </div>
          </div>

          {/* Outgoing Message 1 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                backgroundColor: "#90cdf4",
                padding: "0.75rem 1rem",
                borderRadius: "16px",
                maxWidth: "70%",
                color: "#1a202c",
                fontSize: "0.9rem",
              }}
            >
              Thank you, I really appreciate that.
            </div>
          </div>

          {/* Incoming Message 2 */}
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
                maxWidth: "70%",
                color: "#2d3748",
                fontSize: "0.9rem",
              }}
            >
              Remember, you're doing great. Take it one step at a time.
            </div>
          </div>

          {/* Outgoing Message 2 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                backgroundColor: "#90cdf4",
                padding: "0.75rem 1rem",
                borderRadius: "16px",
                maxWidth: "70%",
                color: "#1a202c",
                fontSize: "0.9rem",
              }}
            >
              Help me plan my day
            </div>
          </div>
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
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#d69e2e",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            I need a break
          </button>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#90cdf4",
              color: "#1a202c",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Help with mind planning
          </button>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#90cdf4",
              color: "#1a202c",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Connect me to my village
          </button>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#90cdf4",
              color: "#1a202c",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
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
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              border: "none",
              borderRadius: "24px",
              outline: "none",
              fontSize: "0.9rem",
              backgroundColor: "white",
              color: "#2d3748",
            }}
          />

          {/* Send Button */}
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#9f7aea",
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
