// ============================================
// WEBSOCKET SERVER FOR REAL-TIME CHAT
// Using Socket.IO for live messaging, presence, and real-time updates
// ============================================

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

// Store active connections
const activeUsers = new Map(); // userId -> { socketId, departmentIds, status }
const departmentRooms = new Map(); // departmentId -> Set of socketIds

// ============= CONNECTION HANDLING =============

io.on("connection", (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // User joins (authenticate and join department)
  socket.on("user:join", ({ userId, departmentId, userName, userAvatar }) => {
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, {
        socketId: socket.id,
        departments: new Set([departmentId]),
        status: "online",
        userName,
        userAvatar,
        lastSeen: new Date(),
      });
    } else {
      const userData = activeUsers.get(userId);
      userData.departments.add(departmentId);
      userData.socketId = socket.id;
      userData.status = "online";
    }

    // Join socket room for department
    socket.join(`department:${departmentId}`);
    if (!departmentRooms.has(departmentId)) {
      departmentRooms.set(departmentId, new Set());
    }
    departmentRooms.get(departmentId).add(socket.id);

    // Notify department members of user presence
    io.to(`department:${departmentId}`).emit("presence:update", {
      userId,
      status: "online",
      userName,
      userAvatar,
      timestamp: new Date(),
    });

    console.log(`[Socket] User ${userId} joined department ${departmentId}`);
  });

  // ============= CHAT MESSAGES =============

  socket.on(
    "message:send",
    ({ departmentId, content, mentions, messageId, timestamp }) => {
      // Broadcast to all users in department
      io.to(`department:${departmentId}`).emit("message:received", {
        id: messageId,
        content,
        mentions,
        timestamp,
        sender: activeUsers.get(socket.handshake.auth.userId) || {},
      });

      console.log(
        `[Chat] Message in ${departmentId}: ${content.substring(0, 50)}`,
      );
    },
  );

  socket.on("message:edit", ({ departmentId, messageId, newContent }) => {
    io.to(`department:${departmentId}`).emit("message:edited", {
      messageId,
      newContent,
      editedAt: new Date(),
    });
  });

  socket.on("message:delete", ({ departmentId, messageId }) => {
    io.to(`department:${departmentId}`).emit("message:deleted", {
      messageId,
      deletedAt: new Date(),
    });
  });

  socket.on(
    "message:reaction",
    ({ departmentId, messageId, emoji, userId }) => {
      io.to(`department:${departmentId}`).emit("reaction:added", {
        messageId,
        emoji,
        userId,
        timestamp: new Date(),
      });
    },
  );

  // ============= TYPING INDICATORS =============

  socket.on("typing:start", ({ departmentId, userId, userName }) => {
    io.to(`department:${departmentId}`).emit("typing:indicator", {
      userId,
      userName,
      isTyping: true,
    });
  });

  socket.on("typing:stop", ({ departmentId, userId }) => {
    io.to(`department:${departmentId}`).emit("typing:indicator", {
      userId,
      isTyping: false,
    });
  });

  // ============= PRESENCE & STATUS =============

  socket.on("status:change", ({ userId, status }) => {
    if (activeUsers.has(userId)) {
      const userData = activeUsers.get(userId);
      userData.status = status; // online, away, dnd, busy

      // Broadcast to all departments user is in
      userData.departments.forEach((deptId) => {
        io.to(`department:${deptId}`).emit("presence:update", {
          userId,
          status,
          timestamp: new Date(),
        });
      });
    }
  });

  // ============= MEETINGS & CALLS =============

  socket.on("meeting:create", ({ meetingId, departmentId, meetingData }) => {
    io.to(`department:${departmentId}`).emit("meeting:created", {
      meetingId,
      ...meetingData,
      createdAt: new Date(),
    });
  });

  socket.on("meeting:join", ({ meetingId, userId, userName }) => {
    socket.join(`meeting:${meetingId}`);
    io.to(`meeting:${meetingId}`).emit("meeting:user:joined", {
      userId,
      userName,
      timestamp: new Date(),
      activeUsers: Array.from(
        io.sockets.adapter.rooms.get(`meeting:${meetingId}`) || [],
      ).length,
    });
  });

  socket.on("meeting:leave", ({ meetingId, userId, userName }) => {
    socket.leave(`meeting:${meetingId}`);
    io.to(`meeting:${meetingId}`).emit("meeting:user:left", {
      userId,
      userName,
      timestamp: new Date(),
      activeUsers: Array.from(
        io.sockets.adapter.rooms.get(`meeting:${meetingId}`) || [],
      ).length,
    });
  });

  socket.on("meeting:chat", ({ meetingId, content, userId, userName }) => {
    io.to(`meeting:${meetingId}`).emit("meeting:chat:message", {
      userId,
      userName,
      content,
      timestamp: new Date(),
    });
  });

  socket.on("hand:raise", ({ meetingId, userId, userName }) => {
    io.to(`meeting:${meetingId}`).emit("hand:raised", {
      userId,
      userName,
      timestamp: new Date(),
    });
  });

  socket.on("hand:lower", ({ meetingId, userId }) => {
    io.to(`meeting:${meetingId}`).emit("hand:lowered", { userId });
  });

  socket.on("screen:share:start", ({ meetingId, userId, userName }) => {
    io.to(`meeting:${meetingId}`).emit("screen:sharing:started", {
      userId,
      userName,
      timestamp: new Date(),
    });
  });

  socket.on("screen:share:stop", ({ meetingId, userId }) => {
    io.to(`meeting:${meetingId}`).emit("screen:sharing:stopped", { userId });
  });

  // ============= WHITEBOARD =============

  socket.on("whiteboard:draw", ({ whiteboardId, drawData }) => {
    io.to(`whiteboard:${whiteboardId}`).emit("whiteboard:update", {
      drawData,
      timestamp: new Date(),
    });
  });

  socket.on("whiteboard:clear", ({ whiteboardId }) => {
    io.to(`whiteboard:${whiteboardId}`).emit("whiteboard:cleared", {
      timestamp: new Date(),
    });
  });

  socket.on("whiteboard:join", ({ whiteboardId, userId }) => {
    socket.join(`whiteboard:${whiteboardId}`);
    io.to(`whiteboard:${whiteboardId}`).emit("whiteboard:user:joined", {
      userId,
      timestamp: new Date(),
    });
  });

  // ============= DISCONNECTION =============

  socket.on("disconnect", () => {
    // Find and update user status
    for (const [userId, userData] of activeUsers.entries()) {
      if (userData.socketId === socket.id) {
        if (departmentRooms.has(userId)) {
          departmentRooms.delete(userId);
        }

        // Notify all departments user was in
        userData.departments.forEach((deptId) => {
          io.to(`department:${deptId}`).emit("presence:update", {
            userId,
            status: "offline",
            timestamp: new Date(),
          });
        });

        activeUsers.delete(userId);
        console.log(`[Socket] User ${userId} disconnected`);
        break;
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`[Socket Error] ${socket.id}:`, error);
  });
});

