const FilesTab = ({ files }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Shared Files</h3>
      <button className="btn-primary" style={{ padding: '8px 16px' }}>📤 Upload File</button>
    </div>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Files shared in this team. You can download, preview, or open in app. Uploads are visible to all team members.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {files.map((file) => (
        <div key={file.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-tertiary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            {file.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{file.name}</div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>{file.size} • Uploaded by {file.uploadedBy} • {file.time}</div>
          </div>
          <button className="btn-ghost" style={{ padding: '8px 12px' }}>⬇️ Download</button>
          <button className="btn-ghost" style={{ padding: '8px 12px' }}>👁️ Preview</button>
        </div>
      ))}
    </div>
  </div>
);

export default FilesTab;
