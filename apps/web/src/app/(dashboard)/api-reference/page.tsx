'use client';

import React from 'react';
import { Code2, Copy, Terminal, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/devices',
    description: 'Fetch all connected mobile nodes/SIMs.',
    response: '[{ "id": "uuid", "phoneNumber": "+91...", "status": "ONLINE" }]'
  },
  {
    method: 'POST',
    path: '/tasks',
    description: 'Send a single SMS task to the queue.',
    payload: '{ "recipient": "+91...", "message": "Hello World" }',
    response: '{ "id": "uuid", "status": "PENDING" }'
  },
  {
    method: 'GET',
    path: '/tasks',
    description: 'Fetch history of all SMS tasks.',
    response: '[{ "id": "uuid", "status": "DELIVERED", "createdAt": "..." }]'
  },
];

export default function ApiReferencePage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="API Reference" 
        description="Integrate SMS Relay into your local scripts and applications."
      />

      <div className="px-4 md:px-8 pb-8 space-y-8">
        <Card className="bg-slate-900 text-white border-none shadow-xl">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
              <Terminal size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Local API Base URL</h2>
              <p className="text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded inline-block">http://localhost:3001</p>
              <p className="text-xs text-slate-500 mt-2">All requests must be made locally. No authentication required for default local setup.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {API_ENDPOINTS.map((api, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Badge variant={api.method === 'GET' ? 'info' : 'success'}>{api.method}</Badge>
                  <code className="text-sm font-bold text-slate-700">{api.path}</code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`http://localhost:3001${api.path}`)}>
                  <Copy size={14} className="mr-2" /> Copy URL
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{api.description}</p>
                
                {api.payload && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request Payload</h4>
                    <pre className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-700 border border-slate-100 overflow-x-auto">
                      {api.payload}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Example Response</h4>
                  <pre className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-700 border border-slate-100 overflow-x-auto">
                    {api.response}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-blue-900 font-bold flex items-center gap-2">
              <CheckCircle2 size={20} />
              Quick Usage via CURL
            </h3>
            <pre className="bg-white p-4 rounded-xl text-xs font-mono text-blue-800 border border-blue-200 overflow-x-auto">
{`curl -X POST http://localhost:3001/tasks \\
     -H "Content-Type: application/json" \\
     -d '{"recipient": "+919876543210", "message": "Test from API"}'`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
