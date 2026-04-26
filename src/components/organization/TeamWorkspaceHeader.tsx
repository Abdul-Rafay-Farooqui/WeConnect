import { TEAM_TABS } from './constants';

const TeamWorkspaceHeader = ({
  selectedTeam,
  activeTab,
  setActiveTab,
  setShowMeetingModal,
  onCreateTeam,
  onAddTeamMembers,
}: any) => (
  <div className="p-4 border-b border-[#222d34] bg-[#111b21]">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[#e9edef] text-lg font-semibold">{selectedTeam}</h2>
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={onCreateTeam}>+ Team</button>
        <button className="btn-ghost" onClick={onAddTeamMembers}>+ Members</button>
        <button className="btn-primary" onClick={() => setShowMeetingModal(true)}>Meeting</button>
      </div>
    </div>
    <div className="flex gap-2 flex-wrap">
      {TEAM_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-1 rounded-md text-sm capitalize ${activeTab === tab ? 'bg-[#00a884] text-[#0b141a]' : 'bg-transparent text-[#8696a0] hover:bg-[#202c33]'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

export default TeamWorkspaceHeader;
