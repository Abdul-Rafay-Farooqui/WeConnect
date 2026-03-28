// ============================================
// WEBSOCKET HOOKS FOR REAL-TIME UPDATES
// ============================================

import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
    socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
};

// ============= useChat Hook =============

export function useChat(departmentId, userId, userName) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    // Connect and join department
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("user:join", { userId, departmentId, userName });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Receive messages
    socket.on("message:received", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Message edited
    socket.on("message:edited", ({ messageId, newContent, editedAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, edited_at: editedAt }
            : msg,
        ),
      );
    });

    // Message deleted
    socket.on("message:deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    // Reaction added
    socket.on("reaction:added", ({ messageId, emoji, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: [...(msg.reactions || []), { emoji, userId }],
              }
            : msg,
        ),
      );
    });

    // Typing indicator
    socket.on("typing:indicator", ({ userId, userName, isTyping }) => {
      setTyping((prev) => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter((name) => name !== userName);
        }
      });
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [departmentId, userId, userName]);

  const sendMessage = useCallback(
    (content, mentions = []) => {
      if (socketRef.current) {
        socketRef.current.emit("message:send", {
          departmentId,
          content,
          mentions,
          messageId: `msg-${Date.now()}`,
          timestamp: new Date(),
        });
      }
    },
    [departmentId],
  );

  const startTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("typing:start", {
        departmentId,
        userId,
        userName,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("typing:stop", { departmentId, userId });
      }, 1000);
    }
  }, [departmentId, userId, userName]);

  const addReaction = useCallback(
    (messageId, emoji) => {
      if (socketRef.current) {
        socketRef.current.emit("message:reaction", {
          departmentId,
          messageId,
          emoji,
          userId,
        });
      }
    },
    [departmentId, userId],
  );

  return {
    messages,
    typing,
    connected,
    sendMessage,
    startTyping,
    addReaction,
  };
}

// ============= useMeeting Hook =============

export function useMeeting(meetingId, userId, userName) {
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [handsRaised, setHandsRaised] = useState([]);
  const [screenSharing, setScreenSharing] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.on("meeting:user:joined", ({ userId, userName, activeUsers }) => {
      setParticipants((prev) => [
        ...prev,
        { userId, userName, joinedAt: new Date(), status: "connected" },
      ]);
    });

    socket.on("meeting:user:left", ({ userId, activeUsers }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
    });

    socket.on(
      "meeting:chat:message",
      ({ userId, userName, content, timestamp }) => {
        setChatMessages((prev) => [
          ...prev,
          { userId, userName, content, timestamp },
        ]);
      },
    );

    socket.on("hand:raised", ({ userId, userName }) => {
      setHandsRaised((prev) => [...prev, { userId, userName }]);
    });

    socket.on("hand:lowered", ({ userId }) => {
      setHandsRaised((prev) => prev.filter((h) => h.userId !== userId));
    });

    socket.on("screen:sharing:started", ({ userId, userName }) => {
      setScreenSharing({ userId, userName });
    });

    socket.on("screen:sharing:stopped", ({ userId }) => {
      setScreenSharing(null);
    });

    return () => {
      socket.off("meeting:user:joined");
      socket.off("meeting:user:left");
      socket.off("meeting:chat:message");
      socket.off("hand:raised");
      socket.off("hand:lowered");
      socket.off("screen:sharing:started");
      socket.off("screen:sharing:stopped");
    };
  }, [meetingId]);

  const joinMeeting = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("meeting:join", { meetingId, userId, userName });
    }
  }, [meetingId, userId, userName]);

  const leaveMeeting = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("meeting:leave", { meetingId, userId, userName });
    }
  }, [meetingId, userId, userName]);

  const sendMeetingChat = useCallback(
    (content) => {
      if (socketRef.current) {
        socketRef.current.emit("meeting:chat", {
          meetingId,
          content,
          userId,
          userName,
        });
      }
    },
    [meetingId, userId, userName],
  );

  const raiseHand = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("hand:raise", { meetingId, userId, userName });
    }
  }, [meetingId, userId, userName]);

  const lowerHand = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("hand:lower", { meetingId, userId });
    }
  }, [meetingId, userId]);

  const startScreenShare = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("screen:share:start", {
        meetingId,
        userId,
        userName,
      });
    }
  }, [meetingId, userId, userName]);

  const stopScreenShare = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("screen:share:stop", { meetingId, userId });
    }
  }, [meetingId, userId]);

  return {
    participants,
    chatMessages,
    handsRaised,
    screenSharing,
    joinMeeting,
    leaveMeeting,
    sendMeetingChat,
    raiseHand,
    lowerHand,
    startScreenShare,
    stopScreenShare,
  };
}

// ============= usePresence Hook =============

export function usePresence(userId, departmentId) {
  const [status, setStatus] = useState("online");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.on(
      "presence:update",
      ({ userId: updatedUserId, status, ...data }) => {
        if (updatedUserId !== userId) {
          setOnlineUsers((prev) => {
            const filtered = prev.filter((u) => u.userId !== updatedUserId);
            if (status === "online") {
              return [...filtered, { userId: updatedUserId, status, ...data }];
            }
            return filtered;
          });
        }
      },
    );

    return () => {
      socket.off("presence:update");
    };
  }, [userId, departmentId]);

  const changeStatus = useCallback(
    (newStatus) => {
      setStatus(newStatus);
      if (socketRef.current) {
        socketRef.current.emit("status:change", { userId, status: newStatus });
      }
    },
    [userId],
  );

  return { status, onlineUsers, changeStatus };
}

// ============= useWhiteboard Hook =============

export function useWhiteboard(whiteboardId, userId) {
  const [canvasData, setCanvasData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.emit("whiteboard:join", { whiteboardId, userId });

    socket.on("whiteboard:update", ({ drawData, timestamp }) => {
      setCanvasData(drawData);
    });

    socket.on("whiteboard:cleared", ({ timestamp }) => {
      setCanvasData(null);
    });

    socket.on("whiteboard:user:joined", ({ userId, timestamp }) => {
      setParticipants((prev) => [...prev, { userId, joinedAt: timestamp }]);
    });

    return () => {
      socket.off("whiteboard:update");
      socket.off("whiteboard:cleared");
      socket.off("whiteboard:user:joined");
    };
  }, [whiteboardId, userId]);

  const draw = useCallback(
    (drawData) => {
      if (socketRef.current) {
        socketRef.current.emit("whiteboard:draw", { whiteboardId, drawData });
      }
    },
    [whiteboardId],
  );

  const clear = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("whiteboard:clear", { whiteboardId });
    }
  }, [whiteboardId]);

  return { canvasData, participants, draw, clear };
}

// ============= useNotifications Hook =============

export function useNotifications(departmentId) {
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.on("notification", ({ type, data, timestamp }) => {
      setNotifications((prev) => [
        ...prev,
        { id: `notif-${Date.now()}`, type, data, timestamp, read: false },
      ]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== `notif-${Date.now()}`),
        );
      }, 5000);
    });

    return () => {
      socket.off("notification");
    };
  }, [departmentId]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, []);

  return { notifications, markAsRead };
}

export default {
  useChat,
  useMeeting,
  usePresence,
  useWhiteboard,
  useNotifications,
};
