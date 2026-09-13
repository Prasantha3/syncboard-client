import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'invalid@nsbm.lk') {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { id: '123', email }
    }, { status: 200 });
  }),
];