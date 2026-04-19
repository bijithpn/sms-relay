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

  const generateOtp = async () => {
    if (!phoneNumber) return;
    setIsGenerating(true);
    setOtp(null);
    try {
      const res = await fetch("http://localhost:3001/api/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: phoneNumber,
          length: Number(length),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOtp(data.otp);
      } else {
        alert(data.message || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("Failed to generate OTP:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyOtp = async () => {
    if (!phoneNumber || !verifyCode) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetch("http://localhost:3001/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phoneNumber, code: verifyCode }),
      });
      const data = await res.json();
      setVerificationResult({
        success: data.success || false,
        message:
          data.message ||
          (res.status === 400
            ? "Invalid or expired OTP"
            : "Verification failed"),
      });
    } catch (error) {
      setVerificationResult({
        success: false,
        message: "Could not connect to service",
      });
    } finally {
      setIsVerifying(false);
    }
  };

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
                disabled={isGenerating || !phoneNumber}
                className="w-full py-3 bg-mistral-orange text-white font-bold uppercase tracking-widest hover:bg-mistral-flame disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  "Send OTP via SMS"
                )}
              </button>
            </div>

            {otp && (
              <div className="p-6 bg-cream border border-bright-yellow text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-mistral-black/40">
                  Reference OTP Code
                </span>
                <div className="text-4xl font-mono font-bold tracking-[0.5em] text-mistral-black ml-[0.5em]">
                  {otp}
                </div>
                <p className="text-[10px] text-mistral-black/60 italic">
                  Valid for 10 minutes
                </p>
              </div>
            )}
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
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="6-digit code"
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
