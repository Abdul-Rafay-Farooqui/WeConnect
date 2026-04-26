const ApprovalsTab = ({ approvals = [] as any[] }) => {
  if (!approvals.length) return <p className="text-[#8696a0] text-sm">No approvals found.</p>;

  return (
    <div className="space-y-2">
      {approvals.map((item: any) => (
        <div key={item.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <p className="text-[#e9edef] text-sm">{item.title}</p>
          <p className="text-[#8696a0] text-xs mt-1">{item.type} • {item.requestedBy}</p>
          <p className="text-xs text-[#00a884] mt-1 capitalize">{item.status}</p>
        </div>
      ))}
    </div>
  );
};

export default ApprovalsTab;
