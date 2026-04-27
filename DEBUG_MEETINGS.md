# Debugging Meeting Issues

## Quick Debug Steps

### 1. Open Browser Console
Press `F12` or right-click → Inspect → Console

### 2. Check Debug Panel
In the meeting room, click the "Debug" button in the top-right corner to see:
- Meeting ID
- Current User ID
- Local Stream status
- Socket connection status
- Number of peers
- Number of remote streams
- Peer connection states

### 3. Look for Console Logs
The app now logs everything with `[Meeting]` prefix:

```
[Meeting] Initializing meeting room
[Meeting] Socket connected: true
[Meeting] Joining meeting: meeting-123
[Meeting] User joined: user-456
[Meeting] Creating peer connection: { userId: 'user-456', initiator: true }
[Meeting] Adding local tracks to peer
[Meeting] Creating offer for: user-456
[Meeting] Sending offer to: user-456
[Meeting] Received answer from: user-456
[Meeting] Received track from: user-456
[Meeting] Adding remote stream for: user-456
```

## Common Issues & Solutions

### Issue 1: Only seeing yourself

**Symptoms:**
- You join the meeting
- You see your own video
- Other user joins but you don't see them
- They don't see you either

**Debug Steps:**
1. Open console on both browsers
2. Check if you see `[Meeting] User joined: <other-user-id>`
3. Check if you see `[Meeting] Creating peer connection`
4. Check if you see `[Meeting] Sending offer`

**Possible Causes:**

#### A. Backend not forwarding socket events
**Check:** Do you see `[Meeting] Received offer` on the other user's console?
**Solution:** Implement backend socket events (see `BACKEND_SOCKET_EVENTS.md`)

```javascript
// Backend should forward like this:
socket.on('meeting:offer', ({ target_user_id, offer }) => {
  io.to(targetSocketId).emit('meeting:offer', {
    from_user_id: socket.userId,
    offer: offer
  });
});
```

#### B. User IDs not matching
**Check:** Are the user IDs in the logs correct?
**Solution:** Verify `currentUserId` prop is being passed correctly

#### C. Socket not connected
**Check:** Debug panel shows "Socket Connected: ❌"
**Solution:** 
```javascript
// Check socket connection
const socket = getSocket();
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

#### D. Local stream not ready
**Check:** Debug panel shows "Local Stream: ❌"
**Solution:** Wait for camera/mic permission, check console for media errors

### Issue 2: Connection established but no video

**Symptoms:**
- Debug panel shows peers and remote streams
- But video element is black/empty

**Debug Steps:**
1. Check if `[Meeting] Received track` appears in console
2. Check if `[Meeting] Adding remote stream` appears
3. Inspect video element in browser DevTools

**Solutions:**

#### A. Video element not getting stream
```javascript
// Check in console:
document.querySelectorAll('video').forEach(v => {
  console.log('Video element:', v);
  console.log('Has srcObject:', !!v.srcObject);
  console.log('Tracks:', v.srcObject?.getTracks());
});
```

#### B. Autoplay blocked
**Solution:** User must interact with page first (click something)

#### C. Track is muted
```javascript
// Check track status:
remoteStream.getTracks().forEach(track => {
  console.log('Track:', track.kind, 'Enabled:', track.enabled, 'Muted:', track.muted);
});
```

### Issue 3: ICE connection fails

**Symptoms:**
- Peer connection state shows "failed" or "disconnected"
- No video/audio despite everything else working

**Debug Steps:**
1. Check peer connection state in debug panel
2. Look for ICE candidate logs
3. Check network/firewall

**Solutions:**

#### A. STUN server not reachable
```javascript
// Test STUN server:
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
pc.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('ICE candidate:', e.candidate);
  }
};
```

#### B. Need TURN server (behind firewall)
**Solution:** Add TURN server to config:
```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

#### C. Corporate firewall blocking WebRTC
**Solution:** Use TURN server or VPN

### Issue 4: Notifications not appearing

**Symptoms:**
- Meeting scheduled but no notifications
- No browser notifications

