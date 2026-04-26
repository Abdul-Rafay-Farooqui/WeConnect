const ActivityTab = ({ activity }) => (
  <div>
    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Activity</h3>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Your mentions, replies, reactions, and file shares in this team. Unread items are highlighted.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {activity.map((item) => (
        <div key={item.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: item.unread ? '4px solid hsl(var(--accent-primary))' : '4px solid transparent' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>💬</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{item.user}</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>{item.text}</div>
              <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>{item.preview}</div>
              <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '8px' }}>{item.time}</div>
            </div>
            {item.unread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--accent-primary))', flexShrink: 0 }} />}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityTab;
