import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('../services/api', () => ({
  authAPI: { getMe: vi.fn().mockRejectedValue(new Error('no token')) },
  brandAPI: { getBrands: vi.fn().mockResolvedValue({ brands: [] }) },
}));

import { AuthProvider, useAuth } from '../context/AuthContext';
import Toast from './Toast';

const ToastTrigger = ({ message, type }) => {
  const { showToast } = useAuth();
  React.useEffect(() => {
    if (message) showToast(message, type);
  }, []);
  return <Toast />;
};

const renderWithAuth = (message, type = 'success') =>
  render(
    <AuthProvider>
      <ToastTrigger message={message} type={type} />
    </AuthProvider>
  );

describe('Toast component (connected)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('displays a success toast message', async () => {
    renderWithAuth('Post saved successfully!', 'success');
    await screen.findByText('Post saved successfully!');
    expect(screen.getByText('Post saved successfully!')).toBeInTheDocument();
  });

  it('displays an error toast message', async () => {
    renderWithAuth('Something went wrong', 'error');
    await screen.findByText('Something went wrong');
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays an info toast message', async () => {
    renderWithAuth('Calendar loaded', 'info');
    await screen.findByText('Calendar loaded');
    expect(screen.getByText('Calendar loaded')).toBeInTheDocument();
  });

  it('renders nothing when no toast is triggered', async () => {
    const { container } = render(
      <AuthProvider>
        <Toast />
      </AuthProvider>
    );
    const outer = container.querySelector('.fixed');
    expect(outer).toBeNull();
  });
});
