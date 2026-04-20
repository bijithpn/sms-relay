"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Info, Save, AlertTriangle, ShieldCheck, Clock, Smartphone } from "lucide-react";
import { apiClient } from "../../../lib/api";
import toast from "react-hot-toast";

export default function SpamProtectionPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const data = await apiClient.get("/tasks/spam-policy");
      setPolicy(data);
    } catch (err) {
      toast.error("Failed to fetch spam policy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch("/tasks/spam-policy", policy);
      toast.success("Spam policy updated successfully");
    } catch (err) {
      toast.error("Failed to save policy");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-mistral-orange border-t-transparent rounded-none" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-mistral-black">
            Spam Guard Settings
          </h1>
          <p className="text-mistral-black/60 font-light mt-1">
            Configure safety limits to prevent carrier-level SIM banning.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 bg-mistral-black text-white px-8 rounded-none font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-lg"
        >
          {isSaving ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-none" />
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-block-gold/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-mistral-orange/10 text-mistral-orange rounded-none">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-tight">Active Protection</h2>
              <div className="ml-auto">
                <button
                  onClick={() => setPolicy({ ...policy, isActive: !policy.isActive })}
                  className={`w-12 h-6 rounded-none transition-colors relative ${
                    policy?.isActive ? "bg-green-500" : "bg-neutral-300"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white transition-all ${
                    policy?.isActive ? "left-7" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
            <p className="text-sm text-mistral-black/60 mb-8 leading-relaxed">
              When spam protection is enabled, the server will automatically block outgoing messages that exceed defined thresholds. This is critical for maintaining your SIM card's reputation.
            </p>

            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-mistral-black/40" />
                    <span className="text-xs font-bold uppercase tracking-widest text-mistral-black/60">
                      Daily Limit Per Device
                    </span>
                  </div>
                  <span className="text-xl font-bold text-mistral-orange">{policy?.maxPerDay} SMS</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={policy?.maxPerDay}
                  onChange={(e) => setPolicy({ ...policy, maxPerDay: parseInt(e.target.value) })}
                  className="w-full h-2 bg-neutral-100 appearance-none cursor-pointer accent-mistral-orange"
                />
                <div className="flex justify-between mt-2 text-[10px] text-mistral-black/30 font-bold uppercase tracking-widest">
                  <span>10 / Day</span>
                  <span>1000 / Day</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-mistral-black/40" />
                    <span className="text-xs font-bold uppercase tracking-widest text-mistral-black/60">
                      Hourly Limit Per Recipient
                    </span>
                  </div>
                  <span className="text-xl font-bold text-mistral-orange">{policy?.maxPerHourPerRecipient} SMS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={policy?.maxPerHourPerRecipient}
                  onChange={(e) => setPolicy({ ...policy, maxPerHourPerRecipient: parseInt(e.target.value) })}
                  className="w-full h-2 bg-neutral-100 appearance-none cursor-pointer accent-mistral-orange"
                />
                <div className="flex justify-between mt-2 text-[10px] text-mistral-black/30 font-bold uppercase tracking-widest">
                  <span>1 / Hour</span>
                  <span>50 / Hour</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-mistral-orange/5 border border-mistral-orange/20 p-6 flex gap-4">
            <AlertTriangle className="text-mistral-orange shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-mistral-orange uppercase text-xs tracking-widest mb-1">Carrier Detection Warning</h3>
              <p className="text-sm text-mistral-black/70 leading-relaxed">
                Aggressive SMS burst patterns (more than 5 messages per minute) are easily detected by carriers and will likely result in a permanent SIM ban. We recommend keeping hourly limits low for suspicious recipients.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-mistral-black text-white p-6">
            <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">Protection Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-white/50">Policy Mode</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white">Global Enforcement</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-white/50">Auto-Banning</span>
                <span className="text-xs font-bold uppercase tracking-widest text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-white/50">Recipient Shield</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-cream/30 border border-block-gold/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-mistral-black/40" />
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-mistral-black/40">Developer Tip</h3>
            </div>
            <p className="text-xs text-mistral-black/60 leading-relaxed italic">
              "If you are running verify-only OTP sessions, keep your recipient limit to 3 per hour to ensure real users don't get blocked by accident."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
