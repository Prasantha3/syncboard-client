import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the login form', () => {
    render(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: /login/i })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /login/i })
    ).toBeInTheDocument();
  });

  test('shows an error when email is empty', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole('button', { name: /login/i })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Email is required');
  });

  test('shows an error when password is empty', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'test@example.com'
    );

    await user.click(
      screen.getByRole('button', { name: /login/i })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Password is required');
  });

  test('allows the user to type email and password', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('Password123');
  });

  test('successfully logs in and stores the token', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'test@example.com'
    );

    await user.type(
      screen.getByLabelText(/password/i),
      'Password123'
    );

    await user.click(
      screen.getByRole('button', { name: /login/i })
    );

    expect(
      await screen.findByRole('status')
    ).toHaveTextContent('Login successful');

    expect(
      localStorage.getItem('token')
    ).toBe('mock-jwt-token');

    expect(
      JSON.parse(localStorage.getItem('user'))
    ).toEqual({
      id: 'test-user-1',
      username: 'Test User',
      email: 'test@example.com',
    });
  });

  test('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'wrong@example.com'
    );

    await user.type(
      screen.getByLabelText(/password/i),
      'WrongPassword'
    );

    await user.click(
      screen.getByRole('button', { name: /login/i })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Invalid credentials');
  });
});