const OrganizationSidebar = ({
  organizations,
  selectedOrg,
  setSelectedOrg,
  selectedTeam,
  setSelectedTeam,
  isLoading,
  error,
  onRetry,
  onCreateOrganization,
  onCreateTeam,
  onAddOrgMembers,
}: any) => (
  <div className="w-[320px] bg-[#111b21] border-r border-[#222d34] flex flex-col">
    <div className="p-4 border-b border-[#222d34]">
      <h2 className="text-[#e9edef] text-xl font-semibold mb-3">Organizations</h2>
      <div className="flex gap-2 flex-wrap">
        <button className="btn-ghost" onClick={onCreateOrganization}>+ Org</button>
        <button className="btn-ghost" onClick={onCreateTeam} disabled={!selectedOrg}>+ Team</button>
        <button className="btn-ghost" onClick={onAddOrgMembers} disabled={!selectedOrg}>+ Members</button>
      </div>
      {isLoading && <p className="text-xs text-[#8696a0] mt-2">Loading...</p>}
      {!isLoading && error && <button className="btn-ghost mt-2" onClick={onRetry}>Retry</button>}
    </div>
    <div className="overflow-y-auto custom-scrollbar flex-1">
      {organizations.map((org: any) => (
        <div key={org.id}>
          <button
            className={`w-full text-left px-4 py-3 ${selectedOrg === org.id ? 'bg-[#202c33]' : 'hover:bg-[#1a252c]'}`}
            onClick={() => setSelectedOrg(org.id)}
          >
            <span className="mr-2">{org.icon || '🏢'}</span>
            <span className="text-[#e9edef]">{org.name}</span>
          </button>
          {selectedOrg === org.id && (org.teams || []).map((team: any) => {
            const teamId = typeof team === 'string' ? team : team.id;
            const teamName = typeof team === 'string' ? team : team.name;
            const active = selectedTeam?.id === teamId;
            return (
              <button
                key={teamId}
                className={`w-full text-left pl-10 pr-4 py-2 text-sm ${active ? 'bg-[#00a884]/20 text-[#e9edef]' : 'text-[#8696a0] hover:bg-[#1a252c]'}`}
                onClick={() => setSelectedTeam({ id: teamId, name: teamName })}
              >
                👥 {teamName}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

export default OrganizationSidebar;
