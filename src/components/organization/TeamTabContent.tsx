import ActivityTab from "./tabs/ActivityTab";
import ApprovalsTab from "./tabs/ApprovalsTab";
import AttendanceTab from "./tabs/AttendanceTab";
import CalendarTab from "./tabs/CalendarTab";
import ChatTab from "./tabs/ChatTab";
import FilesTab from "./tabs/FilesTab";
import MeetingsTab from "./tabs/MeetingsTab";
import MembersTab from "./tabs/MembersTab";
import PraiseTab from "./tabs/PraiseTab";
import TasksTab from "./tabs/TasksTab";

const TeamTabContent = ({
  activeTab,
  teamData,
  selectedTeam,
  selectedOrg,
  teamConversationId,
  onTeamUpdated,
  isTeamAdmin,
  currentUserId,
  currentUserName,
  onRemoveTeamMember,
  onAddActivity,
  onDeleteActivity,
  onRefreshWorkspace,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onAddCalendarEvent,
  onDeleteCalendarEvent,
  onClockIn,
  onClockOut,
  onRequestApproval,
  onApproveApproval,
  onRejectApproval,
  onCancelApproval,
  onSendPraise,
  onScheduleMeeting,
  onStartMeetingNow,
  onStartMeeting,
  onEndMeeting,
}: any) => {
  if (activeTab === "chat")
    return (
      <ChatTab
        selectedTeam={selectedTeam}
        selectedOrg={selectedOrg}
        teamConversationId={teamConversationId}
        onTeamUpdated={onTeamUpdated}
      />
    );
  if (activeTab === "members")
    return (
      <MembersTab
        members={teamData.members}
        isAdmin={isTeamAdmin}
        currentUserId={currentUserId}
        onRemove={onRemoveTeamMember}
      />
    );
  if (activeTab === "activity")
    return (
      <ActivityTab
        activity={teamData.activity}
        isAdmin={isTeamAdmin}
        onAdd={onAddActivity}
        onDelete={onDeleteActivity}
      />
    );
  if (activeTab === "files")
    return (
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
  if (activeTab === "meetings")
    return (
      <MeetingsTab
        meetings={teamData.meetings}
        members={teamData.members}
        organizationId={selectedOrg}
        teamId={selectedTeam?.id}
        currentUserId={currentUserId}
        isAdmin={isTeamAdmin}
        onScheduleMeeting={onScheduleMeeting}
        onStartMeetingNow={onStartMeetingNow}
        onStartMeeting={onStartMeeting}
        onEndMeeting={onEndMeeting}
        onRefresh={onRefreshWorkspace}
      />
    );
  if (activeTab === "tasks")
    return (
      <TasksTab
        tasks={teamData.tasks}
        teamMembers={(teamData.members ?? []).map((m: any) => ({
          id: m.id,
          name: m.name,
        }))}
        currentUserId={currentUserId}
        isAdmin={isTeamAdmin}
        onAdd={onAddTask}
        onDelete={onDeleteTask}
        onUpdate={onUpdateTask}
      />
    );
  if (activeTab === "calendar")
    return (
      <CalendarTab
        events={teamData.calendar}
        teamMembers={(teamData.members ?? []).map((m: any) => ({
          id: m.id,
          name: m.name,
        }))}
        currentUserId={currentUserId}
        isAdmin={isTeamAdmin}
        onAdd={onAddCalendarEvent}
        onDelete={onDeleteCalendarEvent}
      />
    );
  if (activeTab === "attendance")
    return (
      <AttendanceTab
        attendance={teamData.attendance}
        currentUserId={currentUserId}
        isAdmin={isTeamAdmin}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
      />
    );
  if (activeTab === "approvals")
    return (
      <ApprovalsTab
        approvals={teamData.approvals}
        currentUserId={currentUserId}
        isAdmin={isTeamAdmin}
        onRequestApproval={onRequestApproval}
        onApprove={onApproveApproval}
        onReject={onRejectApproval}
        onCancel={onCancelApproval}
      />
    );
  if (activeTab === "praise")
    return (
      <PraiseTab
        praise={teamData.praise}
        teamMembers={(teamData.members ?? []).map((m: any) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
        }))}
        currentUserId={currentUserId}
        onSendPraise={onSendPraise}
      />
    );
  return null;
};

export default TeamTabContent;
