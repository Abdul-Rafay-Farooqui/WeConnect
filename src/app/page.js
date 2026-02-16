'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PersonalView from '../components/PersonalView';
import OrgView from '../components/OrgView';
import InstituteView from '../components/InstituteView';

const PRESENCE_OPTIONS = [
  { id: 'available', label: 'Available', icon: '🟢', color: 'hsl(var(--accent-secondary))' },
  { id: 'busy', label: 'Busy', icon: '🔴', color: 'hsl(var(--accent-danger))' },
  { id: 'dnd', label: 'Do not disturb', icon: '🔕', color: 'hsl(var(--text-muted))' },
  { id: 'brb', label: 'Be right back', icon: '🟡', color: 'hsl(var(--accent-warning))' },
  { id: 'away', label: 'Away', icon: '⚪', color: 'hsl(var(--text-muted))' },
];

export default function Home() {
  const [activeMode, setActiveMode] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [presence, setPresence] = useState('available');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const renderView = () => {
    switch (activeMode) {
      case 'personal':
        return <PersonalView presence={presence} presenceOptions={PRESENCE_OPTIONS} />;
      case 'organization':
        return <OrgView presence={presence} presenceOptions={PRESENCE_OPTIONS} />;
      case 'institute':
        return <InstituteView />;
      default:
        return <PersonalView presence={presence} presenceOptions={PRESENCE_OPTIONS} />;
    }
  };

  if (isLoading) {
    return (
      <div className="container-full flex-center" style={{ background: 'hsl(var(--bg-primary))' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(var(--accent-primary)) 0%, hsl(var(--accent-secondary)) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: '800',
              color: 'white',
              margin: '0 auto 24px',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            W
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>
            Loading WEConnect...
          </div>
        </div>
      </div>
    );
  }

  const currentPresenceOption = PRESENCE_OPTIONS.find((p) => p.id === presence) || PRESENCE_OPTIONS[0];

  return (
    <div className="container-full">
      <Sidebar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        presence={presence}
        setPresence={setPresence}
        presenceOptions={PRESENCE_OPTIONS}
        currentPresenceOption={currentPresenceOption}
      />
      {renderView()}
    </div>
  );
}
