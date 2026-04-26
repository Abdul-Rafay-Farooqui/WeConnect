'use client';

import { useState } from 'react';
import { OrganizationAPI } from '@/lib/api/organization';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationWorkspace } from '@/src/hooks/useOrganizationWorkspace';
import EmptyTeamState from './EmptyTeamState';
import {
  AddOrgMembersModal,
  AddTeamMembersModal,
  CreateOrgModal,
  CreateTeamModal,
  DeleteOrgModal,
  DeleteTeamModal,
} from './OrgModals';
import OrganizationSidebar from './OrganizationSidebar';
import TeamModals from './TeamModals';
import TeamTabContent from './TeamTabContent';
import TeamWorkspaceHeader from './TeamWorkspaceHeader';
import WorkspaceCommandBar from './WorkspaceCommandBar';
import { teamData as defaultTeamData } from './constants';

const OrgView = ({ presence = 'available', presenceOptions = [] as any[] }) => {
  const currentUser = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const {
    organizationsWithTeams,
    selectedOrg,
    setSelectedOrg,
    selectedTeam,
    setSelectedTeam,
    teamData,
    teamConversationId,
    isOrgsLoading,
    isWorkspaceLoading,
    error,
    setError,
    loadOrganizations,
    loadOrganizationTeams,
    loadTeamWorkspace,
    setTeamData,
  } = useOrganizationWorkspace();

  const [activeTab, setActiveTab] = useState('chat');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [commandBarQuery, setCommandBarQuery] = useState('');

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddOrgMembers, setShowAddOrgMembers] = useState(false);
  const [showAddTeamMembers, setShowAddTeamMembers] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [showDeleteOrg, setShowDeleteOrg] = useState(false);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const selectedOrgObj = organizationsWithTeams.find((o) => o.id === selectedOrg) ?? null;

  /** Current user's id — handle various field names the backend may use */
  const uid: string | undefined = currentUser?.id ?? currentUser?.uid ?? currentUser?.userId;

  /**
   * True if the current user is the admin/creator of the SELECTED ORGANIZATION.
   * We check created_by, owner_id, admin_id at the org level.
   * Fallback: if uid is set and no creator info exists, we assume they are admin
   * (since they can only see orgs they belong to).
   */
  const isOrgAdmin = (() => {
    if (!uid || !selectedOrgObj) return false;
    const o = selectedOrgObj as any;
    if (o.created_by) return o.created_by === uid;
    if (o.owner_id) return o.owner_id === uid;
    if (o.admin_id) return o.admin_id === uid;
    // No creator field → grant delete to all for now (backend will enforce)
    return true;
  })();

  /**
   * True if the current user is the admin/creator of the SELECTED TEAM.
   * selectedTeam stores the full team object from the sidebar.
   */
  const isTeamAdmin = (() => {
    if (!uid || !selectedTeam) return false;
    const t = selectedTeam as any;
    if (t.created_by) return t.created_by === uid;
    if (t.owner_id) return t.owner_id === uid;
    if (t.admin_id) return t.admin_id === uid;
    if (t.creator_id) return t.creator_id === uid;
    // No creator field on team → fall back to org-admin check
    return isOrgAdmin;
  })();

  // ── Org selection ─────────────────────────────────────────────────────────
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

  // ── Create Organization ───────────────────────────────────────────────────
  const handleCreateOrganization = async (name: string, slug: string) => {
    setError('');
    const created = await OrganizationAPI.createOrganization({
      name,
      ...(slug ? { slug } : {}),
    });
    await loadOrganizations();
    if (created?.id) {
      setSelectedOrg(created.id);
      await loadOrganizationTeams(created.id, true);
    }
  };

  // ── Delete Organization ───────────────────────────────────────────────────
  const handleDeleteOrganization = async () => {
    if (!selectedOrg) throw new Error('No organization selected');
    setError('');
    await OrganizationAPI.deleteOrganization(selectedOrg);
    await loadOrganizations();
    setSelectedOrg(null);
    setSelectedTeam(null);
    setTeamData(defaultTeamData);
  };

  // ── Create Team ───────────────────────────────────────────────────────────
  const handleCreateTeam = async (name: string, memberIds: string[]) => {
    if (!selectedOrg) throw new Error('Select an organization first');
    setError('');
    const created = await OrganizationAPI.createTeam(selectedOrg, { name, member_ids: memberIds });
    await loadOrganizationTeams(selectedOrg, true);
    if (created?.id) setSelectedTeam({ ...created, id: created.id, name: created.name || name });
  };

  // ── Delete Team ───────────────────────────────────────────────────────────
  const handleDeleteTeam = async () => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('No team selected');
    setError('');
    await OrganizationAPI.deleteTeam(selectedOrg, selectedTeam.id);
    await loadOrganizationTeams(selectedOrg, true);
    setSelectedTeam(null);
    setTeamData(defaultTeamData);
  };

  // ── Remove Org Member ─────────────────────────────────────────────────────
  const handleRemoveOrgMember = async (userId: string) => {
    if (!selectedOrg) throw new Error('No organization selected');
    setError('');
    await OrganizationAPI.removeOrgMember(selectedOrg, userId);
    await loadOrganizationTeams(selectedOrg, true);
  };

  // ── Add Org Members ───────────────────────────────────────────────────────
  const handleAddOrgMembers = async (memberIds: string[]) => {
    if (!selectedOrg) throw new Error('Select an organization first');
    setError('');
    await OrganizationAPI.addOrganizationMembers(selectedOrg, memberIds);
    await loadOrganizationTeams(selectedOrg, true);
  };

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const handleAddTask = async (payload: { title: string; description?: string; priority?: string; due_date?: string }) => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('No team selected');
    await OrganizationAPI.createTask(selectedOrg, selectedTeam.id, payload);
    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('No team selected');
    await OrganizationAPI.deleteTask(selectedOrg, selectedTeam.id, taskId);
    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
  };

  // ── Activity ──────────────────────────────────────────────────────────────
  const handleAddActivity = async (payload: { activity_type: string; preview_text?: string }) => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('No team selected');
    await OrganizationAPI.createActivity(selectedOrg, selectedTeam.id, payload);
    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('No team selected');
    await OrganizationAPI.deleteActivity(selectedOrg, selectedTeam.id, activityId);
    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
  };

  // ── Remove Team Member ────────────────────────────────────────────────────
  const handleRemoveTeamMember = async (memberId: string) => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('No team selected');
    setError('');
    await OrganizationAPI.removeTeamMember(selectedOrg, selectedTeam.id, memberId);
    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
  };
  const handleAddTeamMembers = async (memberIds: string[]) => {
    if (!selectedOrg || !selectedTeam?.id) throw new Error('Select a team first');
    setError('');
    const result = await OrganizationAPI.addTeamMembers(selectedOrg, selectedTeam.id, memberIds);
    if (result?.added === 0) {
      throw new Error('These users are not members of this organization. Add them to the org first.');
    }
    // Refresh workspace so members tab updates immediately
    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
    setActiveTab('members');
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
        onCreateOrganization={() => setShowCreateOrg(true)}
        onCreateTeam={() => {
          if (!selectedOrg) { setError('Select an organization first'); return; }
          setShowCreateTeam(true);
        }}
        onAddOrgMembers={() => {
          if (!selectedOrg) { setError('Select an organization first'); return; }
          setShowAddOrgMembers(true);
        }}
        onDeleteOrg={() => setShowDeleteOrg(true)}
        onAddTeamMembers={(team: any) => {
          setSelectedTeam(team);
          setShowAddTeamMembers(true);
        }}
        isOrgAdmin={isOrgAdmin}
      />

      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {error && (
          <div className="m-4 p-3 rounded border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        )}

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
              onCreateTeam={() => setShowCreateTeam(true)}
              onAddTeamMembers={() => setShowAddTeamMembers(true)}
              onDeleteTeam={isTeamAdmin ? () => setShowDeleteTeam(true) : undefined}
              isTeamAdmin={isTeamAdmin}
            />
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              {isWorkspaceLoading && (
                <p className="text-[#8696a0] text-sm mb-2">Loading workspace…</p>
              )}
              <TeamTabContent
                activeTab={activeTab}
                teamData={teamData}
                selectedTeam={selectedTeam}
                selectedOrg={selectedOrg}
                teamConversationId={teamConversationId}
                onTeamUpdated={(updated: any) => setSelectedTeam(updated)}
                isTeamAdmin={isTeamAdmin}
                currentUserId={uid}
                currentUserName={profile?.display_name ?? currentUser?.display_name ?? 'Someone'}
                onRemoveTeamMember={handleRemoveTeamMember}
                onAddActivity={handleAddActivity}
                onDeleteActivity={handleDeleteActivity}
                onRefreshWorkspace={async () => {
                  if (selectedOrg && selectedTeam?.id)
                    await loadTeamWorkspace(selectedOrg, selectedTeam.id);
                }}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
            <TeamModals
              showMeetingModal={showMeetingModal}
              setShowMeetingModal={setShowMeetingModal}
              showTaskModal={showTaskModal}
              setShowTaskModal={setShowTaskModal}
            />
          </>
        ) : (
          <EmptyTeamState
            orgName={selectedOrgObj?.name}
            orgMembers={selectedOrgObj?.members ?? []}
            isOrgAdmin={isOrgAdmin}
            currentUserId={uid}
            onAddMembers={() => {
              if (!selectedOrg) return;
              setShowAddOrgMembers(true);
            }}
            onRemoveMember={handleRemoveOrgMember}
          />
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <CreateOrgModal
        open={showCreateOrg}
        onClose={() => setShowCreateOrg(false)}
        onSubmit={handleCreateOrganization}
      />
      <DeleteOrgModal
        open={showDeleteOrg}
        onClose={() => setShowDeleteOrg(false)}
        onConfirm={handleDeleteOrganization}
        orgName={selectedOrgObj?.name}
      />
      <CreateTeamModal
        open={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSubmit={handleCreateTeam}
        orgName={selectedOrgObj?.name}
      />
      <DeleteTeamModal
        open={showDeleteTeam}
        onClose={() => setShowDeleteTeam(false)}
        onConfirm={handleDeleteTeam}
        teamName={selectedTeam?.name}
      />
      <AddOrgMembersModal
        open={showAddOrgMembers}
        onClose={() => setShowAddOrgMembers(false)}
        onSubmit={handleAddOrgMembers}
        orgName={selectedOrgObj?.name}
      />
      <AddTeamMembersModal
        open={showAddTeamMembers}
        onClose={() => setShowAddTeamMembers(false)}
        onSubmit={handleAddTeamMembers}
        teamName={selectedTeam?.name}
        orgMembers={selectedOrgObj?.members ?? []}
        existingMemberIds={(teamData.members ?? []).map((m: any) => m.id)}
      />
    </div>
  );
};

export default OrgView;
