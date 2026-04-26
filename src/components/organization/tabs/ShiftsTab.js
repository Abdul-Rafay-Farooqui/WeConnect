const ShiftsTab = ({ shifts }) => (
  <div>
    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Shifts</h3>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      View who is scheduled and when.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {shifts.map((shift) => (
        <div key={shift.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{shift.user}</div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>{shift.role}</div>
          </div>
          <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>{shift.date}</div>
          <div style={{ fontSize: '14px', color: 'hsl(var(--text-primary))', fontWeight: '500' }}>{shift.shift}</div>
        </div>
      ))}
    </div>
  </div>
);

export default ShiftsTab;
