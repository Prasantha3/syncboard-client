const API_BASE_URL = 'http://localhost:5000/api/tasks';

const getAuthHeaders = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

const handleResponse = async (response) => {
  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      responseData.message ||
        `HTTP Error: ${response.status} ${response.statusText}`
    );

    error.status = response.status;
    error.data = responseData;

    if (response.status === 409) {
      error.conflict = responseData.payload || null;
    }

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return responseData;
};

export async function getTasks() {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getTaskById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function createTask(task) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });

  return await handleResponse(response);
}

export async function updateTaskStatus(id, status, baseVersion) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      ...(typeof baseVersion === 'number'
        ? { baseVersion }
        : {}),
    }),
  });

  return await handleResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  await handleResponse(response);

  return { id };
}