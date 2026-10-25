import React from 'react';

// Overdue check helper: comparing string dates YYYY-MM-DD
const isOverdueTask = (dueDate, status) => {
  if (!dueDate || status === 'COMPLETE') return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return dueDate < todayStr;
};

// Date formatter showing Today, Tomorrow, Yesterday, or short date format
const formatDueDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete }) {
  const isOverdue = isOverdueTask(task.dueDate, task.status);
  const isComplete = task.status === 'COMPLETE';

  return (
    <div className={`task-card ${isComplete ? 'task-card-complete' : ''} ${isOverdue ? 'task-card-overdue' : ''}`}>
      {/* Checkbox Status Column */}
      <div className="task-card-left">
        <button
          type="button"
          className={`custom-checkbox ${isComplete ? 'checked' : ''}`}
          onClick={() => onToggleStatus(task)}
          aria-label={isComplete ? 'Mark task as open' : 'Mark task as complete'}
        >
          {isComplete && (
            <svg viewBox="0 0 24 24" className="checkmark-icon">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Content Column */}
      <div className="task-card-middle">
        <div className="task-title-row">
          <h4 className={`task-title ${isComplete ? 'completed-text' : ''}`}>
            {task.title}
          </h4>
          
          {/* Priority Badge */}
          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </span>
        </div>

        {task.description && (
          <p className={`task-desc-preview ${isComplete ? 'completed-desc' : ''}`}>
            {task.description}
          </p>
        )}

        {/* Due Date and Status indicator line */}
        {task.dueDate && (
          <div className="task-meta-row">
            <span className={`task-due-date ${isOverdue ? 'overdue-warning' : ''} ${isComplete ? 'completed-meta' : ''}`}>
              <svg viewBox="0 0 24 24" className="meta-icon calendar-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDueDate(task.dueDate)}
              {isOverdue && <span className="overdue-text"> (Overdue)</span>}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons Column */}
      <div className="task-card-actions">
        <button
          type="button"
          className="action-btn edit-btn"
          onClick={() => onEdit(task)}
          title="Edit Task"
          aria-label="Edit Task"
        >
          <svg viewBox="0 0 24 24" className="action-icon">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          className="action-btn delete-btn"
          onClick={() => onDelete(task)}
          title="Delete Task"
          aria-label="Delete Task"
        >
          <svg viewBox="0 0 24 24" className="action-icon">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
