'use client';

import React from 'react';
import { useDashboardStats } from '../../hooks/useApi';
import { Send, CheckCircle2, XCircle, Clock, Activity, DollarSign, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { DashboardCard } from '../../components/DashboardCard';
import { WarningBanner } from '../../components/ui/WarningBanner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

export default function Dashboard() {
  const { data, isLoading } = useDashboardStats();

  const metrics = data?.metrics || [
    { label: 'Sent Today', value: '0', icon: Send, trend: null, variant: 'info' },
    { label: 'Delivered', value: '0', icon: CheckCircle2, description: '0% success rate', variant: 'success' },
    { label: 'Failed', value: '0', icon: XCircle, trend: null, variant: 'error' },
    { label: 'Pending', value: '0', icon: Clock, variant: 'warning' },
  ];

  const systemHealth = [
    { label: 'Active Devices', value: data?.devices?.length || '0', icon: Activity, description: 'Local nodes', variant: 'success' },
    { label: 'Est. Cost Today', value: '$0.00', icon: DollarSign, description: 'No activity', variant: 'info' },
    { label: 'Alerts', value: '0', icon: AlertTriangle, description: 'System healthy', variant: 'success' },
  ];

  const alerts = [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Dashboard" 
        description="Monitor your local SMS testing campaigns."
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        {/* Urgent Warnings */}
        <WarningBanner 
          variant="warning"
          title="Security Reminder"
          message="Use this platform only for authorized SMS testing. High SMS volume can trigger carrier spam detection and may block your local SIM."
        />

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <DashboardCard key={i} {...metric as any} icon={metric.icon || [Send, CheckCircle2, XCircle, Clock][i]} />
          ))}
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((metric, i) => (
            <DashboardCard key={i} {...metric as any} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Alerts Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Alerts</h2>
              <Badge variant="default">0 New</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                data={alerts}
                emptyMessage="No active alerts"
                columns={[
                  { header: 'Alert', accessor: 'message', className: 'max-w-[200px] truncate' },
                  { header: 'Time', accessor: 'time' },
                  { 
                    header: 'Status', 
                    accessor: (item: any) => (
                      <Badge variant={item.status === 'Active' ? 'error' : 'success'}>
                        {item.status}
                      </Badge>
                    ) 
                  },
                ]}
              />
            </CardContent>
          </Card>

          {/* Quick Stats Chart Placeholder */}
          <Card className="flex flex-col justify-center items-center p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Activity size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Traffic Overview</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Delivery performance and throughput analytics will appear here as you run campaigns.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
