import { http, HttpResponse } from 'msw';

const MOCK_TOKEN = 'header.payload.signature';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'OK',
      message: 'SyncBoard Server active',
      timestamp: new Date().toISOString(),
    });
  }),

  http.post('/api/auth/login', () => {
    return HttpResponse.json({ token: MOCK_TOKEN });
  }),

  http.get('/api/tasks', () => {
    return HttpResponse.json([
      { id: 1, title: 'Mock task', completed: false },
    ]);
  }),
];