# Meeting Connection Flow Diagram

## Current State (Not Working)

```
User A                          Backend                         User B
  |                                |                                |
  |--meeting:join---------------->|                                |
  |                                |                                |
  |                                X (Nothing happens!)            |
  |                                                                 |
  |                                                                 |
  |                                |                                |
  |                                |<--------------meeting:join-----|
  |                                |                                |
  |                                X (Nothing happens!)            |
  |                                                                 |
  
Result: Both users stuck, can't see each other
Debug Panel: Peers: 0, Remote Streams: 0
```

## What Should Happen (After Backend Fix)

```
User A                          Backend                         User B
  |                                |                                |
  |--meeting:join---------------->|                                |
  |                                |                                |
  |<--meeting:user-joined---------|                                |
  |   (user_id: A)                 |                                |
  |                                |                                |
  |                                |<--------------meeting:join-----|
  |                                |                                |
  |<--meeting:user-joined---------|---meeting:user-joined--------->|
  |   (user_id: B)                 |   (user_id: B)                 |
  |                                |                                |
  |--meeting:offer--------------->|                                |
  |   (target: B, offer: {...})    |                                |
  |                                |---meeting:offer--------------->|
  |                                |   (from: A, offer: {...})      |
  |                                |                                |
  |                                |<--------------meeting:answer---|
  |                                |   (target: A, answer: {...})   |
  |<--meeting:answer--------------|                                |
  |   (from: B, answer: {...})     |                                |
  |                                |                                |
  |--meeting:ice-candidate------->|                                |
  |                                |---meeting:ice-candidate------->|
  |                                |                                |
  |                                |<---------meeting:ice-candidate-|
  |<--meeting:ice-candidate-------|                                |
  |                                |                                |
  |<========== WebRTC Video/Audio Stream ==========================>|
  |                                                                  |
  
Result: Both users see each other! 🎉
Debug Panel: Peers: 1, Remote Streams: 1
```

## Detailed Step-by-Step

### Step 1: User A Joins
```
User A Browser:
  ✅ Opens meeting room
  ✅ Gets camera/microphone (Local Stream: ✅)
  ✅ Connects to socket (Socket Connected: ✅)
  ✅ Emits: meeting:join { meeting_id: "123" }

Backend:
  ❌ MISSING: Should emit meeting:user-joined back
  
User A Browser:
  ❌ Waits forever... (Peers: 0)
```

### Step 2: User B Joins (Same Problem)
```
User B Browser:
  ✅ Opens meeting room
  ✅ Gets camera/microphone (Local Stream: ✅)
  ✅ Connects to socket (Socket Connected: ✅)
  ✅ Emits: meeting:join { meeting_id: "123" }

Backend:
  ❌ MISSING: Should emit meeting:user-joined to BOTH users
  
Both Users:
  ❌ Still waiting... (Peers: 0)
```

## What Backend Should Do

### When User A Joins:
```javascript
// Backend receives:
socket.on('meeting:join', ({ meeting_id }) => {
  
  // 1. Join socket room
  socket.join(`meeting:${meeting_id}`);
  
  // 2. Tell EVERYONE in room (including User A)
  io.to(`meeting:${meeting_id}`).emit('meeting:user-joined', {
    user_id: socket.userId  // User A's ID
  });
});

// Result:
// User A receives: meeting:user-joined { user_id: "A" }
// User A thinks: "I'm in the meeting, waiting for others..."
```

### When User B Joins:
```javascript
// Backend receives:
socket.on('meeting:join', ({ meeting_id }) => {
  
  // 1. Join socket room
  socket.join(`meeting:${meeting_id}`);
  
  // 2. Tell EVERYONE in room (User A AND User B)
  io.to(`meeting:${meeting_id}`).emit('meeting:user-joined', {
    user_id: socket.userId  // User B's ID
  });
});

// Result:
// User A receives: meeting:user-joined { user_id: "B" }
// User A thinks: "Someone joined! Let me connect to them..."
// User A creates peer connection and sends offer
//
// User B receives: meeting:user-joined { user_id: "B" }
// User B thinks: "I'm in the meeting, waiting for connections..."
```

