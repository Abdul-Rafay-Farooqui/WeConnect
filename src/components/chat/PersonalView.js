"use client";

import { useState, useEffect } from "react";

const PersonalView = ({ presence = "available", presenceOptions = [] }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [mutedUntil, setMutedUntil] = useState(null);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const pinnedMessage = selectedChat?.isGroup
    ? {
        text: "Meeting tomorrow at 10 AM. Please confirm attendance.",
        time: "9:00 AM",
        sender: "You",
      }
    : null;

  const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const statuses = [
    {
      id: 1,
      name: "Your Status",
      avatar: "👤",
      hasStory: true,
      isOwn: true,
      time: "2h ago",
    },
    {
      id: 2,
      name: "Alice Johnson",
      avatar: "👩",
      hasStory: true,
      time: "1h ago",
    },
    { id: 3, name: "Bob Smith", avatar: "👨", hasStory: true, time: "3h ago" },
    {
      id: 4,
      name: "Carol Davis",
      avatar: "👩‍💼",
      hasStory: true,
      time: "5h ago",
    },
  ];

  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "👩",
      lastMessage: "Hey! How are you?",
      time: "2:30 PM",
      unread: 2,
      online: true,
      typing: false,
      isGroup: false,
      pinned: true,
    },
    {
      id: 2,
      name: "Bob Smith",
      avatar: "👨",
      lastMessage: "Meeting at 5?",
      time: "1:15 PM",
      unread: 0,
      online: false,
      typing: false,
      isGroup: false,
      pinned: false,
    },
    {
      id: 3,
      name: "Team Alpha",
      avatar: "👥",
      lastMessage: "Sarah: Sounds good!",
      time: "12:45 PM",
      unread: 5,
      online: true,
      typing: true,
      isGroup: true,
      pinned: true,
      members: 12,
    },
    {
      id: 4,
      name: "Carol Davis",
      avatar: "👩‍💼",
      lastMessage: "Thanks for the update",
      time: "Yesterday",
      unread: 0,
      online: true,
      typing: false,
      isGroup: false,
      pinned: false,
    },
    {
      id: 5,
      name: "Dev Team",
      avatar: "💻",
      lastMessage: "John: Pushed the fix",
      time: "Yesterday",
      unread: 1,
      online: false,
      typing: false,
      isGroup: true,
      pinned: false,
      members: 8,
    },
    {
      id: 6,
      name: "Family Group",
      avatar: "👨‍👩‍👧‍👦",
      lastMessage: "Mom: Dinner at 7",
      time: "2 hours ago",
      unread: 0,
      online: false,
      typing: false,
      isGroup: true,
      pinned: true,
      members: 5,
    },
  ]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const archivedChats = [
    {
      id: 7,
      name: "Old Project Group",
      avatar: "📁",
      lastMessage: "Archived chat",
      time: "1 week ago",
      isGroup: true,
      members: 4,
    },
    {
      id: 8,
      name: "Jane Wilson",
      avatar: "👩",
      lastMessage: "Archived",
      time: "2 weeks ago",
      isGroup: false,
    },
  ];
  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const unpinnedChats = filteredChats.filter((chat) => !chat.pinned);
  const starredMessagesList = [
    {
      id: 1,
      chatName: "Alice Johnson",
      text: "Awesome! Let me know if you need help.",
      time: "2:30 PM",
      date: "Today",
    },
    {
      id: 2,
      chatName: "Team Alpha",
      text: "Meeting tomorrow at 10 AM",
      time: "12:45 PM",
      date: "Yesterday",
    },
  ];

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedChat) {
      const chatMessages = {
        1: [
          {
            id: 1,
            sender: "them",
            senderName: "Alice Johnson",
            text: "Hey! How are you?",
            time: "2:28 PM",
            reactions: ["👍", "❤️"],
            read: true,
            starred: false,
          },
          {
            id: 2,
            sender: "me",
            text: "I'm good! Working on the new project.",
            time: "2:29 PM",
            reactions: [],
            read: true,
            starred: false,
          },
          {
            id: 3,
            sender: "them",
            senderName: "Alice Johnson",
            text: "Awesome! Let me know if you need help.",
            time: "2:30 PM",
            reactions: ["🙏"],
            read: true,
            starred: true,
          },
          {
            id: 4,
            sender: "me",
            text: "Will do, thanks!",
            time: "2:31 PM",
            reactions: [],
            replyTo: {
              text: "Awesome! Let me know if you need help.",
              sender: "Alice Johnson",
            },
            read: true,
            starred: false,
          },
        ],
        3: [
          {
            id: 1,
            sender: "them",
            senderName: "Sarah",
            text: "Sounds good!",
            time: "12:45 PM",
            reactions: ["👍"],
            read: true,
            starred: false,
          },
          {
            id: 2,
            sender: "me",
            text: "Great! Let's meet tomorrow",
            time: "12:46 PM",
            reactions: [],
            read: true,
            starred: false,
          },
          {
            id: 3,
            sender: "them",
            senderName: "John",
            text: "I agree 👍",
            time: "12:47 PM",
            reactions: [],
            read: true,
            starred: false,
          },
        ],
      };
      setMessages(chatMessages[selectedChat.id] || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  const handleReaction = (messageId, emoji) => {
    console.log(`Added ${emoji} to message ${messageId}`);
  };

  return (
    <div style={{ display: "flex", height: "100vh", flex: 1 }}>
      {/* Chat List */}
      <div
        style={{
          width: "var(--nav-pane-width)",
          background: "hsl(var(--bg-secondary))",
          borderRight: "1px solid hsl(var(--border-subtle))",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid hsl(var(--border-subtle))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "hsl(var(--text-primary))",
              }}
            >
              Messages
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-ghost"
                style={{ padding: "8px", fontSize: "20px" }}
                onClick={() => setShowNewGroupModal(true)}
                title="New Group"
              >
                👥
              </button>
              <button
                className="btn-ghost"
                style={{ padding: "8px", fontSize: "20px" }}
                onClick={() => setShowNewChatModal(true)}
                title="New Chat"
              >
                ✏️
              </button>
              <button
                className="btn-ghost"
                style={{ padding: "8px", fontSize: "20px" }}
                onClick={() => setShowStatus(!showStatus)}
                title="Stories"
              >
                📸
              </button>
            </div>
          </div>
          {presenceOptions.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                padding: "8px 0",
                borderBottom: "1px solid hsl(var(--border-subtle))",
              }}
            >
              <span
                style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}
              >
                Your status (Teams):
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "hsl(var(--text-primary))",
                }}
              >
                {presenceOptions.find((p) => p.id === presence)?.icon || "🟢"}{" "}
                {presenceOptions.find((p) => p.id === presence)?.label ||
                  "Available"}
              </span>
            </div>
          )}
          <input
            type="text"
            placeholder="Search or start new chat"
            className="input-field"
            style={{ fontSize: "14px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              className="btn-ghost"
              style={{ flex: 1, fontSize: "13px", padding: "8px" }}
              onClick={() => setShowStarredMessages(true)}
            >
              ⭐ Starred
            </button>
            <button
              className="btn-ghost"
              style={{ flex: 1, fontSize: "13px", padding: "8px" }}
              onClick={() => setShowArchived(!showArchived)}
            >
              📦 Archived{" "}
              {archivedChats.length > 0 && `(${archivedChats.length})`}
            </button>
          </div>
        </div>

        {/* Chat Items */}
        <div className="scrollable" style={{ flex: 1 }}>
          {pinnedChats.length > 0 && (
            <>
              <div
                style={{
                  padding: "12px 20px 8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "hsl(var(--text-muted))",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Pinned
              </div>
              {pinnedChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    background:
                      selectedChat?.id === chat.id
                        ? "hsl(var(--bg-tertiary))"
                        : "transparent",
                    borderLeft:
                      selectedChat?.id === chat.id
                        ? "3px solid hsl(var(--accent-primary))"
                        : "3px solid transparent",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "hsl(var(--bg-tertiary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                      }}
                    >
                      {chat.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            color: "hsl(var(--text-primary))",
                          }}
                        >
                          {chat.name}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "hsl(var(--text-muted))",
                          }}
                        >
                          {chat.time}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "hsl(var(--text-secondary))",
                        }}
                      >
                        {chat.lastMessage}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          {unpinnedChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: "16px 20px",
                cursor: "pointer",
                background:
                  selectedChat?.id === chat.id
                    ? "hsl(var(--bg-tertiary))"
                    : "transparent",
                borderLeft:
                  selectedChat?.id === chat.id
                    ? "3px solid hsl(var(--accent-primary))"
                    : "3px solid transparent",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "hsl(var(--bg-tertiary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  {chat.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        color: "hsl(var(--text-primary))",
                      }}
                    >
                      {chat.name}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      {chat.time}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "hsl(var(--text-secondary))",
                    }}
                  >
                    {chat.lastMessage}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "hsl(var(--bg-primary))",
        }}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid hsl(var(--border-subtle))",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "hsl(var(--bg-secondary))",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "hsl(var(--bg-tertiary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {selectedChat.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "hsl(var(--text-primary))",
                  }}
                >
                  {selectedChat.name}
                </div>
                <div
                  style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}
                >
                  🟢 Online
                </div>
              </div>
              <button className="btn-ghost" style={{ padding: "8px 12px" }}>
                📞
              </button>
              <button className="btn-ghost" style={{ padding: "8px 12px" }}>
                📹
              </button>
            </div>

            {/* Messages */}
            <div
              className="scrollable"
              style={{
                flex: 1,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.sender === "me" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className="glass"
                    style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      background:
                        msg.sender === "me"
                          ? "hsl(var(--accent-primary))"
                          : "var(--glass-bg)",
                      color:
                        msg.sender === "me"
                          ? "hsl(220 25% 8%)"
                          : "hsl(var(--text-primary))",
                      maxWidth: "60%",
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        fontSize: "11px",
                        marginTop: "4px",
                        opacity: 0.7,
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              style={{
                padding: "20px 24px",
                borderTop: "1px solid hsl(var(--border-subtle))",
                background: "hsl(var(--bg-secondary))",
              }}
            >
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <button className="btn-ghost" style={{ padding: "10px" }}>
                  📎
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input-field"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn-ghost" style={{ padding: "10px" }}>
                  😊
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: "10px 20px" }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex-center"
            style={{ flex: 1, flexDirection: "column" }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>💬</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "hsl(var(--text-secondary))",
              }}
            >
              Select a conversation
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalView;
