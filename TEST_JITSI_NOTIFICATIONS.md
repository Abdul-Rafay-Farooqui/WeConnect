# Testing Jitsi Meetings with Notifications

## What We Fixed

1. ✅ Frontend emits `meeting:start` socket event
2. ✅ Frontend joins team room for notifications
3. ✅ Frontend listens for `meeting:started` and `meeting:notification` events
4. ✅ Frontend shows toast notifications
5. ✅ Jitsi emits `meeting:join` and `meeting:leave` for tracking

## Backend Requirements

Your backend MUST implement these socket events:

### 1. Join Team Room
```javascript
socket.on('join:team', ({ team_id, organization_id }) => {
  socket.join(`team:${team_id}`);
  console.log(`User ${socket.userId} joined team room`);
});
```

### 2. Start Meeting
```javascript
socket.on('meeting:start', async ({ meeting_id, organization_id, team_id }) => {
  // Update database
  await db.meetings.update(meeting_id, { status: 'ongoing' });
  
  // Notify ALL team members
  io.to(`team:${team_id}`).emit('meeting:started', {
    meeting: {
      id: meeting_id,
      title: 'Meeting Title',
      organization_id,
      team_id,
      call_type: 'video',
      started_by_name: socket.userName,
      status: 'ongoing'
    }
  });
  
  // Send individual notifications
  io.to(`team:${team_id}`).emit('meeting:notification', {
    type: 'started',
    meeting: {
      id: meeting_id,
      title: 'Meeting Title',
      organization_id,
      team_id,
      call_type: 'video',
      started_by_name: socket.userName
    },
    message: `${socket.userName} started a meeting`
  });
});
```

### 3. Join Meeting (Optional - for tracking)
```javascript
socket.on('meeting:join', async ({ meeting_id, organization_id, team_id }) => {
  console.log(`User ${socket.userId} joined meeting ${meeting_id}`);
  // Track in database if needed
});
```

### 4. Leave Meeting (Optional - for tracking)
```javascript
socket.on('meeting:leave', async ({ meeting_id, organization_id, team_id }) => {
  console.log(`User ${socket.userId} left meeting ${meeting_id}`);
  // Track in database if needed
});
```

## Testing Steps

### Test 1: Basic Notification (2 Users)

**User A (Starter):**
1. Open app
2. Go to Meetings tab
3. Click "Start Instant Meeting"
4. Check console:
   ```
   [Meetings] Joined team room: team-456
   [Meetings] Emitted meeting:start event
   [Jitsi] User joined conference
   ```
5. Jitsi should load
6. You should see yourself

**User B (Joiner):**
1. Open app in another browser/tab
2. Go to Meetings tab
3. Check console:
   ```
   [Meetings] Joined team room: team-456
   [Meetings] Meeting started: { meeting: {...} }
   [Meetings] Meeting notification: { message: "..." }
   ```
4. You should see:
   - Toast notification: "Meeting started: Instant Team Meeting"
   - Meeting appears in "Upcoming & Live Meetings" section
   - "Join" button is available
5. Click "Join" button
6. Jitsi should load
7. Both users should see each other! ✅

### Test 2: Backend Logs

Your backend should show:

```
User connected: socket-abc123
User authenticated: user-a
User user-a joined team room: team:team-456

User connected: socket-def456
User authenticated: user-b
User user-b joined team room: team:team-456

Meeting start requested: { meeting_id: 'meeting-789', team_id: 'team-456' }
Notified team team-456 about meeting meeting-789
User user-a joined meeting meeting-789

User user-b joined meeting meeting-789
```

### Test 3: Same Jitsi Room

**Check Room Names:**

User A console:
```
[Jitsi] Room name: org-123-team-456-meeting-789
```

User B console:
```
[Jitsi] Room name: org-123-team-456-meeting-789
```

Room names MUST match exactly!

### Test 4: Scheduled Meeting

1. **Schedule meeting:**
   - Click "Schedule Meeting"
   - Set time for 2 minutes from now
   - Click "Schedule"

2. **Wait for notifications:**
   - At -15 min: Browser notification
   - At -5 min: Browser notification
   - At 0 min: Browser notification

