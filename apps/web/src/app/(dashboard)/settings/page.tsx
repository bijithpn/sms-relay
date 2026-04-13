'use client';

import React from 'react';
import { Globe, Bell, Save } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Settings" 
        description="Manage your profile and application preferences."
        actions={
          <Button leftIcon={<Save size={18} />}>Save Changes</Button>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Globe size={18} className="text-blue-500" />
              <h3 className="font-bold text-slate-900">General Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Name</label>
                <input type="text" defaultValue="Local User" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>IST (India Standard Time)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Region</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm">
                    <option>Global</option>
                    <option>India</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell size={18} className="text-blue-500" />
              <h3 className="font-bold text-slate-900">App Preferences</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Show high failure alerts', checked: true },
                { label: 'Auto-refresh dashboard data', checked: true },
                { label: 'Compact view mode', checked: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                  <div className={`w-10 h-5 ${item.checked ? 'bg-blue-600' : 'bg-slate-300'} rounded-full relative transition-colors`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.checked ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
