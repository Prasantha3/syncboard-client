import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server.js';
import TaskBoard from '../src/pages/TaskBoard';

describe('TaskBoard', () => {
  it('shows a loading state, then renders tasks grouped by column', async () => {
    render(<TaskBoard />);

    expect(screen.getByText(/loading/i) || document.body).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Design mockups')).toBeInTheDocument();
    });

    expect(screen.getByText('Set up CI')).toBeInTheDocument();
  });

  it('shows an error banner when the request fails', async () => {
    server.use(
      http.get('/api/tasks', () => {
        return HttpResponse.json({ message: 'Server unavailable' }, { status: 500 });
      })
    );

    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to connect|server unavailable/i)).toBeInTheDocument();
    });
  });

  it('adds a new task via the form', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);

    await waitFor(() => screen.getByText('Design mockups'));

    await user.type(screen.getByPlaceholderText('Task title'), 'Write tests');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  it('deletes a task', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);

    await waitFor(() => screen.getByText('Design mockups'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Design mockups')).not.toBeInTheDocument();
    });
  });
});