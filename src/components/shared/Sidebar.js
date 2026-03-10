"use client";

import { useState } from "react";
import Link from "next/link";
import Notifications from "./Notifications";

const Sidebar = ({
  currentPage = "chat",
  presence,
  setPresence,
  presenceOptions,
  currentPresenceOption,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPresenceMenu, setShowPresenceMenu] = useState(false);
  const notificationCount = 3;

  const modes = [
    {
      id: "chat",
      icon: "💬",
      label: "Personal",
      color: "var(--accent-primary)",
      href: "/chat",
    },
    {
      id: "organization",
      icon: "🏢",
      label: "Organization",
      color: "var(--accent-tertiary)",
      href: "/organization",
    },
    {
      id: "institute",
      icon: "🎓",
      label: "Institute",
      color: "var(--accent-secondary)",
      href: "/institute",
    },
  ];

  return (
    <div
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        background: "hsl(var(--bg-secondary))",
        borderRight: "1px solid hsl(var(--border-subtle))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: "12px",
      }}
    >
      {/* Logo */}
      <Link href="/chat">
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background:
              "linear-gradient(135deg, hsl(var(--accent-primary)) 0%, hsl(var(--accent-secondary)) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "800",
            color: "white",
            marginBottom: "20px",
            cursor: "pointer",
            transition: "transform var(--transition-fast)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          W
        </div>
      </Link>

      {/* Teams-style presence status */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <button
          onClick={() => setShowPresenceMenu(!showPresenceMenu)}
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--bg-tertiary))",
            border: "1px solid hsl(var(--border-subtle))",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            transition: "all var(--transition-fast)",
          }}
          title={`Status: ${currentPresenceOption?.label || "Available"} (Teams)`}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--bg-glass))";
            e.currentTarget.style.borderColor = "hsl(var(--border-medium))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "hsl(var(--bg-tertiary))";
            e.currentTarget.style.borderColor = "hsl(var(--border-subtle))";
          }}
        >
          <span style={{ fontSize: "18px" }}>
            {currentPresenceOption?.icon || "🟢"}
          </span>
          <span
            style={{
              fontSize: "9px",
              color: "hsl(var(--text-muted))",
              maxWidth: "48px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Status
          </span>
        </button>
        {showPresenceMenu && presenceOptions && (
          <div
            style={{
              position: "fixed",
              left: "var(--sidebar-width)",
              top: "100px",
              width: "220px",
              background: "hsl(var(--bg-secondary))",
              border: "1px solid hsl(var(--border-subtle))",
              borderRadius: "var(--radius-md)",
              padding: "8px",
              zIndex: 1001,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "hsl(var(--text-muted))",
                textTransform: "uppercase",
                padding: "8px",
                marginBottom: "4px",
              }}
            >
              Set status (Teams)
            </div>
            {presenceOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setPresence(opt.id);
                  setShowPresenceMenu(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background:
                    presence === opt.id
                      ? "hsl(var(--bg-tertiary))"
                      : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "hsl(var(--text-primary))",
                  fontSize: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "16px" }}>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mode Buttons */}
      {modes.map((mode) => (
        <Link key={mode.id} href={mode.href} style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "var(--radius-md)",
              background:
                currentPage === mode.id
                  ? `hsl(${mode.color})`
                  : "hsl(var(--bg-tertiary))",
              border:
                currentPage === mode.id
                  ? "none"
                  : "1px solid hsl(var(--border-subtle))",
              color:
                currentPage === mode.id
                  ? "hsl(220 25% 8%)"
                  : "hsl(var(--text-secondary))",
              fontSize: "24px",
              cursor: "pointer",
              transition: "all var(--transition-base)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== mode.id) {
                e.currentTarget.style.background = "hsl(var(--bg-glass))";
                e.currentTarget.style.borderColor = "hsl(var(--border-medium))";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== mode.id) {
                e.currentTarget.style.background = "hsl(var(--bg-tertiary))";
                e.currentTarget.style.borderColor = "hsl(var(--border-subtle))";
              }
            }}
            title={mode.label}
          >
            {mode.icon}
            {currentPage === mode.id && (
              <div
                style={{
                  position: "absolute",
                  right: "-4px",
                  width: "4px",
                  height: "70%",
                  background: `hsl(${mode.color})`,
                  borderRadius: "4px 0 0 4px",
                }}
              />
            )}
          </button>
        </Link>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Notifications Button */}
      <button
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          border: "1px solid hsl(var(--border-subtle))",
          color: "hsl(var(--text-secondary))",
          fontSize: "20px",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        onClick={() => setShowNotifications(!showNotifications)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "hsl(var(--bg-tertiary))";
          e.currentTarget.style.color = "hsl(var(--text-primary))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "hsl(var(--text-secondary))";
        }}
        title="Notifications"
      >
        🔔
        {notificationCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "hsl(var(--accent-warning))",
              color: "white",
              fontSize: "10px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid hsl(var(--bg-secondary))",
            }}
          >
            {notificationCount}
          </div>
        )}
      </button>

      {/* Profile Button */}
      <button
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          border: "1px solid hsl(var(--border-subtle))",
          color: "hsl(var(--text-secondary))",
          fontSize: "20px",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setShowProfile(!showProfile)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "hsl(var(--bg-tertiary))";
          e.currentTarget.style.color = "hsl(var(--text-primary))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "hsl(var(--text-secondary))";
        }}
        title="Profile"
      >
        👤
      </button>

      {/* Settings Button */}
      <button
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          border: "1px solid hsl(var(--border-subtle))",
          color: "hsl(var(--text-secondary))",
          fontSize: "20px",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "hsl(var(--bg-tertiary))";
          e.currentTarget.style.color = "hsl(var(--text-primary))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "hsl(var(--text-secondary))";
        }}
        title="Settings"
      >
        ⚙️
      </button>

      {/* Notifications Panel */}
      <Notifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Profile Panel */}
      {showProfile && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "var(--sidebar-width)",
            width: "320px",
            background: "hsl(var(--bg-secondary))",
            border: "1px solid hsl(var(--border-subtle))",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, hsl(var(--accent-primary)) 0%, hsl(var(--accent-secondary)) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 12px",
              }}
            >
              👤
            </div>
            <div
              style={{
                fontWeight: "600",
                fontSize: "18px",
                color: "hsl(var(--text-primary))",
                marginBottom: "4px",
              }}
            >
              John Doe
            </div>
            <div style={{ fontSize: "14px", color: "hsl(var(--text-muted))" }}>
              john.doe@example.com
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              className="btn-ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "12px",
              }}
            >
              👤 Edit Profile
            </button>
            <button
              className="btn-ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "12px",
              }}
            >
              🔒 Privacy & Security
            </button>
            <button
              className="btn-ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "12px",
              }}
            >
              🎨 Appearance
            </button>
            <button
              className="btn-ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "12px",
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
