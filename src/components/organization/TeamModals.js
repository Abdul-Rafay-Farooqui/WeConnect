const TeamModals = ({
  showMeetingModal,
  setShowMeetingModal,
  showMeetingOptions,
  setShowMeetingOptions,
  showTaskModal,
  setShowTaskModal,
  showWhiteboard,
  setShowWhiteboard,
  showScreenShare,
  setShowScreenShare,
}) => (
  <>
    {showMeetingModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowMeetingModal(false)}>
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>Schedule New Meeting</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowMeetingModal(false)}>Create Meeting</button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowMeetingModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    {showMeetingOptions && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }} onClick={() => setShowMeetingOptions(false)}>
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>Meeting options</h3>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowMeetingOptions(false)}>Done</button>
        </div>
      </div>
    )}
    {showTaskModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowTaskModal(false)}>
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>Create New Task</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>Create Task</button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    {showWhiteboard && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>Collaborative Whiteboard</h3>
          <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setShowWhiteboard(false)}>✕ Close</button>
        </div>
      </div>
    )}
    {showScreenShare && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowScreenShare(false)}>
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '600px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))', textAlign: 'center' }}>Share Your Screen</h3>
          <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setShowScreenShare(false)}>Cancel</button>
        </div>
      </div>
    )}
  </>
);

export default TeamModals;
