# Meeting Functionality Improvements

## Overview
Enhanced the meeting and video call functionality with modern features, better layouts, calendar integration, and automated notifications.

## New Features

### 1. Enhanced Video Call Interface
**File:** `src/components/organization/tabs/EnhancedMeetingRoom.tsx`

Features:
- Modern grid and speaker view layouts
- Automatic layout adjustment based on participant count (1-16+ participants)
- High-quality video (1280x720) with audio enhancements:
  - Echo cancellation
  - Noise suppression
  - Auto gain control
- Screen sharing with visual indicator
- Participants panel with real-time status
- In-meeting chat (UI ready)
- Fullscreen mode
- Professional controls with hover effects
- Mute/unmute audio
- Turn camera on/off
- Visual indicators for muted participants

### 2. Meeting Notifications System
**Files:** 
- `lib/meetingScheduler.ts`
- `src/components/organization/MeetingNotifications.tsx`
- `store/uiStore.ts` (enhanced)

Features:
- Automatic notifications at:
  - 15 minutes before meeting
  - 5 minutes before meeting
  - At meeting start time
- Browser push notifications (with permission)
- In-app notification panel with:
  - Unread count badge
  - Color-coded notification types
  - Quick join buttons for live meetings
  - Mark as read functionality
  - Clear all option
- Real-time socket updates for meeting events
- Notification types:
  - `scheduled` - Meeting was scheduled
  - `starting_soon` - Meeting starting in 15/5 minutes
  - `started` - Meeting has started (join now)
  - `ended` - Meeting has ended
  - `cancelled` - Meeting was cancelled

### 3. Calendar Integration
**File:** `src/components/organization/tabs/CalendarTab.tsx` (enhanced)

Features:
- Meetings automatically appear on calendar
- Visual indicators for:
  - Scheduled meetings (blue)
  - Live meetings (red with pulse animation)
  - Regular events (purple, yellow, red based on type)
- Click to join live meetings directly from calendar
- Month and agenda views
- Event count badges on calendar days
- Color-coded event type bars
- Responsive design for mobile and desktop

### 4. Improved Meetings Tab
**File:** `src/components/organization/tabs/MeetingsTab.tsx` (enhanced)

Features:
- Notification permission banner
- Real-time meeting status updates
- Live meeting indicators with pulse animation
- Quick join buttons for ongoing meetings
- Better visual hierarchy
- Improved scheduling modal
- Socket integration for real-time updates

## Technical Implementation

### WebRTC Configuration
```typescript
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
```

### Meeting Scheduler
The `MeetingScheduler` class monitors scheduled meetings and triggers notifications:
- Checks every minute for upcoming meetings
- Prevents duplicate notifications
- Integrates with browser Notification API
- Updates UI store for in-app notifications

### State Management
Enhanced `uiStore.ts` with:
```typescript
meetingNotifications: Array<{
  id: string;
  meeting_id: string;
  organization_id: string;
  team_id: string;
  title: string;
  type: 'scheduled' | 'starting_soon' | 'started' | 'ended' | 'cancelled';
  message: string;
  call_type?: "voice" | "video";
  starts_at?: string;
  created_at: string;
  read: boolean;
}>;
```

### Socket Events
- `meeting:scheduled` - New meeting scheduled
- `meeting:started` - Meeting has started
- `meeting:ended` - Meeting has ended
- `meeting:join` - User joins meeting
- `meeting:leave` - User leaves meeting
- `meeting:user-joined` - Another user joined
- `meeting:user-left` - Another user left
- `meeting:offer` - WebRTC offer
- `meeting:answer` - WebRTC answer
- `meeting:ice-candidate` - ICE candidate exchange

## Usage

### Enable Notifications
1. Click "Enable Notifications" banner in Meetings tab
2. Grant browser notification permission
3. Receive automatic reminders for scheduled meetings

### Schedule a Meeting
1. Click "Schedule Meeting" button
2. Fill in meeting details:
   - Title (required)
   - Description (optional)
   - Date and time (required)
   - Call type (video/voice)
   - Attendees (auto-selected: all team members)
3. Meeting appears on calendar and in meetings list
4. All participants receive notification

### Join a Meeting
From Meetings Tab:
- Click "Join" on live meetings
- Click "Start" on scheduled meetings (admin only)

From Calendar:
- Click on meeting event
- Click "Join Meeting" button for live meetings

From Notifications:
- Open notification panel
- Click "Join Now" on started meeting notifications

### During Meeting
- Toggle microphone: Mute/unmute
- Toggle camera: Turn video on/off
- Share screen: Start/stop screen sharing
- View participants: See all participants and their status
- Switch views: Grid view (all equal) or Speaker view (focus on active speaker)
- Fullscreen: Expand to fullscreen mode
- Leave: End your participation

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.3+)
- Requires HTTPS for camera/microphone access

## Future Enhancements
- Recording functionality
- Virtual backgrounds
- Breakout rooms
- Polls and reactions
- Meeting transcription
- Waiting room
- Hand raise feature
- Chat history persistence
- File sharing during meetings
- Meeting analytics and reports

## Dependencies
- `zustand` - State management
- `socket.io-client` - Real-time communication
- `lucide-react` - Icons
- `date-fns` - Date formatting (for notifications)
- WebRTC APIs - Video/audio streaming
- Notification API - Browser notifications

## Notes
- Meetings require HTTPS in production
- Browser notification permission is optional but recommended
- Screen sharing may not work on all browsers/devices
- Meeting scheduler runs in background while app is open
- Notifications persist until manually cleared or marked as read
