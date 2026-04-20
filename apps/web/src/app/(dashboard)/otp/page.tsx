"use client";

import React from "react";
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card, CardContent } from "../../../components/ui/Card";
import { apiClient } from "../../../lib/api";
import { useRecipients } from "../../../hooks/useApi";
import { toast } from "react-hot-toast";

export default function OtpServicePage() {
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [length, setLength] = React.useState(6);
  const [otp, setOtp] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [verifyCode, setVerifyCode] = React.useState("");
  const [verificationResult, setVerificationResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [taskStatus, setTaskStatus] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const { data: recipients } = useRecipients();

  const isTaskActive = taskStatus === "PENDING" || taskStatus === "QUEUED";

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateOtp = async () => {
    if (!phoneNumber) return;
    setIsGenerating(true);
    setOtp(null);
    try {
      const data = await apiClient.post("/otp/generate", {
        phoneNumber: phoneNumber,
        length: Number(length),
      });
      if (data.success && data.taskId) {
        toast.success("OTP request accepted");
        setTaskStatus("PENDING");
        
        // Poll for task status
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const task = await apiClient.get(`/tasks/${data.taskId}`);
            setTaskStatus(task.status);
            if (task.status === "SENT" || task.status === "DELIVERED") {
              clearInterval(interval);
              if (task.status === "DELIVERED") toast.success("OTP delivered to device");
            } else if (task.status === "FAILED") {
              clearInterval(interval);
              toast.error("SMS dispatch failed. Check phone connection.");
            } else if (attempts > 30) {
              clearInterval(interval);
              setTaskStatus("TIMEOUT");
            }
          } catch (e) {
            clearInterval(interval);
          }
        }, 1500);
      } else {
        toast.error(data.message || "Failed to generate OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate OTP");
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyOtp = async () => {
    if (!phoneNumber || !verifyCode) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const data = await apiClient.post("/otp/verify", { 
        phoneNumber: phoneNumber, 
        code: verifyCode 
      });
      setVerificationResult({
        success: data.success || false,
        message: data.message || "Verified successfully",
      });
      if (data.success) toast.success("Verification Successful");
    } catch (error: any) {
      setVerificationResult({
        success: false,
        message: error.message || "Verification failed",
      });
      toast.error("Verification Failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isMounted) {
    return <div className="flex flex-col min-h-full bg-warm-ivory" />;
  }

  return (
    <div className="flex flex-col min-h-full bg-warm-ivory">
      <PageHeader
        title="OTP Service"
        description="Secure mobile verification. OTPs are sent automatically via your connected mobile nodes."
      />

      <div className="px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <Card className="rounded-none border-block-gold bg-white h-fit">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-mistral-black">
                <ShieldCheck className="text-mistral-orange" />
                Generate OTP
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-cream border border-bright-yellow text-[10px] font-bold uppercase tracking-wider text-mistral-orange">
                <Smartphone size={12} /> SMS Automated
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-mistral-black/60">
                  Recipient Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91XXXXXXXXXX"
                  className="w-full px-4 py-3 bg-warm-ivory border border-block-gold outline-none focus:border-mistral-orange transition-colors"
                />
                <p className="text-[10px] text-mistral-black/40 italic">
                  Must include country code. Code will be sent from your phone
                  plan.
                </p>

                {recipients && recipients.length > 0 && (
                  <div className="pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-mistral-black/40 block mb-2">
                      Quick Select Recipient
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {recipients.slice(0, 6).map((r: any) => (
                        <button
                          key={r.id}
                          onClick={() => setPhoneNumber(r.phoneNumber)}
                          className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${
                            phoneNumber === r.phoneNumber
                              ? "bg-mistral-orange border-mistral-orange text-white"
                              : "bg-cream border-block-gold text-mistral-black/60 hover:border-mistral-orange hover:text-mistral-orange"
                          }`}
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-mistral-black/60">
                  OTP Length (4-8)
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-warm-ivory border border-block-gold outline-none focus:border-mistral-orange transition-colors"
                >
                  {[4, 5, 6, 7, 8].map((l) => (
                    <option key={l} value={l}>
                      {l} Digits
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateOtp}
                disabled={isGenerating || !phoneNumber || isTaskActive}
                className="w-full py-3 bg-mistral-orange text-white font-bold uppercase tracking-widest hover:bg-mistral-flame disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  "Send OTP via SMS"
                )}
              </button>

              {taskStatus && (
                <div className={`p-4 flex items-center justify-between border ${
                  taskStatus === 'SENT' || taskStatus === 'DELIVERED' 
                    ? 'bg-green-50 border-green-100 text-green-700' 
                    : taskStatus === 'FAILED' || taskStatus === 'TIMEOUT'
                      ? 'bg-red-50 border-red-100 text-red-700'
                      : 'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {taskStatus === 'PENDING' || taskStatus === 'QUEUED' ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : taskStatus === 'SENT' || taskStatus === 'DELIVERED' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Status: {taskStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium opacity-70 italic">
                        {taskStatus === 'PENDING' ? 'Waiting for mobile node...' : 
                        taskStatus === 'QUEUED' ? 'Device accepted request' :
                        taskStatus === 'SENT' ? 'In transit to carrier' :
                        taskStatus === 'DELIVERED' ? 'Delivery confirmed' : 
                        taskStatus === 'FAILED' ? 'Delivery error occurred' : 'Wait for update'}
                      </span>
                      {!isTaskActive && (
                        <button 
                          onClick={() => setTaskStatus(null)}
                          className="text-[9px] underline uppercase tracking-tighter hover:text-mistral-orange"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Verifier Section */}
        <Card className="rounded-none border-block-gold bg-white h-fit">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-mistral-black">
              <CheckCircle2 className="text-mistral-orange" />
              Verify OTP
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-mistral-black/60">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="The phone number you sent OTP to"
                  className="w-full px-4 py-3 bg-warm-ivory border border-block-gold outline-none focus:border-mistral-orange transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-mistral-black/60">
                  Enter Verification Code ({length}-digits)
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, length))}
                  placeholder={`${length}-digit code`}
                  maxLength={length}
                  className="w-full px-4 py-3 bg-warm-ivory border border-block-gold outline-none focus:border-mistral-orange transition-colors"
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={isVerifying || !phoneNumber || !verifyCode}
                className="w-full py-3 bg-mistral-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  "Verify & Validate"
                )}
              </button>
            </div>

            {verificationResult && (
              <div
                className={`p-4 flex items-center gap-3 ${verificationResult.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
              >
                {verificationResult.success ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="font-bold text-sm">
                  {verificationResult.message}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
