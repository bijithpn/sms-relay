'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Copy,
  Info,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Wifi,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/api';
import { useRecipients } from '../../hooks/useApi';

type NodeStatus = 'IDLE' | 'ONLINE' | 'HANDOFF' | 'ERROR';
type LogType = 'info' | 'success' | 'error';

type SmsTask = {
  id: string;
  recipient: string;
  message: string;
  status: string;
};

export default function WebNodePage() {
  const [status, setStatus] = useState<NodeStatus>('IDLE');
  const [logs, setLogs] = useState<{ time: string; msg: string; type: LogType }[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pendingTask, setPendingTask] = useState<SmsTask | null>(null);
  const [testNumber, setTestNumber] = useState('+91');
  const [isSending, setIsSending] = useState(false);
  const lastTaskId = useRef<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { data: recipients } = useRecipients();

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '...';
  const nodeUrl = typeof window !== 'undefined' ? window.location.href : '';

  const statusTone = useMemo(() => {
    if (status === 'ONLINE') return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
    if (status === 'HANDOFF') return 'bg-blue-500/10 text-blue-700 border-blue-200';
    if (status === 'ERROR') return 'bg-rose-500/10 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }, [status]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!isActive) return;

    fetchPendingTask();
    const interval = window.setInterval(fetchPendingTask, 5000);
    return () => window.clearInterval(interval);
  }, [isActive]);

  const addLog = (msg: string, type: LogType = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        msg,
        type,
      },
    ].slice(-50));
  };

  useEffect(() => {
    // Catch global errors to alert on mobile for debugging
    const handleError = (event: ErrorEvent) => {
      console.error('Global Error Captured:', event.error);
      alert('Global Error: ' + (event.error?.message || event.message));
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const activateNode = () => {
    try {
      console.log('Start Node clicked');
      alert('Node Activation Initiated');
      setIsActive(true);
      setStatus('ONLINE');
      addLog('System: Node activation requested.', 'info');
      addLog('System: Connecting to relay API...', 'info');
      addLog('Node is online and checking for queued SMS tasks.', 'success');
      addLog('Keep this tab open. Android will ask you to confirm each SMS before sending.', 'info');
      
      // Immediate first fetch
      fetchPendingTask().catch(err => {
        console.error('Initial fetch failed:', err);
        addLog(`Error: ${err.message}`, 'error');
        alert('Fetch Failed: ' + err.message);
      });
    } catch (err: any) {
      console.error('Activation error:', err);
      alert('Activation Error: ' + err.message);
    }
  };

  const fetchPendingTask = async () => {
    if (isPolling || status === 'HANDOFF') return;
    setIsPolling(true);

    try {
      console.log('Polling for tasks...');
      const tasks = await apiClient.get('/tasks/pending');
      console.log('Tasks received:', tasks);
      const nextTask = (Array.isArray(tasks) ? tasks[0] : null) as SmsTask | undefined;

      if (!nextTask) {
        setPendingTask(null);
        setStatus('ONLINE');
        return;
      }

      setPendingTask(nextTask);
      if (lastTaskId.current !== nextTask.id) {
        lastTaskId.current = nextTask.id;
        addLog(`Queued task found for ${nextTask.recipient}. Opening SMS composer.`, 'info');
        await openSmsComposer(nextTask);
      }
    } catch (e: any) {
      console.error('Fetch error:', e);
      setStatus('ERROR');
      addLog(e.message || 'Could not reach the relay API.', 'error');
    } finally {
      setIsPolling(false);
    }
  };

  const openSmsComposer = async (task: SmsTask) => {
    setStatus('HANDOFF');

    try {
      await apiClient.patch(`/tasks/${task.id}`, { status: 'SENT' });
      addLog(`Task ${task.id.slice(0, 8)} handed to Android SMS app. Tap Send to finish.`, 'success');
      window.location.href = `sms:${task.recipient}?body=${encodeURIComponent(task.message)}`;
    } catch (e: any) {
      setStatus('ERROR');
      addLog(e.message || 'Failed to update task before opening SMS composer.', 'error');
    }
  };

  const handleTestSms = () => {
    if (!testNumber) return;
    setIsSending(true);
    addLog(`Opening local SMS composer for ${testNumber}.`, 'info');

    window.setTimeout(() => {
      window.location.href = `sms:${testNumber}?body=${encodeURIComponent('Hello from SMS Relay. Your mobile node link is working.')}`;
      setIsSending(false);
    }, 300);
  };

  const handleSelectRecipient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const recipient = recipients?.find((r: any) => r.id === e.target.value);
    if (recipient) {
      setTestNumber(recipient.phoneNumber);
    }
  };

  const copyNodeUrl = async () => {
    if (!nodeUrl) return;
    await navigator.clipboard.writeText(nodeUrl);
    addLog('Node URL copied to clipboard.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20 flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-950 uppercase">Mobile Relay Node</h1>
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Lock size={10} /> {hostname}
            </p>
          </div>
        </div>
        <Badge className={statusTone}>{status}</Badge>
      </header>

      <main className="flex-1 p-4 space-y-5 max-w-md mx-auto w-full">
        <section className="rounded-xl bg-blue-600 text-white p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Smartphone size={22} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Keep this phone ready</h2>
              <p className="text-sm text-blue-50 leading-relaxed">
                This page checks for queued SMS tasks and opens Android's SMS app. You still need to tap Send in the composer.
              </p>
            </div>
          </div>

          <Button
            onClick={activateNode}
            disabled={isActive}
            className="w-full bg-white text-blue-700 hover:bg-blue-50 border-transparent py-4"
            leftIcon={isActive ? <CheckCircle2 size={18} /> : <Zap size={18} />}
          >
            {isActive ? 'Node Active' : 'Start Node'}
          </Button>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col items-center gap-1">
            <Wifi size={20} className="text-blue-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Queue Check</span>
            <span className="text-xs font-bold text-slate-900">{isActive ? 'Every 5 sec' : 'Paused'}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col items-center gap-1">
            <Activity size={20} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Next Task</span>
            <span className="text-xs font-bold text-slate-900">{pendingTask ? pendingTask.recipient : 'None'}</span>
          </div>
        </div>

        {pendingTask && (
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send size={15} className="text-blue-500" />
                Pending SMS
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-500">Recipient</div>
              <div className="font-mono text-sm text-slate-900">{pendingTask.recipient}</div>
              <div className="text-xs text-slate-500">Message</div>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">{pendingTask.message}</p>
              <Button className="w-full" onClick={() => openSmsComposer(pendingTask)} leftIcon={<Send size={16} />}>
                Open SMS Composer
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="text-blue-500" />
              Activity
            </h3>
            <button onClick={copyNodeUrl} className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
              <Copy size={11} /> Copy Link
            </button>
          </div>
          <div className="bg-slate-950 rounded-lg border border-slate-900 p-4 font-mono text-[11px] h-44 overflow-y-auto space-y-2 scroll-smooth">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-slate-500 shrink-0">{log.time}</span>
                  <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-slate-300'}>
                    {log.msg}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 italic">Tap Start Node to begin.</div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send size={15} className="text-blue-500" />
              Local SMS Test
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient</label>
                {recipients && recipients.length > 0 && (
                  <select 
                    onChange={handleSelectRecipient}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 border-none rounded px-2 py-1 outline-none"
                  >
                    <option value="">Select Saved</option>
                    {recipients.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <Button onClick={handleTestSms} disabled={isSending || !testNumber} variant="outline" className="w-full">
              {isSending ? 'Opening...' : 'Open Test SMS'}
            </Button>
          </CardContent>
        </Card>

        <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Info size={16} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">What to do next</h4>
          </div>
          <ul className="text-[11px] text-slate-600 space-y-3">
            <li className="flex gap-2">
              <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Leave this tab open after tapping Start Node.</span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={12} className="text-blue-500 shrink-0 mt-0.5" />
              <span>When a task arrives, Android opens your SMS app with the recipient and message filled in.</span>
            </li>
            <li className="flex gap-2">
              <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <span>Android requires you to confirm the final send. Fully silent SMS sending needs the native mobile app.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
