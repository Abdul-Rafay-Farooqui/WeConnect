const ChatTab = ({ chat, presenceLabel }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>
      Team chat — send messages, @mention colleagues, and use formatting. Replies and reactions appear here.
    </p>
    <div className="glass" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '14px' }} title="Bold">B</button>
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '14px', fontStyle: 'italic' }} title="Italic">I</button>
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '14px' }} title="Underline">U</button>
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '14px' }} title="Strikethrough">S</button>
      <span style={{ width: '1px', height: '20px', background: 'hsl(var(--border-subtle))' }} />
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '12px' }}>📎 Attach</button>
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '12px' }}>🎬 GIF</button>
      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '12px' }}>🙌 Praise</button>
    </div>
    {chat.map((msg) => (
      <div key={msg.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '24px' }}>{msg.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{msg.sender}</span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{presenceLabel}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{msg.time}</div>
          </div>
          <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Reply</button>
        </div>
        <div style={{ color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
          {msg.message.split(' ').map((word, idx) => (
            word.startsWith('@') ? <span key={idx} style={{ color: 'hsl(var(--accent-primary))', fontWeight: '600' }}>{word} </span> : `${word} `
          ))}
        </div>
        {msg.reactions.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {msg.reactions.map((reaction, idx) => (
              <div key={idx} style={{ background: 'hsl(var(--bg-secondary))', border: '1px solid hsl(var(--border-subtle))', borderRadius: '10px', padding: '2px 8px', fontSize: '12px' }}>
                {reaction}
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
    <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
      <input type="text" placeholder="Type a message... Use @ to mention someone" className="input-field" />
    </div>
  </div>
);

export default ChatTab;
