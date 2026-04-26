const TasksTab = ({ tasks, setShowTaskModal }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Team Tasks</h3>
      <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => setShowTaskModal(true)}>➕ New Task</button>
    </div>
    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Track work with assignee, due date, and priority. Move tasks through To do → In progress → Completed.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {tasks.map((task) => (
        <div key={task.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input type="checkbox" checked={task.status === 'completed'} readOnly />
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h4>
              </div>
              <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>{task.description}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                <span>👤 {task.assignee}</span>
                <span>📅 {task.dueDate}</span>
              </div>
            </div>
            <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', background: 'hsl(var(--bg-tertiary))', color: 'hsl(var(--text-muted))' }}>{task.status}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TasksTab;
