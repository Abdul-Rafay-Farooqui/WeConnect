# Meeting Notification System - Status & Implementation Guide

## Current Status

### ✅ Frontend - COMPLETE
The frontend is fully implemented and ready:

1. **Meeting Start Notifications**
   - When User A starts a meeting, frontend emits `meeting:start` socket event
   - Frontend listens for `meeting:started` event from backend
   - Shows toast notification: "John started a meeting: Team Standup"
   - Adds notification to notification panel
   - Shows "Join" button

2. **Scheduled Meeting Reminders**
   - Monitors scheduled meetings
   - Shows notifications at: 15 min before, 5 min before, and at start time
   - Browser notifications (if permission granted)
   - In-app toast notifications

3. **Notification UI**
   - Toast notifications (bottom-right corner)
   - Notification panel (bell icon in header)
   - Meeting cards show "LIVE" indicator for ongoing meetings
   - Calendar shows scheduled meetings

### ❌ Backend - NOT IMPLEMENTED
The backend is missing the socket event handlers that send notifications to team members.

---

## What You Need to Implement (Backend)

### Required Socket Events

#### 1. Join Team Room
```javascript
socket.on('join:team', ({ team_id, organization_id }) => {
  const roomName = `team:${team_id}`;
  socket.join(roomName);
  console.log(`User ${socket.userId} joined team room: ${roomName}`);
});
```

#### 2. Meeting Start Notification
```javascript
socket.on('meeting:start', async ({ meeting_id, organization_id, team_id }) => {
  try {
    // Update meeting status in database
    await updateMeetingStatus(meeting_id, 'ongoing');
    
    // Get meeting details
    const meeting = await getMeetingById(meeting_id);
    
    // Get user who started the meeting
    const starterName = await getUserName(socket.userId);
    
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
        started_by_name: starterName,
        status: 'ongoing'
      }
    });
    
    console.log(`✅ Notified team ${team_id} about meeting ${meeting_id}`);
    
  } catch (error) {
    console.error('❌ Error starting meeting:', error);
  }
});
```

---

## How It Works (After Backend Implementation)

### Scenario 1: Instant Meeting

**User A (Starter):**
1. Clicks "Start Instant Meeting"
2. Frontend emits `meeting:start` to backend
3. Meeting room opens with Jitsi
4. User A is in the meeting

**User B (Team Member):**
1. Backend emits `meeting:started` to team room
2. User B receives the event
3. Toast notification appears: "John started a meeting: Team Standup"
4. Notification panel shows new notification with "Join" button
5. User B clicks "Join"
6. User B joins the same Jitsi room
7. Both users can see and hear each other! 🎉

### Scenario 2: Scheduled Meeting

**15 Minutes Before:**
- All team members receive notification: "Meeting starting in 15 minutes: Weekly Standup"
- Browser notification (if enabled)
- In-app toast notification

**5 Minutes Before:**
- Reminder notification: "Meeting starting in 5 minutes: Weekly Standup"

**At Start Time:**
- Notification: "Meeting is starting now: Weekly Standup"
- "Join" button to enter meeting

**When Someone Starts It:**
- Same as Instant Meeting flow above

---

## Testing Instructions

### Step 1: Implement Backend
Add the 2 socket event handlers to your backend (see code above).

### Step 2: Test With 2 Users

**Window 1 (User A - John):**
1. Login as John
2. Go to Organization tab
3. Join a team
4. Click "Start Instant Meeting"

**Window 2 (User B - Alice):**
1. Login as Alice (different user, same team)
2. Go to Organization tab
3. **Expected:** Toast notification appears: "John started a meeting: Team Standup"
4. **Expected:** Bell icon shows notification badge
5. Click bell icon to see notification
6. Click "Join" button
7. **Expected:** Both users in same Jitsi meeting room

### Step 3: Verify Console Logs

**Backend Console:**
```
User john-id joined team room: team:team-456
Meeting start requested: { meeting_id: 'meeting-789', team_id: 'team-456' }
✅ Notified team team-456 about meeting meeting-789
```

**Frontend Console (User A):**
```
[Meetings] Joined team room: team-456
[Meetings] Emitted meeting:start event
```

**Frontend Console (User B):**
```
[Meetings] Joined team room: team-456
[Meetings] Meeting started: { meeting: { ... } }
Meeting started: Team Standup
```

---

## Current Issues

### Issue 1: Jitsi Lobby Mode
**Problem:** Jitsi's public server (meet.jit.si) enforces lobby/authentication mode
**Error:** `conference.connectionError.membersOnly`

**Solutions:**
1. **Self-host Jitsi** (recommended for production)
2. **Use 8x8.vc** (Jitsi's commercial service, no lobby)
3. **Use different video service** (Zoom, Google Meet, etc.)

**Temporary Workaround:**
The current implementation uses Jitsi iframe which works but may hit lobby restrictions. For testing notifications, you can:
- Have both users join quickly (within 30 seconds)
- Or use a self-hosted Jitsi server

### Issue 2: Backend Not Implemented
**Problem:** Backend doesn't emit `meeting:started` event
**Impact:** Other users never receive notifications
**Solution:** Implement the 2 socket handlers above

---

## Files Reference

### Frontend Files (Already Implemented ✅)
- `weconnect/src/components/organization/tabs/MeetingsTab.tsx` - Emits events, listens for notifications
- `weconnect/src/components/organization/tabs/JitsiMeetingRoom.tsx` - Jitsi meeting room
- `weconnect/src/components/organization/MeetingNotifications.tsx` - Notification panel
- `weconnect/store/uiStore.ts` - Notification state management
- `weconnect/lib/meetingScheduler.ts` - Scheduled meeting reminders

### Backend Files (Need Implementation ❌)
- Your socket.io server file - Add the 2 event handlers

### Documentation Files
- `weconnect/QUICK_FIX_JITSI.md` - Quick backend implementation guide
- `weconnect/BACKEND_JITSI_COMPLETE.md` - Complete backend guide with database schema
- `weconnect/WHAT_TO_EXPECT.md` - What to expect after implementation

---

## Summary

**What's Working:**
- ✅ Frontend emits `meeting:start` when meeting starts
- ✅ Frontend listens for `meeting:started` notifications
- ✅ Toast notifications display correctly
- ✅ Notification panel shows meeting notifications
- ✅ "Join" button opens meeting room
- ✅ Scheduled meeting reminders (15min, 5min, start time)
- ✅ Calendar integration
- ✅ Jitsi meeting room (with lobby limitation)

**What's Missing:**
- ❌ Backend socket event handlers
- ❌ Backend doesn't emit `meeting:started` to team members
- ❌ Self-hosted Jitsi server (optional but recommended)

**Next Steps:**
1. Implement the 2 backend socket handlers (5 minutes of work)
2. Test with 2 users in different browser windows
3. Verify notifications appear for User B when User A starts meeting
4. (Optional) Set up self-hosted Jitsi to avoid lobby issues

**Result After Backend Implementation:**
- 🎉 All team members receive notifications when meetings start
- 🎉 Click "Join" to enter the meeting
- 🎉 Everyone in the same room, can see and hear each other
- 🎉 Works like Microsoft Teams!
