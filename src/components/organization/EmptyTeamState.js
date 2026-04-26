const EmptyTeamState = () => (
  <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '16px' }}>
    <div style={{ fontSize: '64px' }}>🏢</div>
    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>
      Select an organization and team to get started
    </h3>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', textAlign: 'center', maxWidth: '400px' }}>
      Collaborate with your team, schedule meetings, share files, and track attendance all in one place.
    </p>
  </div>
);

export default EmptyTeamState;
