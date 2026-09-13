import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:5000/api/auth';

export const handlers = [
  http.post(`${API_BASE_URL}/login`, async ({ request }) => {
    const body = await request.json();

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: 'Validation Error',
          message: 'Email and password required',
        },
        { status: 400 }
      );
    }

    if (
      body.email !== 'test@example.com' ||
      body.password !== 'Password123'
    ) {
      return HttpResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: 'test-user-1',
          username: 'Test User',
          email: 'test@example.com',
        },
      },
      { status: 200 }
    );
  }),
];