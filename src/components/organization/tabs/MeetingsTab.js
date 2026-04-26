const MeetingsTab = ({ meetings, setShowMeetingOptions }) => (
  <div>
    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Scheduled Meetings</h3>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Join or schedule team meetings. Use Meeting options to enable recording, live captions, raise hand, and breakout rooms.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {meetings.map((meeting) => (
        <div key={meeting.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>{meeting.title}</h4>
              <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>📅 {meeting.date} • {meeting.time}</div>
              <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>👥 {meeting.attendees} attendees</div>
            </div>
            <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', background: meeting.status === 'upcoming' ? 'hsl(var(--accent-primary) / 0.2)' : 'hsl(var(--bg-tertiary))', color: meeting.status === 'upcoming' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-muted))' }}>
              {meeting.status}
            </div>
          </div>
          {meeting.status === 'upcoming' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" style={{ padding: '8px 16px', flex: 1 }}>📹 Join Meeting</button>
              <button className="btn-ghost" style={{ padding: '8px 16px' }} onClick={() => setShowMeetingOptions(true)}>⚙️ Meeting options</button>
              <button className="btn-ghost" style={{ padding: '8px 16px' }}>✏️ Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default MeetingsTab;
