import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/devices'),
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get('/tasks'),
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => apiClient.get('/templates'),
  });
};

export const useRecipients = (search?: string) => {
  return useQuery({
    queryKey: ['recipients', search],
    queryFn: () => apiClient.get(search ? `/recipients?search=${encodeURIComponent(search)}` : '/recipients'),
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch devices and task summary in parallel
      const [devices, summary] = await Promise.all([
        apiClient.get('/devices'),
        apiClient.get('/tasks/summary'),
      ]);
      
      const { stats, recentTasks } = summary;

      return {
        metrics: [
          { label: 'Sent Today', value: stats.total.toString(), variant: 'info' },
          { label: 'Delivered', value: stats.delivered.toString(), variant: 'success' },
          { label: 'Failed', value: stats.failed.toString(), variant: 'error' },
          { label: 'Pending', value: stats.pending.toString(), variant: 'warning' },
        ],
        devices,
        recentTasks,
      };
    },
  });
};
