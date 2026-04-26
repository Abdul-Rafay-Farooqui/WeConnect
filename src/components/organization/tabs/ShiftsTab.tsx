const ShiftsTab = ({ shifts = [] as any[] }) => {
  if (!shifts.length) return <p className="text-[#8696a0] text-sm">No shifts planned.</p>;

  return (
    <div className="space-y-2">
      {shifts.map((item: any) => (
        <div key={item.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <p className="text-[#e9edef] text-sm">{item.user} ({item.role})</p>
          <p className="text-[#8696a0] text-xs mt-1">{item.date} • {item.shift}</p>
          <p className="text-xs text-[#00a884] mt-1 capitalize">{item.status}</p>
        </div>
      ))}
    </div>
  );
};

export default ShiftsTab;
