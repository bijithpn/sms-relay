import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useState, useEffect } from "react";

export const useDevices = () => {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => apiClient.get("/devices"),
  });
};

export const useTasks = (status?: string) => {
  return useQuery({
    queryKey: ["tasks", status],
    queryFn: () => apiClient.get(status ? `/tasks?status=${status}` : "/tasks"),
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => apiClient.get("/templates"),
  });
};

export const useRecipients = (search?: string) => {
  return useQuery({
    queryKey: ["recipients", search],
    queryFn: () =>
      apiClient.get(
        search
          ? `/recipients?search=${encodeURIComponent(search)}`
          : "/recipients",
      ),
  });
};

export const useDashboardStats = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = new EventSource("/api/tasks/events");

      eventSource.onmessage = async (event) => {
        try {
          const summary = JSON.parse(event.data);
          const devices = await apiClient.get("/devices").catch(() => []);

          const { stats, recentTasks } = summary;
          setData({
            metrics: [
              {
                label: "Sent Today",
                value: stats.total.toString(),
                variant: "info",
              },
              {
                label: "Delivered",
                value: stats.delivered.toString(),
                variant: "success",
              },
              {
                label: "Failed",
                value: stats.failed.toString(),
                variant: "error",
              },
              {
                label: "Pending",
                value: stats.pending.toString(),
                variant: "warning",
              },
            ],
            devices,
            recentTasks,
          });
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        setError(err);
        eventSource.close();
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { data, isLoading, error };
};
