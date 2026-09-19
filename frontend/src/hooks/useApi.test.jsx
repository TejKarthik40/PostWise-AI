import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../services/api', () => ({
  calendarAPI: {
    getCalendars: vi.fn(),
    getCalendarById: vi.fn(),
    generateCalendar: vi.fn(),
  },
  postAPI: {
    updatePost: vi.fn(),
    regeneratePost: vi.fn(),
    reschedulePost: vi.fn(),
    deletePost: vi.fn(),
    createPost: vi.fn(),
    publishLinkedIn: vi.fn(),
  },
  brandAPI: {
    getBrands: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
  },
  authAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  },
}));

import { calendarAPI, brandAPI, postAPI } from '../services/api';
import {
  useCalendars,
  useCalendarPosts,
  useBrands,
  useGenerateCalendar,
  useDeletePost,
  QUERY_KEYS,
} from './useApi';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCalendars', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty array while loading', async () => {
    calendarAPI.getCalendars.mockResolvedValueOnce({ calendars: [] });
    const { result } = renderHook(() => useCalendars(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('resolves calendar list correctly', async () => {
    const mockCalendars = [
      { _id: 'cal1', title: 'October Campaign' },
      { _id: 'cal2', title: 'November Launch' },
    ];
    calendarAPI.getCalendars.mockResolvedValueOnce({ calendars: mockCalendars });
    const { result } = renderHook(() => useCalendars(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].title).toBe('October Campaign');
  });

  it('sets error state on API failure', async () => {
    calendarAPI.getCalendars.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useCalendars(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe('Network error');
  });
});

describe('useCalendarPosts', () => {
  it('is disabled when calendarId is falsy', () => {
    const { result } = renderHook(() => useCalendarPosts(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('fetches posts when calendarId is provided', async () => {
    const mockPosts = [
      { _id: 'p1', idea: 'Post One', platform: 'Instagram' },
    ];
    calendarAPI.getCalendarById.mockResolvedValueOnce({ posts: mockPosts });
    const { result } = renderHook(() => useCalendarPosts('cal1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].idea).toBe('Post One');
  });
});

describe('useBrands', () => {
  it('resolves brand list', async () => {
    const mockBrands = [{ _id: 'b1', name: 'EcoGlow', tone: 'Inspirational' }];
    brandAPI.getBrands.mockResolvedValueOnce({ brands: mockBrands });
    const { result } = renderHook(() => useBrands(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data[0].name).toBe('EcoGlow');
  });
});

describe('useGenerateCalendar', () => {
  it('calls generateCalendar with provided payload', async () => {
    const mockResponse = { calendar: { _id: 'cal3' }, posts: [] };
    calendarAPI.generateCalendar.mockResolvedValueOnce(mockResponse);
    calendarAPI.getCalendars.mockResolvedValue({ calendars: [] });

    const { result } = renderHook(() => useGenerateCalendar(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ brandId: 'b1', month: 'October 2026' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calendarAPI.generateCalendar).toHaveBeenCalledWith({
      brandId: 'b1',
      month: 'October 2026',
    });
  });
});

describe('useDeletePost', () => {
  it('calls deletePost with the correct post id', async () => {
    postAPI.deletePost.mockResolvedValueOnce({ message: 'Deleted' });
    calendarAPI.getCalendars.mockResolvedValue({ calendars: [] });

    const { result } = renderHook(() => useDeletePost(), {
      wrapper: createWrapper(),
    });
    result.current.mutate('post-id-123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(postAPI.deletePost).toHaveBeenCalledWith('post-id-123');
  });
});

describe('QUERY_KEYS', () => {
  it('generates deterministic keys', () => {
    expect(QUERY_KEYS.calendarPosts('abc')).toEqual(['calendars', 'abc', 'posts']);
    expect(QUERY_KEYS.jobStatus('job-1')).toEqual(['jobs', 'job-1']);
  });
});
