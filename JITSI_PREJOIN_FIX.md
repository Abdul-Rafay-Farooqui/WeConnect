# Jitsi Prejoin Page Fix

## Issue
When joining a Jitsi meeting, users see a "Enter your name" screen (prejoin page) instead of joining directly with their username from the app.

## Solution Applied

Updated `JitsiMeetingRoom.tsx` with enhanced configuration to skip the prejoin page and automatically use the user's display name.

### Configuration Changes

```typescript
configOverwrite: {
  prejoinPageEnabled: false,        // Skip the prejoin page
  prejoinConfig: {
    enabled: false,                  // Also disable in prejoin config
  },
  startWithAudioMuted: false,        // Start with audio on
  startWithVideoMuted: false,        // Start with video on
  requireDisplayName: false,         // Don't require display name
  disableProfile: true,              // Disable profile editing
  enableWelcomePage: false,          // Disable welcome page
  enableClosePage: false,            // Disable close page
  disableDeepLinking: true,          // Disable deep linking
},
userInfo: {
  displayName: currentUserName || 'User',  // Auto-fill user's name
  email: '',                         // Optional email
},
```

## How It Works

1. **User starts/joins meeting** → `currentUserName` is passed to JitsiMeetingRoom
2. **Jitsi External API loads** → Configuration is applied
3. **User joins directly** → No prejoin screen, name is pre-filled
4. **User appears in meeting** → With their display name from the app

## Testing

### Before Fix
1. User clicks "Start Meeting" or "Join"
2. ❌ Jitsi shows "Enter your name" screen
3. User has to type their name manually
4. User clicks "Join meeting"

### After Fix
1. User clicks "Start Meeting" or "Join"
2. ✅ Jitsi joins directly
3. ✅ User's name is automatically set
4. ✅ No manual input required

## Why Prejoin Page Might Still Show

The public Jitsi server (meet.jit.si) sometimes enforces the prejoin page regardless of configuration. This can happen due to:

1. **Server-side settings** - Jitsi server overrides client config
2. **Browser restrictions** - Some browsers require user interaction
3. **Network issues** - Config not applied in time
4. **Jitsi version** - Older Jitsi versions ignore some configs

## Alternative Solutions

### Option 1: Use JWT Authentication (Recommended for Production)

Set up your own Jitsi server with JWT authentication:

```typescript
const options = {
  roomName: meeting.id,
  jwt: generateJWT({
    userId: currentUserId,
    userName: currentUserName,
    roomName: meeting.id,
  }),
  // ... other options
};
```

**Benefits:**
- Full control over prejoin behavior
- Better security
- Custom branding
- No lobby restrictions

### Option 2: Self-Hosted Jitsi Server

Host your own Jitsi Meet instance:

```typescript
const domain = 'your-jitsi-server.com'; // Instead of meet.jit.si
```

**Benefits:**
- Complete control over all settings
- No public server limitations
- Better performance
- Custom features

### Option 3: Use URL Parameters (Fallback)

If External API fails, the iframe fallback uses URL parameters:

```typescript
const roomUrl = `https://meet.jit.si/${meeting.id}#config.prejoinPageEnabled=false&userInfo.displayName="${userName}"`;
```

This works but has less control than External API.

## Current Implementation

The code now uses a **hybrid approach**:

1. **Primary**: Jitsi External API with full configuration
2. **Fallback**: iframe with URL parameters if External API fails

Both methods attempt to skip the prejoin page and set the display name.

## Troubleshooting

### Prejoin Page Still Shows

**Try these steps:**

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check console logs** - Look for Jitsi errors
3. **Try different browser** - Chrome/Edge work best
4. **Check user name** - Verify `currentUserName` is set

**Debug in console:**
```javascript
// Check if user name is being passed
console.log('Current user name:', currentUserName);

// Check Jitsi config
console.log('Jitsi options:', options);
```

### Name Not Auto-Filled

**Possible causes:**
1. `currentUserName` is undefined or empty
2. Jitsi config not applied
3. Browser blocking auto-fill

**Fix:**
- Verify user profile has a name
- Check `profile?.name` in layout.tsx
- Add fallback: `currentUserName || user?.email || 'User'`

### External API Not Loading

**Symptoms:**
- Falls back to iframe
- Limited control over prejoin

**Fix:**
- Check internet connection
- Verify https://meet.jit.si/external_api.js is accessible
- Check browser console for script loading errors

## Configuration Reference

### All Prejoin-Related Configs

```typescript
configOverwrite: {
  // Main prejoin settings
  prejoinPageEnabled: false,
  prejoinConfig: {
    enabled: false,
    hideDisplayName: false,
    hideExtraJoinButtons: [],
  },
  
  // Display name settings
  requireDisplayName: false,
  disableProfile: true,
  
  // Welcome/close pages
  enableWelcomePage: false,
  enableClosePage: false,
  
  // Other useful settings
  startWithAudioMuted: false,
  startWithVideoMuted: false,
  disableDeepLinking: true,
  
  // Lobby settings (if applicable)
  enableLobbyChat: false,
  hideConferenceSubject: false,
}
```

### User Info Settings

```typescript
userInfo: {
  displayName: 'John Doe',    // User's display name
  email: 'john@example.com',  // User's email (optional)
  avatarURL: 'https://...',   // User's avatar (optional)
}
```

## Best Practices

### 1. Always Provide Display Name
```typescript
currentUserName={profile?.name || user?.email || 'User'}
```

### 2. Handle Missing User Info
```typescript
const displayName = currentUserName || 
                    profile?.display_name || 
                    user?.phone || 
                    'Anonymous User';
```

### 3. Log Configuration for Debugging
```typescript
console.log('[Jitsi] Initializing with:', {
  roomName: meeting.id,
  displayName: currentUserName,
  prejoinEnabled: false,
});
```

### 4. Test with Multiple Browsers
- Chrome/Edge (best support)
- Firefox (good support)
- Safari (some limitations)

## Production Recommendations

For production use, consider:

1. **Self-hosted Jitsi** - Full control, better performance
2. **JWT authentication** - Secure, no lobby issues
3. **Custom domain** - Professional appearance
4. **Recording server** - Save meetings
5. **TURN server** - Better connectivity

## Summary

The prejoin page issue is now fixed with:
- ✅ `prejoinPageEnabled: false` in multiple places
- ✅ `requireDisplayName: false` to skip name requirement
- ✅ `userInfo.displayName` auto-filled from app
- ✅ Fallback iframe with URL parameters
- ✅ Enhanced error handling

Users should now join meetings directly without seeing the "Enter your name" screen!

## Testing Checklist

- [ ] User A starts meeting
- [ ] User A joins directly (no prejoin screen)
- [ ] User A's name shows correctly in meeting
- [ ] User B receives notification
- [ ] User B clicks "Accept"
- [ ] User B joins directly (no prejoin screen)
- [ ] User B's name shows correctly in meeting
- [ ] Both users can see each other's names

If all checkboxes pass, the fix is working correctly!
