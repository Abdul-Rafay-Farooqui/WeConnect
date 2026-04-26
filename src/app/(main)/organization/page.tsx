'use client';

import { useMemo, useState } from 'react';
import OrgView from '@/src/components/organization/OrgView';

const PRESENCE_OPTIONS = [
  { id: 'available', label: 'Available', icon: '🟢' },
  { id: 'busy', label: 'Busy', icon: '🔴' },
  { id: 'dnd', label: 'Do not disturb', icon: '🔕' },
  { id: 'brb', label: 'Be right back', icon: '🟡' },
  { id: 'away', label: 'Away', icon: '⚪' },
];

export default function OrganizationPage() {
  const [presence, setPresence] = useState('available');
  const currentPresenceOption = useMemo(
    () => PRESENCE_OPTIONS.find((p) => p.id === presence) || PRESENCE_OPTIONS[0],
    [presence],
  );

  return (
    <div className="h-full w-full">
      <OrgView
        presence={presence}
        setPresence={setPresence}
        presenceOptions={PRESENCE_OPTIONS}
        currentPresenceOption={currentPresenceOption}
      />
    </div>
  );
}
