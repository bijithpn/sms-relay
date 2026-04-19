"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Send,
  Users,
  FileText,
  Info,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "../../../../components/PageHeader";
import { Card, CardHeader, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { WarningBanner } from "../../../../components/ui/WarningBanner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../lib/api";

export default function NewCampaignPage() {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [confirmedAuthorized, setConfirmedAuthorized] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const characterCount = message.length;
  const segments = Math.ceil(characterCount / 160) || 0;
  const recipientList = recipients
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const recipientCount = recipientList.length;

  const isFormValid = message.length > 0 && recipientCount > 0;

  const startCampaign = async () => {
    if (!isFormValid || !confirmedAuthorized) return;
    setIsStarting(true);
    setError("");

    try {
      await apiClient.post("/tasks/bulk", {
        recipients: recipientList,
        message,
      });
      setIsConfirming(false);
      router.push("/campaigns");
    } catch (e: any) {
      setError(
        e.message ||
          "Failed to create campaign tasks. Check the API and database connection.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <PageHeader
          title="Start SMS Campaign"
          description="Create a local SMS test campaign."
          actions={
            <Link href="/campaigns">
              <Button variant="ghost" leftIcon={<ArrowLeft size={18} />}>
                Cancel
              </Button>
            </Link>
          }
        />
      </div>

      <div className="px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                Campaign Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Local SIM / Device
                </label>
                <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <option>Default (Auto-select)</option>
                  <option>SIM-01 (+91 98765 43210)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Message
                  </label>
                  <Badge variant="outline">
                    {characterCount} chars / {segments} segment(s)
                  </Badge>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your test message here..."
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs py-1">
                    Insert Variable
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs py-1">
                    Select Template
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Users size={14} />
                    Recipients
                  </label>
                  <Badge variant="info">{recipientCount} recipients</Badge>
                </div>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="Enter phone numbers separated by commas or spaces..."
                  className="w-full h-24 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Example: +919876543210, +1234567890
                </p>
              </div>
            </CardContent>
          </Card>

          <WarningBanner
            variant="info"
            message="Only send messages to users who have given explicit consent. High volume can lead to SIM blocking."
          />
        </div>

        {/* Sidebar Summary Area */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                Campaign Summary
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Recipients</span>
                  <span className="font-bold text-slate-900">
                    {recipientCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Segments per SMS</span>
                  <span className="font-bold text-slate-900">{segments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total SMS Units</span>
                  <span className="font-bold text-slate-900">
                    {recipientCount * segments}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  <Clock size={14} />
                  Est. Duration: ~{Math.ceil(recipientCount / 10)} mins
                </div>
                <Button
                  className="w-full py-4 text-base font-bold shadow-lg shadow-blue-500/20"
                  disabled={!isFormValid}
                  onClick={() => {
                    setConfirmedAuthorized(false);
                    setError("");
                    setIsConfirming(true);
                  }}
                  rightIcon={<Send size={18} />}
                >
                  Confirm & Send
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white border-none">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Info size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Pro-Tip
                </h3>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Running a large test? Use the{" "}
                <strong>Rate Limit Settings</strong> to adjust how fast messages
                are sent to avoid SIM blocking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Are you sure?
                  </h3>
                  <p className="text-sm text-slate-500">
                    Review your campaign before launching.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Recipients</span>
                  <span className="font-bold text-slate-900">
                    {recipientCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Rate Limit</span>
                  <span className="font-bold text-slate-900">
                    10 SMS/min (Safe)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <WarningBanner
                  variant="error"
                  message="I confirm this is authorized testing traffic and I accept responsibility for any SIM blocking due to high volume."
                />

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    id="auth-check"
                    checked={confirmedAuthorized}
                    onChange={(event) =>
                      setConfirmedAuthorized(event.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="auth-check"
                    className="text-sm font-medium text-slate-700 cursor-pointer select-none"
                  >
                    I confirm this is authorized testing.
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsConfirming(false)}
                >
                  Go Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={startCampaign}
                  disabled={!confirmedAuthorized || isStarting}
                  isLoading={isStarting}
                >
                  Start Campaign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
