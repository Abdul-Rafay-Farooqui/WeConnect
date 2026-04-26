const AttendanceTab = ({ attendance = [] as any[] }) => {
  if (!attendance.length) return <p className="text-[#8696a0] text-sm">No attendance data.</p>;

  return (
    <div className="space-y-2">
      {attendance.map((row: any) => (
        <div key={row.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3 flex justify-between">
          <div>
            <p className="text-[#e9edef] text-sm">{row.name}</p>
            <p className="text-[#8696a0] text-xs">In: {row.signIn} • Out: {row.signOut}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#00a884] capitalize">{row.status}</p>
            <p className="text-xs text-[#8696a0]">{row.hours}h</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceTab;
