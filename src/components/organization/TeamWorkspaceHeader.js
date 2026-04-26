import { TEAM_TABS } from './constants';

const TeamWorkspaceHeader = ({ selectedTeam, activeTab, setActiveTab, setShowWhiteboard, setShowScreenShare, setShowMeetingModal }) => (
  <div
    style={{
      padding: '20px 24px',
      borderBottom: '1px solid hsl(var(--border-subtle))',
      background: 'hsl(var(--bg-secondary))',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>{selectedTeam}</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '14px' }} onClick={() => setShowWhiteboard(true)}>
          🎨 Whiteboard
        </button>
        <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '14px' }} onClick={() => setShowScreenShare(true)}>
          🖥️ Share Screen
        </button>
        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setShowMeetingModal(true)}>
          📅 Schedule Meeting
        </button>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {TEAM_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={activeTab === tab ? '' : 'btn-ghost'}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === tab ? 'hsl(var(--accent-tertiary))' : 'transparent',
            color: activeTab === tab ? 'white' : 'hsl(var(--text-secondary))',
            fontWeight: '600',
            fontSize: '14px',
            textTransform: 'capitalize',
            transition: 'all var(--transition-fast)',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

export default TeamWorkspaceHeader;