3. **Start meeting:**
   - Admin clicks "Start" button
   - Backend emits `meeting:started`
   - All team members see toast notification
   - All team members see "Join" button

4. **Join meeting:**
   - Click "Join"
   - Jitsi loads
   - Everyone in same room ✅

## Troubleshooting

### Issue: User B doesn't see notification

**Check 1: Is User B in team room?**
```javascript
// User B console should show:
[Meetings] Joined team room: team-456
```

**Check 2: Is backend emitting event?**
```javascript
// Backend logs should show:
Notified team team-456 about meeting meeting-789
```

**Check 3: Is User B listening?**
```javascript
// User B console should show:
[Meetings] Meeting started: {...}
```

**Solution:** Implement backend socket events (see `BACKEND_JITSI_COMPLETE.md`)

### Issue: Users in different Jitsi rooms

**Check:** Room names must be identical

```javascript
// Both should create:
const roomName = `${organizationId}-${teamId}-${meetingId}`;
```

**Verify in console:**
```
User A: org-123-team-456-meeting-789
User B: org-123-team-456-meeting-789
```

If different, check that both users have same:
- organizationId
- teamId
- meetingId

### Issue: Toast not showing

**Check:** Toast state in MeetingsTab

```javascript
// Should see in React DevTools:
toast: { message: "...", type: "info" }
```

**Solution:** Toast auto-hides after 5 seconds. Check console for logs.

### Issue: Meeting not appearing in list

**Check:** Meeting status in database

```sql
SELECT * FROM meetings WHERE id = 'meeting-789';
-- status should be 'ongoing'
```

**Solution:** Backend must update meeting status when started.

## Debug Checklist

Frontend (User A - Starter):
- [ ] Joined team room
- [ ] Emitted `meeting:start` event
- [ ] Jitsi loaded
- [ ] Can see self in video

Frontend (User B - Joiner):
- [ ] Joined team room
- [ ] Received `meeting:started` event
- [ ] Received `meeting:notification` event
- [ ] Toast notification appeared
- [ ] Meeting appears in list
- [ ] "Join" button visible
- [ ] Clicked "Join"
- [ ] Jitsi loaded
- [ ] Can see User A

Backend:
- [ ] Received `join:team` from both users
- [ ] Received `meeting:start` from User A
- [ ] Emitted `meeting:started` to team room
- [ ] Emitted `meeting:notification` to team room
- [ ] Both users in same team room

Jitsi:
- [ ] Both users have same room name
- [ ] Both users joined Jitsi conference
- [ ] Video/audio working

## Expected Console Output

### User A (Starter)
```
[Meetings] Joined team room: team-456
[Meetings] Emitted meeting:start event
[Jitsi] Initializing meeting room
[Jitsi] User joined conference
```

### User B (Joiner)
```
[Meetings] Joined team room: team-456
[Meetings] Meeting started: { meeting: { id: "...", title: "..." } }
[Meetings] Meeting notification: { message: "John started a meeting" }
Toast: "Meeting started: Instant Team Meeting"
[User clicks Join]
[Jitsi] Initializing meeting room
[Jitsi] User joined conference
```

### Backend
```
User user-a connected
User user-a joined team room: team:team-456
User user-b connected
User user-b joined team room: team:team-456
Meeting start requested: meeting-789
Notified team team-456 about meeting meeting-789
User user-a joined meeting meeting-789
User user-b joined meeting meeting-789
```

## Success Criteria

✅ User A starts meeting  
✅ User B receives notification within 1 second  
✅ User B sees toast message  
✅ User B sees meeting in list  
✅ User B clicks "Join"  
✅ Both users in same Jitsi room  
✅ Both users see each other  
✅ Video/audio works  

## Next Steps

1. ✅ Implement backend socket events (see `BACKEND_JITSI_COMPLETE.md`)
2. ✅ Test with 2 users
3. ✅ Verify notifications work
4. ✅ Verify same Jitsi room
5. ✅ Test with 3+ users
6. ✅ Test scheduled meetings
7. ✅ Deploy and celebrate! 🎉
