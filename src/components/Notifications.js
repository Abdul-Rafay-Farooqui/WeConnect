'use client';

import { useState } from 'react';

const Notifications = ({ isOpen, onClose }) => {
  const [notifications] = useState([
    { id: 1, type: 'message', title: 'New message from Alice', content: 'Hey! How are you?', time: '2 minutes ago', read: false, icon: '💬' },
    { id: 2, type: 'assignment', title: 'New assignment posted', content: 'Project Proposal due Feb 20', time: '1 hour ago', read: false, icon: '📝' },
    { id: 3, type: 'meeting', title: 'Meeting starting soon', content: 'Sprint Planning in 10 minutes', time: '2 hours ago', read: true, icon: '📅' },
    { id: 4, type: 'grade', title: 'Grade posted', content: 'You received 85/100 on Midterm Essay', time: '3 hours ago', read: false, icon: '🎯' },
    { id: 5, type: 'team', title: 'New team member', content: 'Sarah joined Engineering team', time: '1 day ago', read: true, icon: '👥' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        background: 'hsl(var(--bg-secondary))',
        borderLeft: '1px solid hsl(var(--border-subtle))',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', background: 'hsl(var(--accent-cyan))', color: 'hsl(220 25% 8%)', fontSize: '12px', fontWeight: '700' }}>
              {unreadCount}
            </span>
          )}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'hsl(var(--text-secondary))',
            padding: '4px',
          }}
        >
          ✕
        </button>
      </div>
      <div className="scrollable" style={{ flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <div>No notifications</div>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="glass-hover"
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid hsl(var(--border-subtle))',
                  background: notification.read ? 'transparent' : 'hsl(var(--accent-cyan) / 0.1)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--bg-tertiary))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = notification.read ? 'transparent' : 'hsl(var(--accent-cyan) / 0.1)';
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>{notification.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>
                      {notification.title}
                    </div>
                    <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>
                      {notification.content}
                    </div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{notification.time}</div>
                  </div>
                  {!notification.read && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'hsl(var(--accent-primary))',
                        marginTop: '8px',
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {unreadCount > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid hsl(var(--border-subtle))' }}>
          <button className="btn-primary" style={{ width: '100%' }}>
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
