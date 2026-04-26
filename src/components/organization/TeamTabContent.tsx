import ActivityTab from './tabs/ActivityTab';
import ApprovalsTab from './tabs/ApprovalsTab';
import AttendanceTab from './tabs/AttendanceTab';
import CalendarTab from './tabs/CalendarTab';
import ChatTab from './tabs/ChatTab';
import FilesTab from './tabs/FilesTab';
import MeetingsTab from './tabs/MeetingsTab';
import PraiseTab from './tabs/PraiseTab';
import ShiftsTab from './tabs/ShiftsTab';
import TasksTab from './tabs/TasksTab';

const TeamTabContent = ({ activeTab, teamData }: any) => {
  if (activeTab === 'chat') return <ChatTab chat={teamData.chat} />;
  if (activeTab === 'activity') return <ActivityTab activity={teamData.activity} />;
  if (activeTab === 'files') return <FilesTab files={teamData.files} />;
  if (activeTab === 'meetings') return <MeetingsTab meetings={teamData.meetings} />;
  if (activeTab === 'tasks') return <TasksTab tasks={teamData.tasks} />;
  if (activeTab === 'calendar') return <CalendarTab meetings={teamData.calendar || teamData.meetings} />;
  if (activeTab === 'attendance') return <AttendanceTab attendance={teamData.attendance} />;
  if (activeTab === 'approvals') return <ApprovalsTab approvals={teamData.approvals} />;
  if (activeTab === 'praise') return <PraiseTab praise={teamData.praise} />;
  if (activeTab === 'shifts') return <ShiftsTab shifts={teamData.shifts} />;
  return null;
};

export default TeamTabContent;
