import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarAPI, postAPI, brandAPI, authAPI } from '../services/api';

export const QUERY_KEYS = {
  calendars: ['calendars'],
  calendarById: (id) => ['calendars', id],
  calendarPosts: (id) => ['calendars', id, 'posts'],
  brands: ['brands'],
  me: ['auth', 'me'],
  jobStatus: (jobId) => ['jobs', jobId],
};

export function useCalendars() {
  return useQuery({
    queryKey: QUERY_KEYS.calendars,
    queryFn: async () => {
      const res = await calendarAPI.getCalendars();
      return res?.data?.calendars || res?.calendars || [];
    },
  });
}

export function useCalendarPosts(calendarId) {
  return useQuery({
    queryKey: QUERY_KEYS.calendarPosts(calendarId),
    queryFn: async () => {
      const res = await calendarAPI.getCalendarById(calendarId);
      return res?.data?.posts || res?.posts || [];
    },
    enabled: !!calendarId,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: async () => {
      const res = await brandAPI.getBrands();
      return res?.data?.brands || res?.brands || [];
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: async () => {
      const res = await authAPI.getMe();
      return res?.data?.user || res?.user || null;
    },
    retry: false,
  });
}

export function useGenerateCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => calendarAPI.generateCalendar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.calendars });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => postAPI.updatePost(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
    },
  });
}

export function useRegeneratePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customInstruction }) =>
      postAPI.regeneratePost(id, customInstruction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
    },
  });
}

export function useReschedulePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, timeSlot }) =>
      postAPI.reschedulePost(id, date, timeSlot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => postAPI.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
    },
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => brandAPI.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => brandAPI.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => brandAPI.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
    },
  });
}

export function usePublishLinkedIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => postAPI.publishLinkedIn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
    },
  });
}

export function useJobStatus(jobId, { enabled = false } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.jobStatus(jobId),
    queryFn: async () => {
      const res = await fetch(`/api/calendars/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('postwise_token')}`,
        },
      });
      if (!res.ok) throw new Error('Job not found');
      return res.json();
    },
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') return false;
      return 2000;
    },
  });
}
