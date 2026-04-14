'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Smartphone, 
  Zap, 
  SmartphoneNfc, 
  Send, 
  Wifi, 
  Globe, 
  Cloud,
  Copy,
  CheckCircle2,
  Save,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import QRCode from 'react-qr-code';
import { useTemplates, useRecipients } from '../../../hooks/useApi';
import { apiClient } from '../../../lib/api';

export default function ConnectPhonePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'ngrok' | 'cloudflare'>('local');
  const [manualUrl, setManualUrl] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testSmsNumber, setTestSmsNumber] = useState("+91");
  const [testSmsMessage, setTestSmsMessage] = useState("Hello from SMS Relay! Your mobile node is correctly configured.");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [testSmsError, setTestSmsError] = useState("");
  const [testSmsSuccess, setTestSmsSuccess] = useState(false);
  
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const { data: templates } = useTemplates();
  const { data: recipients } = useRecipients();

  const tunnelInfo = {
    local: {
      title: "Local Network",
      icon: <Wifi size={16} />,
      command: "ipconfig",
      steps: [
        "Open terminal and run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux).",
        "Find your IPv4 Address (e.g. 192.168.1.5).",
        "Format it as: http://YOUR_IP:3000"
      ]
    },
    ngrok: {
      title: "Ngrok Tunnel",
      icon: <Globe size={16} />,
      command: "ngrok http 3000",
      steps: [
        "Install Ngrok CLI and run the command above.",
        "Copy the 'Forwarding' HTTPS URL provided by Ngrok.",
        "Ensure the URL ends with .ngrok-free.app"
      ]
    },
    cloudflare: {
      title: "Cloudflare",
      icon: <Cloud size={16} />,
      command: "cloudflared tunnel --url http://localhost:3000",
      steps: [
        "Install Cloudflared and run the command above.",
        "Wait for the output to show a .trycloudflare.com URL.",
        "Copy that URL and paste it into the input below."
      ]
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("BASE_URL");
    if (saved) {
      setManualUrl(saved);
      setInputValue(saved);
    }
  }, []);

  // Priority Resolver: Manual > Env > Origin
  const baseUrl = useMemo(() => {
    if (!mounted) return "";
    if (manualUrl) return manualUrl.replace(/\/$/, '');
    const envUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');
    if (typeof window !== 'undefined') return window.location.origin;
    return "";
  }, [manualUrl, mounted]);

  const syncUrl = useMemo(() => {
    return baseUrl ? `${baseUrl}/api/devices/sync` : "";
  }, [baseUrl]);

  const fetchDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const data = await apiClient.get('/devices');
      setDevices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchDevices();
      const interval = setInterval(fetchDevices, 10000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const handleSave = () => {
    if (inputValue) {
      const formatted = inputValue.trim();
      localStorage.setItem("BASE_URL", formatted);
      setManualUrl(formatted);
      setTestResult(null);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("BASE_URL");
    setManualUrl("");
    setInputValue("");
    setTestResult(null);
  };

  const handleOptimizeUrl = async () => {
    setIsOptimizing(true);
    setTestResult(null);
    try {
      const result = await apiClient.post('/system/tunnel/start', {
        mode: 'local',
        port: 3000,
      });
      const optimizedUrl = result.url.replace(/\/$/, '');
      localStorage.setItem("BASE_URL", optimizedUrl);
      setManualUrl(optimizedUrl);
      setInputValue(optimizedUrl);
      setTestResult('success');
    } catch (e) {
      console.error(e);
      setTestResult('error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${baseUrl}/api/system/ip`);
      if (res.ok) setTestResult('success');
      else setTestResult('error');
    } catch (e) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testSmsNumber || !testSmsMessage) return;
    setIsSendingSms(true);
    setTestSmsError("");
    setTestSmsSuccess(false);
    try {
      const task = await apiClient.post('/tasks', {
        recipient: testSmsNumber,
        message: testSmsMessage,
        status: 'PENDING'
      });
      
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const updatedTask = await apiClient.get(`/tasks/${task.id}`);
          if (updatedTask.status === 'SENT') {
            clearInterval(interval);
            setIsSendingSms(false);
            setTestSmsSuccess(true);
            setTestSmsNumber("");
            setTimeout(() => setTestSmsSuccess(false), 5000);
          } else if (updatedTask.status === 'FAILED') {
            clearInterval(interval);
            setIsSendingSms(false);
            setTestSmsError('Delivery failed. The mobile node returned an error (likely offline).');
          } else if (attempts > 20) {
            clearInterval(interval);
            setIsSendingSms(false);
            setTestSmsError('Timeout: Task is still pending. Is your app ONLINE and synced?');
          }
        } catch (e) {
          clearInterval(interval);
          setIsSendingSms(false);
        }
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setTestSmsError(e.message || 'Failed to create test task.');
      setIsSendingSms(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <PageHeader 
        title="Connect Phone" 
        description="Sync your Flutter app to send SMS automatically via API."
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Zap size={18} className="text-amber-500" />
                  API Configuration
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base API URL</label>
                    <Badge variant={manualUrl ? "info" : "default"} className="text-[9px]">
                      {manualUrl ? "Manual Override" : "System Default"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. http://192.168.1.5:3000"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button onClick={handleSave} size="sm" leftIcon={<Save size={16} />}>
                      Save
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  <Button size="sm" onClick={handleOptimizeUrl} disabled={isOptimizing} isLoading={isOptimizing} leftIcon={<Zap size={14} />}>
                    Optimize Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={14} />}>
                    Reset
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={testConnection} 
                    disabled={isTesting || !baseUrl}
                    className={testResult === 'success' ? 'text-emerald-600' : testResult === 'error' ? 'text-rose-600' : ''}
                  >
                    {isTesting ? "Testing..." : testResult === 'success' ? "Connection OK" : testResult === 'error' ? "Connection Failed" : "Test Connection"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Smartphone size={18} className="text-emerald-500" />
                  Active Mobile Devices
                </h3>
              </CardHeader>
              <CardContent>
                {isLoadingDevices && devices.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw size={24} className="animate-spin mx-auto text-slate-300" />
                    <p className="mt-2 text-xs text-slate-500 uppercase font-bold tracking-widest">Searching for devices...</p>
                  </div>
                ) : devices.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <Smartphone size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No Flutter devices connected.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Set the Sync URL in your app to point here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${device.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{device.phoneNumber || 'Node '+device.id.slice(0,4)}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[9px] py-0">{device.simOperator || 'Generic SIM'}</Badge>
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{device.publicUrl}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={device.status === 'ONLINE' ? 'success' : 'default'} className="text-[9px] font-bold">
                            {device.status}
                          </Badge>
                          <p className="text-[9px] text-slate-400 mt-1 font-medium">Last seen: {new Date(device.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
                  <Button variant="ghost" size="xs" onClick={fetchDevices} className="text-slate-500 font-bold uppercase tracking-widest">
                    <RefreshCw size={12} className="mr-2" /> Refresh List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Flutter App Sync</h3>
              
              <div className="w-48 h-48 bg-white p-4 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                {syncUrl ? (
                  <QRCode value={syncUrl} size={160} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} />
                ) : (
                  <div className="space-y-2 text-slate-300">
                    <SmartphoneNfc size={48} className="mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Invalid URL</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${syncUrl ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Sync Endpoint</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 group">
                  <code className="text-[10px] font-mono text-slate-600 truncate flex-1 text-left">{syncUrl || 'Enter URL above'}</code>
                  <button onClick={copyToClipboard} className="p-1 text-slate-400 hover:text-blue-600">
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Send size={18} className="text-blue-500" />
                  Instant Test
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient</label>
                  <input 
                    type="tel" 
                    placeholder="+919876543210" 
                    value={testSmsNumber}
                    onChange={(e) => setTestSmsNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</label>
                  <textarea 
                    value={testSmsMessage}
                    onChange={(e) => setTestSmsMessage(e.target.value)}
                    placeholder="Enter test message..."
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSendTestSms}
                  disabled={isSendingSms || !testSmsNumber}
                  leftIcon={testSmsSuccess ? <CheckCircle2 size={16} /> : <Send size={16} />}
                  variant={testSmsSuccess ? "success" : "default"}
                >
                  {isSendingSms ? "Queueing..." : testSmsSuccess ? "Sent Successfully!" : "Send via App"}
                </Button>
                {testSmsSuccess && (
                  <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded border border-emerald-100 text-center">
                    SMS sent successfully!
                  </p>
                )}
                {testSmsError && (
                  <p className="text-[10px] text-rose-600 font-medium bg-rose-50 p-2 rounded border border-rose-100">{testSmsError}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
