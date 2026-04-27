# Meeting System Setup Guide

## Quick Start

### 1. Install Dependencies
All required dependencies are already in package.json. If you need to reinstall:

```bash
cd weconnect
npm install
```

### 2. Import Components

#### In your Organization/Team page:
```typescript
import MeetingsTab from '@/components/organization/tabs/MeetingsTab';
import CalendarTab from '@/components/organization/tabs/CalendarTab';
import MeetingNotifications from '@/components/organization/MeetingNotifications';
```

#### Add notification panel to your layout:
```typescript
import { useUIStore } from '@/store/uiStore';

function YourLayout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { meetingNotifications } = useUIStore();
  const unreadCount = meetingNotifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell Icon */}
      <button onClick={() => setShowNotifications(true)} className="relative">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <MeetingNotifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onJoinMeeting={(notification) => {
          // Handle joining meeting
          openMeetingScreen({
            organization_id: notification.organization_id,
            team_id: notification.team_id,
            meeting_id: notification.meeting_id,
            title: notification.title,
            call_type: notification.call_type,
          });
        }}
      />
    </>
  );
}
```

### 3. Update MeetingsTab Usage

```typescript
<MeetingsTab
  meetings={meetings}
  members={teamMembers}
  organizationId={organizationId}
  teamId={teamId}
  currentUserId={currentUser.id}
  isAdmin={isAdmin}
  onScheduleMeeting={async (payload) => {
    // API call to schedule meeting
    await OrganizationAPI.scheduleMeeting(organizationId, teamId, payload);
  }}
  onStartMeetingNow={async (payload) => {
    // API call to start instant meeting
    return await OrganizationAPI.startMeeting(organizationId, teamId, payload);
  }}
  onStartMeeting={async (meetingId, callType) => {
    // API call to start scheduled meeting
    return await OrganizationAPI.startScheduledMeeting(organizationId, teamId, meetingId);
  }}
  onEndMeeting={async (meetingId) => {
    // API call to end meeting
    await OrganizationAPI.endMeeting(organizationId, teamId, meetingId);
  }}
  onRefresh={async () => {
    // Refresh meetings list
    await fetchMeetings();
  }}
/>
```

### 4. Update CalendarTab Usage

```typescript
<CalendarTab
  events={calendarEvents}
  meetings={meetings}
  teamMembers={teamMembers}
  currentUserId={currentUser.id}
  isAdmin={isAdmin}
  onAdd={async (payload) => {
    // API call to create calendar event
    await OrganizationAPI.createCalendarEvent(organizationId, teamId, payload);
  }}
  onDelete={async (eventId) => {
    // API call to delete calendar event
    await OrganizationAPI.deleteCalendarEvent(organizationId, teamId, eventId);
  }}
  onJoinMeeting={(meetingId) => {
    // Handle joining meeting from calendar
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      openMeetingScreen({
        organization_id: organizationId,
        team_id: teamId,
        meeting_id: meetingId,
        title: meeting.title,
        call_type: meeting.call_type,
      });
    }
  }}
/>
```

### 5. Backend API Requirements

Your backend should support these endpoints:

#### Schedule Meeting
```
POST /api/organizations/:orgId/teams/:teamId/meetings/schedule
Body: {
  title: string;
  description?: string;
  starts_at: string; // ISO 8601
  ends_at: string; // ISO 8601
  call_type: 'voice' | 'video';
  attendee_ids: string[];
}
```

#### Start Instant Meeting
```
POST /api/organizations/:orgId/teams/:teamId/meetings/instant
Body: {
  title: string;
  duration_minutes: number;
  call_type: 'voice' | 'video';
  attendee_ids: string[];
}
```

#### Start Scheduled Meeting
```
POST /api/organizations/:orgId/teams/:teamId/meetings/:meetingId/start
```

#### End Meeting
```
POST /api/organizations/:orgId/teams/:teamId/meetings/:meetingId/end
```

