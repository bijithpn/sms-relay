'use client';

import React from 'react';
import { Plus, Send, RefreshCcw } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';
import { useTasks } from '../../../hooks/useApi';

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useTasks();

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
        title="Campaigns" 
        description="Monitor and manage your SMS test campaigns."
        actions={
          <Link href="/campaigns/new">
            <Button leftIcon={<Plus size={18} />}>
              Start Campaign
            </Button>
          </Link>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <Card>
          <CardContent className="p-0">
            <DataTable 
              data={campaigns || []}
              emptyMessage="No campaigns found. Start a new one to see it here."
              columns={[
                { header: 'Campaign Name', accessor: (item: any) => item.name || `Task ${item.id.slice(0,8)}`, className: 'font-bold text-slate-900' },
                { 
                  header: 'Sent', 
                  accessor: (item: any) => (
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-medium">{item.sent || 0}</span>
                      <span className="text-[10px] text-slate-500">{item.success || '0%'} delivered</span>
                    </div>
                  ) 
                },
                { 
                  header: 'Status', 
                  accessor: (item: any) => {
                    const variants: Record<string, any> = {
                      'COMPLETED': 'success',
                      'RUNNING': 'info',
                      'PAUSED': 'warning',
                      'PENDING': 'default',
                      'FAILED': 'error',
                    };
                    return (
                      <Badge variant={variants[item.status] || 'default'}>
                        {item.status}
                      </Badge>
                    );
                  } 
                },
                { header: 'Started At', accessor: (item: any) => new Date(item.createdAt).toLocaleString() },
                {
                  header: '',
                  accessor: (item: any) => (
                    <div className="flex items-center gap-2">
                      {item.status === 'RUNNING' ? (
                        <Button variant="outline" size="sm">Pause</Button>
                      ) : (
                        <Button variant="ghost" size="sm" iconOnly>
                          <RefreshCcw size={16} />
                        </Button>
                      )}
                    </div>
                  )
                }
              ]}
              onRowClick={(campaign) => console.log('Campaign clicked:', campaign.id)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
