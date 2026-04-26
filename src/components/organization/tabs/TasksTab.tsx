const TasksTab = ({ tasks = [] as any[] }) => {
  if (!tasks.length) return <p className="text-[#8696a0] text-sm">No tasks in this team.</p>;

  return (
    <div className="space-y-2">
      {tasks.map((task: any) => (
        <div key={task.id} className="bg-[#111b21] border border-[#222d34] rounded-lg p-3">
          <div className="flex justify-between items-start">
            <p className="text-[#e9edef] text-sm font-medium">{task.title}</p>
            <span className="text-xs text-[#8696a0] capitalize">{task.priority}</span>
          </div>
          <p className="text-[#8696a0] text-xs mt-1">
            {task.assignee} • Due {task.dueDate}
          </p>
          <p className="text-xs text-[#00a884] mt-1 capitalize">{task.status}</p>
        </div>
      ))}
    </div>
  );
};

export default TasksTab;
