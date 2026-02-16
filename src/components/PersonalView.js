'use client';

import { useState, useEffect } from 'react';

const PersonalView = ({ presence = 'available', presenceOptions = [] }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'
  const [showArchived, setShowArchived] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [mutedUntil, setMutedUntil] = useState(null); // '8h' | '1w' | 'always' | null
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const pinnedMessage = selectedChat?.isGroup ? { text: 'Meeting tomorrow at 10 AM. Please confirm attendance.', time: '9:00 AM', sender: 'You' } : null;

  const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const statuses = [
    { id: 1, name: 'Your Status', avatar: '👤', hasStory: true, isOwn: true, time: '2h ago' },
    { id: 2, name: 'Alice Johnson', avatar: '👩', hasStory: true, time: '1h ago' },
    { id: 3, name: 'Bob Smith', avatar: '👨', hasStory: true, time: '3h ago' },
    { id: 4, name: 'Carol Davis', avatar: '👩‍💼', hasStory: true, time: '5h ago' },
  ];

  const [chats, setChats] = useState([
    { id: 1, name: 'Alice Johnson', avatar: '👩', lastMessage: 'Hey! How are you?', time: '2:30 PM', unread: 2, online: true, typing: false, isGroup: false, pinned: true },
    { id: 2, name: 'Bob Smith', avatar: '👨', lastMessage: 'Meeting at 5?', time: '1:15 PM', unread: 0, online: false, typing: false, isGroup: false, pinned: false },
    { id: 3, name: 'Team Alpha', avatar: '👥', lastMessage: 'Sarah: Sounds good!', time: '12:45 PM', unread: 5, online: true, typing: true, isGroup: true, pinned: true, members: 12 },
    { id: 4, name: 'Carol Davis', avatar: '👩‍💼', lastMessage: 'Thanks for the update', time: 'Yesterday', unread: 0, online: true, typing: false, isGroup: false, pinned: false },
    { id: 5, name: 'Dev Team', avatar: '💻', lastMessage: 'John: Pushed the fix', time: 'Yesterday', unread: 1, online: false, typing: false, isGroup: true, pinned: false, members: 8 },
    { id: 6, name: 'Family Group', avatar: '👨‍👩‍👧‍👦', lastMessage: 'Mom: Dinner at 7', time: '2 hours ago', unread: 0, online: false, typing: false, isGroup: true, pinned: true, members: 5 },
  ]);

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const archivedChats = [
    { id: 7, name: 'Old Project Group', avatar: '📁', lastMessage: 'Archived chat', time: '1 week ago', isGroup: true, members: 4 },
    { id: 8, name: 'Jane Wilson', avatar: '👩', lastMessage: 'Archived', time: '2 weeks ago', isGroup: false },
  ];
  const pinnedChats = filteredChats.filter(chat => chat.pinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.pinned);
  const starredMessagesList = [
    { id: 1, chatName: 'Alice Johnson', text: 'Awesome! Let me know if you need help.', time: '2:30 PM', date: 'Today' },
    { id: 2, chatName: 'Team Alpha', text: 'Meeting tomorrow at 10 AM', time: '12:45 PM', date: 'Yesterday' },
  ];

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedChat) {
      const chatMessages = {
        1: [
          { id: 1, sender: 'them', senderName: 'Alice Johnson', text: 'Hey! How are you?', time: '2:28 PM', reactions: ['👍', '❤️'], read: true, starred: false },
          { id: 2, sender: 'me', text: "I'm good! Working on the new project.", time: '2:29 PM', reactions: [], read: true, starred: false },
          { id: 3, sender: 'them', senderName: 'Alice Johnson', text: 'Awesome! Let me know if you need help.', time: '2:30 PM', reactions: ['🙏'], read: true, starred: true },
          { id: 4, sender: 'me', text: 'Will do, thanks!', time: '2:31 PM', reactions: [], replyTo: { text: 'Awesome! Let me know if you need help.', sender: 'Alice Johnson' }, read: true, starred: false },
          { id: 5, sender: 'them', senderName: 'Alice Johnson', type: 'voice', duration: '0:45', time: '2:32 PM', reactions: [], read: true, starred: false },
          { id: 6, sender: 'me', type: 'image', url: 'https://via.placeholder.com/300', caption: 'Check this out!', time: '2:35 PM', reactions: ['❤️'], read: true, starred: false },
          { id: 7, sender: 'them', senderName: 'Alice Johnson', type: 'link', text: 'Check this article', url: 'https://example.com/article', linkPreview: { title: 'Getting started with WEConnect', description: 'A complete guide to collaboration.', domain: 'example.com' }, time: '2:40 PM', reactions: [], read: true, starred: false },
          { id: 8, sender: 'me', type: 'poll', question: 'Best time for standup?', options: [{ text: '9 AM', votes: 3 }, { text: '10 AM', votes: 5 }, { text: '11 AM', votes: 2 }], time: '2:42 PM', reactions: [], read: true, starred: false },
        ],
        3: [
          { id: 1, sender: 'them', senderName: 'Sarah', text: 'Sounds good!', time: '12:45 PM', reactions: ['👍'], read: true, starred: false },
          { id: 2, sender: 'me', text: 'Great! Let\'s meet tomorrow', time: '12:46 PM', reactions: [], read: true, starred: false },
          { id: 3, sender: 'them', senderName: 'John', text: 'I agree 👍', time: '12:47 PM', reactions: [], read: true, starred: false },
        ],
      };
      setMessages(chatMessages[selectedChat.id] || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  const handleReaction = (messageId, emoji) => {
    console.log(`Added ${emoji} to message ${messageId}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flex: 1 }}>
      {/* Chat List */}
      <div
        style={{
          width: 'var(--nav-pane-width)',
          background: 'hsl(var(--bg-secondary))',
          borderRight: '1px solid hsl(var(--border-subtle))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>Messages</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-ghost"
                style={{ padding: '8px', fontSize: '20px' }}
                onClick={() => setShowNewGroupModal(true)}
                title="New Group"
              >
                👥
              </button>
              <button
                className="btn-ghost"
                style={{ padding: '8px', fontSize: '20px' }}
                onClick={() => setShowNewChatModal(true)}
                title="New Chat"
              >
                ✏️
              </button>
              <button
                className="btn-ghost"
                style={{ padding: '8px', fontSize: '20px' }}
                onClick={() => setShowStatus(!showStatus)}
                title="Stories (WhatsApp) — view or add status"
              >
                📸
              </button>
            </div>
          </div>
          {/* Teams-style presence in Messages */}
          {presenceOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Your status (Teams):</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>
                {presenceOptions.find((p) => p.id === presence)?.icon || '🟢'} {presenceOptions.find((p) => p.id === presence)?.label || 'Available'}
              </span>
            </div>
          )}
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="input-field" 
            style={{ fontSize: '14px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              className="btn-ghost"
              style={{ flex: 1, fontSize: '13px', padding: '8px' }}
              onClick={() => setShowStarredMessages(true)}
              title="Starred messages"
            >
              ⭐ Starred
            </button>
            <button
              className="btn-ghost"
              style={{ flex: 1, fontSize: '13px', padding: '8px' }}
              onClick={() => setShowArchived(!showArchived)}
              title="Archived chats"
            >
              📦 Archived {archivedChats.length > 0 && `(${archivedChats.length})`}
            </button>
          </div>
        </div>

        {/* Archived Chats */}
        {showArchived && archivedChats.length > 0 && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid hsl(var(--border-subtle))', background: 'hsl(var(--bg-tertiary))' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Archived</div>
            {archivedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => { setSelectedChat(chat); setShowArchived(false); }}
                style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--bg-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{chat.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', fontSize: '14px' }}>{chat.name}</div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{chat.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp-style Status (Stories) */}
        {showStatus && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid hsl(var(--border-subtle))', background: 'hsl(var(--bg-tertiary))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Stories (WhatsApp)</span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginLeft: '4px' }}>— 24h</span>
              <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', marginLeft: 'auto' }}>
                + Add
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>Photos and videos that disappear after 24 hours. Tap to view.</p>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {statuses.map((status) => (
                <div key={status.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: status.hasStory ? 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-tertiary)))' : 'hsl(var(--bg-tertiary))',
                      padding: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'hsl(var(--bg-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {status.avatar}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textAlign: 'center', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {status.isOwn ? 'You' : status.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Items */}
        <div className="scrollable" style={{ flex: 1 }}>
          {pinnedChats.length > 0 && (
            <>
              <div style={{ padding: '12px 20px 8px', fontSize: '12px', fontWeight: '600', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pinned
              </div>
              {pinnedChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: selectedChat?.id === chat.id ? 'hsl(var(--bg-tertiary))' : 'transparent',
                    borderLeft: selectedChat?.id === chat.id ? '3px solid hsl(var(--accent-primary))' : '3px solid transparent',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'hsl(var(--bg-glass))';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'hsl(var(--bg-tertiary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'hsl(var(--accent-green))',
                          border: '2px solid hsl(var(--bg-secondary))',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{chat.name}</span>
                      <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{chat.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          color: chat.typing ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontStyle: chat.typing ? 'italic' : 'normal',
                        }}
                      >
                        {chat.typing ? 'typing...' : chat.lastMessage}
                      </span>
                      {chat.unread > 0 && (
                        <div
                          style={{
                            minWidth: '20px',
                            height: '20px',
                            borderRadius: '10px',
                            background: 'hsl(var(--accent-primary))',
                            color: 'hsl(220 25% 8%)',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 6px',
                          }}
                        >
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          {pinnedChats.length > 0 && unpinnedChats.length > 0 && (
            <div style={{ padding: '12px 20px 8px', fontSize: '12px', fontWeight: '600', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '8px' }}>
              All Chats
            </div>
          )}
          {unpinnedChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                background: selectedChat?.id === chat.id ? 'hsl(var(--bg-tertiary))' : 'transparent',
                borderLeft: selectedChat?.id === chat.id ? '3px solid hsl(var(--accent-primary))' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'hsl(var(--bg-glass))';
              }}
              onMouseLeave={(e) => {
                if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'hsl(var(--bg-tertiary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'hsl(var(--accent-green))',
                      border: '2px solid hsl(var(--bg-secondary))',
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{chat.name}</span>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{chat.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      color: chat.typing ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontStyle: chat.typing ? 'italic' : 'normal',
                    }}
                  >
                    {chat.typing ? 'typing...' : chat.lastMessage}
                  </span>
                  {chat.unread > 0 && (
                    <div
                      style={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        background: 'hsl(var(--accent-primary))',
                        color: 'hsl(220 25% 8%)',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px',
                      }}
                    >
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'hsl(var(--bg-primary))' }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid hsl(var(--border-subtle))',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'hsl(var(--bg-secondary))',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'hsl(var(--bg-tertiary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {selectedChat.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: 'hsl(var(--text-primary))' }}>
                  {selectedChat.name}
                  {selectedChat.isGroup && (
                    <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginLeft: '8px', fontWeight: '400' }}>
                      ({selectedChat.members} members)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                  {isTyping ? 'typing...' : selectedChat.online ? (
                    <>🟢 Online • Teams: Available</>
                  ) : selectedChat.isGroup ? (
                    `${selectedChat.members} members`
                  ) : (
                    `Last seen ${selectedChat.time}`
                  )}
                </div>
                {presenceOptions.length > 0 && (
                  <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                    You: {presenceOptions.find((p) => p.id === presence)?.icon} {presenceOptions.find((p) => p.id === presence)?.label}
                  </div>
                )}
              </div>
              <button 
                className="btn-ghost" 
                style={{ padding: '8px 12px' }} 
                title="Voice Call"
                onClick={() => {
                  setCallType('voice');
                  setShowCallModal(true);
                }}
              >
                📞
              </button>
              <button 
                className="btn-ghost" 
                style={{ padding: '8px 12px' }} 
                title="Video Call"
                onClick={() => {
                  setCallType('video');
                  setShowCallModal(true);
                }}
              >
                📹
              </button>
              <button 
                className="btn-ghost" 
                style={{ padding: '8px 12px' }} 
                title="Media Gallery"
                onClick={() => setShowMediaGallery(true)}
              >
                🖼️
              </button>
              <button className="btn-ghost" style={{ padding: '8px 12px' }} title="Search in chat">
                🔍
              </button>
              <button className="btn-ghost" style={{ padding: '8px 12px' }} title="Chat/Contact info" onClick={() => setShowChatInfo(true)}>
                ⋮
              </button>
            </div>

            {/* Chat / Contact Info Panel */}
            {showChatInfo && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '360px',
                  height: '100%',
                  background: 'hsl(var(--bg-secondary))',
                  borderLeft: '1px solid hsl(var(--border-subtle))',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', fontSize: '18px', color: 'hsl(var(--text-primary))' }}>{selectedChat?.isGroup ? 'Group info' : 'Contact info'}</span>
                  <button onClick={() => setShowChatInfo(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}>✕</button>
                </div>
                <div className="scrollable" style={{ flex: 1, padding: '16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(var(--bg-tertiary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 12px' }}>{selectedChat?.avatar}</div>
                    <div style={{ fontWeight: '600', fontSize: '18px', color: 'hsl(var(--text-primary))' }}>{selectedChat?.name}</div>
                    {selectedChat?.isGroup && <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>{selectedChat?.members} participants</div>}
                    {!selectedChat?.isGroup && <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Hey there! I am using WEConnect.</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button className="btn-ghost" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => setMutedUntil(mutedUntil ? null : '8h')}>
                      🔕 {mutedUntil ? `Muted (${mutedUntil})` : 'Mute notifications'}
                    </button>
                    {mutedUntil && (
                      <div style={{ paddingLeft: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button style={{ fontSize: '12px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-tertiary))', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer' }} onClick={() => setMutedUntil('8h')}>8 hours</button>
                        <button style={{ fontSize: '12px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-tertiary))', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer' }} onClick={() => setMutedUntil('1w')}>1 week</button>
                        <button style={{ fontSize: '12px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-tertiary))', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer' }} onClick={() => setMutedUntil('always')}>Always</button>
                      </div>
                    )}
                    <button className="btn-ghost" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => setDisappearingMessages(!disappearingMessages)}>
                      ⏱️ Disappearing messages {disappearingMessages ? '✓ On' : 'Off'}
                    </button>
                    <button className="btn-ghost" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => setShowMediaGallery(true)}>
                      🖼️ Media, links, and docs
                    </button>
                    <button className="btn-ghost" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => { setShowStarredMessages(true); setShowChatInfo(false); }}>
                      ⭐ Starred messages ({starredMessagesList.length})
                    </button>
                    {selectedChat?.isGroup && (
                      <>
                        <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '12px', marginBottom: '4px' }}>Group description</div>
                        <div style={{ padding: '12px', background: 'hsl(var(--bg-tertiary))', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Weekly sync and project updates.</div>
                      </>
                    )}
                    <button className="btn-ghost" style={{ justifyContent: 'flex-start', textAlign: 'left', marginTop: '16px', color: 'hsl(var(--accent-warning))' }}>
                      🚫 Block
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pinned message banner (groups) */}
            {selectedChat?.isGroup && pinnedMessage && (
              <div
                style={{
                  padding: '12px 24px',
                  background: 'hsl(var(--bg-tertiary))',
                  borderBottom: '1px solid hsl(var(--border-subtle))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => {}}
              >
                <span style={{ fontSize: '18px' }}>📌</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginBottom: '2px' }}>Pinned message</div>
                  <div style={{ fontSize: '14px', color: 'hsl(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pinnedMessage.text}</div>
                </div>
                <span style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>↓</span>
              </div>
            )}

            {/* Messages */}
            <div className="scrollable gradient-mesh" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '60%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {msg.replyTo && (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'hsl(var(--bg-tertiary) / 0.5)',
                          borderLeft: '3px solid hsl(var(--accent-primary))',
                          fontSize: '12px',
                          color: 'hsl(var(--text-muted))',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>{msg.replyTo.sender || 'You'}</div>
                        {msg.replyTo.text}
                      </div>
                    )}
                    <div
                      className="glass"
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: msg.sender === 'me' ? 'hsl(var(--accent-primary))' : 'var(--glass-bg)',
                        color: msg.sender === 'me' ? 'hsl(220 25% 8%)' : 'hsl(var(--text-primary))',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget.querySelector('.reaction-btn');
                        if (btn) btn.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget.querySelector('.reaction-btn');
                        if (btn) btn.style.opacity = '0';
                        if (messageMenuId) setMessageMenuId(null);
                      }}
                    >
                      {msg.type === 'voice' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>▶️</button>
                          <div style={{ flex: 1, height: '4px', background: 'hsl(var(--bg-tertiary))', borderRadius: '2px', position: 'relative' }}>
                            <div style={{ width: '40%', height: '100%', background: 'hsl(var(--accent-primary))', borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontSize: '12px' }}>{msg.duration}</span>
                        </div>
                      ) : msg.type === 'image' ? (
                        <div>
                          <img src={msg.url} alt={msg.caption || 'Shared image'} style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }} />
                          {msg.caption && <div style={{ fontSize: '14px' }}>{msg.caption}</div>}
                        </div>
                      ) : msg.type === 'link' && msg.linkPreview ? (
                        <div>
                          <div style={{ marginBottom: '8px' }}>{msg.text}</div>
                          <a href={msg.url} style={{ display: 'block', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid hsl(var(--accent-primary))', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{msg.linkPreview.title}</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>{msg.linkPreview.description}</div>
                            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{msg.linkPreview.domain}</div>
                          </a>
                        </div>
                      ) : msg.type === 'poll' ? (
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '12px' }}>{msg.question}</div>
                          {msg.options.map((opt, i) => (
                            <div key={i} style={{ marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                                <span style={{ flex: 1 }}>{opt.text}</span>
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>{opt.votes} votes</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>{msg.text}</div>
                      )}
                      {msg.senderName && msg.sender === 'them' && (
                        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', fontWeight: '600' }}>{msg.senderName}</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                        {msg.starred && <span style={{ fontSize: '12px' }} title="Starred">⭐</span>}
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>{msg.time}</span>
                        {msg.read && msg.sender === 'me' && <span style={{ fontSize: '12px' }} title="Read">✓✓</span>}
                      </div>
                      
                      {/* Message context menu trigger & quick reactions */}
                      <div className="reaction-btn" style={{ position: 'absolute', top: '-8px', right: msg.sender === 'me' ? 'auto' : '4px', left: msg.sender === 'me' ? '4px' : 'auto', display: 'flex', gap: '2px', opacity: 0, transition: 'opacity var(--transition-fast)', background: 'hsl(var(--bg-secondary))', borderRadius: '12px', padding: '4px', border: '1px solid hsl(var(--border-subtle))' }}>
                        {QUICK_REACTIONS.map((emoji) => (
                          <button key={emoji} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '2px' }} onClick={() => handleReaction(msg.id, emoji)}>{emoji}</button>
                        ))}
                        <button style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '2px' }} onClick={() => setMessageMenuId(messageMenuId === msg.id ? null : msg.id)} title="More">⋯</button>
                      </div>
                      {messageMenuId === msg.id && (
                        <div style={{ position: 'absolute', top: '100%', left: msg.sender === 'me' ? 'auto' : 0, right: msg.sender === 'me' ? 0 : 'auto', marginTop: '4px', background: 'hsl(var(--bg-secondary))', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-sm)', padding: '8px', minWidth: '160px', zIndex: 20, boxShadow: 'var(--shadow-lg)' }}>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }} onClick={() => { setReplyingTo({ text: msg.text, sender: msg.senderName }); setMessageMenuId(null); }}>↩️ Reply</button>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}>↗️ Forward</button>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}>⭐ Star</button>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}>📋 Copy</button>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', color: 'hsl(var(--accent-warning))' }}>🗑️ Delete for me</button>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', color: 'hsl(var(--accent-danger))' }}>🗑️ Delete for everyone</button>
                          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }} onClick={() => setMessageMenuId(null)}>Cancel</button>
                        </div>
                      )}
                    </div>
                    
                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                        {msg.reactions.map((reaction, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'hsl(var(--bg-secondary))',
                              border: '1px solid hsl(var(--border-subtle))',
                              borderRadius: '10px',
                              padding: '2px 6px',
                              fontSize: '12px',
                            }}
                          >
                            {reaction}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div
                style={{
                  padding: '12px 24px',
                  background: 'hsl(var(--bg-tertiary))',
                  borderTop: '1px solid hsl(var(--border-subtle))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--accent-primary))', marginBottom: '4px' }}>Replying to</div>
                  <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>{replyingTo.text}</div>
                </div>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
                  ✕
                </button>
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid hsl(var(--border-subtle))', background: 'hsl(var(--bg-secondary))' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button className="btn-ghost" style={{ padding: '8px' }} title="Attach document">📄 Document</button>
                <button className="btn-ghost" style={{ padding: '8px' }} title="Create poll" onClick={() => setShowPollModal(true)}>📊 Poll</button>
                <button className="btn-ghost" style={{ padding: '8px' }} title="Share contact">👤 Contact</button>
                <button className="btn-ghost" style={{ padding: '8px' }} title="Share location">📍 Location</button>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-ghost" style={{ padding: '10px' }} title="Attach File">
                  📎
                </button>
                <button className="btn-ghost" style={{ padding: '10px' }} title="Camera">
                  📷
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input-field"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      console.log('Send:', messageInput);
                      setMessageInput('');
                      setReplyingTo(null);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button className="btn-ghost" style={{ padding: '10px' }} title="Emoji">
                  😊
                </button>
                {messageInput.trim() ? (
                  <button className="btn-primary" style={{ padding: '10px 20px' }}>
                    Send
                  </button>
                ) : (
                  <button className="btn-ghost" style={{ padding: '10px' }} title="Voice Message">
                    🎤
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '64px' }}>💬</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>Select a conversation to start messaging</h3>
            <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', textAlign: 'center', maxWidth: '400px' }}>
              Send messages, share files, make voice and video calls, and stay connected with your contacts.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn-primary" onClick={() => setShowNewChatModal(true)}>
                Start New Chat
              </button>
              <button className="btn-ghost" onClick={() => setShowNewGroupModal(true)}>
                Create Group
              </button>
            </div>
          </div>
        )}

        {/* New Chat Modal */}
        {showNewChatModal && (
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
            onClick={() => setShowNewChatModal(false)}
          >
            <div
              className="glass"
              style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>
                New Chat
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button className="btn-primary" style={{ flex: 1, fontSize: '13px' }}>New chat</button>
                  <button className="btn-ghost" style={{ flex: 1, fontSize: '13px' }}>📢 New broadcast list</button>
                </div>
                <input type="text" placeholder="Search contacts..." className="input-field" />
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'].map((name, idx) => (
                    <div
                      key={idx}
                      className="glass-hover"
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                      onClick={() => {
                        setShowNewChatModal(false);
                        // In real app, would create new chat here
                      }}
                    >
                      <div style={{ fontSize: '24px' }}>👤</div>
                      <span style={{ color: 'hsl(var(--text-primary))' }}>{name}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowNewChatModal(false)}>
                    Start Chat
                  </button>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowNewChatModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Starred Messages Modal */}
        {showStarredMessages && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowStarredMessages(false)}>
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>⭐ Starred messages</h3>
                <button onClick={() => setShowStarredMessages(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}>✕</button>
              </div>
              {starredMessagesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>No starred messages. Long-press a message and tap Star.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {starredMessagesList.map((s) => (
                    <div key={s.id} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>{s.chatName} • {s.date} {s.time}</div>
                      <div style={{ color: 'hsl(var(--text-primary))' }}>{s.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Poll Modal */}
        {showPollModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowPollModal(false)}>
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>Create poll</h3>
              <input type="text" placeholder="Poll question" className="input-field" style={{ marginBottom: '12px' }} />
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '8px' }}>Options</label>
                <input type="text" placeholder="Option 1" className="input-field" style={{ marginBottom: '8px' }} />
                <input type="text" placeholder="Option 2" className="input-field" style={{ marginBottom: '8px' }} />
                <button className="btn-ghost" style={{ width: '100%', fontSize: '13px' }}>+ Add option</button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Allow multiple answers</span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowPollModal(false)}>Create poll</button>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowPollModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* New Group Modal */}
        {showNewGroupModal && (
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
            onClick={() => setShowNewGroupModal(false)}
          >
            <div
              className="glass"
              style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>
                Create New Group
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="Group name" className="input-field" />
                <div>
                  <label style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px', display: 'block' }}>
                    Add Members
                  </label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    {['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown'].map((name, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" />
                        <span style={{ color: 'hsl(var(--text-primary))' }}>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowNewGroupModal(false)}>
                    Create Group
                  </button>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowNewGroupModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Gallery Modal */}
        {showMediaGallery && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowMediaGallery(false)}
          >
            <div
              className="glass"
              style={{ padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '800px', width: '90%', maxHeight: '80vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                  Media Gallery
                </h3>
                <button onClick={() => setShowMediaGallery(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'hsl(var(--text-primary))' }}>
                  ✕
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      background: 'hsl(var(--bg-tertiary))',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🖼️
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call Modal */}
        {showCallModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>{callType === 'video' ? '📹' : '📞'}</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                {callType === 'video' ? 'Video Call' : 'Voice Call'}
              </h3>
              <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '32px' }}>Calling {selectedChat?.name}...</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '16px 32px', fontSize: '16px', background: 'hsl(var(--accent-green))' }}
                  onClick={() => setShowCallModal(false)}
                >
                  Answer
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: '16px 32px', fontSize: '16px', background: 'hsl(var(--accent-warning))', border: 'none', color: 'white' }}
                  onClick={() => setShowCallModal(false)}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalView;
