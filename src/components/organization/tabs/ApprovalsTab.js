const ApprovalsTab = ({ approvals }) => (
  <div>
    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Approvals</h3>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Review and approve leave, purchases, timesheets, and other requests.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {approvals.map((approval) => (
        <div key={approval.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{approval.title}</h4>
            <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{approval.status}</span>
          </div>
          <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>{approval.description}</div>
        </div>
      ))}
    </div>
  </div>
);

export default ApprovalsTab;
