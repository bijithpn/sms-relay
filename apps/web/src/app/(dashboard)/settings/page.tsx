'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Bell, Save, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function SettingsPage() {
  const [userName, setUserName] = useState('Local User');
  const [timezone, setTimezone] = useState('UTC');
  const [region, setRegion] = useState('Global');
  const [preferences, setPreferences] = useState([
    { id: 'failure-alerts', label: 'Show high failure alerts', checked: true },
    { id: 'auto-refresh', label: 'Auto-refresh dashboard data', checked: true },
    { id: 'compact-view', label: 'Compact view mode', checked: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.region) setRegion(parsed.region);
        if (parsed.preferences) setPreferences(parsed.preferences);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    const settings = { userName, timezone, region, preferences };
    localStorage.setItem('app-settings', JSON.stringify(settings));
    
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const togglePreference = (id: string) => {
    setPreferences(prev => prev.map(p => 
      p.id === id ? { ...p, checked: !p.checked } : p
    ));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Settings" 
        description="Manage your profile and application preferences."
        actions={
          <Button 
            leftIcon={saved ? <CheckCircle size={18} /> : <Save size={18} />} 
            onClick={handleSave}
            disabled={isSaving}
            variant={saved ? "success" : "primary"}
          >
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
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
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="IST">IST (India Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                  >
                    <option value="Global">Global</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="Europe">Europe</option>
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
              {preferences.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                  <button 
                    onClick={() => togglePreference(item.id)}
                    className={`w-10 h-5 ${item.checked ? 'bg-blue-600' : 'bg-slate-300'} rounded-full relative transition-colors focus:outline-none`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.checked ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