**Debug Steps:**
1. Check notification permission: `Notification.permission`
2. Check if `MeetingScheduler.startMonitoring()` is called
3. Check console for notification logs

**Solutions:**

#### A. Permission not granted
```javascript
// Request permission:
Notification.requestPermission().then(permission => {
  console.log('Notification permission:', permission);
});
```

#### B. Scheduler not started
**Check:** Is `MeetingScheduler.startMonitoring(meetings)` called in `MeetingsTab`?

#### C. Meeting time format wrong
**Check:** `starts_at` should be ISO 8601 format: `2024-01-15T10:00:00Z`

### Issue 5: Camera/Microphone not working

See `TROUBLESHOOTING_CALLS.md` for detailed camera/mic debugging.

## Testing Checklist

### Before Testing
- [ ] Backend socket events implemented
- [ ] HTTPS enabled (required for camera/mic)
- [ ] Browser permissions granted
- [ ] No other apps using camera/mic

### Test with 2 Users
1. **User A joins meeting**
   - [ ] Sees own video
   - [ ] Debug panel shows local stream ✅
   - [ ] Debug panel shows socket connected ✅

2. **User B joins meeting**
   - [ ] User A sees "User joined" in console
   - [ ] User A sees peer connection created
   - [ ] User B sees "User joined" in console
   - [ ] User B sees peer connection created

3. **WebRTC Handshake**
   - [ ] User A sends offer
   - [ ] User B receives offer
   - [ ] User B sends answer
   - [ ] User A receives answer
   - [ ] ICE candidates exchanged

4. **Video Streams**
   - [ ] User A sees User B's video
   - [ ] User B sees User A's video
   - [ ] Both see 2 participants in debug panel

### Test Controls
- [ ] Mute/unmute works
- [ ] Camera on/off works
- [ ] Screen share works
- [ ] Leave meeting works
- [ ] Participants panel shows both users

## Advanced Debugging

### Monitor WebRTC Stats
```javascript
// In browser console during meeting:
const pc = Array.from(peersRef.current.values())[0];
pc.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      console.log('Video stats:', {
        bytesReceived: report.bytesReceived,
        packetsLost: report.packetsLost,
        framesDecoded: report.framesDecoded
      });
    }
  });
});
```

### Check Network Quality
```javascript
// Monitor connection quality:
pc.oniceconnectionstatechange = () => {
  console.log('ICE state:', pc.iceConnectionState);
};

pc.onconnectionstatechange = () => {
  console.log('Connection state:', pc.connectionState);
};
```

### Capture Network Logs
1. Open Chrome DevTools
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Check socket.io messages

### Enable WebRTC Internals
Chrome: `chrome://webrtc-internals`
Firefox: `about:webrtc`

Shows detailed WebRTC connection info, ICE candidates, and stats.

## Quick Fixes

### Reset Everything
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Reconnect Socket
```javascript
// In browser console:
import { reconnectSocket } from '@/lib/socket';
reconnectSocket();
```

### Clear Peer Connections
```javascript
// Leave and rejoin meeting
```

## Getting Help

When reporting issues, include:
1. Browser console logs (with `[Meeting]` prefix)
2. Debug panel screenshot
3. Browser and version
4. Operating system
5. Network setup (corporate, home, VPN, etc.)
6. Steps to reproduce

## Performance Tips

### Reduce Video Quality
```javascript
// In MeetingRoomModal.tsx, change:
video: {
  width: { ideal: 640 },  // Lower from 1280
  height: { ideal: 480 }, // Lower from 720
  facingMode: "user"
}
```

### Limit Participants
Grid view works best with 4-9 participants. For larger meetings, use speaker view.

### Check Bandwidth
```javascript
// Test bandwidth:
navigator.connection?.downlink // Mbps
navigator.connection?.effectiveType // '4g', '3g', etc.
```

## Production Monitoring

### Log Important Events
```javascript
// Track meeting metrics:
- Meeting join time
- Time to first video
- Connection failures
- Peer connection states
- ICE gathering time
```

### Alert on Issues
```javascript
// Monitor for:
- Failed peer connections
- No remote streams after 10 seconds
- Socket disconnections
- Media device errors
```
