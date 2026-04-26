export const PRESENCE_MAP = {
  available: '🟢 Available',
  busy: '🔴 Busy',
  dnd: '🔕 Do not disturb',
  brb: '🟡 Be right back',
  away: '⚪ Away',
};

export const TEAM_TABS = ['chat', 'activity', 'files', 'meetings', 'tasks', 'calendar', 'attendance', 'approvals', 'praise', 'shifts'];

export const organizations = [
  { id: 1, name: 'TechCorp Inc.', icon: '🏢', teams: ['Engineering', 'Design', 'Marketing'] },
  { id: 2, name: 'StartupXYZ', icon: '🚀', teams: ['Product', 'Sales'] },
];

export const teamData = {
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
