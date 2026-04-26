const ActivityTab = ({ activity = [] as any[] }) => {
  if (!activity.length) return <p className="text-[#8696a0] text-sm">No recent activity.</p>;

  return (
    <div className="space-y-2">
      {activity.map((item: any) => (
        <div key={item.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <p className="text-[#e9edef] text-sm">
            {item.user} <span className="text-[#8696a0]">{item.text}</span>
          </p>
          <p className="text-[#8696a0] text-xs mt-1">{item.preview}</p>
          <p className="text-[#8696a0] text-xs mt-1">{item.time}</p>
        </div>
      ))}
    </div>
  );
};

export default ActivityTab;
