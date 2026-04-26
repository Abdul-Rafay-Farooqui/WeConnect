const PraiseTab = ({ praise = [] as any[] }) => {
  if (!praise.length) return <p className="text-[#8696a0] text-sm">No praise records.</p>;

  return (
    <div className="space-y-2">
      {praise.map((item: any) => (
        <div key={item.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <p className="text-[#e9edef] text-sm">{item.badge}</p>
          <p className="text-[#8696a0] text-xs mt-1">{item.from} → {item.to}</p>
          <p className="text-[#cfd4d7] text-xs mt-1">{item.message}</p>
        </div>
      ))}
    </div>
  );
};

export default PraiseTab;
