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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // In a real app, this might be a single specialized endpoint
      // For now we could aggregate or fetch multiple
      const [devices, tasks] = await Promise.all([
        apiClient.get('/devices'),
        apiClient.get('/tasks'),
      ]);
      
      const sentToday = tasks.length; // Placeholder logic
      const delivered = tasks.filter(t => t.status === 'DELIVERED').length;
      const failed = tasks.filter(t => t.status === 'FAILED').length;
      const pending = tasks.filter(t => t.status === 'PENDING').length;

      return {
        metrics: [
          { label: 'Sent Today', value: sentToday.toString(), variant: 'info' },
          { label: 'Delivered', value: delivered.toString(), variant: 'success' },
          { label: 'Failed', value: failed.toString(), variant: 'error' },
          { label: 'Pending', value: pending.toString(), variant: 'warning' },
        ],
        devices,
        recentTasks: tasks.slice(0, 5),
      };
    },
  });
};
