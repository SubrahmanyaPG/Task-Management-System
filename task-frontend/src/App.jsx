import React, { useState, useEffect } from 'react';
import { listTasks, createTask, updateTask, deleteTask, subscribeToFallbackMode } from './api';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import Toast from './components/Toast';
import EmptyState from './components/EmptyState';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Filters and sorting states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DUE_DATE');

  // Modals visibility states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Subscribe to API fallback mode (Local Demo Mode)
  useEffect(() => {
    const unsubscribe = subscribeToFallbackMode((fallbackVal) => {
      setIsLocalMode(fallbackVal);
    });
    return unsubscribe;
  }, []);

  // Fetch tasks on initial render
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (err) {
      showToast('Error connecting to backend API.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Helper for displaying toast notifications
  const showToast = (message, type = 'success') => {
    const newToast = {
      id: crypto.randomUUID(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  // 1. Toggle status between OPEN and COMPLETE
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'COMPLETE' ? 'OPEN' : 'COMPLETE';
    const updateDto = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: nextStatus,
    };

    try {
      const updated = await updateTask(task.id, updateDto);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      showToast(
        nextStatus === 'COMPLETE'
          ? 'Task marked as completed! 🎉'
          : 'Task marked as open.',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // 2. Open edit modal
  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  // 3. Open delete confirmation modal
  const handleOpenDelete = (task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  // 4. Save Task (create or update)
  const handleSaveTask = async (payload) => {
    if (isCreateOpen) {
      try {
        const created = await createTask(payload);
        setTasks((prev) => [...prev, created]);
        setIsCreateOpen(false);
        showToast('Task created successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to create task.', 'error');
      }
    } else if (isEditOpen && selectedTask) {
      try {
        const updated = await updateTask(selectedTask.id, payload);
        setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
        setIsEditOpen(false);
        setSelectedTask(null);
        showToast('Task updated successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update task.', 'error');
      }
    }
  };

  // 5. Delete Task
  const handleConfirmDelete = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setIsDeleteOpen(false);
      setIsEditOpen(false); // Close edit modal if triggered from there
      setSelectedTask(null);
      showToast('Task deleted successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && task.status === 'OPEN') ||
      (statusFilter === 'COMPLETE' && task.status === 'COMPLETE');

    const matchesPriority =
      priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  // Sorting logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'DUE_DATE') {
      // Tasks without due date go to the end
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'PRIORITY') {
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return 0;
  });

  const hasFiltersActive = statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  return (
    <>
      {/* Header Bar */}
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <svg viewBox="0 0 24 24" className="logo-icon">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h1 className="logo-text">TaskFlow</h1>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="app-container">
        {/* Offline Demo Warning Banner */}
        {isLocalMode && (
          <div className="demo-banner">
            <div className="demo-banner-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="demo-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Running in Local Demo Mode. Spring Boot backend is offline.</span>
            </div>
            <span className="demo-banner-right">Offline Fallback</span>
          </div>
        )}

        {/* Toolbar: Filters and Sort controls */}
        <div className="toolbar">
          <div className="filter-group">
            {/* Status Filter */}
            <div className="filter-item">
              <label htmlFor="status-filter" className="filter-label">Status</label>
              <select
                id="status-filter"
                className="select-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="OPEN">Open</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="filter-item">
              <label htmlFor="priority-filter" className="filter-label">Priority</label>
              <select
                id="priority-filter"
                className="select-control"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Sorting control */}
            <div className="filter-item">
              <label htmlFor="sort-by" className="filter-label">Sort By</label>
              <select
                id="sort-by"
                className="select-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="DUE_DATE">Due Date</option>
                <option value="PRIORITY">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List Content Area */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span className="loading-text">Loading your tasks...</span>
          </div>
        ) : sortedTasks.length === 0 ? (
          <EmptyState isFiltered={hasFiltersActive || tasks.length > 0} />
        ) : (
          <div className="task-list">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <TaskModal
        isOpen={isCreateOpen}
        mode="create"
        onSave={handleSaveTask}
        onClose={() => setIsCreateOpen(false)}
      />

      <TaskModal
        isOpen={isEditOpen}
        mode="edit"
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleOpenDelete}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTask(null);
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        task={selectedTask}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          // If edit was open, we keep it, otherwise clean selectedTask
          if (!isEditOpen) {
            setSelectedTask(null);
          }
        }}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} setToasts={setToasts} />
    </>
  );
}
