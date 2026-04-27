# Quick Backend Fix - Meeting Not Working

## Problem
Users can join meeting but don't see each other. Debug shows:
- Local Stream: ✅
- Socket Connected: ✅
- Peers: 0 ❌
- Remote Streams: 0 ❌

## Root Cause
Backend is not emitting `meeting:user-joined` event when users join the meeting.

## Quick Fix (5 minutes)

### Step 1: Find your socket handler file
Look for where you handle socket connections, probably something like:
- `server/socket.js`
- `server/sockets/meeting.js`
- `src/socket/handlers.js`

### Step 2: Add this code

```javascript
// When user joins meeting
socket.on('meeting:join', async ({ meeting_id, organization_id, team_id }) => {
  console.log('User joining meeting:', {
    userId: socket.userId, // or however you store user ID
    meetingId: meeting_id
  });

  // Join the socket room
  const roomName = `meeting:${meeting_id}`;
  socket.join(roomName);

  // CRITICAL: Broadcast to ALL users in the room (including the joiner)
  io.to(roomName).emit('meeting:user-joined', {
    user_id: socket.userId, // The user who just joined
    participants: [] // Can be empty for now
  });

  console.log('Emitted meeting:user-joined to room:', roomName);
});

// When user requests participants
socket.on('meeting:get-participants', ({ meeting_id }) => {
  const roomName = `meeting:${meeting_id}`;
  
  // Get all sockets in the room
  const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
  const participants = [];
  
  if (socketsInRoom) {
    socketsInRoom.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.userId) {
        participants.push({
          user_id: socket.userId,
          display_name: socket.userName || 'User'
        });
      }
    });
  }

  socket.emit('meeting:participants', { participants });
  console.log('Sent participants:', participants);
});

// Forward WebRTC offer
socket.on('meeting:offer', ({ meeting_id, target_user_id, offer }) => {
  console.log('Forwarding offer from', socket.userId, 'to', target_user_id);
  
  // Find target user's socket
  const targetSocket = findSocketByUserId(target_user_id);
  if (targetSocket) {
    targetSocket.emit('meeting:offer', {
      from_user_id: socket.userId,
      offer: offer
    });
    console.log('Offer forwarded successfully');
  } else {
    console.error('Target user socket not found:', target_user_id);
  }
});

// Forward WebRTC answer
socket.on('meeting:answer', ({ meeting_id, target_user_id, answer }) => {
  console.log('Forwarding answer from', socket.userId, 'to', target_user_id);
  
  const targetSocket = findSocketByUserId(target_user_id);
  if (targetSocket) {
    targetSocket.emit('meeting:answer', {
      from_user_id: socket.userId,
      answer: answer
    });
    console.log('Answer forwarded successfully');
  } else {
    console.error('Target user socket not found:', target_user_id);
  }
});

// Forward ICE candidate
socket.on('meeting:ice-candidate', ({ meeting_id, target_user_id, candidate }) => {
  console.log('Forwarding ICE candidate from', socket.userId, 'to', target_user_id);
  
  const targetSocket = findSocketByUserId(target_user_id);
  if (targetSocket) {
    targetSocket.emit('meeting:ice-candidate', {
      from_user_id: socket.userId,
      candidate: candidate
    });
  } else {
    console.error('Target user socket not found:', target_user_id);
  }
});

// Helper function to find socket by user ID
function findSocketByUserId(userId) {
  for (let [id, socket] of io.sockets.sockets) {
    if (socket.userId === userId) {
      return socket;
    }
  }
  return null;
}
```

### Step 3: Make sure user ID is stored on socket

When user connects, store their user ID:

```javascript
io.on('connection', (socket) => {
  // Get user ID from JWT token or auth
  const token = socket.handshake.auth.token;
  const decoded = verifyToken(token); // Your JWT verification
  
  // CRITICAL: Store user ID on socket
  socket.userId = decoded.userId;
  socket.userName = decoded.userName;
  
  console.log('User connected:', socket.userId);
  
  // ... rest of your socket handlers
});
```

### Step 4: Test

