import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('../services/api', () => ({
  authAPI: { getMe: vi.fn(), login: vi.fn(), register: vi.fn() },
  brandAPI: { getBrands: vi.fn() },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

import { authAPI, brandAPI } from '../services/api';
import { AuthProvider, useAuth } from './AuthContext';

const LoginConsumer = () => {
  const { login, user } = useAuth();
  const handleLogin = () => login('test@example.com', 'pass123');
  return (
    <div>
      <button onClick={handleLogin} data-testid="login-btn">Login</button>
      {user && <span data-testid="user-name">{user.name}</span>}
    </div>
  );
};

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authAPI.getMe.mockRejectedValue({ response: { status: 401 } });
    brandAPI.getBrands.mockResolvedValue({ brands: [] });
  });

  it('renders without crashing with no authenticated user', async () => {
    const NoUser = () => {
      const { user } = useAuth();
      return <div data-testid="user">{user ? 'logged-in' : 'no-user'}</div>;
    };
    render(<NoUser />, { wrapper });
    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('no-user')
    );
  });

  it('calls authAPI.login with correct credentials', async () => {
    authAPI.login.mockResolvedValueOnce({
      token: 'tok123',
      user: { _id: 'u1', name: 'Alex', email: 'test@example.com' },
    });
    brandAPI.getBrands.mockResolvedValue({ brands: [] });

    render(<LoginConsumer />, { wrapper });
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass123',
      });
    });
  });

  it('showToast exposes a toast message', async () => {
    const ToastTrigger = () => {
      const { showToast, toast } = useAuth();
      return (
        <div>
          <button onClick={() => showToast('Hello world', 'success')} data-testid="trigger">
            Trigger
          </button>
          {toast && <div data-testid="toast-msg">{toast.message}</div>}
        </div>
      );
    };

    render(<ToastTrigger />, { wrapper });
    fireEvent.click(screen.getByTestId('trigger'));
    await waitFor(() =>
      expect(screen.getByTestId('toast-msg').textContent).toBe('Hello world')
    );
  });

  it('logout clears token from localStorage', async () => {
    localStorage.setItem('postwise_token', 'existing-token');
    authAPI.getMe.mockResolvedValueOnce({ user: { _id: 'u1', name: 'Alex' } });
    brandAPI.getBrands.mockResolvedValue({ brands: [] });

    const LogoutConsumer = () => {
      const { logout } = useAuth();
      return <button onClick={logout} data-testid="logout-btn">Logout</button>;
    };

    render(<LogoutConsumer />, { wrapper });
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(localStorage.getItem('postwise_token')).toBeNull();
  });
});
