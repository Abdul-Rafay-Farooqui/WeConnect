const WorkspaceCommandBar = ({ presence, presenceOptions, commandBarQuery, setCommandBarQuery }) => (
  <div
    style={{
      padding: '12px 24px',
      borderBottom: '1px solid hsl(var(--border-subtle))',
      background: 'hsl(var(--bg-secondary))',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}
  >
    {presenceOptions.length > 0 && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'hsl(var(--bg-tertiary))',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          color: 'hsl(var(--text-secondary))',
        }}
      >
        <span>{presenceOptions.find((p) => p.id === presence)?.icon || '🟢'}</span>
        <span>{presenceOptions.find((p) => p.id === presence)?.label || 'Available'}</span>
      </div>
    )}
    <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
      <input
        type="text"
        placeholder="Search or type a command (e.g. /schedule, @mention)..."
        className="input-field"
        style={{ paddingLeft: '36px' }}
        value={commandBarQuery}
        onChange={(e) => setCommandBarQuery(e.target.value)}
      />
      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'hsl(var(--text-muted))' }}>🔍</span>
    </div>
    <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '13px' }}>📅 Schedule</button>
    <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '13px' }}>📄 Files</button>
  </div>
);

export default WorkspaceCommandBar;
