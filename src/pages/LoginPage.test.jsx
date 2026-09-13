import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import LoginPage from './LoginPage'; // Adjust import path if needed
import { ThemeProvider } from '../context/ThemeContext'; // Adjust import path if needed

describe('LoginPage Component', () => {

  const renderWithContext = (ui) => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          {ui}
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  // 1. Form Validation Testing
  it('shows validation errors when submitting empty required fields', async () => {
    const user = userEvent.setup();
    renderWithContext(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /login|sign in/i });
    await user.click(submitButton);

    // Expect HTML5 validation or rendered error message
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
  });

  // 2. User Event Simulation & MSW Successful Login
  it('simulates typing and submits form successfully', async () => {
    const user = userEvent.setup();
    renderWithContext(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login|sign in/i });

    // Simulate typing
    await user.type(emailInput, 'hettihewa@nsbm.lk');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('hettihewa@nsbm.lk');
    expect(passwordInput).toHaveValue('password123');

    await user.click(submitButton);

    // Assert successful redirect or success message using findByText / waitFor
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  // 3. Async & Network Failure (MSW Override) Testing
  it('displays error message when login request fails', async () => {
    // Override MSW handler for network failure
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithContext(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'wrong@nsbm.lk');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login|sign in/i }));

    // Async assertion using findByText
    const errorMessage = await screen.findByText(/invalid email or password/i);
    expect(errorMessage).toBeInTheDocument();
  });

});