import { PRESENCE_MAP } from './constants';
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

const TeamTabContent = ({ activeTab, teamData, setShowMeetingOptions, setShowTaskModal }) => {
  if (activeTab === 'chat') return <ChatTab chat={teamData.chat} presenceLabel={PRESENCE_MAP.available} />;
  if (activeTab === 'activity') return <ActivityTab activity={teamData.activity} />;
  if (activeTab === 'files') return <FilesTab files={teamData.files} />;
  if (activeTab === 'meetings') return <MeetingsTab meetings={teamData.meetings} setShowMeetingOptions={setShowMeetingOptions} />;
  if (activeTab === 'tasks') return <TasksTab tasks={teamData.tasks} setShowTaskModal={setShowTaskModal} />;
  if (activeTab === 'calendar') return <CalendarTab meetings={teamData.meetings} />;
  if (activeTab === 'attendance') return <AttendanceTab attendance={teamData.attendance} />;
  if (activeTab === 'approvals') return <ApprovalsTab approvals={teamData.approvals} />;
  if (activeTab === 'praise') return <PraiseTab praise={teamData.praise} />;
  if (activeTab === 'shifts') return <ShiftsTab shifts={teamData.shifts} />;

  return null;
};

export default TeamTabContent;
