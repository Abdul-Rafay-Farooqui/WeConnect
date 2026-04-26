const CalendarTab = ({ meetings = [] as any[] }) => {
  if (!meetings.length) return <p className="text-[#8696a0] text-sm">No calendar entries.</p>;

  return (
    <div className="space-y-2">
      {meetings.map((meeting: any) => (
        <div key={meeting.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <p className="text-[#e9edef] text-sm">{meeting.date}</p>
          <p className="text-[#cfd4d7] text-sm">{meeting.title}</p>
          <p className="text-[#8696a0] text-xs">{meeting.time}</p>
        </div>
      ))}
    </div>
  );
};

export default CalendarTab;
