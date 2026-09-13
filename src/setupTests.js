import '@testing-library/jest-dom';
import { server } from './mocks/server.js';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handlers after each test so they don't leak into other tests
afterEach(() => server.resetHandlers());

// Clean up after tests finish
afterAll(() => server.close());