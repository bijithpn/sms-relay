'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Signal, 
  ShieldCheck, 
  Send, 
  Activity, 
  Info, 
  AlertCircle,
  Wifi,
  Lock,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function WebNodePage() {
  const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'ONLINE'>('CONNECTING');
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  const [permissions, setPermissions] = useState<{ sms: boolean }>({ sms: false });
  const [testNumber, setTestNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate connection to the relay server
    const timer = setTimeout(() => {
      setStatus('ONLINE');
      addLog('Secure connection established with relay', 'success');
      addLog('Waiting for SMS tasks...', 'info');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      msg,
      type
    }].slice(-50));
  };

  const requestPermissions = async () => {
    setIsSending(true);
    addLog('Requesting SMS permissions from browser...', 'info');
    
    // Simulate permission request
    setTimeout(() => {
      setPermissions({ sms: true });
      addLog('SMS Access Granted', 'success');
      addLog('Device registered as active routing node', 'success');
      setIsSending(false);
    }, 1500);
  };

  const handleTestSms = () => {
    if (!testNumber) return;
    setIsSending(true);
    addLog(`Initiating test SMS to ${testNumber}...`, 'info');
    
    setTimeout(() => {
      addLog(`SMS successfully handed off to system dialer`, 'success');
      addLog(`Verification required: Check your phone's default SMS app`, 'info');
      setIsSending(false);
      
      // In a real Web-to-SMS flow, we would trigger an 'sms:' href or use WebSMS API
      window.location.href = `sms:${testNumber}?body=Hello from SMS Relay! Your mobile node is connected and working.`;
    }, 1000);
  };

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '...';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500'}`} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">Mobile Relay Node</h1>
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Lock size={10} /> {hostname}
            </p>
          </div>
        </div>
        <Badge className={status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
          {status}
        </Badge>
      </header>

      <main className="flex-1 p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Permission Call to Action */}
        {!permissions.sms ? (
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-xl shadow-blue-900/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4">
              <ShieldCheck size={120} className="text-white" />
            </div>
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap size={20} className="text-amber-300 fill-amber-300" />
                  Activate Node
                </h2>
                <p className="text-sm text-blue-50 opacity-90 leading-relaxed">
                  To turn this phone into a testing node, you need to grant SMS permissions to the browser.
                </p>
              </div>
              <Button 
                onClick={requestPermissions}
                disabled={isSending}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 text-base rounded-xl border-none shadow-lg transition-transform active:scale-95"
              >
                {isSending ? <RefreshCw className="animate-spin mr-2" size={18} /> : "Enable SMS Access"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
              <Wifi size={20} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Signal</span>
              <span className="text-xs font-bold text-white">Strong</span>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
              <Activity size={20} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Load</span>
              <span className="text-xs font-bold text-white">0%</span>
            </div>
          </div>
        )}

        {/* Real-time Console */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="text-blue-500" />
              System Activity
            </h3>
            <span className="text-[9px] text-slate-600 font-mono">v1.0.4-stable</span>
          </div>
          <div className="bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[11px] h-48 overflow-y-auto space-y-2 scroll-smooth">
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-left-1 duration-300">
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400' : 
                  log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                }>
                  {log.msg}
                </span>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-slate-700 italic">Initializing console...</div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Test Tool - Only visible after permissions */}
        {permissions.sms && (
          <Card className="bg-slate-900/30 border-white/5">
            <CardHeader className="pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Send size={14} className="text-blue-500" />
                Connection Tester
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
              </div>
              <Button 
                onClick={handleTestSms}
                disabled={isSending || !testNumber}
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5 text-slate-300 text-xs py-5"
              >
                {isSending ? "Processing..." : "Send Test SMS"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10 space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Info size={16} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">How it works</h4>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-3">
            <li className="flex gap-2">
              <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Keep this tab **open and visible** in your phone's browser for active routing.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
              <span>When the relay server sends a task, your browser will trigger the native SMS app.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Check your **Default SMS app** to confirm messages were sent.</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-[10px] text-slate-600 font-medium">Relay Node Powered by SMS-RELAY Infrastructure</p>
      </footer>
    </div>
  );
}
