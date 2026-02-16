'use client';

import { useState } from 'react';

const OrgView = ({ presence = 'available', presenceOptions = [] }) => {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [commandBarQuery, setCommandBarQuery] = useState('');

  const PRESENCE = { available: '🟢 Available', busy: '🔴 Busy', dnd: '🔕 Do not disturb', brb: '🟡 Be right back', away: '⚪ Away' };

  const organizations = [
    { id: 1, name: 'TechCorp Inc.', icon: '🏢', teams: ['Engineering', 'Design', 'Marketing'] },
    { id: 2, name: 'StartupXYZ', icon: '🚀', teams: ['Product', 'Sales'] },
  ];

  const teamData = {
    chat: [
      { id: 1, sender: 'John Doe', message: 'Meeting in 10 minutes', time: '3:45 PM', avatar: '👨‍💼', reactions: ['👍', '✅'], mentions: [] },
      { id: 2, sender: 'Sarah Lee', message: 'Updated the design files @John', time: '3:30 PM', avatar: '👩‍🎨', reactions: [], mentions: ['John'] },
      { id: 3, sender: 'Mike Chen', message: 'Great work team! 🎉', time: '3:15 PM', avatar: '👨‍💻', reactions: ['🎉', '❤️', '👏'], mentions: [] },
    ],
    files: [
      { id: 1, name: 'Q4_Report.pdf', size: '2.4 MB', uploadedBy: 'John Doe', time: '2 hours ago', type: 'pdf', icon: '📄' },
      { id: 2, name: 'Design_Mockups.fig', size: '15.8 MB', uploadedBy: 'Sarah Lee', time: '5 hours ago', type: 'figma', icon: '🎨' },
      { id: 3, name: 'Meeting_Notes.docx', size: '124 KB', uploadedBy: 'Mike Chen', time: '1 day ago', type: 'doc', icon: '📝' },
    ],
    meetings: [
      { id: 1, title: 'Sprint Planning', time: '10:00 AM - 11:00 AM', date: 'Today', attendees: 8, status: 'upcoming' },
      { id: 2, title: 'Design Review', time: '2:00 PM - 3:00 PM', date: 'Today', attendees: 5, status: 'upcoming' },
      { id: 3, title: 'Team Standup', time: '9:00 AM - 9:30 AM', date: 'Yesterday', attendees: 12, status: 'completed' },
    ],
    attendance: [
      { id: 1, name: 'John Doe', signIn: '9:00 AM', signOut: '5:30 PM', status: 'present', avatar: '👨‍💼', hours: '8.5' },
      { id: 2, name: 'Sarah Lee', signIn: '9:15 AM', signOut: '-', status: 'active', avatar: '👩‍🎨', hours: '6.5' },
      { id: 3, name: 'Mike Chen', signIn: '-', signOut: '-', status: 'absent', avatar: '👨‍💻', hours: '0' },
    ],
    tasks: [
      { id: 1, title: 'Complete Q4 Report', assignee: 'John Doe', dueDate: 'Feb 18, 2026', priority: 'high', status: 'in-progress', description: 'Finalize quarterly report with all metrics' },
      { id: 2, title: 'Design System Update', assignee: 'Sarah Lee', dueDate: 'Feb 20, 2026', priority: 'medium', status: 'todo', description: 'Update design tokens and components' },
      { id: 3, title: 'API Documentation', assignee: 'Mike Chen', dueDate: 'Feb 17, 2026', priority: 'high', status: 'completed', description: 'Document all API endpoints' },
      { id: 4, title: 'User Testing Session', assignee: 'Sarah Lee', dueDate: 'Feb 19, 2026', priority: 'low', status: 'todo', description: 'Conduct usability testing with 5 users' },
    ],
    activity: [
      { id: 1, type: 'mention', user: 'Sarah Lee', text: 'mentioned you', preview: 'Updated the design files @John', time: '30m ago', unread: true },
      { id: 2, type: 'reply', user: 'Mike Chen', text: 'replied to your message', preview: 'Great work team! 🎉', time: '1h ago', unread: true },
      { id: 3, type: 'reaction', user: 'John Doe', text: 'reacted to your message', preview: '👍 Meeting in 10 minutes', time: '2h ago', unread: false },
      { id: 4, type: 'file', user: 'Sarah Lee', text: 'shared a file', preview: 'Design_Mockups.fig', time: '5h ago', unread: false },
    ],
    approvals: [
      { id: 1, title: 'Leave request - John Doe', type: 'Leave', requestedBy: 'John Doe', date: 'Feb 16-18', status: 'pending', description: 'Personal leave' },
      { id: 2, title: 'Purchase approval - New monitors', type: 'Purchase', requestedBy: 'Sarah Lee', amount: '$2,400', status: 'pending', description: '5x 27" monitors for design team' },
      { id: 3, title: 'Timesheet approval', type: 'Timesheet', requestedBy: 'Mike Chen', date: 'Week of Feb 10', status: 'approved', description: '40 hours' },
    ],
    praise: [
      { id: 1, from: 'John Doe', to: 'Sarah Lee', badge: '🌟 Great work', message: 'Amazing design on the Q4 dashboard!', time: 'Yesterday' },
      { id: 2, from: 'Sarah Lee', to: 'Mike Chen', badge: '🚀 Team player', message: 'Thanks for the quick API docs.', time: '2 days ago' },
    ],
    shifts: [
      { id: 1, user: 'John Doe', role: 'Lead', date: 'Today', shift: '9:00 AM - 5:00 PM', status: 'scheduled' },
      { id: 2, user: 'Sarah Lee', role: 'Designer', date: 'Today', shift: '10:00 AM - 6:00 PM', status: 'scheduled' },
      { id: 3, user: 'Mike Chen', role: 'Developer', date: 'Tomorrow', shift: '9:00 AM - 5:00 PM', status: 'scheduled' },
    ],
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flex: 1 }}>
      {/* Organization & Team List */}
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
                  {org.teams.map((team, idx) => (
                    <div
                      key={idx}
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

      {/* Team Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'hsl(var(--bg-primary))' }}>
        {selectedTeam ? (
          <>
            {/* Command bar */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid hsl(var(--border-subtle))', background: 'hsl(var(--bg-secondary))', display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Teams-style presence */}
              {presenceOptions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'hsl(var(--bg-tertiary))', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
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

            {/* Team Header */}
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
                {['chat', 'activity', 'files', 'meetings', 'tasks', 'calendar', 'attendance', 'approvals', 'praise', 'shifts'].map((tab) => (
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

            {/* Content Area */}
            <div className="scrollable gradient-mesh" style={{ flex: 1, padding: '24px' }}>
              {activeTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>
                    Team chat — send messages, @mention colleagues, and use formatting. Replies and reactions appear here.
                  </p>
                  {/* Rich formatting toolbar */}
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
                  {teamData.chat.map((msg) => (
                    <div key={msg.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '24px' }}>{msg.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{msg.sender}</span>
                            <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{PRESENCE.available}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{msg.time}</div>
                        </div>
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Reply</button>
                      </div>
                      <div style={{ color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
                        {msg.message.split(' ').map((word, idx) =>
                          word.startsWith('@') ? (
                            <span key={idx} style={{ color: 'hsl(var(--accent-primary))', fontWeight: '600' }}>
                              {word}{' '}
                            </span>
                          ) : (
                            word + ' '
                          )
                        )}
                      </div>
                      {msg.reactions.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {msg.reactions.map((reaction, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'hsl(var(--bg-secondary))',
                                border: '1px solid hsl(var(--border-subtle))',
                                borderRadius: '10px',
                                padding: '2px 8px',
                                fontSize: '12px',
                              }}
                            >
                              {reaction}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Message Input */}
                  <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
                    <input type="text" placeholder="Type a message... Use @ to mention someone" className="input-field" />
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Activity</h3>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Your mentions, replies, reactions, and file shares in this team. Unread items are highlighted.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.activity.map((item) => (
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
              )}

              {activeTab === 'files' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Shared Files</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px' }}>
                      📤 Upload File
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Files shared in this team. You can download, preview, or open in app. Uploads are visible to all team members.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.files.map((file) => (
                      <div key={file.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsl(var(--bg-tertiary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                          }}
                        >
                          {file.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{file.name}</div>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                            {file.size} • Uploaded by {file.uploadedBy} • {file.time}
                          </div>
                        </div>
                        <button className="btn-ghost" style={{ padding: '8px 12px' }}>
                          ⬇️ Download
                        </button>
                        <button className="btn-ghost" style={{ padding: '8px 12px' }}>
                          👁️ Preview
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'meetings' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Scheduled Meetings</h3>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Join or schedule team meetings. Use Meeting options to enable recording, live captions, raise hand, and breakout rooms.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.meetings.map((meeting) => (
                      <div key={meeting.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
                              {meeting.title}
                            </h4>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>
                              📅 {meeting.date} • {meeting.time}
                            </div>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>👥 {meeting.attendees} attendees</div>
                          </div>
                          <div
                            style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: meeting.status === 'upcoming' ? 'hsl(var(--accent-primary) / 0.2)' : 'hsl(var(--bg-tertiary))',
                              color: meeting.status === 'upcoming' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-muted))',
                            }}
                          >
                            {meeting.status}
                          </div>
                        </div>
                        {meeting.status === 'upcoming' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn-primary" style={{ padding: '8px 16px', flex: 1 }}>
                                📹 Join Meeting
                              </button>
                              <button className="btn-ghost" style={{ padding: '8px 16px' }} onClick={() => setShowMeetingOptions(true)}>
                                ⚙️ Meeting options
                              </button>
                              <button className="btn-ghost" style={{ padding: '8px 16px' }}>✏️ Edit</button>
                            </div>
                            <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <span>🎙️ Record meeting</span>
                              <span>📝 Live captions</span>
                              <span>✋ Raise hand</span>
                              <span>🚪 Breakout rooms</span>
                              <span>📋 Meeting notes</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Team Tasks</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => setShowTaskModal(true)}>
                      ➕ New Task
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Track work with assignee, due date, and priority. Move tasks through To do → In progress → Completed.
                  </p>
                  {/* Task Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'hsl(var(--accent-primary))' }}>
                        {teamData.tasks.filter(t => t.status === 'todo').length}
                      </div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>To Do</div>
                    </div>
                    <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'hsl(var(--accent-warning))' }}>
                        {teamData.tasks.filter(t => t.status === 'in-progress').length}
                      </div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>In Progress</div>
                    </div>
                    <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'hsl(var(--accent-secondary))' }}>
                        {teamData.tasks.filter(t => t.status === 'completed').length}
                      </div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Completed</div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.tasks.map((task) => (
                      <div key={task.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <input type="checkbox" checked={task.status === 'completed'} style={{ cursor: 'pointer' }} />
                              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                {task.title}
                              </h4>
                            </div>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
                              {task.description}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                              <span>👤 {task.assignee}</span>
                              <span>📅 {task.dueDate}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <div
                              style={{
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: '600',
                                background:
                                  task.priority === 'high'
                                    ? 'hsl(var(--accent-warning) / 0.2)'
                                    : task.priority === 'medium'
                                    ? 'hsl(var(--accent-primary) / 0.2)'
                                    : 'hsl(var(--bg-tertiary))',
                                color:
                                  task.priority === 'high'
                                    ? 'hsl(var(--accent-warning))'
                                    : task.priority === 'medium'
                                    ? 'hsl(var(--accent-primary))'
                                    : 'hsl(var(--text-muted))',
                              }}
                            >
                              {task.priority}
                            </div>
                            <div
                              style={{
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: '600',
                                background:
                                  task.status === 'completed'
                                    ? 'hsl(var(--accent-secondary) / 0.2)'
                                    : task.status === 'in-progress'
                                    ? 'hsl(var(--accent-primary) / 0.2)'
                                    : 'hsl(var(--bg-tertiary))',
                                color:
                                  task.status === 'completed'
                                    ? 'hsl(var(--accent-secondary))'
                                    : task.status === 'in-progress'
                                    ? 'hsl(var(--accent-primary))'
                                    : 'hsl(var(--text-muted))',
                              }}
                            >
                              {task.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Team Calendar</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-ghost" style={{ padding: '8px 12px' }}>Today</button>
                      <button className="btn-ghost" style={{ padding: '8px 12px' }}>Week</button>
                      <button className="btn-ghost" style={{ padding: '8px 12px' }}>Month</button>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    View meetings and events. Dots on dates indicate scheduled items. Click a date to see details.
                  </p>
                  {/* Calendar View */}
                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'hsl(var(--text-muted))', padding: '8px' }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = i + 1;
                        const hasMeeting = teamData.meetings.some(m => m.date === 'Today' && date === 16);
                        return (
                          <div
                            key={i}
                            className={hasMeeting ? 'glass-hover' : ''}
                            style={{
                              aspectRatio: '1',
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              background: hasMeeting ? 'hsl(var(--accent-tertiary) / 0.2)' : 'hsl(var(--bg-tertiary))',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: date === 16 ? '2px solid hsl(var(--accent-primary))' : 'none',
                            }}
                          >
                            <span style={{ fontSize: '14px', color: date === 16 ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-primary))', fontWeight: date === 16 ? '700' : '400' }}>
                              {date <= 31 ? date : ''}
                            </span>
                            {hasMeeting && (
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'hsl(var(--accent-tertiary))', marginTop: '4px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginTop: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>
                      Upcoming Events
                    </h4>
                    {teamData.meetings.filter(m => m.status === 'upcoming').map((meeting) => (
                      <div key={meeting.id} style={{ padding: '12px', marginBottom: '8px', background: 'hsl(var(--bg-tertiary))', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{meeting.title}</div>
                        <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                          📅 {meeting.date} • {meeting.time} • 👥 {meeting.attendees} attendees
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Sign-in and sign-out times for the team. View who is present, active, or absent and total hours worked.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div className="glass" style={{ flex: 1, padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'hsl(var(--accent-secondary))' }}>
                        {teamData.attendance.filter((a) => a.status !== 'absent').length}
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Present Today</div>
                    </div>
                    <div className="glass" style={{ flex: 1, padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'hsl(var(--accent-warning))' }}>
                        {teamData.attendance.filter((a) => a.status === 'absent').length}
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Absent</div>
                    </div>
                    <div className="glass" style={{ flex: 1, padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'hsl(var(--accent-primary))' }}>
                        {teamData.attendance.reduce((sum, a) => sum + parseFloat(a.hours), 0).toFixed(1)}h
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Total Hours</div>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>
                      Attendance Records
                    </h3>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>
                      Sign-in and sign-out timestamps with total hours. Status: present (signed out), active (signed in), or absent.
                    </p>
                    {teamData.attendance.map((record) => (
                      <div
                        key={record.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          borderBottom: '1px solid hsl(var(--border-subtle))',
                        }}
                      >
                        <div style={{ fontSize: '24px', marginRight: '12px' }}>{record.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{record.name}</div>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                            Sign In: {record.signIn} | Sign Out: {record.signOut} | Hours: {record.hours}h
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600',
                            background:
                              record.status === 'present'
                                ? 'hsl(var(--accent-secondary) / 0.2)'
                                : record.status === 'active'
                                ? 'hsl(var(--accent-primary) / 0.2)'
                                : 'hsl(var(--accent-warning) / 0.2)',
                            color:
                              record.status === 'present'
                                ? 'hsl(var(--accent-secondary))'
                                : record.status === 'active'
                                ? 'hsl(var(--accent-primary))'
                                : 'hsl(var(--accent-warning))',
                          }}
                        >
                          {record.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'approvals' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Approvals</h3>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Review and approve leave, purchases, timesheets, and other requests. Approve or reject with one click.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.approvals.map((approval) => (
                      <div key={approval.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{approval.title}</h4>
                            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>{approval.type} • Requested by {approval.requestedBy}</div>
                          </div>
                          <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', background: approval.status === 'pending' ? 'hsl(var(--accent-warning) / 0.2)' : 'hsl(var(--accent-secondary) / 0.2)', color: approval.status === 'pending' ? 'hsl(var(--accent-warning))' : 'hsl(var(--accent-secondary))' }}>{approval.status}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>{approval.description}</div>
                        {approval.amount && <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{approval.amount}</div>}
                        {approval.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button className="btn-primary" style={{ padding: '8px 16px' }}>Approve</button>
                            <button className="btn-ghost" style={{ padding: '8px 16px', color: 'hsl(var(--accent-danger))' }}>Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'praise' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Praise</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px' }}>🙌 Send praise</button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Recognize teammates with badges and a short message. Sent praise appears here for the whole team to see.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.praise.map((p) => (
                      <div key={p.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{ fontSize: '32px' }}>{p.badge.split(' ')[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{p.from} → {p.to}</div>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>{p.badge}</div>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>&quot;{p.message}&quot;</div>
                            <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '8px' }}>{p.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'shifts' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Shifts</h3>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    View who is scheduled and when. Use this to plan coverage and see who is working today or tomorrow.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamData.shifts.map((shift) => (
                      <div key={shift.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{shift.user}</div>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>{shift.role}</div>
                        </div>
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>{shift.date}</div>
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-primary))', fontWeight: '500' }}>{shift.shift}</div>
                        <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', background: 'hsl(var(--accent-primary) / 0.2)', color: 'hsl(var(--accent-primary))' }}>{shift.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Meeting Modal */}
            {showMeetingModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowMeetingModal(false)}
              >
                <div
                  className="glass"
                  style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>
                    Schedule New Meeting
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" placeholder="Meeting Title" className="input-field" />
                    <input type="date" className="input-field" />
                    <input type="time" placeholder="Start Time" className="input-field" />
                    <input type="time" placeholder="End Time" className="input-field" />
                    <textarea placeholder="Description (optional)" className="input-field" rows="3" />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowMeetingModal(false)}>
                        Create Meeting
                      </button>
                      <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowMeetingModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Options Modal */}
            {showMeetingOptions && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }} onClick={() => setShowMeetingOptions(false)}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>Meeting options</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Record meeting', 'Live captions', 'Allow raise hand', 'Breakout rooms', 'Meeting notes'].map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-tertiary))' }}>
                        <span style={{ color: 'hsl(var(--text-primary))', fontSize: '14px' }}>{opt}</span>
                        <input type="checkbox" defaultChecked={opt === 'Live captions' || opt === 'Allow raise hand'} />
                      </label>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={() => setShowMeetingOptions(false)}>Done</button>
                </div>
              </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowTaskModal(false)}
              >
                <div
                  className="glass"
                  style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>
                    Create New Task
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" placeholder="Task Title" className="input-field" />
                    <textarea placeholder="Description" className="input-field" rows="3" />
                    <select className="input-field">
                      <option>Assign to...</option>
                      <option>John Doe</option>
                      <option>Sarah Lee</option>
                      <option>Mike Chen</option>
                    </select>
                    <input type="date" className="input-field" />
                    <select className="input-field">
                      <option>Priority</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>
                        Create Task
                      </button>
                      <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Whiteboard Modal */}
            {showWhiteboard && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>Collaborative Whiteboard</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }}>✏️ Draw</button>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }}>📐 Shapes</button>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }}>📝 Text</button>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setShowWhiteboard(false)}>✕ Close</button>
                  </div>
                </div>
                <div style={{ flex: 1, background: 'white', margin: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎨</div>
                    <div>Whiteboard Canvas - Draw, annotate, and collaborate in real-time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Screen Share Modal */}
            {showScreenShare && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowScreenShare(false)}
              >
                <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '600px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))', textAlign: 'center' }}>
                    Share Your Screen
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <button className="btn-primary" style={{ padding: '16px', width: '100%' }}>
                      🖥️ Entire Screen
                    </button>
                    <button className="btn-ghost" style={{ padding: '16px', width: '100%' }}>
                      🪟 Application Window
                    </button>
                    <button className="btn-ghost" style={{ padding: '16px', width: '100%' }}>
                      📑 Browser Tab
                    </button>
                  </div>
                  <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setShowScreenShare(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '64px' }}>🏢</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>
              Select an organization and team to get started
            </h3>
            <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', textAlign: 'center', maxWidth: '400px' }}>
              Collaborate with your team, schedule meetings, share files, and track attendance all in one place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgView;
