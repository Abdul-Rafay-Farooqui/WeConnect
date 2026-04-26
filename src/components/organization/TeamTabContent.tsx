import ActivityTab from './tabs/ActivityTab';
import ApprovalsTab from './tabs/ApprovalsTab';
import AttendanceTab from './tabs/AttendanceTab';
import CalendarTab from './tabs/CalendarTab';
import ChatTab from './tabs/ChatTab';
import FilesTab from './tabs/FilesTab';
import MeetingsTab from './tabs/MeetingsTab';
import MembersTab from './tabs/MembersTab';
import PraiseTab from './tabs/PraiseTab';
import ShiftsTab from './tabs/ShiftsTab';
import TasksTab from './tabs/TasksTab';

const TeamTabContent = ({ activeTab, teamData, selectedTeam, selectedOrg, teamConversationId, onTeamUpdated, isTeamAdmin, currentUserId, currentUserName, onRemoveTeamMember, onAddActivity, onDeleteActivity, onRefreshWorkspace, onAddTask, onDeleteTask }: any) => {
  if (activeTab === 'chat')
    return (
      <ChatTab
        selectedTeam={selectedTeam}
        selectedOrg={selectedOrg}
        teamConversationId={teamConversationId}
        onTeamUpdated={onTeamUpdated}
      />
    );
  if (activeTab === 'members')
    return (
      <MembersTab
        members={teamData.members}
        isAdmin={isTeamAdmin}
        currentUserId={currentUserId}
        onRemove={onRemoveTeamMember}
      />
    );
  if (activeTab === 'activity') return (
    <ActivityTab
      activity={teamData.activity}
      isAdmin={isTeamAdmin}
      onAdd={onAddActivity}
      onDelete={onDeleteActivity}
    />
  );
  if (activeTab === 'files') return (
    <FilesTab
      files={teamData.files}
      conversationId={teamConversationId}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      isAdmin={isTeamAdmin}
      onRefresh={onRefreshWorkspace}
      onAddActivity={onAddActivity}
    />
  );
  if (activeTab === 'meetings') return <MeetingsTab meetings={teamData.meetings} />;
  if (activeTab === 'tasks') return (
    <TasksTab
      tasks={teamData.tasks}
      teamMembers={(teamData.members ?? []).map((m: any) => ({ id: m.id, name: m.name }))}
      onAdd={onAddTask}
      onDelete={onDeleteTask}
    />
  );
  if (activeTab === 'calendar') return <CalendarTab meetings={teamData.calendar || teamData.meetings} />;
  if (activeTab === 'attendance') return <AttendanceTab attendance={teamData.attendance} />;
  if (activeTab === 'approvals') return <ApprovalsTab approvals={teamData.approvals} />;
  if (activeTab === 'praise') return <PraiseTab praise={teamData.praise} />;
  if (activeTab === 'shifts') return <ShiftsTab shifts={teamData.shifts} />;
  return null;
};

export default TeamTabContent;