### When User A Sends Offer:
```javascript
// Backend receives:
socket.on('meeting:offer', ({ target_user_id, offer }) => {
  
  // Find User B's socket
  const targetSocket = findSocketByUserId(target_user_id);
  
  // Forward offer to User B
  targetSocket.emit('meeting:offer', {
    from_user_id: socket.userId,  // User A's ID
    offer: offer
  });
});

// Result:
// User B receives: meeting:offer { from_user_id: "A", offer: {...} }
// User B thinks: "Got an offer from User A, sending answer..."
```

### When User B Sends Answer:
```javascript
// Backend receives:
socket.on('meeting:answer', ({ target_user_id, answer }) => {
  
  // Find User A's socket
  const targetSocket = findSocketByUserId(target_user_id);
  
  // Forward answer to User A
  targetSocket.emit('meeting:answer', {
    from_user_id: socket.userId,  // User B's ID
    answer: answer
  });
});

// Result:
// User A receives: meeting:answer { from_user_id: "B", answer: {...} }
// User A thinks: "Got answer! Now exchanging ICE candidates..."
```

### ICE Candidates (Multiple Times):
```javascript
// Backend receives from both users:
socket.on('meeting:ice-candidate', ({ target_user_id, candidate }) => {
  
  // Find target user's socket
  const targetSocket = findSocketByUserId(target_user_id);
  
  // Forward ICE candidate
  targetSocket.emit('meeting:ice-candidate', {
    from_user_id: socket.userId,
    candidate: candidate
  });
});

// Result:
// ICE candidates exchanged back and forth
// WebRTC connection established
// Video/audio streams connected! 🎉
```

## The Key Points

### 1. Backend is Just a Messenger
```
User A --message--> Backend --message--> User B
User B --message--> Backend --message--> User A
```

Backend doesn't process WebRTC, just forwards messages!

### 2. Room Names Must Match
```javascript
// Frontend sends:
meeting_id: "49812dd8-437e-4955-8b55-8e3f803e1784"

// Backend must use:
socket.join(`meeting:49812dd8-437e-4955-8b55-8e3f803e1784`)
io.to(`meeting:49812dd8-437e-4955-8b55-8e3f803e1784`).emit(...)
```

### 3. User IDs Must Be Tracked
```javascript
// On connection:
socket.userId = getUserIdFromToken(socket.handshake.auth.token);

// When forwarding:
targetSocket.emit('meeting:offer', {
  from_user_id: socket.userId  // ← Must include this!
});
```

### 4. Events Must Be Forwarded, Not Broadcast
```javascript
// ❌ Wrong (sends to everyone):
io.to(`meeting:${meeting_id}`).emit('meeting:offer', ...);

// ✅ Correct (sends to specific user):
targetSocket.emit('meeting:offer', ...);
```

## Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     MEETING CONNECTION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User A                Backend              User B          │
│    │                      │                    │            │
│    │  1. Join Meeting     │                    │            │
│    ├─────────────────────>│                    │            │
│    │                      │                    │            │
│    │  2. User Joined (A)  │                    │            │
│    │<─────────────────────┤                    │            │
│    │                      │                    │            │
│    │                      │  3. Join Meeting   │            │
│    │                      │<───────────────────┤            │
│    │                      │                    │            │
│    │  4. User Joined (B)  │  5. User Joined(B)│            │
│    │<─────────────────────┼───────────────────>│            │
│    │                      │                    │            │
│    │  6. Offer            │                    │            │
│    ├─────────────────────>│  7. Offer          │            │
│    │                      ├───────────────────>│            │
│    │                      │                    │            │
│    │                      │  8. Answer         │            │
│    │  9. Answer           │<───────────────────┤            │
│    │<─────────────────────┤                    │            │
│    │                      │                    │            │
│    │  10. ICE Candidates (back and forth)     │            │
│    │<────────────────────────────────────────>│            │
│    │                      │                    │            │
│    │  11. WebRTC Stream (peer-to-peer)        │            │
│    │<═════════════════════════════════════════>│            │
│    │                                           │            │
│    │           🎥 Video Connected! 🎉          │            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## What You Need to Do

1. ✅ Open your backend socket handler file
2. ✅ Add the 6 event handlers (see QUICK_FIX_BACKEND.md)
3. ✅ Make sure `socket.userId` is set on connection
4. ✅ Restart backend
5. ✅ Test with 2 users
6. ✅ Check debug panel shows Peers: 1, Remote Streams: 1
7. ✅ Celebrate! 🎉

The frontend is ready and waiting! Just need the backend to forward the messages.
