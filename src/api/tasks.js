const API_BASE_URL = 'http://localhost:5000/api/tasks';

// Reads the stored JWT and builds auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper to handle response status and extract JSON/errors cleanly
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `HTTP Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export async function getTasks() {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(response);
  } catch (err) {
    throw new Error(err.message || 'Could not connect to backend server');
  }
}

export async function getTaskById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(response);
  } catch (err) {
    throw new Error(err.message || 'Failed to fetch task details');
  }
}

export async function createTask(task) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(task),
    });
    return await handleResponse(response);
  } catch (err) {
    throw new Error(err.message || 'Failed to create task');
  }
}

export async function updateTaskStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  } catch (err) {
    throw new Error(err.message || 'Failed to update task status');
  }
}

export async function deleteTask(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    await handleResponse(response);
    return { id };
  } catch (err) {
    throw new Error(err.message || 'Failed to delete task');
  }
}