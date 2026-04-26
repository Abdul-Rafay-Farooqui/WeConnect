'use client';

import { useState } from 'react';
import EmptyTeamState from './EmptyTeamState';
import OrganizationSidebar from './OrganizationSidebar';
import TeamModals from './TeamModals';
import TeamTabContent from './TeamTabContent';
import TeamWorkspaceHeader from './TeamWorkspaceHeader';
import WorkspaceCommandBar from './WorkspaceCommandBar';
import { organizations, teamData } from './constants';

const OrgView = ({ presence = 'available', presenceOptions = [] }) => {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [commandBarQuery, setCommandBarQuery] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', flex: 1 }}>
      <OrganizationSidebar
        organizations={organizations}
        selectedOrg={selectedOrg}
        setSelectedOrg={setSelectedOrg}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'hsl(var(--bg-primary))' }}>
        {selectedTeam ? (
          <>
            <WorkspaceCommandBar
              presence={presence}
              presenceOptions={presenceOptions}
              commandBarQuery={commandBarQuery}
              setCommandBarQuery={setCommandBarQuery}
            />
            <TeamWorkspaceHeader
              selectedTeam={selectedTeam}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowWhiteboard={setShowWhiteboard}
              setShowScreenShare={setShowScreenShare}
              setShowMeetingModal={setShowMeetingModal}
            />
            <div className="scrollable gradient-mesh" style={{ flex: 1, padding: '24px' }}>
              <TeamTabContent
                activeTab={activeTab}
                teamData={teamData}
                setShowMeetingOptions={setShowMeetingOptions}
                setShowTaskModal={setShowTaskModal}
              />
            </div>
            <TeamModals
              showMeetingModal={showMeetingModal}
              setShowMeetingModal={setShowMeetingModal}
              showMeetingOptions={showMeetingOptions}
              setShowMeetingOptions={setShowMeetingOptions}
              showTaskModal={showTaskModal}
              setShowTaskModal={setShowTaskModal}
              showWhiteboard={showWhiteboard}
              setShowWhiteboard={setShowWhiteboard}
              showScreenShare={showScreenShare}
              setShowScreenShare={setShowScreenShare}
            />
          </>
        ) : (
          <EmptyTeamState />
        )}
      </div>
    </div>
  );
};

export default OrgView;
