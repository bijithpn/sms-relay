'use client';

import React, { useState } from 'react';
import { Plus, Send, RefreshCcw, Filter } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';
import { useTasks } from '../../../hooks/useApi';

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: tasks, isLoading, refetch } = useTasks(statusFilter || undefined);

  if (isLoading && !tasks) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="SMS History" 
        description="Monitor your SMS delivery logs, history, and status."
        actions={
          <Link href="/campaigns/new">
            <Button leftIcon={<Plus size={18} />}>
              Send SMS
            </Button>
          </Link>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
            <h2 className="text-lg font-bold text-slate-800">Message Logs</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <Filter size={14} className="text-slate-500" />
                <select 
                  className="bg-transparent text-sm border-none outline-none focus:ring-0 text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="SENT">Sent</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <Button variant="ghost" size="sm" iconOnly onClick={() => refetch()}>
                <RefreshCcw size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
              data={tasks || []}
              emptyMessage="No SMS tasks found matching the given filters."
              columns={[
                { 
                  header: 'Recipient', 
                  accessor: (item: any) => (
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.recipient}</span>
                      <span className="text-[10px] text-slate-400">ID: {item.id.slice(0,8)}</span>
                    </div>
                  ) 
                },
                { 
                  header: 'Message', 
                  accessor: (item: any) => (
                    <p className="max-w-[200px] sm:max-w-xs md:max-w-md truncate text-slate-600 text-sm">
                      {item.message}
                    </p>
                  ) 
                },
                { 
                  header: 'Gateway Node', 
                  accessor: (item: any) => item.device?.phoneNumber || 'Unassigned',
                },
                { 
                  header: 'Status', 
                  accessor: (item: any) => {
                    const variants: Record<string, any> = {
                      'DELIVERED': 'success',
                      'SENT': 'info',
                      'PENDING': 'warning',
                      'FAILED': 'error',
                    };
                    return (
                      <Badge variant={variants[item.status] || 'default'}>
                        {item.status}
                      </Badge>
                    );
                  } 
                },
                { header: 'Time', accessor: (item: any) => new Date(item.createdAt).toLocaleString() }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
