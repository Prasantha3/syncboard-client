const API_BASE_URL = 'http://localhost:5000/api/auth';

const handleResponse = async (response) => {
  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      responseData.message ||
        `HTTP Error: ${response.status} ${response.statusText}`
    );

    error.status = response.status;
    error.data = responseData;

    throw error;
  }

  return responseData;
};

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return await handleResponse(response);
}