1. Restart your backend server
2. Open browser console on both users
3. Join meeting
4. You should see in backend logs:
   ```
   User joining meeting: { userId: 'user1', meetingId: 'meeting-123' }
   Emitted meeting:user-joined to room: meeting:meeting-123
   User joining meeting: { userId: 'user2', meetingId: 'meeting-123' }
   Emitted meeting:user-joined to room: meeting:meeting-123
   Forwarding offer from user1 to user2
   Offer forwarded successfully
   Forwarding answer from user2 to user1
   Answer forwarded successfully
   ```

5. In frontend console you should see:
   ```
   [Meeting] User joined: user2
   [Meeting] Creating peer connection
   [Meeting] Sending offer
   [Meeting] Received answer
   [Meeting] Received track
   ```

## Still Not Working?

### Check 1: Is socket.userId set?
```javascript
// In your socket connection handler, add:
console.log('Socket userId:', socket.userId);
```

If it's `undefined`, you need to set it from your JWT token.

### Check 2: Are events being received?
```javascript
// Add at the top of each handler:
socket.on('meeting:join', (data) => {
  console.log('RECEIVED meeting:join:', data);
  // ... rest of code
});
```

### Check 3: Is room being joined?
```javascript
socket.on('meeting:join', async ({ meeting_id }) => {
  const roomName = `meeting:${meeting_id}`;
  socket.join(roomName);
  
  // Check if joined
  console.log('Socket rooms:', Array.from(socket.rooms));
  // Should show: ['socketId', 'meeting:meeting-123']
});
```

### Check 4: Is emit working?
```javascript
// After emitting, check:
const socketsInRoom = io.sockets.adapter.rooms.get(`meeting:${meeting_id}`);
console.log('Sockets in room:', socketsInRoom?.size);
```

## Minimal Working Example

If you're starting from scratch, here's the absolute minimum:

```javascript
const io = require('socket.io')(server);

// Store user sockets
const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  // Get user ID (from your auth system)
  socket.userId = socket.handshake.auth.userId;
  userSockets.set(socket.userId, socket.id);
  
  console.log('Connected:', socket.userId);

  // Join meeting
  socket.on('meeting:join', ({ meeting_id }) => {
    socket.join(`meeting:${meeting_id}`);
    
    // Tell everyone (including joiner) that user joined
    io.to(`meeting:${meeting_id}`).emit('meeting:user-joined', {
      user_id: socket.userId
    });
  });

  // Forward offer
  socket.on('meeting:offer', ({ target_user_id, offer }) => {
    const targetSocketId = userSockets.get(target_user_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('meeting:offer', {
        from_user_id: socket.userId,
        offer: offer
      });
    }
  });

  // Forward answer
  socket.on('meeting:answer', ({ target_user_id, answer }) => {
    const targetSocketId = userSockets.get(target_user_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('meeting:answer', {
        from_user_id: socket.userId,
        answer: answer
      });
    }
  });

  // Forward ICE candidate
  socket.on('meeting:ice-candidate', ({ target_user_id, candidate }) => {
    const targetSocketId = userSockets.get(target_user_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('meeting:ice-candidate', {
        from_user_id: socket.userId,
        candidate: candidate
      });
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    userSockets.delete(socket.userId);
  });
});
```

## Expected Flow

1. **User A joins:**
   - Frontend emits: `meeting:join`
   - Backend joins room and emits: `meeting:user-joined` (User A)
   - User A receives: `meeting:user-joined` (sees themselves)

2. **User B joins:**
   - Frontend emits: `meeting:join`
   - Backend joins room and emits: `meeting:user-joined` (User B)
   - Both User A and User B receive: `meeting:user-joined` (User B)
   - User A creates peer connection and sends offer
   - Backend forwards offer to User B
   - User B receives offer, creates peer connection, sends answer
   - Backend forwards answer to User A
   - ICE candidates exchanged
   - Video streams connected!

## Next Steps

After implementing this:
1. Check backend console for logs
2. Check frontend console for `[Meeting]` logs
3. Check debug panel - should show Peers: 1, Remote Streams: 1
4. If still not working, share backend logs and I'll help debug further
