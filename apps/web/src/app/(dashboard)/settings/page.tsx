"use client";

import React, { useState, useEffect } from "react";
import { Globe, Bell, Save, CheckCircle } from "lucide-react";
import { apiClient } from "../../../lib/api";
import { PageHeader } from "../../../components/PageHeader";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export default function SettingsPage() {
  const [userName, setUserName] = useState("Local User");
  const [timezone, setTimezone] = useState("UTC");
  const [region, setRegion] = useState("Global");
  const [preferences, setPreferences] = useState([
    { id: "failure-alerts", label: "Show high failure alerts", checked: true },
    { id: "auto-refresh", label: "Auto-refresh dashboard data", checked: true },
    { id: "compact-view", label: "Compact view mode", checked: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    // Load local settings
    const savedSettings = localStorage.getItem("app-settings");
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
    
    // Load Spam Policy from server
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const data = await apiClient.get("/tasks/spam-policy");
      setPolicy(data);
    } catch (err) {
      console.error("Failed to fetch spam policy", err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save local settings
      const settings = { userName, timezone, region, preferences };
      localStorage.setItem("app-settings", JSON.stringify(settings));

      // Save Spam Policy to server
      if (policy) {
        await apiClient.patch("/tasks/spam-policy", policy);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)),
    );
  };

  return (
    <div className="flex flex-col h-full bg-warm-ivory">
      <PageHeader
        title="Settings"
        description="Manage your profile, application preferences, and security limits."
        actions={
          <Button
            leftIcon={saved ? <CheckCircle size={18} /> : <Save size={18} />}
            onClick={handleSave}
            disabled={isSaving}
            className={`rounded-none font-bold uppercase tracking-widest ${saved ? "bg-green-600" : "bg-mistral-black hover:bg-neutral-800 text-white"}`}
          >
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      <div className="px-4 md:px-8 mb-8">
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-[#ffd900]" />
          <div className="flex-1 bg-[#ffe295]" />
          <div className="flex-1 bg-[#ffa110]" />
          <div className="flex-1 bg-[#ff8105]" />
          <div className="flex-1 bg-[#fb6424]" />
          <div className="flex-1 bg-[#fa520f]" />
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="rounded-none border-block-gold bg-white">
            <CardHeader className="flex flex-row items-center gap-2">
              <Globe size={18} className="text-mistral-orange" />
              <h3 className="font-bold uppercase tracking-tight text-mistral-black">General Information</h3>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-mistral-black/40 uppercase tracking-widest">
                  User Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-warm-ivory border border-block-gold/20 px-4 py-2 text-sm focus:border-mistral-orange outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-mistral-black/40 uppercase tracking-widest">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-warm-ivory border border-block-gold/20 px-4 py-2 text-sm focus:border-mistral-orange outline-none"
                  >
                    <option value="UTC">UTC (Universal)</option>
                    <option value="IST">IST (India)</option>
                    <option value="PST">PST (Pacific)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-mistral-black/40 uppercase tracking-widest">
                    Default Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-warm-ivory border border-block-gold/20 px-4 py-2 text-sm focus:border-mistral-orange outline-none"
                  >
                    <option value="Global">Global</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-block-gold bg-white">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell size={18} className="text-mistral-orange" />
              <h3 className="font-bold uppercase tracking-tight text-mistral-black">Node Security (Spam Guard)</h3>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between p-4 bg-warm-ivory border border-block-gold/10">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-mistral-black uppercase tracking-tight">Active Protection</span>
                  <span className="text-[10px] text-mistral-black/40">Enable global SMS rate limiting</span>
                </div>
                <button
                  onClick={() => setPolicy({ ...policy, isActive: !policy?.isActive })}
                  className={`w-10 h-5 ${policy?.isActive ? "bg-green-500" : "bg-neutral-300"} transition-colors relative focus:outline-none`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white transition-all ${policy?.isActive ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-mistral-black/40 uppercase tracking-widest">
                    Daily SMS Count Per Node
                  </label>
                  <span className="text-xs font-bold text-mistral-orange">{policy?.maxPerDay} SMS</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={policy?.maxPerDay || 100}
                  onChange={(e) => setPolicy({ ...policy, maxPerDay: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 appearance-none cursor-pointer accent-mistral-orange"
                />
                <p className="text-[10px] text-mistral-black/30 italic">
                  Critical: Carriers often ban SIMs above 500 SMS/day.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-none border-block-gold bg-white h-fit">
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell size={18} className="text-mistral-orange" />
            <h3 className="font-bold uppercase tracking-tight text-mistral-black">User Preferences</h3>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {preferences.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-warm-ivory border border-block-gold/10"
              >
                <span className="text-sm text-mistral-black uppercase tracking-tight font-normal">
                  {item.label}
                </span>
                <button
                  onClick={() => togglePreference(item.id)}
                  className={`w-10 h-5 ${item.checked ? "bg-mistral-orange" : "bg-neutral-300"} relative transition-colors focus:outline-none`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white transition-all ${item.checked ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
