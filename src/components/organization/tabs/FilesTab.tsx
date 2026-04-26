const FilesTab = ({ files = [] as any[] }) => {
  if (!files.length) return <p className="text-[#8696a0] text-sm">No files found.</p>;

  return (
    <div className="space-y-2">
      {files.map((file: any) => (
        <div key={file.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[#e9edef] text-sm">{file.icon || '📄'} {file.name}</p>
            <p className="text-[#8696a0] text-xs">{file.uploadedBy} • {file.time}</p>
          </div>
          <p className="text-[#8696a0] text-xs">{file.size || '-'}</p>
        </div>
      ))}
    </div>
  );
};

export default FilesTab;
