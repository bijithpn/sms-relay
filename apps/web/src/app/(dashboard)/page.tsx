"use client";

import React from "react";
import { useDashboardStats } from "../../hooks/useApi";
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { DashboardCard } from "../../components/DashboardCard";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { DataTable } from "../../components/ui/DataTable";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mistral-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load dashboard data</h2>
        <p className="mt-2">Ensure the API is running and try again.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Recipient",
      accessor: (task: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-mistral-black">{task.recipient}</span>
          <span className="text-[10px] text-mistral-black/40 font-mono">
            {task.id.slice(0, 8)}
          </span>
        </div>
      ),
    },
    {
      header: "Message",
      accessor: (task: any) => (
        <p className="max-w-xs truncate text-mistral-black/60 italic">
          "{task.message}"
        </p>
      ),
    },
    {
      header: "Device",
      accessor: (task: any) =>
        task.device ? (
          <Badge variant="outline" className="text-[10px] gap-1">
            <Smartphone size={10} /> {task.device.phoneNumber || "Node"}
          </Badge>
        ) : (
          <span className="text-mistral-black/40 text-xs">-</span>
        ),
    },
    {
      header: "Status",
      accessor: (task: any) => {
        const variants: any = {
          PENDING: "warning",
          SENT: "info",
          DELIVERED: "success",
          FAILED: "error",
        };
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant={variants[task.status] || "default"}
              className="text-[10px] font-bold w-fit"
            >
              {task.status}
            </Badge>
            {task.status === 'FAILED' && task.failureReason && (
              <span className="text-[9px] text-rose-500 font-medium max-w-[100px] truncate leading-tight" title={task.failureReason}>
                {task.failureReason}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Time",
      accessor: (task: any) => (
        <span className="text-xs text-mistral-black/40">
          {new Date(task.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  const metricsIcons: any = {
    "Sent Today": Send,
    Delivered: CheckCircle2,
    Failed: XCircle,
    Pending: Clock,
  };

  return (
    <div className="flex flex-col h-full bg-warm-ivory">
      <PageHeader
        title="Network Overview"
        description="Monitor your SMS relay traffic and device connectivity in real-time."
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.metrics.map((metric: any, i: number) => (
            <DashboardCard
              key={i}
              label={metric.label}
              value={metric.value}
              icon={metricsIcons[metric.label] || Activity}
              variant={metric.variant as any}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="font-normal text-mistral-black flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Activity size={18} className="text-mistral-orange" />
                  Recent Activity
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={stats?.recentTasks || []}
                  emptyMessage="No recent tasks found."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-normal text-mistral-black flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Smartphone size={18} className="text-mistral-orange" />
                  Live Nodes
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.devices.length > 0 ? (
                    stats.devices.map((device: any) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-3 rounded-none border border-block-gold/30 bg-cream"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${device.status === "ONLINE" ? "bg-emerald-500 animate-pulse" : "bg-block-gold"}`}
                          />
                          <div className="flex flex-col">
                            <p className="text-xs font-normal text-mistral-black">
                              {device.phoneNumber || "Unknown"}
                            </p>
                            <p className="text-[10px] text-mistral-black/60 font-mono truncate max-w-[120px]">
                              {device.publicUrl}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            device.status === "ONLINE" ? "success" : "default"
                          }
                          className="text-[9px]"
                        >
                          {device.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-xs text-mistral-black/40 italic">
                      No nodes registered.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
