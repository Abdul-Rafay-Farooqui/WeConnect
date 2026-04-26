const AttendanceTab = ({ attendance }) => (
  <div>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Sign-in and sign-out times for the team. View who is present, active, or absent and total hours worked.
    </p>
    <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>Attendance Records</h3>
      {attendance.map((record) => (
        <div key={record.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
          <div style={{ fontSize: '24px', marginRight: '12px' }}>{record.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{record.name}</div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Sign In: {record.signIn} | Sign Out: {record.signOut} | Hours: {record.hours}h</div>
          </div>
          <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', background: 'hsl(var(--bg-tertiary))', color: 'hsl(var(--text-muted))' }}>{record.status}</div>
        </div>
      ))}
    </div>
  </div>
);

export default AttendanceTab;
