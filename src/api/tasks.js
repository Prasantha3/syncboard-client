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
    
    // Step 1 & 3: Handle HTTP 409 Conflict distinctly and preserve payload for UI
    if (response.status === 409) {
      const conflictError = new Error(errorData.message || 'Conflict detected: Task modified by another user');
      conflictError.status = 409;
      conflictError.isConflict = true;
      conflictError.payload = errorData.payload || errorData; // Passes current & yourVersion to UI
      throw conflictError;
    }

    const errorMessage = errorData.message || `HTTP Error: ${response.status} ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
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
    throw err;
  }
}

export async function getTaskById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(response);
  } catch (err) {
    throw err;
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
    throw err;
  }
}

export async function updateTaskStatus(id, status, baseVersion) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ changes: { status }, baseVersion }),
    });
    return await handleResponse(response);
  } catch (err) {
    throw err;
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
    throw err;
  }
}

// Step 2: Fetch overdue task aggregation stats per assignee
export async function getOverdueTaskStats(boardId) {
  try {
    const query = boardId ? `?boardId=${boardId}` : '';
    const response = await fetch(`${API_BASE_URL}/stats/overdue${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(response);
  } catch (err) {
    throw err;
  }
}