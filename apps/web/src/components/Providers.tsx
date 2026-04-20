"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress Swagger UI lifecycle warnings globally in React 19 Strict Mode
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const msg = args[0]?.toString() || "";
      if (
        ((msg.includes("UNSAFE_componentWillReceiveProps") || msg.includes("UNSAFE_componentWillMount")) &&
        (msg.includes("ModelCollapse") || msg.includes("SwaggerUI") || msg.includes("operation"))) ||
        (msg.includes("SSE Error (ReadyState: 1)"))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
