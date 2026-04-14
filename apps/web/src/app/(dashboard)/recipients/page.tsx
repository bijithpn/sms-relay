'use client';

import React, { useState } from 'react';
import { Users, Plus, Upload, ShieldCheck, UserMinus, Search, Filter, Trash2 } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { useRecipients } from '../../../hooks/useApi';
import { apiClient } from '../../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function RecipientsPage() {
  const [search, setSearch] = useState('');
  const { data: recipients, isLoading } = useRecipients(search);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91');
  const queryClient = useQueryClient();

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    try {
      await apiClient.post('/recipients', { name: newName, phoneNumber: newPhone });
      setNewName('');
      setNewPhone('+91');
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return;
    try {
      await apiClient.delete(`/recipients/${id}`);
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Recipients" 
        description="Manage your test phone numbers and contact lists."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Upload size={18} />}>Import CSV</Button>
            <Button onClick={() => setIsAdding(!isAdding)} leftIcon={<Plus size={18} />}>
              {isAdding ? 'Cancel' : 'Add Recipient'}
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        {isAdding && (
          <Card className="bg-white border-blue-200 shadow-md">
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900">Add New Recipient</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRecipient} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+919876543210" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">Save Recipient</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  data={recipients || []}
                  isLoading={isLoading}
                  emptyMessage="No recipients found. Add one to get started."
                  columns={[
                    { 
                      header: 'Name', 
                      accessor: 'name',
                      className: 'font-bold text-slate-900'
                    },
                    { 
                      header: 'Phone Number', 
                      accessor: 'phoneNumber',
                      className: 'font-mono text-sm text-slate-600'
                    },
                    { 
                      header: 'Added On', 
                      accessor: (item: any) => new Date(item.createdAt).toLocaleDateString()
                    },
                    {
                      header: '',
                      accessor: (item: any) => (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </Button>
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
                <h3 className="font-bold text-sm uppercase tracking-wider">Recipient Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs font-bold uppercase">Total Contacts</span>
                  <span className="text-xl font-bold">{recipients?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-blue-900">Recipient Management</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Saved recipients can be quickly selected when sending test SMS or creating campaigns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
