import React from 'react';

export default function DeleteConfirmationModal({ isOpen, task, onClose, onConfirm }) {
  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Task?</h2>
          <button type="button" className="close-x-btn" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <p className="delete-confirmation-msg">
            Are you sure you want to delete <strong className="highlight-task-title">"{task.title}"</strong>?
          </p>
          <p className="delete-note">This action cannot be undone.</p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
