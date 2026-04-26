const PraiseTab = ({ praise }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Praise</h3>
      <button className="btn-primary" style={{ padding: '8px 16px' }}>🙌 Send praise</button>
    </div>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Recognize teammates with badges and a short message.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {praise.map((item) => (
        <div key={item.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{item.from} → {item.to}</div>
          <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>{item.badge}</div>
          <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>&quot;{item.message}&quot;</div>
        </div>
      ))}
    </div>
  </div>
);

export default PraiseTab;
