# Troubleshooting Incoming Call Modal

## Issue: Incoming Call Modal Not Showing

### Debug Steps

#### 1. Check Browser Console Logs

When User A starts a meeting and User B should receive notification, check User B's browser console for these logs:

**Expected logs:**
```
[Meetings] Joined team room: <teamId>
[Meetings] Meeting started: { meeting: { ... } }
[Meetings] Current user ID: <userId>
[Meetings] Meeting started by: <starterUserId>
[Meetings] Showing incoming call modal
[IncomingMeetingModal] open: true meeting: { ... }
```

**If you see:**
```
[Meetings] Not showing modal - current user started the meeting
```
This means User B's ID matches the starter's ID (shouldn't happen if different users).

#### 2. Verify Socket Connection

**Check User B's console:**
```
[Socket] Connected
[Meetings] Joined team room: <teamId>
```

If you don't see these, the socket isn't connected.

#### 3. Verify Backend is Emitting Event

**Check backend logs:**
```
[RealtimeGateway] Meeting started: <meetingId> by user <userId>
[RealtimeGateway] Broadcasted meeting:started to team:<teamId>
```

If you don't see these, the backend isn't emitting the event.

#### 4. Check if Both Users Are in Same Team

**User A and User B must be:**
- In the same organization
- In the same team
- Both on the Meetings tab

#### 5. Verify Meeting Data Structure

The backend should emit:
```javascript
{
  meeting: {
    id: "meeting-id",
    organization_id: "org-id",
    team_id: "team-id",
    title: "Team Meeting",
    call_type: "video",
    started_by: "user-a-id",
    started_by_name: "John Doe"
  }
}
```

### Common Issues

#### Issue 1: Modal Shows for User Who Started Meeting
**Symptom:** User A sees the incoming call modal after starting meeting
**Cause:** `started_by` field doesn't match `currentUserId`
**Fix:** Check that backend is setting `started_by` correctly

#### Issue 2: No Sound
**Symptom:** Modal shows but no ringtone
**Cause:** Browser autoplay policy or Web Audio API error
**Fix:** 
- Click anywhere on the page first (user interaction required)
- Check browser console for audio errors
- Try in a different browser

#### Issue 3: Modal Doesn't Show at All
**Symptom:** No modal, no logs
**Possible causes:**
1. Socket not connected
2. User not in team room
3. Backend not emitting event
4. User IDs match (same user)

**Debug:**
```javascript
// In browser console (User B)
// Check if incomingMeeting state is set
// Open React DevTools → Components → MeetingsTab
// Look for incomingMeeting state
```

#### Issue 4: Modal Shows But Can't Accept
**Symptom:** Click Accept but nothing happens
**Cause:** `handleAcceptIncomingCall` function error
**Fix:** Check browser console for errors

### Manual Test

You can manually trigger the modal for testing:

**In User B's browser console:**
```javascript
// Simulate receiving meeting:started event
const socket = window.io?.(); // Get socket instance
socket.emit('meeting:started', {
  meeting: {
    id: 'test-meeting-123',
    organization_id: 'your-org-id',
    team_id: 'your-team-id',
    title: 'Test Meeting',
    call_type: 'video',
    started_by: 'different-user-id', // NOT current user
    started_by_name: 'Test User'
  }
});
```

### Verification Checklist

- [ ] Backend is running
- [ ] Frontend is running
- [ ] User A and User B are in same team
- [ ] Both users are on Meetings tab
- [ ] Socket connection established (check console)
- [ ] User B joined team room (check console)
- [ ] Backend emits meeting:started (check backend logs)
- [ ] User B receives event (check console)
- [ ] `started_by` !== `currentUserId`
- [ ] IncomingMeetingModal receives props (check console)
- [ ] Modal renders (check DOM)

### Quick Fix: Force Show Modal

If you want to test the modal UI without the full flow:

**In MeetingsTab.tsx, temporarily add:**
```typescript
// Add this after the state declarations
useEffect(() => {
  // Force show modal after 3 seconds for testing
  setTimeout(() => {
    setIncomingMeeting({
      id: 'test-123',
      title: 'Test Meeting',
      call_type: 'video',
      started_by_name: 'Test User',
      organization_id: organizationId,
      team_id: teamId,
    });
  }, 3000);
}, []);
```

This will show the modal 3 seconds after opening the Meetings tab.

### Check Modal Rendering

**In browser DevTools:**
1. Open Elements tab
2. Search for "IncomingMeetingModal" or "Incoming Video Call"
3. If found but not visible, check CSS (z-index, display, opacity)
4. If not found, modal isn't rendering

### Network Tab Check

**In browser DevTools → Network → WS (WebSocket):**
1. Find the socket.io connection
2. Click on it
3. Go to Messages tab
4. Look for `meeting:started` message
5. Verify the payload

### React DevTools Check

**If you have React DevTools:**
1. Open Components tab
2. Find MeetingsTab component
3. Check state:
   - `incomingMeeting` should be set when notification arrives
4. Find IncomingMeetingModal component
5. Check props:
   - `open` should be true
   - `meeting` should have data

### Still Not Working?

If none of the above helps, check:

1. **Browser compatibility** - Try Chrome/Edge
2. **Clear cache** - Hard refresh (Ctrl+Shift+R)
3. **Check for errors** - Any red errors in console?
4. **Firewall/Proxy** - Blocking WebSocket?
5. **CORS issues** - Check Network tab for CORS errors

### Expected Flow

```
User A clicks "Start Meeting"
       ↓
Frontend emits: meeting:start
       ↓
Backend receives: meeting:start
       ↓
Backend logs: "Meeting started: <id> by user <userId>"
       ↓
Backend emits: meeting:started to team:<teamId>
       ↓
Backend logs: "Broadcasted meeting:started to team:<teamId>"
       ↓
User B receives: meeting:started
       ↓
User B logs: "[Meetings] Meeting started: { ... }"
       ↓
User B logs: "[Meetings] Showing incoming call modal"
       ↓
User B logs: "[IncomingMeetingModal] open: true meeting: { ... }"
       ↓
Modal appears with ringtone
```

If any step in this flow is missing, that's where the problem is.
