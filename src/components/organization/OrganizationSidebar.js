const OrganizationSidebar = ({ organizations, selectedOrg, setSelectedOrg, selectedTeam, setSelectedTeam }) => (
  <div
    style={{
      width: 'var(--nav-pane-width)',
      background: 'hsl(var(--bg-secondary))',
      borderRight: '1px solid hsl(var(--border-subtle))',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>
        Organizations
      </h2>
    </div>

    <div className="scrollable" style={{ flex: 1 }}>
      {organizations.map((org) => (
        <div key={org.id} style={{ marginBottom: '8px' }}>
          <div
            onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
            style={{
              padding: '16px 20px',
              cursor: 'pointer',
              background: selectedOrg === org.id ? 'hsl(var(--bg-tertiary))' : 'transparent',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
            onMouseEnter={(e) => {
              if (selectedOrg !== org.id) e.currentTarget.style.background = 'hsl(var(--bg-glass))';
            }}
            onMouseLeave={(e) => {
              if (selectedOrg !== org.id) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ fontSize: '24px' }}>{org.icon}</div>
            <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{org.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
              {selectedOrg === org.id ? '▼' : '▶'}
            </span>
          </div>

          {selectedOrg === org.id && (
            <div style={{ paddingLeft: '20px' }}>
              {org.teams.map((team) => (
                <div
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    background: selectedTeam === team ? 'hsl(var(--accent-tertiary) / 0.2)' : 'transparent',
                    borderLeft: selectedTeam === team ? '3px solid hsl(var(--accent-tertiary))' : '3px solid transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTeam !== team) e.currentTarget.style.background = 'hsl(var(--bg-glass))';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTeam !== team) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>👥 {team}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default OrganizationSidebar;
