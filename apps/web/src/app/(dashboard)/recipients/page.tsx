'use client';

import React from 'react';
import { Users, Plus, Upload, ShieldCheck, UserMinus, Search, Filter } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';

const recipients = [];

export default function RecipientsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Recipients" 
        description="Manage your test phone numbers and suppression lists."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Upload size={18} />}>Import CSV</Button>
            <Button leftIcon={<Plus size={18} />}>Add Recipient</Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search recipients..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>Filters</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <DataTable 
                  data={recipients}
                  emptyMessage="No recipients found. Add one to get started."
                  columns={[
                    { 
                      header: 'Phone Number', 
                      accessor: (item: any) => (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{item.number}</span>
                          <span className="text-[10px] text-slate-500">{item.name}</span>
                        </div>
                      ) 
                    },
                    { 
                      header: 'Status', 
                      accessor: (item: any) => {
                        const variant: any = item.status === 'Verified' ? 'success' : item.status === 'Suppressed' ? 'error' : 'info';
                        return <Badge variant={variant}>{item.status}</Badge>;
                      } 
                    },
                    { 
                      header: 'Consent', 
                      accessor: (item: any) => (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          {item.consent === 'Opted-in' ? <ShieldCheck size={14} className="text-emerald-500" /> : <UserMinus size={14} className="text-rose-500" />}
                          {item.consent}
                        </div>
                      ) 
                    },
                    { header: 'Region', accessor: 'region' },
                    { header: 'Last SMS', accessor: 'lastSent' },
                    {
                      header: '',
                      accessor: () => (
                        <Button variant="ghost" size="sm">Edit</Button>
                      )
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-none shadow-xl">
              <CardHeader>
                <h3 className="font-bold text-sm uppercase tracking-wider">Suppression Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs font-bold uppercase">Opted-Out</span>
                  <span className="text-xl font-bold">0</span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs font-bold uppercase">Failed Rep.</span>
                  <span className="text-xl font-bold text-rose-400">0</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 text-xs font-bold uppercase">Manually Blocked</span>
                  <span className="text-xl font-bold">0</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-blue-900">Safety Tip</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Regularly clean your recipient lists to remove numbers that fail repeatedly. High failure rates can trigger carrier blocking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