// ============= REST API ENDPOINTS =============

// Get online users in department
app.get("/api/department/:departmentId/online-users", (req, res) => {
  const { departmentId } = req.params;
  const roomSocketIds =
    io.sockets.adapter.rooms.get(`department:${departmentId}`) || new Set();

  const onlineUsers = [];
  for (const [userId, userData] of activeUsers.entries()) {
    if (userData.departments.has(departmentId)) {
      onlineUsers.push({
        userId,
        userName: userData.userName,
        userAvatar: userData.userAvatar,
        status: userData.status,
        lastSeen: userData.lastSeen,
      });
    }
  }

  res.json({ onlineUsers, count: onlineUsers.length });
});

// Get meeting participants
app.get("/api/meeting/:meetingId/participants", (req, res) => {
  const { meetingId } = req.params;
  const roomSocketIds =
    io.sockets.adapter.rooms.get(`meeting:${meetingId}`) || new Set();
  res.json({
    meetingId,
    participantCount: roomSocketIds.size,
    participants: Array.from(roomSocketIds),
  });
});

// Broadcast notification to department
app.post("/api/notify/department", express.json(), (req, res) => {
  const { departmentId, type, data } = req.body;

  io.to(`department:${departmentId}`).emit("notification", {
    type,
    data,
    timestamp: new Date(),
  });

  res.json({ success: true, delivered: true });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeConnections: activeUsers.size,
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[Express Error]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ============= SERVER STARTUP =============

const PORT = process.env.SOCKET_SERVER_PORT || 3001;

server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   WebSocket Server Running              ║
  ║   Port: ${PORT}                           
  ║   Status: Ready for connections        ║
  ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export { io, server, app };
