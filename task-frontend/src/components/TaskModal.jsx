import React, { useState, useEffect } from 'react';

export default function TaskModal({ isOpen, mode, task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('OPEN');
  const [errors, setErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  // Sync state with task when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setDueDate(task.dueDate || '');
        setPriority(task.priority || 'MEDIUM');
        setStatus(task.status || 'OPEN');
      } else {
        // Clear for creation
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('MEDIUM');
        setStatus('OPEN');
      }
      setErrors({});
    }
  }, [isOpen, mode, task]);

  if (!isOpen) return null;

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 255) {
      newErrors.title = 'Title must be 255 characters or less';
    }

    if (description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    if (dueDate && dueDate < todayStr) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      dueDate: dueDate || null,
      priority,
    };

    if (mode === 'edit') {
      payload.status = status;
    }

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Task' : 'New Task'}</h2>
          <button type="button" className="close-x-btn" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title field */}
          <div className="form-group">
            <label htmlFor="task-title-input" className="form-label required-label">
              Title
            </label>
            <input
              id="task-title-input"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Finish writing documentation"
              value={title}
              onChange={handleTitleChange}
              maxLength={260}
              required
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Description field */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="task-desc-input" className="form-label">
                Description
              </label>
              <span className={`char-counter ${description.length > 1000 ? 'counter-error' : ''}`}>
                {description.length}/1000
              </span>
            </div>
            <textarea
              id="task-desc-input"
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Provide a detailed description of the task..."
              value={description}
              onChange={handleDescriptionChange}
              maxLength={1100}
              rows={4}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Due date and Priority Side-by-Side */}
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="task-date-input" className="form-label">
                Due Date
              </label>
              <input
                id="task-date-input"
                type="date"
                className={`form-input ${errors.dueDate ? 'input-error' : ''}`}
                value={dueDate}
                min={todayStr}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
                }}
              />
              {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
            </div>

            <div className="form-group half-width">
              <label className="form-label">Priority</label>
              <div className="priority-segments">
                {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`segment-btn segment-${p.toLowerCase()} ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Field (only when editing) */}
          {mode === 'edit' && (
            <div className="form-group status-toggle-group">
              <span className="form-label">Status</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={status === 'COMPLETE'}
                  onChange={(e) => setStatus(e.target.checked ? 'COMPLETE' : 'OPEN')}
                />
                <span className="slider round"></span>
                <span className="toggle-label-text">
                  {status === 'COMPLETE' ? 'Completed' : 'Open'}
                </span>
              </label>
            </div>
          )}

          {/* Modal Actions */}
          <div className={`modal-footer ${mode === 'edit' ? 'edit-footer' : ''}`}>
            {mode === 'edit' && (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => onDelete(task)}
              >
                Delete Task
              </button>
            )}

            <div className="modal-footer-right">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
