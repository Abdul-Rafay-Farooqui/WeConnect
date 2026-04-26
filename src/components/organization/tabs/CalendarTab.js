const CalendarTab = ({ meetings }) => (
  <div>
    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>Team Calendar</h3>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      View meetings and events. Dots on dates indicate scheduled items.
    </p>
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {Array.from({ length: 35 }, (_, i) => {
          const date = i + 1;
          const hasMeeting = meetings.some((m) => m.date === 'Today' && date === 16);
          return (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', background: hasMeeting ? 'hsl(var(--accent-tertiary) / 0.2)' : 'hsl(var(--bg-tertiary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {date <= 31 ? date : ''}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default CalendarTab;
