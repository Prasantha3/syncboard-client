const API_BASE_URL = 'http://localhost:5000/api/tasks';

// Helper to handle response status and extract JSON/errors cleanly
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `HTTP Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Handle 204 No Content (DELETE responses)
  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export async function getTasks() {
  const response = await fetch(API_BASE_URL);
  return await handleResponse(response);
}

export async function getTaskById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return await handleResponse(response);
}

export async function createTask(task) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return await handleResponse(response);
}

export async function updateTaskStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return await handleResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
  return { id };
}