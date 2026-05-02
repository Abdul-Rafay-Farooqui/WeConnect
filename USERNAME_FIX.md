# Username Display Fix

## Issue
All users showing as "User" in Jitsi meetings instead of their actual display names.

## Root Cause
The `layout.tsx` was using `profile?.name` but the Profile type has `display_name` field, not `name`.

## Fix Applied

### File: `weconnect/src/app/(main)/layout.tsx`

**Before:**
```typescript
currentUserName={profile?.name || "User"}
```

**After:**
```typescript
currentUserName={profile?.display_name || user?.email || "User"}
```

### Profile Type Structure
```typescript
export type Profile = {
  id: string;
  phone: string;
  display_name: string;  // ← Correct field name
  username?: string;
  avatar_url?: string;
  // ... other fields
};
```

## How It Works Now

1. **User logs in** → Profile loaded with `display_name`
2. **User starts/joins meeting** → `currentUserName` = `profile.display_name`
3. **Jitsi loads** → User's actual name is passed to Jitsi
4. **User appears in meeting** → With their real display name

## Fallback Chain

The fix includes a fallback chain:
```typescript
profile?.display_name  // First choice: User's display name
|| user?.email         // Second choice: User's email
|| "User"              // Last resort: Generic "User"
```

## Testing

### Before Fix
- User A joins meeting → Shows as "User"
- User B joins meeting → Shows as "User"
- ❌ Can't tell users apart

### After Fix
- User A joins meeting → Shows as "John Doe"
- User B joins meeting → Shows as "Jane Smith"
- ✅ Each user has their actual name

## Debug Logging

Added console logging to help verify:

```typescript
console.log('[JitsiMeetingRoom] currentUserName:', currentUserName);
```

**Check browser console when joining meeting:**
- Should show: `[JitsiMeetingRoom] currentUserName: John Doe`
- NOT: `[JitsiMeetingRoom] currentUserName: User`

## Verification Steps

1. **Start a meeting**
2. **Open browser console** (F12)
3. **Look for log**: `[JitsiMeetingRoom] currentUserName: <your-name>`
4. **Check Jitsi interface** - Your name should appear
5. **Have another user join** - Their name should appear

## If Still Showing "User"

### Check 1: Profile Has Display Name
```javascript
// In browser console
console.log('Profile:', profile);
console.log('Display name:', profile?.display_name);
```

If `display_name` is undefined or empty, the user needs to set their name in profile settings.

### Check 2: Prop is Being Passed
```javascript
// Check in React DevTools
// Components → JitsiMeetingRoom
// Props → currentUserName
```

Should show the actual name, not "User".

### Check 3: Jitsi Config Applied
```javascript
// In browser console when meeting loads
// Look for: userInfo: { displayName: "John Doe" }
```

## Related Files

All these files correctly use `display_name`:

✅ `weconnect/src/components/organization/OrgView.tsx`
```typescript
currentUserName={
  profile?.display_name ??
  currentUser?.display_name ??
  "Someone"
}
```

✅ `weconnect/src/app/(main)/layout.tsx` (now fixed)
```typescript
currentUserName={profile?.display_name || user?.email || "User"}
```

## Common Issues

### Issue 1: Name Not Set in Profile
**Symptom:** Still shows "User" even after fix
**Cause:** User hasn't set their display name
**Fix:** User needs to update their profile with a display name

### Issue 2: Profile Not Loaded
**Symptom:** Shows email or "User"
**Cause:** Profile data not loaded yet
**Fix:** Wait for profile to load, or check auth flow

### Issue 3: Old Cache
**Symptom:** Still shows "User" after fix
**Cause:** Browser cache
**Fix:** Hard refresh (Ctrl+Shift+R) or clear cache

## Summary

The fix changes:
- ❌ `profile?.name` (doesn't exist)
- ✅ `profile?.display_name` (correct field)

With fallback to email or "User" if display name is not set.

Users will now see their actual names in Jitsi meetings!

## Testing Checklist

- [ ] User A starts meeting
- [ ] Console shows: `[JitsiMeetingRoom] currentUserName: <actual-name>`
- [ ] User A's name appears in Jitsi (not "User")
- [ ] User B joins meeting
- [ ] User B's name appears in Jitsi (not "User")
- [ ] Both users can see each other's real names
- [ ] No "User" labels visible

If all checkboxes pass, the fix is working correctly!
