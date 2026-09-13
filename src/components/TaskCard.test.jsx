import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TaskCard from './TaskCard';
import { ThemeProvider } from '../context/ThemeContext'; // Adjust path if needed

describe('TaskCard Component', () => {

  const mockTask = {
    title: 'Fix Navigation Bug',
    assignee: 'K G K Jayawardhana',
    dueDate: '2026-09-20',
    priority: 'high',
    status: 'In Progress'
  };

  // Wrapper combining Router and Theme contexts
  const renderWithContext = (ui) => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          {ui}
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  // 1. TaskCard Unit Test
  it('renders task details correctly using queries', () => {
    renderWithContext(<TaskCard task={mockTask} />);

    expect(screen.getByRole('heading', { name: /Fix Navigation Bug/i })).toBeInTheDocument();
    expect(screen.getByText(/K G K Jayawardhana/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-09-20/i)).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
  });

  // 2. CSS Class Assertions
  it('applies completed container CSS class when task status is done', () => {
    const completedTask = {
      ...mockTask,
      status: 'Done'
    };

    const { container } = renderWithContext(<TaskCard task={completedTask} />);

    const cardElement = container.querySelector('.task-card');
    expect(cardElement).toHaveClass('task-card-done');
  });

});