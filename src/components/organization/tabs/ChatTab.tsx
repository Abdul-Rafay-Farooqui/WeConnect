const ChatTab = ({ chat = [] as any[] }) => {
  if (!chat.length) {
    return <p className="text-[#8696a0] text-sm">No team chat messages yet.</p>;
  }

  return (
    <div className="space-y-3">
      {chat.map((item: any) => (
        <div key={item.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[#e9edef] text-sm font-medium">{item.sender || 'Unknown'}</p>
            <p className="text-[#8696a0] text-xs">{item.time || '-'}</p>
          </div>
          <p className="text-[#cfd4d7] text-sm">{item.message || ''}</p>
          {!!item.reactions?.length && (
            <p className="text-xs text-[#8696a0] mt-2">{item.reactions.join(' ')}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatTab;
