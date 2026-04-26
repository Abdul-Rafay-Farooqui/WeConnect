'use client';

import { useState } from 'react';
import { OrganizationAPI } from '@/lib/api/organization';
import { useOrganizationWorkspace } from '@/src/hooks/useOrganizationWorkspace';
import EmptyTeamState from './EmptyTeamState';
import OrganizationSidebar from './OrganizationSidebar';
import TeamModals from './TeamModals';
import TeamTabContent from './TeamTabContent';
import TeamWorkspaceHeader from './TeamWorkspaceHeader';
import WorkspaceCommandBar from './WorkspaceCommandBar';
import { teamData as defaultTeamData } from './constants';

const parseIds = (value: string) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const OrgView = ({ presence = 'available', presenceOptions = [] as any[] }) => {
  const {
    organizationsWithTeams,
    selectedOrg,
    setSelectedOrg,
    selectedTeam,
    setSelectedTeam,
    teamData,
    isOrgsLoading,
    isWorkspaceLoading,
    error,
    setError,
    loadOrganizations,
    loadOrganizationTeams,
    setTeamData,
  } = useOrganizationWorkspace();

  const [activeTab, setActiveTab] = useState('chat');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [commandBarQuery, setCommandBarQuery] = useState('');

  const handleSelectOrg = (organizationId: string | null) => {
    if (selectedOrg === organizationId) {
      setSelectedOrg(null);
      setSelectedTeam(null);
      setTeamData(defaultTeamData);
      return;
    }
    setSelectedOrg(organizationId);
    setSelectedTeam(null);
    setTeamData(defaultTeamData);
  };

  const handleCreateOrganization = async () => {
    const name = window.prompt('Organization name');
    if (!name?.trim()) return;
    const slug = window.prompt('Slug (optional)', '') || '';
    try {
      setError('');
      const created = await OrganizationAPI.createOrganization({
        name: name.trim(),
        ...(slug.trim() ? { slug: slug.trim() } : {}),
      });
      await loadOrganizations();
      if (created?.id) {
        setSelectedOrg(created.id);
        await loadOrganizationTeams(created.id, true);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to create organization');
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedOrg) return setError('Select an organization first');
    const name = window.prompt('Team name');
    if (!name?.trim()) return;
    const raw = window.prompt('Team member user IDs (comma separated)', '') || '';
    try {
      setError('');
      const created = await OrganizationAPI.createTeam(selectedOrg, {
        name: name.trim(),
        member_ids: parseIds(raw),
      });
      await loadOrganizationTeams(selectedOrg, true);
      if (created?.id) setSelectedTeam({ id: created.id, name: created.name || name.trim() });
    } catch (err: any) {
      setError(err?.message || 'Unable to create team');
    }
  };

  const handleAddOrgMembers = async () => {
    if (!selectedOrg) return setError('Select an organization first');
    const raw = window.prompt('Organization member user IDs (comma separated)', '') || '';
    const member_ids = parseIds(raw);
    if (!member_ids.length) return;
    try {
      setError('');
      await OrganizationAPI.addOrganizationMembers(selectedOrg, member_ids);
      await loadOrganizationTeams(selectedOrg, true);
    } catch (err: any) {
      setError(err?.message || 'Unable to add organization members');
    }
  };

  const handleAddTeamMembers = async () => {
    if (!selectedOrg || !selectedTeam?.id) return setError('Select a team first');
    const raw = window.prompt('Team member user IDs (comma separated)', '') || '';
    const member_ids = parseIds(raw);
    if (!member_ids.length) return;
    try {
      setError('');
      await OrganizationAPI.addTeamMembers(selectedOrg, selectedTeam.id, member_ids);
    } catch (err: any) {
      setError(err?.message || 'Unable to add team members');
    }
  };

  return (
    <div className="flex h-full">
      <OrganizationSidebar
        organizations={organizationsWithTeams}
        selectedOrg={selectedOrg}
        setSelectedOrg={handleSelectOrg}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        isLoading={isOrgsLoading}
        error={error}
        onRetry={loadOrganizations}
        onCreateOrganization={handleCreateOrganization}
        onCreateTeam={handleCreateTeam}
        onAddOrgMembers={handleAddOrgMembers}
      />
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {error && <div className="m-4 p-3 rounded border border-red-500/40 bg-red-500/10 text-red-200 text-sm">{error}</div>}
        {selectedTeam ? (
          <>
            <WorkspaceCommandBar
              presence={presence}
              presenceOptions={presenceOptions}
              commandBarQuery={commandBarQuery}
              setCommandBarQuery={setCommandBarQuery}
            />
            <TeamWorkspaceHeader
              selectedTeam={selectedTeam.name}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowMeetingModal={setShowMeetingModal}
              onCreateTeam={handleCreateTeam}
              onAddTeamMembers={handleAddTeamMembers}
            />
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              {isWorkspaceLoading && <p className="text-[#8696a0] text-sm mb-2">Loading workspace...</p>}
              <TeamTabContent activeTab={activeTab} teamData={teamData} />
            </div>
            <TeamModals
              showMeetingModal={showMeetingModal}
              setShowMeetingModal={setShowMeetingModal}
              showTaskModal={showTaskModal}
              setShowTaskModal={setShowTaskModal}
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
