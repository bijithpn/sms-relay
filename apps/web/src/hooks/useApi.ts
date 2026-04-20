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
      const secret = localStorage.getItem("admin_secret");
      if (!secret) {
        console.warn("No admin secret found, skipping SSE connection");
        setIsLoading(false);
        return;
      }

      eventSource = new EventSource(
        `/api/tasks/events?secret=${secret}`,
      );

      eventSource.onopen = () => {
        console.log("SSE Connection opened");
        setError(null);
      };

      eventSource.onmessage = async (event) => {
        try {
          if (!event.data) return;
          const summary = JSON.parse(event.data);
          
          // If the backend sent an error field, log it but don't crash
          if (summary.error) {
            console.warn("SSE received data error:", summary.error);
          }

          const devices = await apiClient.get("/devices").catch(() => []);

          const stats = summary?.stats || { total: 0, delivered: 0, failed: 0, pending: 0 };
          const recentTasks = summary?.recentTasks || [];

          setData({
            metrics: [
              {
                label: "Sent Today",
                value: (stats.total || 0).toString(),
                variant: "info",
              },
              {
                label: "Delivered",
                value: (stats.delivered || 0).toString(),
                variant: "success",
              },
              {
                label: "Failed",
                value: (stats.failed || 0).toString(),
                variant: "error",
              },
              {
                label: "Pending",
                value: (stats.pending || 0).toString(),
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
        const state = eventSource.readyState;
        
        // If readyState is OPEN (1) or CONNECTING (0), it's often transient
        if (state === 1) { // 1 is OPEN
          return;
        }

        if (state === 0) { // 0 is CONNECTING
          return;
        }

        console.warn(`SSE Connection Issue (State: ${state})`, err);
        
        if (state === 2) { // 2 is CLOSED
          console.error("SSE Connection was closed by the server");
          setError(new Error("Dashboard connection lost. Reconnecting..."));
          eventSource.close();
          
          setTimeout(() => {
            if (localStorage.getItem("admin_secret")) {
              connect();
            }
          }, 5000);
        }
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
