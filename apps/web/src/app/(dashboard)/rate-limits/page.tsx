'use client';

import React, { useState } from 'react';
import { Activity, ShieldAlert, Save, RotateCcw, Info } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { WarningBanner } from '../../../components/ui/WarningBanner';

export default function RateLimitsPage() {
  const [limits, setLimits] = useState({
    perMinute: 6,
    perHour: 300,
    perDay: 5000,
    delay: 10,
    burst: 5,
    cooldown: 300
  });

  const getRiskLevel = () => {
    if (limits.perMinute <= 6) return 'low';
    if (limits.perMinute <= 12) return 'medium';
    return 'high';
  };

  const risk = getRiskLevel();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Rate Limit Settings" 
        description="Configure SMS velocity and safety thresholds."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<RotateCcw size={18} />}>Reset Defaults</Button>
            <Button leftIcon={<Save size={18} />}>Save Changes</Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" />
                  Global Rate Limits
                </h2>
                <Badge variant={risk === 'low' ? 'risk-low' : risk === 'medium' ? 'risk-medium' : 'risk-high'}>
                  {risk.toUpperCase()} RISK
                </Badge>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold text-slate-700">SMS per Minute</label>
                        <span className="text-sm font-bold text-blue-600">{limits.perMinute}</span>
                      </div>
                      <input 
                        type="range" min="1" max="60" value={limits.perMinute}
                        onChange={(e) => setLimits({...limits, perMinute: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Safe (1-6)</span>
                        <span>Risky (12+)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold text-slate-700">Delay between messages (s)</label>
                        <span className="text-sm font-bold text-blue-600">{limits.delay}s</span>
                      </div>
                      <input 
                        type="range" min="1" max="60" value={limits.delay}
                        onChange={(e) => setLimits({...limits, delay: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">SMS per Hour</label>
                      <input 
                        type="number" value={limits.perHour}
                        onChange={(e) => setLimits({...limits, perHour: parseInt(e.target.value)})}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">SMS per Day</label>
                      <input 
                        type="number" value={limits.perDay}
                        onChange={(e) => setLimits({...limits, perDay: parseInt(e.target.value)})}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Burst Limit</label>
                    <p className="text-xs text-slate-500 mb-2">Max messages sent in immediate succession.</p>
                    <input 
                      type="number" value={limits.burst}
                      onChange={(e) => setLimits({...limits, burst: parseInt(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Cooldown Duration (s)</label>
                    <p className="text-xs text-slate-500 mb-2">Pause duration after reaching burst limit or failures.</p>
                    <input 
                      type="number" value={limits.cooldown}
                      onChange={(e) => setLimits({...limits, cooldown: parseInt(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <WarningBanner 
              variant={risk === 'high' ? 'error' : risk === 'medium' ? 'warning' : 'info'}
              title={risk === 'high' ? 'HIGH RISK DETECTED' : 'Rate Limit Advisory'}
              message={
                risk === 'high' 
                  ? "Current settings are highly likely to trigger carrier spam filters. SIM blocking is imminent at this velocity. Proceed with extreme caution."
                  : "High SMS volume can trigger carrier spam detection and may block your SIM, sender ID, or gateway account. Use only with authorized test numbers."
              }
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900">Recommended Safe Values</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <ul className="text-xs text-emerald-800 space-y-2 list-disc pl-4">
                    <li>1 SMS every 5-10 seconds per SIM</li>
                    <li>6-12 SMS per minute per SIM max</li>
                    <li>Daily cap should reflect verified traffic</li>
                    <li>Auto-pause enabled after high failure rate</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900">Auto-Pause Triggers</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">On carrier rejection (3x)</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">On failure rate &gt; 15%</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
