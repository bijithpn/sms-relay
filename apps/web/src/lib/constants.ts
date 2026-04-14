import { 
  LayoutDashboard, 
  Send, 
  Activity, 
  FileText, 
  Users, 
  Bell, 
  Settings,
  Code2,
  SmartphoneNfc
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/campaigns', icon: Send },
  { label: 'Rate Limits', href: '/rate-limits', icon: Activity },
  { label: 'Templates', href: '/templates', icon: FileText },
  { label: 'Recipients', href: '/recipients', icon: Users },
  { label: 'Connect Phone', href: '/connect-phone', icon: SmartphoneNfc },
  { label: 'API Reference', href: '/api-reference', icon: Code2 },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const SECURITY_NOTICE = "Use this platform only for authorized SMS testing.";
export const SPAM_WARNING = "High SMS volume can trigger carrier spam detection and may block your SIM, sender ID, or gateway account. Use only with authorized test numbers.";
