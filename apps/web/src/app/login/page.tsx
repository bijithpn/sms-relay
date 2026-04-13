'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Smartphone, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
  const [useOtp, setUseOtp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden relative">
      {/* Abstract Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-emerald-600 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SMS Relay</h1>
          <p className="text-slate-400 text-sm">Professional SMS Testing & Analytics Platform</p>
        </div>

        <Card className="border-slate-800 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="flex bg-slate-900/50 p-1 rounded-lg">
              <button 
                onClick={() => setUseOtp(false)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${!useOtp ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Password
              </button>
              <button 
                onClick={() => setUseOtp(true)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${useOtp ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                OTP
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              {!useOtp ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <Link href="#" className="text-[10px] font-bold text-blue-400 uppercase hover:text-blue-300">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">One-Time Password</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono tracking-[0.5em]"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">We've sent a code to your registered device.</p>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-500/20"
                rightIcon={<ArrowRight size={18} />}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 flex items-start gap-3">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-amber-500">Security Notice:</strong> Use this platform only for authorized SMS testing. Unauthorized use is strictly prohibited and subject to audit logging.
          </p>
        </div>
      </div>
    </div>
  );
}
