# Complete Backend Implementation for Jitsi Meetings

## The Problem

When User A starts a meeting, User B doesn't know about it because:
1. Backend doesn't emit `meeting:started` event
2. User B doesn't receive notification
3. User B doesn't know to join

## The Solution

Implement these backend socket events to notify all team members when meetings start.

## Complete Backend Code

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Store user sockets: userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Get user ID from JWT token
  const token = socket.handshake.auth.token;
  const user = verifyToken(token); // Your JWT verification function
  
  if (!user) {
    socket.disconnect();
    return;
  }
  
  socket.userId = user.id;
  socket.userName = user.name;
  userSockets.set(user.id, socket.id);
  
  console.log('User authenticated:', user.id);

  // Join user's teams rooms for notifications
  socket.on('join:team', async ({ team_id, organization_id }) => {
    const roomName = `team:${team_id}`;
    socket.join(roomName);
    console.log(`User ${socket.userId} joined team room: ${roomName}`);
  });

  // When a meeting is started
  socket.on('meeting:start', async ({ meeting_id, organization_id, team_id }) => {
    try {
      console.log('Meeting start requested:', { meeting_id, team_id });
      
      // Update meeting status in database
      await db.meetings.update(meeting_id, {
        status: 'ongoing',
        started_at: new Date(),
        started_by: socket.userId
      });
      
      // Get meeting details
      const meeting = await db.meetings.findById(meeting_id);
      
      // Get all team members
      const teamMembers = await db.teams.getMembers(team_id);
      
      // Notify ALL team members (including the starter)
      const roomName = `team:${team_id}`;
      io.to(roomName).emit('meeting:started', {
        meeting: {
          id: meeting.id,
          title: meeting.title,
          organization_id: organization_id,
          team_id: team_id,
          call_type: meeting.call_type,
          started_by: socket.userId,
          started_by_name: socket.userName,
          status: 'ongoing'
        }
      });
      
      console.log(`Notified team ${team_id} about meeting ${meeting_id}`);
      
      // Also send individual notifications to each team member
      for (const member of teamMembers) {
        if (member.id !== socket.userId) { // Don't notify the starter
          const memberSocketId = userSockets.get(member.id);
          if (memberSocketId) {
            io.to(memberSocketId).emit('meeting:notification', {
              type: 'started',
              meeting: {
                id: meeting.id,
                title: meeting.title,
                organization_id: organization_id,
                team_id: team_id,
                call_type: meeting.call_type,
                started_by_name: socket.userName
              },
              message: `${socket.userName} started a meeting: ${meeting.title}`
            });
          }
        }
      }
      
      // Acknowledge to the starter
      socket.emit('meeting:start:success', {
        meeting_id: meeting.id,
        status: 'ongoing'
      });
      
    } catch (error) {
      console.error('Error starting meeting:', error);
      socket.emit('meeting:start:error', {
        message: error.message || 'Failed to start meeting'
      });
    }
  });

  // When a meeting is ended
  socket.on('meeting:end', async ({ meeting_id, organization_id, team_id }) => {
    try {
      console.log('Meeting end requested:', { meeting_id, team_id });
      
      // Update meeting status in database
      await db.meetings.update(meeting_id, {
        status: 'ended',
        ended_at: new Date(),
        ended_by: socket.userId
      });
      
      // Notify all team members
      const roomName = `team:${team_id}`;
      io.to(roomName).emit('meeting:ended', {
        meeting_id: meeting_id,
        ended_by: socket.userId
      });
      
      console.log(`Notified team ${team_id} that meeting ${meeting_id} ended`);
      
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  });

  // When user joins a meeting (for tracking)
  socket.on('meeting:join', async ({ meeting_id, organization_id, team_id }) => {
    try {
      console.log('User joining meeting:', { userId: socket.userId, meeting_id });
      
      // Track in database
      await db.meeting_participants.create({
        meeting_id: meeting_id,
        user_id: socket.userId,
        joined_at: new Date()
      });
      
      // Notify team that user joined
      const roomName = `team:${team_id}`;
      io.to(roomName).emit('meeting:user-joined', {
        meeting_id: meeting_id,
        user_id: socket.userId,
        user_name: socket.userName
      });
      
    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  });

  // When user leaves a meeting (for tracking)
  socket.on('meeting:leave', async ({ meeting_id, organization_id, team_id }) => {
    try {
      console.log('User leaving meeting:', { userId: socket.userId, meeting_id });
      
      // Track in database
      await db.meeting_participants.update({
        meeting_id: meeting_id,
        user_id: socket.userId
      }, {
        left_at: new Date()
      });
      
      // Notify team that user left
      const roomName = `team:${team_id}`;
      io.to(roomName).emit('meeting:user-left', {
        meeting_id: meeting_id,
        user_id: socket.userId,
        user_name: socket.userName
      });
      
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
    userSockets.delete(socket.userId);
  });
});

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
```

## Database Schema

You need these tables:

```sql
-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  team_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  call_type VARCHAR(10) NOT NULL, -- 'voice' or 'video'
  status VARCHAR(20) NOT NULL, -- 'scheduled', 'ongoing', 'ended'
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  started_by UUID,
  ended_by UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meeting participants (for tracking)
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id),
  user_id UUID NOT NULL,
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_meetings_team ON meetings(team_id, status);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meeting_participants_meeting ON meeting_participants(meeting_id);
```

## API Endpoints

You also need these REST endpoints:

### Start Meeting
```javascript
// POST /api/organizations/:orgId/teams/:teamId/meetings/:meetingId/start
router.post('/organizations/:orgId/teams/:teamId/meetings/:meetingId/start', async (req, res) => {
  try {
    const { orgId, teamId, meetingId } = req.params;
    const userId = req.user.id; // From JWT middleware
    
    // Verify user has access
    const hasAccess = await checkTeamAccess(userId, teamId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update meeting
    const meeting = await db.meetings.update(meetingId, {
      status: 'ongoing',
      started_at: new Date(),
      started_by: userId
    });
    
    // Emit socket event (will be handled by socket handler above)
    // The socket handler will notify all team members
    
    res.json({
      meeting_id: meeting.id,
      status: 'ongoing',
      call_type: meeting.call_type
    });
    
  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
});
```

### Start Instant Meeting
```javascript
// POST /api/organizations/:orgId/teams/:teamId/meetings/instant
router.post('/organizations/:orgId/teams/:teamId/meetings/instant', async (req, res) => {
  try {
    const { orgId, teamId } = req.params;
    const { title, duration_minutes, call_type, attendee_ids } = req.body;
    const userId = req.user.id;
    
    // Create meeting
    const meeting = await db.meetings.create({
      organization_id: orgId,
      team_id: teamId,
      title: title || 'Instant Meeting',
      call_type: call_type || 'video',
      status: 'ongoing',
      started_at: new Date(),
      started_by: userId,
      created_by: userId
    });
    
    // The socket handler will notify team members
    
    res.json({
      meeting_id: meeting.id,
      status: 'ongoing',
      call_type: meeting.call_type
    });
    
  } catch (error) {
    console.error('Instant meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});
```

## Frontend Integration

The frontend needs to emit socket events when starting meetings:

```typescript
// When starting a meeting
const socket = getSocket();

// Join team room for notifications
socket.emit('join:team', {
  team_id: teamId,
  organization_id: organizationId
});

// Start the meeting
socket.emit('meeting:start', {
  meeting_id: meetingId,
  organization_id: organizationId,
  team_id: teamId
});

// Listen for success
socket.on('meeting:start:success', (data) => {
  console.log('Meeting started successfully');
  // Open Jitsi room
});

// Listen for notifications
socket.on('meeting:notification', (data) => {
  // Show toast notification
  showNotification(data.message);
});
```

## Testing

### Test 1: Start Meeting
1. User A starts meeting
2. Backend emits `meeting:started` to team room
3. User B receives `meeting:started` event
4. User B sees notification
5. User B clicks "Join"
6. Both in same Jitsi room ✅

### Test 2: Check Backend Logs
```
User connected: socket-123
User authenticated: user-a
User user-a joined team room: team:team-456
Meeting start requested: { meeting_id: 'meeting-789', team_id: 'team-456' }
Notified team team-456 about meeting meeting-789
```

### Test 3: Check Frontend Console
```
[Socket] Connected
[Socket] Joined team room
[Meeting] Starting meeting...
[Meeting] Meeting started successfully
[Notification] John started a meeting: Team Standup
```

## Troubleshooting

### Issue: User B not receiving notification

**Check 1:** Is User B in team room?
```javascript
// Backend log should show:
User user-b joined team room: team:team-456
```

**Check 2:** Is socket emitting to correct room?
```javascript
// Backend log should show:
Notified team team-456 about meeting meeting-789
```

**Check 3:** Is User B listening for event?
```javascript
// Frontend should have:
socket.on('meeting:started', (data) => {
  console.log('Meeting started:', data);
});
```

### Issue: Users in different Jitsi rooms

**Check:** Room name must be identical
```javascript
// Both users should create same room:
const roomName = `${organizationId}-${teamId}-${meetingId}`;
// Example: "org-123-team-456-meeting-789"
```

## Summary

**Backend needs to:**
1. ✅ Accept `meeting:start` event
2. ✅ Update database (status = 'ongoing')
3. ✅ Emit `meeting:started` to team room
4. ✅ Send individual notifications to team members

**Frontend needs to:**
1. ✅ Join team room on mount
2. ✅ Emit `meeting:start` when starting
3. ✅ Listen for `meeting:started` event
4. ✅ Show notification toast
5. ✅ Create same Jitsi room name

**Result:** All team members get notified and can join the same Jitsi room! 🎉
