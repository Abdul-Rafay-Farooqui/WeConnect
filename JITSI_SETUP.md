# Jitsi Meet Setup - Quick Start

## What Changed

✅ **Removed:** Complex WebRTC peer connections  
✅ **Added:** Simple Jitsi Meet integration  
✅ **Result:** Meetings work instantly with zero backend code!

## How It Works Now

```
User A clicks "Join Meeting"
    ↓
Frontend creates room: "org-123-team-456-meeting-789"
    ↓
Jitsi loads in iframe
    ↓
User A connects to Jitsi servers
    ↓
User B joins same meeting
    ↓
Frontend creates same room name
    ↓
User B connects to Jitsi servers
    ↓
Jitsi automatically connects them
    ↓
Video/audio works! 🎉
```

## Setup (2 Minutes)

### Step 1: No Backend Changes Needed!

That's right - Jitsi handles everything. You can optionally add tracking:

```javascript
// Optional: Track when meetings start/end
socket.on('meeting:started', ({ meeting_id }) => {
  console.log('Meeting started:', meeting_id);
  // Update database if needed
});

socket.on('meeting:ended', ({ meeting_id }) => {
  console.log('Meeting ended:', meeting_id);
  // Update database if needed
});
```

### Step 2: Test It!

1. Open your app
2. Click "Start Instant Meeting"
3. Wait for Jitsi to load (2-3 seconds)
4. You should see yourself in the video
5. Open another browser/tab
6. Join the same meeting
7. Both users see each other automatically! ✅

## Features You Get

### Basic Features (Free)
- ✅ HD video calls
- ✅ Audio calls
- ✅ Screen sharing
- ✅ Text chat
- ✅ Participant list
- ✅ Mute/unmute
- ✅ Camera on/off
- ✅ Unlimited participants
- ✅ No time limits

### Advanced Features (Free)
- ✅ Virtual backgrounds
- ✅ Background blur
- ✅ Raise hand
- ✅ Reactions (👍 ❤️ 😂)
- ✅ Tile view / Speaker view
- ✅ Fullscreen mode
- ✅ Picture-in-picture
- ✅ Keyboard shortcuts
- ✅ Mobile support

### Premium Features (Optional)
- Recording (with Dropbox)
- Live streaming (YouTube)
- Breakout rooms
- Polls
- Custom branding (self-hosted)

## Customization

### Change Jitsi Server

By default, uses public Jitsi servers (meet.jit.si). To use your own:

```typescript
// In JitsiMeetingRoom.tsx, line ~70:
const api = new window.JitsiMeetExternalAPI("your-domain.com", options);
```

### Customize Interface

```typescript
// In JitsiMeetingRoom.tsx, configOverwrite section:
configOverwrite: {
  startWithAudioMuted: true,        // Start muted
  startWithVideoMuted: false,       // Camera on
  enableWelcomePage: false,         // Skip welcome
  prejoinPageEnabled: true,         // Show pre-join screen
  defaultLanguage: "en",            // Language
  
  // Branding (self-hosted only)
  defaultRemoteDisplayName: "Guest",
  defaultLocalDisplayName: "Me",
}
```

### Customize Toolbar

```typescript
// In JitsiMeetingRoom.tsx, interfaceConfigOverwrite section:
TOOLBAR_BUTTONS: [
  "microphone",      // Mute/unmute
  "camera",          // Camera on/off
  "desktop",         // Screen share
  "fullscreen",      // Fullscreen
  "hangup",          // Leave meeting
  "chat",            // Text chat
  "raisehand",       // Raise hand
  "tileview",        // Grid view
  // Remove buttons you don't want
],
```

### Custom Branding

```typescript
// In JitsiMeetingRoom.tsx:
interfaceConfigOverwrite: {
  APP_NAME: "Your App Name",
  NATIVE_APP_NAME: "Your App",
  PROVIDER_NAME: "Your Company",
  SHOW_JITSI_WATERMARK: false,      // Remove Jitsi logo
  SHOW_WATERMARK_FOR_GUESTS: false,
  SHOW_BRAND_WATERMARK: false,
  SHOW_POWERED_BY: false,
}
```

## Troubleshooting

### Issue: Jitsi not loading

**Check 1:** Browser console for errors
```javascript
// Should see:
[Jitsi] User joined conference
```

**Check 2:** Script loaded
```javascript
// In browser console:
console.log(window.JitsiMeetExternalAPI);
// Should show: function
```

**Solution:** Clear cache and reload

### Issue: Can't see/hear others

**Check 1:** Browser permissions
- Click lock icon in address bar
- Allow camera and microphone

**Check 2:** Same room name
- Both users must join same meeting ID
- Check debug: room name should match

**Solution:** Grant permissions and rejoin

### Issue: Poor quality

**Check 1:** Internet speed
- Jitsi needs 1-2 Mbps per participant
- Test: https://fast.com

**Check 2:** Too many participants
- Recommended: 10-20 for best quality
- Maximum: 75 participants

**Solution:** Reduce video quality or participant count

### Issue: Meeting not starting

**Check 1:** Meeting ID exists
```javascript
console.log('Meeting:', meeting);
// Should show meeting object
```

**Check 2:** Organization/Team IDs
```javascript
console.log('Org:', organizationId, 'Team:', teamId);
// Should show valid IDs
```

**Solution:** Verify meeting was created properly

## Comparison: Before vs After

### Before (WebRTC)
```
❌ Complex setup
❌ Backend socket handlers needed
❌ Peer connection management
❌ ICE candidate forwarding
❌ STUN/TURN servers
❌ Only 2-4 participants reliable
❌ Hard to debug
❌ No screen share
❌ No chat
❌ No recording
```

### After (Jitsi)
```
✅ Simple setup
✅ No backend code needed
✅ Automatic connections
✅ Works out of the box
✅ Free public servers
✅ 75+ participants
✅ Easy to debug
✅ Screen share included
✅ Chat included
✅ Recording available
```

## Testing Checklist

- [ ] User can start instant meeting
- [ ] User can schedule meeting
- [ ] User can join scheduled meeting
- [ ] Multiple users can join same meeting
- [ ] Video works
- [ ] Audio works
- [ ] Screen share works
- [ ] Chat works
- [ ] Mute/unmute works
- [ ] Camera on/off works
- [ ] Leave meeting works
- [ ] Notifications work (if implemented)

## Next Steps

### 1. Test Basic Functionality
- Start a meeting
- Join with 2 users
- Verify video/audio works

### 2. Customize (Optional)
- Change branding
- Adjust toolbar buttons
- Set default settings

### 3. Add Tracking (Optional)
- Track meeting start/end
- Log participant count
- Monitor meeting duration

### 4. Consider Self-Hosting (Optional)
- For custom branding
- For data privacy
- For full control

## Resources

- **Jitsi Handbook:** https://jitsi.github.io/handbook/
- **External API Docs:** https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
- **Configuration Options:** https://github.com/jitsi/jitsi-meet/blob/master/config.js
- **Interface Config:** https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
- **Community Forum:** https://community.jitsi.org/

## Support

If you have issues:
1. Check browser console for errors
2. Test on different browser
3. Check internet connection
4. Try public Jitsi demo: https://meet.jit.si/test
5. Ask in Jitsi community forum

## Summary

🎉 **Congratulations!** Your meetings now work with:
- ✅ Zero backend complexity
- ✅ Professional video quality
- ✅ All features included
- ✅ Free and unlimited
- ✅ Works immediately

Just test it and enjoy! 🚀
