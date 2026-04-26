const MeetingsTab = ({ meetings = [] as any[] }) => {
  if (!meetings.length) return <p className="text-[#8696a0] text-sm">No meetings scheduled.</p>;

  return (
    <div className="space-y-2">
      {meetings.map((meeting: any) => (
        <div key={meeting.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <p className="text-[#e9edef] text-sm font-medium">{meeting.title}</p>
          <p className="text-[#8696a0] text-xs mt-1">{meeting.date} • {meeting.time}</p>
          <p className="text-xs text-[#00a884] mt-1 capitalize">{meeting.status}</p>
        </div>
      ))}
    </div>
  );
};

export default MeetingsTab;