#### Get Meetings
```
GET /api/organizations/:orgId/teams/:teamId/meetings
```

### 6. Socket Events

Your backend should emit these socket events:

```typescript
// When meeting is scheduled
socket.emit('meeting:scheduled', {
  meeting: {
    id: string;
    organization_id: string;
    team_id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    call_type: 'voice' | 'video';
    status: 'scheduled';
  }
});

// When meeting starts
socket.emit('meeting:started', {
  meeting: {
    id: string;
    organization_id: string;
    team_id: string;
    title: string;
    call_type: 'voice' | 'video';
    status: 'ongoing';
  }
});

// When meeting ends
socket.emit('meeting:ended', {
  meeting_id: string;
});
```

### 7. Database Schema

Suggested meeting table structure:

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  team_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  call_type VARCHAR(10) NOT NULL, -- 'voice' or 'video'
  status VARCHAR(20) NOT NULL, -- 'scheduled', 'ongoing', 'ended', 'cancelled'
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meeting_attendees (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id),
  user_id UUID NOT NULL,
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meetings_org_team ON meetings(organization_id, team_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_starts_at ON meetings(starts_at);
```

## Testing

### 1. Test Notifications
```typescript
// Request permission
await MeetingScheduler.requestNotificationPermission();

// Manually trigger notification
MeetingScheduler.notifyMeetingScheduled({
  id: 'test-123',
  organization_id: 'org-1',
  team_id: 'team-1',
  title: 'Test Meeting',
  starts_at: new Date(Date.now() + 15 * 60000).toISOString(), // 15 min from now
  call_type: 'video',
});
```

### 2. Test Meeting Room
1. Schedule a meeting
2. Start the meeting
3. Join from another browser/device
4. Test controls:
   - Mute/unmute
   - Camera on/off
   - Screen share
   - View modes
   - Participants panel

### 3. Test Calendar Integration
1. Schedule a meeting with specific date/time
2. Check calendar view - meeting should appear
3. Click on meeting day
4. Verify meeting details in sidebar
5. If meeting is live, test "Join Meeting" button

## Troubleshooting

### Notifications not working
- Check browser notification permission
- Verify `MeetingScheduler.startMonitoring()` is called
- Check browser console for errors
- Ensure meetings have valid `starts_at` timestamps

### Video/Audio not working
- Verify HTTPS connection (required for camera/mic)
- Check browser permissions for camera/microphone
- Test with different browsers
- Check WebRTC compatibility

### Calendar not showing meetings
- Verify `meetings` prop is passed to CalendarTab
- Check meeting `starts_at` format (should be ISO 8601)
- Verify date calculations in `allCalendarItems` useMemo

### Socket events not received
- Check socket connection status
- Verify backend is emitting events correctly
- Check socket event names match exactly
- Look for errors in browser console

## Production Checklist

- [ ] HTTPS enabled (required for WebRTC)
- [ ] STUN/TURN servers configured for production
- [ ] Socket.io connection secured
- [ ] Meeting data persisted in database
- [ ] Notification permissions requested appropriately
- [ ] Error handling for media device access
- [ ] Fallback UI for unsupported browsers
- [ ] Meeting cleanup on user disconnect
- [ ] Rate limiting on meeting creation
- [ ] Meeting recording storage (if enabled)

## Performance Tips

1. Limit video quality based on network conditions
2. Use TURN server for users behind strict firewalls
3. Implement participant limits (recommended: 16 max for grid view)
4. Clean up old notifications periodically
5. Optimize socket event payloads
6. Use pagination for meeting history
7. Implement lazy loading for calendar events

## Security Considerations

1. Validate meeting access permissions
2. Implement meeting passwords/PINs
3. Add waiting room for sensitive meetings
4. Log meeting access for audit trails
5. Encrypt media streams (WebRTC does this by default)
6. Validate socket authentication
7. Rate limit meeting creation
8. Implement meeting expiration

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Review socket connection status
4. Check backend API responses
5. Test with different browsers/devices
