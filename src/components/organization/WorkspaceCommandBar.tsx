const WorkspaceCommandBar = ({
  presence,
  presenceOptions,
  commandBarQuery,
  setCommandBarQuery,
}: any) => (
  <div className="p-3 border-b border-[#222d34] bg-[#111b21] flex items-center gap-3">
    <div className="text-xs text-[#8696a0] bg-[#202c33] rounded px-2 py-1">
      {presenceOptions.find((p: any) => p.id === presence)?.icon || '🟢'}{' '}
      {presenceOptions.find((p: any) => p.id === presence)?.label || 'Available'}
    </div>
    <input
      value={commandBarQuery}
      onChange={(e) => setCommandBarQuery(e.target.value)}
      placeholder="Search workspace..."
      className="input-field max-w-md"
    />
  </div>
);

export default WorkspaceCommandBar;
