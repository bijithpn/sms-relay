import {
  LayoutDashboard,
  Send,
  Activity,
  FileText,
  Users,
  Bell,
  Settings,
  Code2,
  SmartphoneNfc,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "SMS Logs", href: "/campaigns", icon: Send },
  { label: "Gateways", href: "/connect-phone", icon: SmartphoneNfc },
  { label: "OTP Console", href: "/otp", icon: ShieldCheck },
  { label: "API Reference", href: "/api-reference", icon: Code2 },
  { label: "Recipients", href: "/recipients", icon: Users },
];

export const SECURITY_NOTICE =
  "Use this platform only for authorized SMS testing.";
export const SPAM_WARNING =
  "High SMS volume can trigger carrier spam detection and may block your SIM, sender ID, or gateway account. Use only with authorized test numbers.";
