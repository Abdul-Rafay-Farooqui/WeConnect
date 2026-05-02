# Quick Fix: Jitsi Meeting Notifications

## What Was Fixed

✅ **Frontend now uses Jitsi instead of WebRTC**
- Changed `layout.tsx` to import `JitsiMeetingRoom` instead of `MeetingRoomModal`
- Jitsi handles all video/audio connections automatically
- No more complex WebRTC peer-to-peer code

## What You Need to Do: Backend Implementation

Your backend needs to implement 2 critical socket events for notifications to work:

### 1. Join Team Room (for receiving notifications)

```javascript
socket.on('join:team', async ({ team_id, organization_id }) => {
  const roomName = `team:${team_id}`;
  socket.join(roomName);
  console.log(`User ${socket.userId} joined team room: ${roomName}`);
});
```

### 2. Meeting Start (to notify all team members)

```javascript
socket.on('meeting:start', async ({ meeting_id, organization_id, team_id }) => {
  try {
    console.log('Meeting start requested:', { meeting_id, team_id });
    
    // Update meeting status in your database
    await updateMeetingStatus(meeting_id, 'ongoing');
    
    // Get meeting details from your database
    const meeting = await getMeetingById(meeting_id);
    
    // Notify ALL team members in the team room
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
    
    console.log(`✅ Notified team ${team_id} about meeting ${meeting_id}`);
    
  } catch (error) {
    console.error('❌ Error starting meeting:', error);
  }
});
```

## That's It!

With these 2 socket events implemented:

1. ✅ User A starts meeting
2. ✅ Backend emits `meeting:started` to team room
3. ✅ User B receives notification
4. ✅ User B clicks "Join"
5. ✅ Both users join the same Jitsi room
6. ✅ They can see and hear each other!

## Testing

### Step 1: Check Backend Logs
When User A starts a meeting, you should see:
```
User user-a joined team room: team:team-456
Meeting start requested: { meeting_id: 'meeting-789', team_id: 'team-456' }
✅ Notified team team-456 about meeting meeting-789
```

### Step 2: Check Frontend Console (User B)
User B should see:
```
[Meetings] Meeting started: { meeting: { ... } }
Meeting started: Team Standup
```

### Step 3: Check Jitsi Room
Both users should see:
```
[Jitsi] Creating room: org-123-team-456-meeting-789
[Jitsi] User joined conference
```

## Troubleshooting

### Issue: User B doesn't receive notification

**Check 1:** Is User B in the team room?
```javascript
// Backend should log:
User user-b joined team room: team:team-456
```

**Check 2:** Is backend emitting to the correct room?
```javascript
// Backend should log:
✅ Notified team team-456 about meeting meeting-789
```

**Check 3:** Is frontend listening for the event?
```javascript
// Frontend already has this in MeetingsTab.tsx:
socket.on("meeting:started", (data) => {
  console.log('[Meetings] Meeting started:', data);
  // Shows notification
});
```

### Issue: Users in different Jitsi rooms

**Problem:** Room names don't match

**Solution:** Both users must create the same room name:
```javascript
const roomName = `${organizationId}-${teamId}-${meetingId}`;
// Example: "org-123-team-456-meeting-789"
```

This is already implemented in `JitsiMeetingRoom.tsx` ✅

## Complete Backend Example

See `BACKEND_JITSI_COMPLETE.md` for a full implementation with:
- User authentication
- Database updates
- Individual notifications
- Meeting tracking
- Error handling

## Summary

**What Changed:**
- ✅ Frontend now uses Jitsi (simpler, more reliable)
- ✅ Removed complex WebRTC code
- ✅ Fixed import in `layout.tsx`

**What You Need:**
- ⚠️ Implement `join:team` socket event
- ⚠️ Implement `meeting:start` socket event
- ⚠️ Emit `meeting:started` to team room

**Result:**
- 🎉 All team members get notified
- 🎉 Everyone joins the same Jitsi room
- 🎉 Video calls work automatically!
