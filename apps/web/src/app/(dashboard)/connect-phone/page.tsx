'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Smartphone, 
  Link as LinkIcon, 
  ShieldCheck, 
  Zap, 
  SmartphoneNfc, 
  Send, 
  Wifi, 
  Globe, 
  Cloud,
  Copy,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import QRCode from 'react-qr-code';
import { useTemplates } from '../../../hooks/useApi';
import { apiClient } from '../../../lib/api';

export default function ConnectPhonePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'ngrok' | 'cloudflare'>('local');
  const [manualUrl, setManualUrl] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testSmsNumber, setTestSmsNumber] = useState("");
  const [testSmsMessage, setTestSmsMessage] = useState("Hello from SMS Relay! Your mobile node is correctly configured.");
  const [isSendingSms, setIsSendingSms] = useState(false);
  
  const { data: templates } = useTemplates();

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
    
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    return "";
  }, [manualUrl, mounted]);

  const nodeUrl = useMemo(() => {
    return baseUrl ? `${baseUrl}/node` : "";
  }, [baseUrl]);

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

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Use baseUrl directly for testing as we want to check external accessibility
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
    try {
      // Use apiClient which is properly configured with the proxy
      await apiClient.post('/tasks', {
        recipient: testSmsNumber,
        message: testSmsMessage,
        status: 'PENDING'
      });
      alert('Test SMS task created! Check your connected phone.');
      setTestSmsNumber("");
    } catch (e) {
      console.error(e);
      alert('Failed to create test task. Is the API running?');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates?.find((t: any) => t.id === e.target.value);
    if (template) {
      setTestSmsMessage(template.content);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(nodeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prevent hydration flicker
  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Connect Phone" 
        description="Manually set your connection URL for local network or public tunnels."
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Zap size={18} className="text-amber-500" />
                  Connection Configuration
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connection URL</label>
                    <Badge variant={manualUrl ? "info" : "default"} className="text-[9px]">
                      {manualUrl ? "Manual Override Active" : "Using System Default"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. http://192.168.1.5:3000 or https://xyz.ngrok.app"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button onClick={handleSave} size="sm" leftIcon={<Save size={16} />}>
                      Save
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Enter your local IP (check `ipconfig`) or your public tunnel URL (Ngrok/Cloudflare).
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={14} />}>
                    Reset to Default
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
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <ExternalLink size={18} className="text-blue-500" />
                  Tunnel Setup Helpers
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  {(['local', 'ngrok', 'cloudflare'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        activeTab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tunnelInfo[t].icon}
                      {tunnelInfo[t].title}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Terminal Command</p>
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs flex justify-between items-center group">
                      <code>{tunnelInfo[activeTab].command}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(tunnelInfo[activeTab].command)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded transition-opacity"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Steps</p>
                    <ul className="space-y-2">
                      {tunnelInfo[activeTab].steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-[11px] text-slate-600 font-medium">
                          <span className="text-blue-500 font-bold">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-600 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Smartphone size={120} />
              </div>
              <CardContent className="p-8 space-y-4">
                <h2 className="text-xl font-bold leading-tight">Quick Setup Guide</h2>
                <div className="space-y-3 text-sm opacity-90">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                    <p>Start your tunnel (e.g. <code>ngrok http 3000</code>) or find your Local IP.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                    <p>Paste the URL above and click <strong>Save</strong>.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                    <p>Scan the QR code with your Android phone's camera.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Display */}
          <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-dashed border-slate-200">
              <div className="w-48 h-48 bg-white p-4 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                {nodeUrl ? (
                  <QRCode 
                    value={nodeUrl} 
                    size={160}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <div className="space-y-2 text-slate-300">
                    <SmartphoneNfc size={48} className="mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Invalid URL</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${nodeUrl ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Active QR Link</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 group">
                  <code className="text-[10px] font-mono text-blue-600 truncate flex-1 text-left">{nodeUrl || 'Enter URL above'}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-white rounded transition-colors text-slate-400 hover:text-blue-600"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {nodeUrl && (
                  <a 
                    href={nodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline flex items-center justify-center gap-1"
                  >
                    Open on this device <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Send size={18} className="text-blue-500" />
                  Test SMS Node
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient Number</label>
                  <input 
                    type="tel" 
                    placeholder="+919876543210" 
                    value={testSmsNumber}
                    onChange={(e) => setTestSmsNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</label>
                    {templates && templates.length > 0 && (
                      <div className="relative">
                        <select 
                          onChange={handleSelectTemplate}
                          className="text-[9px] font-bold text-blue-600 bg-blue-50 border-none rounded px-2 py-1 appearance-none pr-4 cursor-pointer outline-none"
                        >
                          <option value="">Use Template</option>
                          {templates.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={8} className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                      </div>
                    )}
                  </div>
                  <textarea 
                    value={testSmsMessage}
                    onChange={(e) => setTestSmsMessage(e.target.value)}
                    placeholder="Enter test message..."
                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <Button 
                  className="w-full" 
                  size="sm" 
                  variant="outline"
                  onClick={handleSendTestSms}
                  disabled={isSendingSms || !testSmsNumber || !testSmsMessage}
                >
                  {isSendingSms ? "Sending..." : "Send Test SMS"}
                </Button>
                <p className="text-[10px] text-slate-400 italic text-center">Queues a task to your connected node.</p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck size={16} />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Mobile Support</h3>
                </div>
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  Web-to-SMS routing requires <strong>Android Chrome</strong>. Ensure your phone has internet access if using a public tunnel.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
