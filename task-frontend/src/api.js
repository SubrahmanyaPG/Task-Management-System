// API Client for TaskFlow with Spring Boot backend and LocalStorage Fallback

let isFallbackMode = false;
let fallbackListeners = [];

export function subscribeToFallbackMode(listener) {
  fallbackListeners.push(listener);
  listener(isFallbackMode);
  return () => {
    fallbackListeners = fallbackListeners.filter(l => l !== listener);
  };
}

function setFallbackMode(val) {
  if (isFallbackMode !== val) {
    isFallbackMode = val;
    fallbackListeners.forEach(listener => listener(val));
  }
}

// Local Storage Keys & Seeds
const STORAGE_KEY = 'taskflow_tasks_mock';

function getLocalTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const defaultTasks = [
      {
        id: '1e1e4a77-3e13-4e4f-b52e-ec5f7dfd1d21',
        title: 'Welcome to TaskFlow! 🚀',
        description: 'This is a clean, modern personal task tracker. Try creating, editing, and filtering tasks!',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        priority: 'HIGH',
        status: 'OPEN'
      },
      {
        id: '2b2b8c99-4d24-5f5f-c63f-fc6f8dfd2e32',
        title: 'Review vanilla CSS architecture',
        description: 'Create a beautiful dark/light interface with glassmorphism, responsive elements, and clean animations.',
        dueDate: new Date().toISOString().split('T')[0], // today
        priority: 'MEDIUM',
        status: 'COMPLETE'
      },
      {
        id: '3c3c9d88-5e35-6f6f-d74f-fd7f9dfd3f43',
        title: 'Test Spring Boot Integration',
        description: 'Verify API endpoints handle high, medium, and low priorities and update tasks smoothly.',
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday (overdue)
        priority: 'LOW',
        status: 'OPEN'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  return JSON.parse(data);
}

function saveLocalTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Request Helper
async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    setFallbackMode(false);
    return res;
  } catch (error) {
    console.warn("Backend API request failed, switching to local mode:", error);
    setFallbackMode(true);
    throw error;
  }
}

// API Endpoints
export async function listTasks() {
  try {
    const res = await request('/api/v1/tasks');
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (isFallbackMode) {
      return getLocalTasks();
    }
    throw err;
  }
}

export async function createTask(taskDto) {
  try {
    const res = await request('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskDto),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (isFallbackMode) {
      const tasks = getLocalTasks();
      const newTask = {
        id: crypto.randomUUID(),
        title: taskDto.title,
        description: taskDto.description || '',
        dueDate: taskDto.dueDate || null,
        priority: taskDto.priority,
        status: 'OPEN',
      };
      tasks.push(newTask);
      saveLocalTasks(tasks);
      return newTask;
    }
    throw err;
  }
}

export async function updateTask(id, updateDto) {
  try {
    const res = await request(`/api/v1/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateDto),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (isFallbackMode) {
      const tasks = getLocalTasks();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Task not found');
      const updated = {
        ...tasks[idx],
        title: updateDto.title,
        description: updateDto.description || '',
        dueDate: updateDto.dueDate || null,
        priority: updateDto.priority,
        status: updateDto.status,
      };
      tasks[idx] = updated;
      saveLocalTasks(tasks);
      return updated;
    }
    throw err;
  }
}

export async function deleteTask(id) {
  try {
    const res = await request(`/api/v1/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return true;
  } catch (err) {
    if (isFallbackMode) {
      let tasks = getLocalTasks();
      tasks = tasks.filter(t => t.id !== id);
      saveLocalTasks(tasks);
      return true;
    }
    throw err;
  }
}
