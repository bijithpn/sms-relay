"use client";

import React from "react";
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

const alerts = [];

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Alerts"
        description="Stay notified about system health, compliance, and delivery issues."
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {alerts.length > 0 ? (
            alerts.map((alert: any) => (
              <Card
                key={alert.id}
                className={alert.status === "resolved" ? "opacity-60" : ""}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
                        alert.severity === "high"
                          ? "bg-rose-100 text-rose-600"
                          : alert.severity === "medium"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {alert.severity === "high" ? (
                        <ShieldAlert size={24} />
                      ) : (
                        <AlertTriangle size={24} />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {alert.title}
                          </h3>
                          <Badge
                            variant={
                              alert.severity === "high"
                                ? "error"
                                : alert.severity === "medium"
                                  ? "warning"
                                  : "info"
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                        {alert.description}
                      </p>
                      <div className="pt-4 flex items-center gap-3">
                        {alert.status === "unresolved" ? (
                          <>
                            <Button size="sm">{alert.action}</Button>
                            <Button variant="ghost" size="sm">
                              Dismiss
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase">
                            <CheckCircle2 size={14} />
                            Resolved
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:self-start">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No active alerts
              </h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                We will notify you here if there are any issues with your
                campaigns or system health.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
