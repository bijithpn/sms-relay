'use client';

import React from 'react';
import { Smartphone, Link as LinkIcon, ShieldCheck, Zap, ArrowRight, SmartphoneNfc } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export default function ConnectPhonePage() {
  const WEB_NODE_URL = "http://localhost:3000/node"; // This would be the mobile-optimized route

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Connect Phone" 
        description="Turn any Android phone into an SMS sending node via a simple web URL."
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-blue-600 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Smartphone size={120} />
              </div>
              <CardContent className="p-8 space-y-4">
                <Badge className="bg-blue-500 text-white border-blue-400">PWA Node</Badge>
                <h2 className="text-2xl font-bold leading-tight">No App Install Required</h2>
                <p className="opacity-90 text-sm leading-relaxed">
                  Our Web Node technology allows you to use your phone's native SIM capabilities directly from the browser. Simply open the URL, grant SMS permissions, and start routing.
                </p>
                <div className="pt-4">
                  <Button className="bg-white text-blue-600 hover:bg-slate-100 border-none font-bold">
                    View Connection URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" />
                  Connection Steps
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600 text-sm">1</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900">Open URL on Phone</h4>
                    <p className="text-xs text-slate-500">Scan the QR code or type the local connection URL in Chrome/Edge on your Android device.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600 text-sm">2</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900">Grant Permissions</h4>
                    <p className="text-xs text-slate-500">The browser will request access to 'Send and View SMS messages'. Click 'Allow' to enable routing.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600 text-sm">3</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900">Keep Tab Open</h4>
                    <p className="text-xs text-slate-500">For best performance, add to home screen and ensure the tab remains active in the foreground.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-dashed border-slate-200">
              <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                {/* QR Code Placeholder */}
                <div className="space-y-2">
                  <SmartphoneNfc size={48} className="text-slate-300 mx-auto" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scan to Connect</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">Local Connection Link</p>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  <code className="text-xs font-mono text-blue-600 truncate max-w-[200px]">{WEB_NODE_URL}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <LinkIcon size={12} />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 italic">Ensure your phone is on the same Wi-Fi as this machine.</p>
              </div>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Browser Support</h3>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Web-to-SMS routing works on <strong>Android Chrome v85+</strong> and <strong>Edge Mobile</strong>. iOS Safari does not support programmatic SMS sending.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
