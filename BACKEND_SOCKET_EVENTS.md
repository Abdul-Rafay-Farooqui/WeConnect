# Backend Socket Events for Meetings

## Required Socket Events

Your backend needs to implement these socket events for the meeting functionality to work properly.

### 1. Meeting Join

**Client Emits:**
```javascript
socket.emit("meeting:join", {
  meeting_id: "meeting-123",
  organization_id: "org-456",
  team_id: "team-789"
});
```

**Backend Should:**
1. Verify user has access to the meeting
2. Add user to meeting room
3. Broadcast to all users in the meeting:

```javascript
// To all users in the meeting (including the joiner)
io.to(meetingRoomId).emit("meeting:user-joined", {
  user_id: "user-who-joined",
  participants: [
    { user_id: "user1", display_name: "Alice" },
    { user_id: "user2", display_name: "Bob" }
  ]
});
```

### 2. Get Participants

**Client Emits:**
```javascript
socket.emit("meeting:get-participants", {
  meeting_id: "meeting-123"
});
```

**Backend Should:**
```javascript
// Send back to requesting user only
socket.emit("meeting:participants", {
  participants: [
    { user_id: "user1", display_name: "Alice" },
    { user_id: "user2", display_name: "Bob" }
  ]
});
```

### 3. WebRTC Offer

**Client Emits:**
```javascript
socket.emit("meeting:offer", {
  meeting_id: "meeting-123",
  target_user_id: "user-to-receive-offer",
  offer: RTCSessionDescription
});
```

**Backend Should:**
```javascript
// Forward to target user only
io.to(targetUserSocketId).emit("meeting:offer", {
  from_user_id: "user-who-sent-offer",
  offer: offer
});
```

### 4. WebRTC Answer

**Client Emits:**
```javascript
socket.emit("meeting:answer", {
  meeting_id: "meeting-123",
  target_user_id: "user-to-receive-answer",
  answer: RTCSessionDescription
});
```

**Backend Should:**
```javascript
// Forward to target user only
io.to(targetUserSocketId).emit("meeting:answer", {
  from_user_id: "user-who-sent-answer",
  answer: answer
});
```

### 5. ICE Candidate

**Client Emits:**
```javascript
socket.emit("meeting:ice-candidate", {
  meeting_id: "meeting-123",
  target_user_id: "user-to-receive-candidate",
  candidate: RTCIceCandidate
});
```

**Backend Should:**
```javascript
// Forward to target user only
io.to(targetUserSocketId).emit("meeting:ice-candidate", {
  from_user_id: "user-who-sent-candidate",
  candidate: candidate
});
```

### 6. Meeting Leave

**Client Emits:**
```javascript
socket.emit("meeting:leave", {
  meeting_id: "meeting-123"
});
```

**Backend Should:**
```javascript
// Remove user from meeting room
// Broadcast to remaining users
io.to(meetingRoomId).emit("meeting:user-left", {
  user_id: "user-who-left"
});
```

### 7. Meeting End (Admin Only)

**Client Emits:**
```javascript
socket.emit("meeting:end", {
  meeting_id: "meeting-123"
});
```

**Backend Should:**
```javascript
// Verify user is admin
// Broadcast to all users
io.to(meetingRoomId).emit("meeting:ended", {
  meeting_id: "meeting-123"
});
// Close the meeting room
```

