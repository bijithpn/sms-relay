'use client';

import React from 'react';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';

const templates = [];

export default function TemplatesPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Templates" 
        description="Create and manage your pre-approved SMS message templates."
        actions={
          <Button leftIcon={<Plus size={18} />}>Create Template</Button>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>Filters</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable 
              data={templates}
              emptyMessage="No templates found. Create one to get started."
              columns={[
                { 
                  header: 'Template Name', 
                  accessor: (item: any) => (
                    <span className="font-bold text-slate-900">{item.name}</span>
                  ) 
                },
                { 
                  header: 'Type', 
                  accessor: (item: any) => (
                    <Badge variant={item.type === 'Alert' ? 'warning' : 'info'}>
                      {item.type}
                    </Badge>
                  ) 
                },
                { 
                  header: 'Message Body', 
                  accessor: (item: any) => (
                    <div className="max-w-md truncate text-slate-500 italic">
                      "{item.body}"
                    </div>
                  ) 
                },
                { 
                  header: 'Status', 
                  accessor: (item: any) => (
                    <Badge variant={item.status === 'Approved' ? 'success' : 'default'}>
                      {item.status}
                    </Badge>
                  ) 
                },
                {
                  header: '',
                  accessor: () => (
                    <Button variant="ghost" size="sm">Edit</Button>
                  )
                }
              ]}
              onRowClick={(template) => console.log('Template clicked:', template.name)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
