"use client";

import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

type HealthResponse = {
  api: string;
  database: string;
  tablesReady: boolean;
  missingTables: string[];
  message: string;
};

export function SystemStatusBanner() {
  const { data, error, isLoading, refetch } = useQuery<HealthResponse>({
    queryKey: ["system-health"],
    queryFn: () => apiClient.get("/system/health"),
    refetchInterval: 15000,
    retry: false,
  });

  if (data?.database === "connected" && data.tablesReady) {
    return null;
  }

  const message =
    error instanceof Error
      ? error.message
      : data?.message || "Checking API and database connection...";

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {isLoading ? (
            <RefreshCw size={18} className="mt-0.5 shrink-0 animate-spin" />
          ) : data?.database === "connected" ? (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-bold">Setup check</p>
            <p className="text-xs leading-relaxed">{message}</p>
            {data?.missingTables?.length ? (
              <p className="text-xs">
                Missing tables: {data.missingTables.join(", ")}
              </p>
            ) : null}
            <p className="text-xs font-mono">Run: pnpm easy</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="w-fit rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
        >
          Recheck
        </button>
      </div>
    </div>
  );
}