## Complete Backend Implementation Example (Node.js + Socket.io)

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Store active meetings and participants
const activeMeetings = new Map(); // meetingId -> Set of socket IDs
const userSockets = new Map(); // userId -> socket ID

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Authenticate user
  const userId = socket.handshake.auth.userId; // Get from JWT token
  if (!userId) {
    socket.disconnect();
    return;
  }
  
  userSockets.set(userId, socket.id);

  // Meeting Join
  socket.on('meeting:join', async ({ meeting_id, organization_id, team_id }) => {
    try {
      // Verify access
      const hasAccess = await verifyMeetingAccess(userId, meeting_id, organization_id, team_id);
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Join socket room
      socket.join(`meeting:${meeting_id}`);
      
      // Track participant
      if (!activeMeetings.has(meeting_id)) {
        activeMeetings.set(meeting_id, new Set());
      }
      activeMeetings.get(meeting_id).add(userId);

      // Get all participants
      const participants = Array.from(activeMeetings.get(meeting_id)).map(uid => ({
        user_id: uid,
        display_name: getUserDisplayName(uid) // Your function to get user name
      }));

      // Notify all users
      io.to(`meeting:${meeting_id}`).emit('meeting:user-joined', {
        user_id: userId,
        participants: participants
      });

      console.log(`User ${userId} joined meeting ${meeting_id}`);
    } catch (error) {
      console.error('Meeting join error:', error);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  });

  // Get Participants
  socket.on('meeting:get-participants', ({ meeting_id }) => {
    const participants = activeMeetings.has(meeting_id)
      ? Array.from(activeMeetings.get(meeting_id)).map(uid => ({
          user_id: uid,
          display_name: getUserDisplayName(uid)
        }))
      : [];
    
    socket.emit('meeting:participants', { participants });
  });

  // WebRTC Offer
  socket.on('meeting:offer', ({ meeting_id, target_user_id, offer }) => {
    const targetSocketId = userSockets.get(target_user_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('meeting:offer', {
        from_user_id: userId,
        offer: offer
      });
      console.log(`Forwarded offer from ${userId} to ${target_user_id}`);
    } else {
      console.warn(`Target user ${target_user_id} not found`);
    }
  });

  // WebRTC Answer
  socket.on('meeting:answer', ({ meeting_id, target_user_id, answer }) => {
    const targetSocketId = userSockets.get(target_user_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('meeting:answer', {
        from_user_id: userId,
        answer: answer
      });
      console.log(`Forwarded answer from ${userId} to ${target_user_id}`);
    } else {
      console.warn(`Target user ${target_user_id} not found`);
    }
  });

  // ICE Candidate
  socket.on('meeting:ice-candidate', ({ meeting_id, target_user_id, candidate }) => {
    const targetSocketId = userSockets.get(target_user_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('meeting:ice-candidate', {
        from_user_id: userId,
        candidate: candidate
      });
      console.log(`Forwarded ICE candidate from ${userId} to ${target_user_id}`);
    } else {
      console.warn(`Target user ${target_user_id} not found`);
    }
  });

  // Meeting Leave
  socket.on('meeting:leave', ({ meeting_id }) => {
    handleUserLeave(socket, userId, meeting_id);
  });

  // Meeting End (Admin only)
  socket.on('meeting:end', async ({ meeting_id }) => {
    try {
      const isAdmin = await checkIfAdmin(userId, meeting_id);
      if (!isAdmin) {
        socket.emit('error', { message: 'Only admins can end meetings' });
        return;
      }

      // Notify all participants
      io.to(`meeting:${meeting_id}`).emit('meeting:ended', {
        meeting_id: meeting_id
      });

      // Clean up
      activeMeetings.delete(meeting_id);
      
      console.log(`Meeting ${meeting_id} ended by ${userId}`);
    } catch (error) {
      console.error('Meeting end error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find all meetings user was in and notify others
    activeMeetings.forEach((participants, meeting_id) => {
      if (participants.has(userId)) {
        handleUserLeave(socket, userId, meeting_id);
      }
    });
    
    userSockets.delete(userId);
  });
});

function handleUserLeave(socket, userId, meeting_id) {
  socket.leave(`meeting:${meeting_id}`);
  
  if (activeMeetings.has(meeting_id)) {
    activeMeetings.get(meeting_id).delete(userId);
    
    // Notify remaining users
    io.to(`meeting:${meeting_id}`).emit('meeting:user-left', {
      user_id: userId
    });
    
    // Clean up empty meetings
    if (activeMeetings.get(meeting_id).size === 0) {
      activeMeetings.delete(meeting_id);
    }
  }
  
  console.log(`User ${userId} left meeting ${meeting_id}`);
}

// Helper functions (implement based on your database)
async function verifyMeetingAccess(userId, meetingId, orgId, teamId) {
  // Check if user is member of team/organization
  // Check if meeting exists and is active
  return true; // Implement your logic
}

function getUserDisplayName(userId) {
  // Get user display name from database/cache
  return 'User'; // Implement your logic
}

async function checkIfAdmin(userId, meetingId) {
  // Check if user is admin of the team/organization
  return true; // Implement your logic
}
```

## Testing Socket Events

Use this test script to verify your backend:

```javascript
// test-socket.js
const io = require('socket.io-client');

const socket = io('http://localhost:4000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected');
  
  // Test join
  socket.emit('meeting:join', {
    meeting_id: 'test-meeting',
    organization_id: 'test-org',
    team_id: 'test-team'
  });
});

socket.on('meeting:user-joined', (data) => {
  console.log('✅ User joined:', data);
});

socket.on('meeting:participants', (data) => {
  console.log('✅ Participants:', data);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

Run with: `node test-socket.js`

## Common Issues

### Issue 1: Users can't see each other
**Cause:** Socket events not being forwarded correctly
**Solution:** Check that `meeting:offer`, `meeting:answer`, and `meeting:ice-candidate` are being forwarded to the correct user

### Issue 2: Connection fails immediately
**Cause:** ICE candidates not being exchanged
**Solution:** Verify `meeting:ice-candidate` event is working

### Issue 3: Only one user sees the other
**Cause:** Offer/answer not being sent both ways
**Solution:** Make sure both users create peer connections and exchange offers

### Issue 4: Users disconnect immediately
**Cause:** Meeting room not being joined properly
**Solution:** Verify `socket.join()` is being called with correct room name

## Debug Checklist

- [ ] Socket authentication working
- [ ] `meeting:join` creates room and adds user
- [ ] `meeting:user-joined` broadcasts to all users
- [ ] `meeting:get-participants` returns current users
- [ ] `meeting:offer` forwards to target user
- [ ] `meeting:answer` forwards to target user
- [ ] `meeting:ice-candidate` forwards to target user
- [ ] `meeting:leave` removes user and notifies others
- [ ] `disconnect` event cleans up user from all meetings
- [ ] Room names are consistent (e.g., `meeting:${meeting_id}`)
- [ ] User IDs are being tracked correctly

## Production Considerations

1. **Rate Limiting**: Limit socket events per user
2. **Authentication**: Verify JWT tokens on connection
3. **Authorization**: Check meeting access on join
4. **Cleanup**: Remove inactive meetings after timeout
5. **Logging**: Log all meeting events for debugging
6. **Monitoring**: Track active meetings and participants
7. **Scaling**: Use Redis adapter for multiple servers
8. **Security**: Validate all incoming data
